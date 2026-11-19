// Babak andal di meja kasir (masukan Farrez 19 Nov 2026, butir 16): listrik padam, lampu darurat
// menyala, kasir tetap mencatat offline, lalu transaksi tertunda terkirim.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ANCHOR, keadaanAndal } from "../components/dunia/naskah.js";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const tanpaKomentar = (s) => s.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const props = baca("components/dunia/props.js");
const andal = tanpaKomentar(props.slice(props.indexOf("// ---- 08 andal"), props.indexOf("// ---- 09 aman")));
const dunia = tanpaKomentar(baca("components/dunia/dunia.js"));

test("keadaan andal: normal, padam dengan tertunda 1 ke 3, mengirim, lalu terkirim", () => {
  // Harapan dihitung dari naskah babak (padam u 0,42..0,72, satu transaksi tiap 0,08 sesudah
  // 0,46, jeda kirim 0,05), bukan dari kode.
  const kasus = [
    [0, "normal", 0],
    [0.42, "normal", 0],
    [0.421, "padam", 1],
    [0.539, "padam", 1],
    [0.541, "padam", 2],
    [0.619, "padam", 2],
    [0.621, "padam", 3],
    [0.719, "padam", 3],
    [0.72, "kirim", 3],
    [0.769, "kirim", 3],
    [0.77, "pulih", 3],
    [1, "pulih", 3],
  ];
  for (const [u, keadaan, tertunda] of kasus) assert.deepEqual(keadaanAndal(u), { keadaan, tertunda }, `u ${u}`);
  // Gulir di luar babak dan nilai rusak tidak pernah memadamkan toko.
  assert.equal(keadaanAndal(Number.NaN).keadaan, "normal");
  assert.equal(keadaanAndal(-1).keadaan, "normal");
  assert.equal(keadaanAndal(2).tertunda, 3);
});

test("satu rentang padam: lampu toko dan props memakai keadaanAndal yang sama", () => {
  assert.match(dunia, /const padam = a\.id === "andal" && keadaanAndal\(u\)\.keadaan === "padam";/);
  assert.match(andal, /const \{ keadaan, tertunda: n \} = keadaanAndal\(u\);/);
  // Layar kanvas hanya digambar ulang saat keadaan atau jumlahnya berganti, bukan tiap bingkai.
  assert.match(andal, /if \(kunci !== kini\) \{\s*kini = kunci;\s*layarKasir\.gambar\(keadaan, n\);/);
});

test("benda babak: tablet, printer struk, modem berlampu LOS, lampu darurat twin spot; bangku dibuang", () => {
  assert.match(andal, /teksturKasirOffline\(bahasa\)/);
  assert.match(andal, /setelLed\(led\[2\], padam \? 0xff2a1a : 0x111111/);
  assert.match(andal, /lampuDarurat\.intensity = padam \? 9 : 0;/);
  assert.match(andal, /setelLed\(indikator, padam \? 0xff3b2f : 0x4bff6a/);
  assert.doesNotMatch(props, /wooden_stool_01|tinggiDudukan|08-jeda/);
  // Lampu darurat sorot tanpa bayangan: peta bayangan tambahan dihitung ulang tiap lampu kunci bergerak.
  assert.match(dunia, /const lampuDarurat = new THREE\.SpotLight\(/);
  assert.doesNotMatch(dunia, /lampuDarurat\.castShadow/);
});

test("lampu darurat di atas rak kaset dan sorotnya jatuh ke meja kasir", () => {
  const [x, y, z] = andal.match(/dd\.position\.set\(([\d.]+), ([\d.]+), ([\d.]+)\);/).slice(1).map(Number);
  // Rak kaset dunia.js: x 0,6..4,4, puncak y 2,53, dinding depan z 4.
  assert.ok(x > 0.6 && x < 4.4 && y - 0.05 > 2.53 && z < 4, `twin spot di ${x}, ${y}, ${z}`);
  const [tx, tz] = andal.match(/lampuDarurat\.target\.position\.set\(([\d.]+), ATAS, ([\d.]+)\);/).slice(1).map(Number);
  assert.ok(tx > 0.7 && tx < 3.3 && tz > 2.6 && tz < 3.4, `sorot jatuh di ${tx}, ${tz}`);
  // Kepala menunduk ke meja: rotasi x negatif pada grup yang menghadap -z.
  assert.match(andal, /k\.rotation\.set\(-0\.\d+,/);
});

test("bohlam model lampu gantung ikut gelap saat padam", () => {
  assert.match(dunia, /m\.emissiveIntensity = dasar \* faktorRedup \* faktorRedup;/);
  const langkah = dunia.slice(dunia.indexOf("const langkahRedup"), dunia.indexOf("const langkahRedup") + 600);
  assert.match(langkah, /redupkanBohlam\(\);/);
  assert.match(dunia, /6 \* Math\.max\(0\.02, redupKini\)/);
});

test("layar kasir dua bahasa dengan kunci yang sama dan angka lewat Intl", () => {
  const blok = props.slice(props.indexOf("const TEKS_KASIR"), props.indexOf("function teksturKasirOffline"));
  const kunci = (bhs) => [...blok.slice(blok.indexOf(`${bhs}: {`)).matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]).slice(0, 9);
  assert.deepEqual(kunci("id"), kunci("en"));
  assert.match(blok, /tertunda: \(n\) => `\$\{n\} transaksi tertunda`/);
  assert.match(props, /new Intl\.NumberFormat\(bahasa === "en" \? "en-US" : "id-ID"\)/);
  assert.match(baca("components/dunia/Dunia.jsx"), /const bahasa = useLocale\(\);/);
});

test("kamera andal: desktop mundur dari meja, layar tegak punya pose sendiri", () => {
  const a = ANCHOR.find((x) => x.id === "andal");
  assert.ok(a.tegak, "andal tanpa pose tegak");
  // Desktop: jarak ke rak (z 3,86) cukup untuk meja, lampu gantung, dan lampu darurat.
  assert.ok(3.86 - a.posisi[2] > 2.8, `kamera desktop hanya ${3.86 - a.posisi[2]} m dari rak`);
  // Benda di kanan bingkai (teks di kiri): dari dalam toko menghadap +z, x lebih kecil = kanan.
  assert.ok(a.lihat[0] > 2.5, "lihat tidak digeser ke kiri benda");
});
