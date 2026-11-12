// Loader ular (ADR 0014): progresnya nyata, tidak pernah mundur atau mendahului pekerjaan,
// terkamannya menyambung tanpa lompatan, dan mulutnya menutup seluruh layar sebelum kanvas
// dilepas. Bagian akhir mengunci pemasangannya: intro CSS hero (PR #57) sudah diganti.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  gabungProgres,
  kejar,
  faseLoader,
  kepala,
  panjangUlar,
  lubangMulut,
  LIUK,
  TERKAM,
  PUDAR,
} from "../components/dunia/ular.js";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("progres hanya dari pekerjaan nyata: modul, aset, lalu pemanasan", () => {
  assert.equal(gabungProgres({}), 0);
  assert.equal(gabungProgres({ modul: true, aset: [1, 1, 1], hangat: 1 }), 1);
  assert.ok(Math.abs(gabungProgres({ modul: true, aset: [1, 0] }) - (0.08 + 0.36)) < 1e-12);
  // Aset selesai tanpa pemanasan belum boleh 100%: shader yang belum dikompilasi membekukan bingkai.
  assert.ok(gabungProgres({ modul: true, aset: [1, 1] }) < 0.81);
  assert.equal(gabungProgres({ modul: true, aset: [2, 5], hangat: 9 }), 1);
});

test("angka yang tampil mengejar progres tanpa mundur dan tanpa mendahului", () => {
  let tampil = 0;
  const nyata = [0.1, 0.1, 0.05, 0.4, 0.4, 0.3, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  let tertinggi = 0;
  for (const n of nyata) {
    tertinggi = Math.max(tertinggi, n);
    const baru = kejar(tampil, n, 1 / 60);
    assert.ok(baru >= tampil, "mundur");
    assert.ok(baru <= tertinggi + 1e-12, "mendahului");
    tampil = baru;
  }
  // Progres nyata yang turun (aset baru terdaftar) tidak menarik angka yang sudah tampil.
  assert.equal(kejar(0.5, 0.2, 1 / 60), 0.5);
  for (let i = 0; i < 400; i++) tampil = kejar(tampil, 1, 1 / 60);
  assert.equal(tampil, 1, "tidak pernah sampai 100%");
});

test("urutan fase: memuat, meliuk, menerjang, selesai dalam kurang dari 2,2 detik", () => {
  assert.equal(faseLoader(null).nama, "muat");
  assert.equal(faseLoader(0).nama, "liuk");
  assert.equal(faseLoader(LIUK + 0.01).nama, "terkam");
  assert.equal(faseLoader(LIUK + TERKAM + 0.01).nama, "selesai");
  assert.ok(LIUK + TERKAM < 2.2);
});

test("gerak dikurangi: tanpa liuk dan terkam, hanya crossfade singkat", () => {
  assert.equal(faseLoader(null, true).nama, "muat");
  assert.equal(faseLoader(0.1, true).nama, "pudar");
  assert.equal(faseLoader(PUDAR + 0.01, true).nama, "selesai");
  assert.ok(PUDAR <= 0.5);
});

test("ular makin panjang mengikuti progres", () => {
  assert.equal(panjangUlar(0), 8);
  assert.equal(panjangUlar(1), 36);
  assert.ok(panjangUlar(0.5) > panjangUlar(0.2));
});

test("kepala tidak melompat saat berpindah dari spinner ke liuk dan dari liuk ke terkam", () => {
  const tSiap = 2.37;
  const e = 1e-4;
  for (const t of [tSiap, tSiap + LIUK]) {
    const a = kepala(t - e, tSiap);
    const b = kepala(t + e, tSiap);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 0.01, `lompat posisi di ${t}`);
    assert.ok(Math.abs(a.s - b.s) < 0.05, `lompat skala di ${t}`);
  }
});

test("di akhir terkam lubang mulut menutup seluruh layar, di HP maupun desktop", () => {
  const h = kepala(10 + LIUK + TERKAM + 0.01, 10);
  assert.equal(h.terkam, 1);
  for (const [W, H] of [
    [390, 844],
    [1440, 900],
    [2560, 1080],
  ]) {
    const U = Math.min(W, H);
    const { rx, ry, dy } = lubangMulut(h, U);
    const cx = W / 2;
    const cy = H / 2 + h.y * U + dy;
    for (const [x, y] of [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ]) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      assert.ok(d <= 1, `${W}x${H}: sudut ${x},${y} di luar mulut (${d.toFixed(2)})`);
    }
  }
});

test("intro CSS hero PR #57 sudah diganti portal ular", () => {
  const css = baca("components/gerbang/gerbang.css");
  assert.doesNotMatch(css, /@keyframes gerbang-(masuk|judul|bilah)/);
  assert.ok(!existsSync(new URL("../tests/gerbang-intro.test.mjs", import.meta.url)));
});

test("tirai awal dipasang sebelum gambar pertama dan memakai aturan mode yang sama", () => {
  const layout = baca("app/[locale]/layout.jsx");
  assert.match(layout, /<TiraiDunia \/>/);
  assert.ok(layout.indexOf("<ThemeScript />") < layout.indexOf("<TiraiDunia />"));
  const tirai = baca("components/dunia/TiraiDunia.jsx");
  assert.match(tirai, /pilihModeAwal\.toString\(\)/);
});

test("loader menunggu pemanasan dunia sebelum menerjang", () => {
  const dunia = baca("components/dunia/Dunia.jsx");
  const tunggu = dunia.indexOf("await d.siapkan(");
  assert.ok(tunggu > 0, "Dunia tidak menunggu siapkan()");
  const mesin = baca("components/dunia/dunia.js");
  const siapkan = mesin.slice(mesin.indexOf("const siapkan = async"));
  assert.match(siapkan.slice(0, 1500), /compileAsync/);
  assert.match(siapkan.slice(0, 1500), /initTexture/);
  assert.match(mesin, /new THREE\.LoadingManager\(/);
});
