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
  assert.match(dunia, /float frKaca = 0\.04 \+ 0\.96 \* pow\(1\.0 - abs\(dot\(normal, geometryViewDir\)\), 5\.0\);/);
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
