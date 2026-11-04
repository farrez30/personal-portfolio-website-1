import { test } from "node:test";
import assert from "node:assert/strict";
import { UKURAN, aturGulung, tekuk, letakTengah, gulungDari, mulaiBelok, sudutDi, busurDepan, GULUNG_GLSL } from "../components/imersif/gulung.js";

const dekat = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;
const titik = (g, datar, n = 120) =>
  Array.from({ length: n + 1 }, (_, i) => tekuk(-UKURAN / 2 + (i / n) * UKURAN, g, datar));

// Panjang kertas = jumlah jarak antar titik berurutan; harus tetap 120 mm di mana pun.
function panjang(ps) {
  let s = 0;
  for (let i = 1; i < ps.length; i++) s += Math.hypot(ps[i][0] - ps[i - 1][0], ps[i][1] - ps[i - 1][1]);
  return s;
}

test("di dalam tutup (kemajuan 0) kertas datar dan tengahnya tidak bergeser", () => {
  const g = aturGulung(0, {});
  for (const [x, z, a] of titik(g, 0)) {
    assert.ok(dekat(z, 0) && dekat(a, 0), `z ${z}, sudut ${a}`);
  }
  const [tx, tz, ta] = letakTengah(g);
  assert.ok(dekat(tx, 0) && dekat(tz, 0) && dekat(ta, 0));
});

test("panjang kertas terjaga di sepanjang gulungan, ditekuk maupun dilemaskan", () => {
  for (const k of [0.1, 0.35, 0.6, 0.85, 1]) {
    const g = aturGulung(gulungDari(k), {});
    for (const datar of [0, 0.5, 1]) {
      assert.ok(dekat(panjang(titik(g, datar, 400)), UKURAN, 2e-4), `kemajuan ${k}, datar ${datar}`);
    }
  }
});

test("saat ditarik, kertas benar-benar melengkung (bukan lembaran kaku)", () => {
  const g = aturGulung(gulungDari(0.45), {});
  const sudut = titik(g, 0).map((p) => p[2]);
  assert.ok(Math.max(...sudut) - Math.min(...sudut) > 0.3, "beda sudut ujung ke ujung terlalu kecil");
});

test("dilemaskan penuh, kertas lurus lagi dengan panjang aslinya", () => {
  const g = aturGulung(gulungDari(0.7), {});
  const ps = titik(g, 1);
  for (const [x, z, a] of ps) assert.ok(dekat(z, 0, 1e-9) && dekat(a, 0, 1e-9));
  assert.ok(dekat(ps[ps.length - 1][0] - ps[0][0], UKURAN, 1e-9));
});

test("di akhir gulungan tengah buklet sudah berputar setengah lingkaran", () => {
  const g = aturGulung(gulungDari(1), {});
  assert.ok(dekat(letakTengah(g)[2], -Math.PI, 1e-6));
});

test("tengah buklet bergerak ke arah kamera (dalam negatif), tidak masuk ke nampan", () => {
  for (let i = 1; i <= 20; i++) {
    const g = aturGulung(gulungDari(i / 20), {});
    const [, tz] = letakTengah(g);
    assert.ok(tz <= 1e-9, `tengah masuk ke kotak di kemajuan ${i / 20}`);
  }
});

test("sudut jalur naik terus dan berhenti tepat di pi", () => {
  const g = aturGulung(1, {});
  let lalu = -1;
  for (let f = 0; f <= busurDepan(g) + 0.5; f += 0.01) {
    const s = sudutDi(f, g);
    assert.ok(s >= lalu - 1e-12);
    lalu = s;
  }
  assert.ok(dekat(lalu, Math.PI));
});

test("pose mulai berubah setelah buklet keluar dari bawah tutup, sebelum mendarat", () => {
  const m = mulaiBelok();
  assert.ok(m > 0.2 && m < 0.8, `mulaiBelok ${m}`);
});

test("GLSL memuat fungsi deformSheet dan tidak berisi NaN", () => {
  assert.match(GULUNG_GLSL, /vec3 deformSheet\(vec3 p, vec2 uv\)/);
  assert.doesNotMatch(GULUNG_GLSL, /NaN|undefined|Infinity/);
});

test("jalur HP (sisi -1, tutup 110 derajat) adalah cermin: tengah bergerak ke arah sebaliknya", () => {
  const kanan = aturGulung(gulungDari(0.5, 1, 180), {}, 1, 180);
  const kiri = aturGulung(gulungDari(0.5, -1, 110), {}, -1, 110);
  assert.ok(letakTengah(kanan)[0] < 0, "layar lebar: punggung keluar ke -x");
  assert.ok(letakTengah(kiri)[0] > 0, "HP: tepi depan keluar ke +x");
  assert.ok(dekat(letakTengah(aturGulung(gulungDari(1, -1, 110), {}, -1, 110))[2], Math.PI, 1e-6));
});

test("jalur HP juga menjaga panjang kertas dan mendarat datar", () => {
  for (const k of [0.2, 0.5, 0.8]) {
    const g = aturGulung(gulungDari(k, -1, 110), {}, -1, 110);
    assert.ok(dekat(panjang(titik(g, 0, 400)), UKURAN, 2e-4));
    for (const [, z, a] of titik(g, 1)) assert.ok(dekat(z, 0, 1e-9) && dekat(a, 0, 1e-9));
  }
});
