// Audit ulang dunia toko kaset, 19 Nov 2026 (temuan Farrez gambar 1, 7, 8, 9: cincin hitam
// putus-putus di lantai). Sumber terbukti dengan bingkai yang dibekukan lewat ?uji-dunia:
// cincin hilang hanya saat grup nyala lampu disembunyikan, bukan saat bayangan dimatikan.
// pow() GLSL dengan basis negatif tidak terdefinisi (ANGLE D3D11: exp2(y * log2(x)) = NaN), dan
// NaN yang dijumlahkan additive tampil sebagai piksel hitam.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const tanpaKomentar = (s) => s.replace(/\/\/.*$/gm, "");

// Ambil argumen pertama pow(...) dengan menghitung kurung.
function argPertama(s, i) {
  let d = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "(") d++;
    else if (s[j] === ")") d--;
    else if (s[j] === "," && d === 0) return s.slice(i, j).trim();
  }
  return "";
}

const berkas = ["components/dunia", "components/imersif"].flatMap((d) => readdirSync(new URL(d, akar)).filter((f) => f.endsWith(".js")).map((f) => `${d}/${f}`));

test("setiap pow() di shader memakai basis yang pasti tidak negatif", () => {
  for (const p of berkas) {
    const s = tanpaKomentar(baca(p));
    for (const m of s.matchAll(/(?<![.\w])pow\(/g)) {
      const a = argPertama(s, m.index + 4);
      const aman =
        /^(abs|max|clamp)\(/.test(a) ||
        /^\d+(\.\d+)?$/.test(a) ||
        // Variabel yang dihitung lewat clamp/max/abs di berkas yang sama.
        (/^\w+$/.test(a) && new RegExp(`float ${a} = (abs|max|clamp)\\(`).test(s));
      assert.ok(aman, `${p}: pow(${a}, ...) bisa menerima basis negatif`);
    }
  }
});

test("kerucut berkas lampu mengikuti anchor tujuan, juga selama terbang", () => {
  const s = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(s, /nyala\.kerucut\(!a\.cerita\);/);
  assert.doesNotMatch(s, /nyala\.kerucut\(true\)/, "kerucut dinyalakan paksa di tengah perpindahan babak");
});

// Butir 8: stempel glitch saat gulir mundur. Rekaman sapuan mundur 19 Nov memperlihatkan cap
// terhapus saat stempel menempel lagi dan fase terlompati oleh langkah gulir besar.
test("stempel: dipicu sekali, dimainkan menurut waktu, gulir mundur tidak menghapus cap", async () => {
  const { pemicuSekali } = await import("../components/dunia/naskah.js");
  const p = pemicuSekali({ ambang: 0.3, ulang: 0.12, akhir: 0.75, durasi: 2 });
  assert.equal(p.langkah(0.1, 0), 0);
  assert.equal(p.langkah(0.31, 10), 0, "baru mulai saat melewati ambang");
  assert.ok(p.sibuk());
  // Gulir melompat jauh tidak melompati fase: progres hanya menurut waktu.
  assert.equal(p.langkah(0.7, 11), 0.5);
  // Gulir mundur di tengah gerak tidak membalik gerak.
  assert.equal(p.langkah(0.2, 11.5), 0.75);
  assert.equal(p.langkah(0.2, 12.1), 1);
  assert.ok(!p.sibuk());
  // Sudah dicap: mundur sampai 0,15 tetap tercap.
  assert.equal(p.langkah(0.15, 13), 1);
  // Digulir mundur sampai awal babak dengan kamera diam: cap tidak hilang di depan mata.
  assert.equal(p.langkah(0.05, 13.5), 1);
  // Kamera masuk lagi dari babak sebelumnya: disetel ulang, dan bisa mengecap lagi.
  assert.equal(p.langkah(0.05, 14, false, true), 0);
  assert.equal(p.langkah(0.4, 15), 0);
  assert.ok(p.sibuk());
});

test("stempel: masuk dari belakang atau gerak dikurangi langsung tercap", async () => {
  const { pemicuSekali } = await import("../components/dunia/naskah.js");
  const dariBelakang = pemicuSekali();
  assert.equal(dariBelakang.langkah(0.95, 0), 1);
  assert.ok(!dariBelakang.sibuk());
  const diam = pemicuSekali();
  assert.equal(diam.langkah(0.4, 0, true), 1);
});

test("props babak tujuan dipasang selama kamera terbang, dengan progres babak yang dimulai ulang", () => {
  const s = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(s, /if \(i !== indeks\) uBabak = null;/);
  assert.match(s, /terbang: !!blend/);
  assert.match(s, /if \(a\.cerita && blend && props\) props\.perbarui\(a\.id, uBabak/);
  // Props tidak lagi membaca geser kamera (yang meluncur dari ujung babak sebelumnya).
  assert.doesNotMatch(s, /const u = geser \+ 0\.5;/);
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  assert.match(p, /momen\.rencana = \(u, s = \{\}\) => poseStempel\(cap0\.langkah\(u, s\.waktu \?\? 0, s\.diam, s\.terbang\)\);/);
});
