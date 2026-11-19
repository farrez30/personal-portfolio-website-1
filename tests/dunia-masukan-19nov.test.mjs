// Masukan Farrez 19 Nov 2026: loader CD realistis, corong cahaya lembut, stempel menyentuh kertas,
// kaca bening, lonceng toko, pintu tanpa kesan kertas tempel. Riset: desain/cerita-v4/riset-masukan-19nov.md.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gambarLoader } from "../components/dunia/ular.js";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
const dunia = baca("components/dunia/dunia.js");
const props = baca("components/dunia/props.js");

// Konteks kanvas tiruan yang mencatat urutan panggilan.
function kanvasTiruan() {
  const log = [];
  const gradien = () => ({ addColorStop: (f) => log.push(["henti", f]) });
  return {
    log,
    ctx: new Proxy(
      {},
      {
        get: (_, k) => {
          if (k === "createConicGradient") return (...a) => (log.push(["conic", ...a]), gradien());
          if (k === "createLinearGradient" || k === "createRadialGradient") return () => gradien();
          return (...a) => log.push([k, ...a]);
        },
        set: (_, k, v) => (log.push(["set", k, v]), true),
      },
    ),
  };
}

test("loader: baji pelangi diam terhadap lampu, hanya noda yang berputar", () => {
  const sudutBaji = [];
  for (const t of [1, 2.3]) {
    const { log, ctx } = kanvasTiruan();
    gambarLoader(ctx, 800, 500, t, { progres: 0.6 });
    const putarPertama = log.findIndex((x) => x[0] === "rotate");
    const conic = log.map((x, i) => [x, i]).filter(([x]) => x[0] === "conic");
    assert.ok(conic.length > 2, "ada baji difraksi");
    // Semua baji digambar sebelum rotasi apa pun: tidak ikut berputar bersama cakram.
    for (const [, i] of conic) assert.ok(putarPertama === -1 || i < putarPertama, "baji digambar setelah rotate");
    sudutBaji.push(conic[0][0][1]);
  }
  assert.equal(sudutBaji[0], sudutBaji[1], "sudut baji berubah dengan waktu putar");
});

test("loader: tanpa gradien pelangi penuh, bagian berdata melebar dengan progres", () => {
  const cincinData = (p) => {
    const { log, ctx } = kanvasTiruan();
    gambarLoader(ctx, 800, 500, 1, { progres: p });
    // Lapisan difraksi = conic sesudah yang pertama (kilau putih seluruh cermin).
    return log.filter((x) => x[0] === "conic").length - 1;
  };
  assert.ok(cincinData(0.8) >= cincinData(0.2));
  assert.equal(cincinData(0), 0, "progres 0 tanpa difraksi");
  assert.doesNotMatch(baca("components/dunia/ular.js"), /PELANGI/);
});

test("corong cahaya: tepi memudar menurut sudut pandang, additive, tanpa tekstur gradasi keras", () => {
  assert.match(dunia, /const kerucut = bahanBerkas\(\);/);
  assert.match(dunia, /float tepi = pow\(abs\(dot\(normalize\(vNormal\), normalize\(-vPos\)\)\), 3\.0\);/);
  assert.match(dunia, /blending: THREE\.AdditiveBlending,/);
  assert.doesNotMatch(dunia, /teksturTegak/);
});

test("kaca bening: putih, opasitas rendah, fresnel; bukan biru rata", () => {
  assert.match(dunia, /kaca: bahanKaca\(\),/);
  assert.doesNotMatch(dunia, /0x9fb4c8/);
  assert.match(dunia, /float frKaca = 0\.04 \+ 0\.96 \* pow\(max\(0\.0, 1\.0 - abs\(dot\(normal, geometryViewDir\)\)\), 5\.0\);/);
});

test("stempel menyentuh kertas tepat di tempat bekas capnya", () => {
  const kertas = props.match(/const KERTAS = \[([-\d.]+), ([-\d.]+), ([-\d.]+)\];/).slice(1).map(Number);
  const cap = props.match(/cap\.position\.set\(([-\d.]+), ([-\d.]+), ([-\d.]+)\);/).slice(1).map(Number);
  assert.deepEqual(kertas, cap);
  // Saat ditahan, stempel ada di KERTAS (karet tertekan 1 mm), dan cap muncul sesudah kontak.
  assert.match(props, /\} else if \(u < 0\.57\) \{\s*p = KERTAS;/);
  assert.match(props, /cap\.material\.opacity = u >= 0\.505 \? 1 : 0;/);
});

test("pintu: lonceng toko berpegas, papan OPEN, jendela luar berkusen dan redup", () => {
  assert.match(dunia, /new THREE\.LatheGeometry\(profil, 40\)/);
  assert.match(dunia, /new THREE\.TubeGeometry\(new THREE\.CatmullRomCurve3\(titikPegas\)/);
  assert.match(dunia, /c\.fillText\("OPEN", 150, 96\);/);
  assert.doesNotMatch(dunia, /c\.fillStyle = terang \? "#e9dfcc" : "#e8b36a";/);
  // Lonceng berayun teredam saat tiba di pintu, lalu diam.
  assert.match(dunia, /const amp = 0\.16 \* Math\.exp\(-1\.7 \* t\);/);
});

test("bab bentuk: empat benda sesuai teks, di zona bebas depan balok tingkat atas", () => {
  const mentah = readFileSync(new URL("../components/dunia/props.js", import.meta.url), "utf8");
  const blok = mentah.slice(mentah.indexOf("// ---- 03 bentuk"), mentah.indexOf("// ---- 04 fondasi")).replace(/\/\/.*$/gm, "");
  for (const t of ["teksturDashboard()", "03-format-piringan.webp", "teksturBrosur()", "teksturChat()", "teksturKotakAplikasi()"]) assert.ok(blok.includes(t), t);
  assert.doesNotMatch(blok, /03-format-(cd|kaset|hp)\.webp/);
  // Tingkat bawah: hanya z 0 sampai 0,22 yang bebas; kotak aplikasi di tingkat atas (alas 1,16).
  const panggil = [...blok.matchAll(/pasangBenda\([^,]+(?:\([^)]*\))?, ([-\d.]+), ([-\d.]+)(?:, ([-\d.]+))?(?:, ([-\d.]+))?\);/g)];
  assert.equal(panggil.length, 5);
  for (const [, , z, , alas] of panggil) {
    if (alas) continue;
    assert.ok(+z >= 0.08 && +z <= 0.15, `z ${z} di luar zona bebas`);
  }
  // Benda maju ke kamera saat diangkat, menjauh dari balok tingkat atas.
  assert.match(blok, /x\.o\.position\.z = x\.dasar\.z \+ 0\.05 \* t;/);
});

test("adegan 10: sepuluh CD muat di celah rak dan semuanya keluar bingkai sebelum bab habis", () => {
  const celah = dunia.match(/if \(y === 1\.12 && z > (-[\d.]+) && z < (-[\d.]+)\) \{/).slice(1).map(Number);
  const [z0, langkah] = props.match(/new THREE\.Vector3\(4\.8, 1\.12 \+ 0\.071, (-[\d.]+) \+ i \* ([\d.]+)\)/).slice(1).map(Number);
  const tebal = 0.0104;
  const n = props.match(/const SLUG_RILIS = \[([^\]]+)\]/)[1].split(",").length;
  assert.equal(n, 10);
  // CD rak di luar celah punya pusat di luar rentang celah, jadi tepinya bisa masuk setengah tebal.
  assert.ok(z0 - tebal / 2 >= celah[0] + tebal / 2, "CD pertama bertumpuk dengan tetangganya");
  assert.ok(z0 + (n - 1) * langkah + tebal / 2 <= celah[1] - tebal / 2, "CD terakhir bertumpuk dengan tetangganya");
  assert.ok(langkah > tebal, "CD bertumpuk satu sama lain");
  // tau = (u - 0,08 - i*0,05) / 0,35 dan CD hilang saat tau = 1: yang terakhir habis di u 0,88.
  assert.match(props, /const tau = \(u - 0\.08 - i \* 0\.05\) \/ 0\.35;/);
  assert.ok(0.08 + (n - 1) * 0.05 + 0.35 <= 0.9);
  // Ditarik lurus dulu (tanpa putar y) sampai bebas, baru terbang.
  assert.match(props, /if \(tau < 0\.2\) \{\s*k\.position\.copy\(keluar\);\s*k\.rotation\.set\(0, 0, 0\.05 \* Math\.sin\(Math\.PI \* tarik\)\);/);
});
