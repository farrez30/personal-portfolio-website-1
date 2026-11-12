// Loader cakram CD (ADR 0014, varian CD storyboard loader): progresnya nyata, tidak pernah mundur atau mendahului pekerjaan,
// cakramnya menegak tanpa lompatan, dan lubang tengahnya menutup seluruh layar sebelum kanvas
// dilepas. Bagian akhir mengunci pemasangannya: intro CSS hero (PR #57) sudah diganti.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  gabungProgres,
  kejar,
  faseLoader,
  cakramPada,
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

test("urutan fase: memuat, menegak, membuka, selesai dalam kurang dari 1,2 detik", () => {
  assert.equal(faseLoader(null).nama, "muat");
  assert.equal(faseLoader(0).nama, "liuk");
  assert.equal(faseLoader(LIUK + 0.01).nama, "terkam");
  assert.equal(faseLoader(LIUK + TERKAM + 0.01).nama, "selesai");
  assert.ok(LIUK + TERKAM < 1.2);
});

test("gerak dikurangi: tanpa menegak dan membuka, hanya crossfade singkat", () => {
  assert.equal(faseLoader(null, true).nama, "muat");
  assert.equal(faseLoader(0.1, true).nama, "pudar");
  assert.equal(faseLoader(PUDAR + 0.01, true).nama, "selesai");
  assert.ok(PUDAR <= 0.5);
});

test("kilau pelangi mengisi mengikuti progres, lalu penuh begitu 100%", () => {
  assert.equal(cakramPada(1, null, 0).isi, 0);
  assert.equal(cakramPada(1, null, 0.4).isi, 0.4);
  assert.equal(cakramPada(5, 4, 1).isi, 1);
});

test("cakram berputar makin kencang saat progres naik", () => {
  const laju = (p) => (cakramPada(1.01, null, p).putar - cakramPada(1, null, p).putar) / 0.01;
  assert.ok(laju(0.8) > laju(0.2));
});

test("cakram menegak dan membuka tanpa lompatan di sambungan fase", () => {
  const tSiap = 2.37;
  const e = 1e-4;
  for (const t of [tSiap, tSiap + LIUK]) {
    const a = cakramPada(t - e, tSiap, 1);
    const b = cakramPada(t + e, tSiap, 1);
    assert.ok(Math.abs(a.r - b.r) < 0.01, `lompat ukuran di ${t}`);
    assert.ok(Math.abs(a.miring - b.miring) < 0.01, `lompat miring di ${t}`);
    assert.ok(Math.abs(a.lubang - b.lubang) < 0.01, `lompat lubang di ${t}`);
  }
  assert.equal(cakramPada(tSiap + LIUK, tSiap, 1).miring, 1);
});

test("di akhir lubang tengah menutup seluruh layar, di HP maupun desktop", () => {
  const c = cakramPada(10 + LIUK + TERKAM + 0.01, 10, 1);
  for (const [W, H] of [
    [390, 844],
    [1440, 900],
    [2560, 1080],
  ]) {
    const U = Math.min(W, H);
    const rx = c.lubang * U, ry = c.lubang * U * c.miring;
    for (const [x, y] of [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ]) {
      const d = ((x - W / 2) / rx) ** 2 + ((y - H / 2) / ry) ** 2;
      assert.ok(d <= 1, `${W}x${H}: sudut ${x},${y} di luar lubang (${d.toFixed(2)})`);
    }
  }
});

test("intro CSS hero PR #57 sudah diganti portal cakram", () => {
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

test("loader menunggu pemanasan dunia sebelum membuka", () => {
  const dunia = baca("components/dunia/Dunia.jsx");
  const tunggu = dunia.indexOf("await d.siapkan(");
  assert.ok(tunggu > 0, "Dunia tidak menunggu siapkan()");
  const mesin = baca("components/dunia/dunia.js");
  const siapkan = mesin.slice(mesin.indexOf("const siapkan = async"));
  assert.match(siapkan.slice(0, 1500), /compileAsync/);
  assert.match(siapkan.slice(0, 1500), /initTexture/);
  assert.match(mesin, /new THREE\.LoadingManager\(/);
});
