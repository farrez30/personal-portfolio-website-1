// Gulir halaman memindah rak CD: rak mengikuti posisi pecahan, lalu mendarat searah gulir.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { indeksMendarat } from "../components/imersif/mendarat.js";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("satu notch roda ke bawah sudah pindah ke album berikut", () => {
  assert.equal(indeksMendarat(0.25, 1), 1);
  assert.equal(indeksMendarat(3.25, 1), 4);
  // Geser sangat kecil (sentuhan trackpad) kembali ke album semula.
  assert.equal(indeksMendarat(3.1, 1), 3);
  // Sekitar ambang 12%: di bawahnya belum pindah, di atasnya sudah.
  assert.equal(indeksMendarat(3.11, 1), 3);
  assert.equal(indeksMendarat(3.13, 1), 4);
});

test("satu notch ke atas pindah ke album sebelumnya", () => {
  assert.equal(indeksMendarat(2.75, -1), 2);
  assert.equal(indeksMendarat(2.95, -1), 3);
  assert.equal(indeksMendarat(2.5, -1), 2);
});

test("tanpa arah, mendarat di album terdekat", () => {
  assert.equal(indeksMendarat(4.4, 0), 4);
  assert.equal(indeksMendarat(4.6, 0), 5);
});

test("gulir halaman memakai posisi pecahan, bukan indeks bulat yang memulai tween tiap event", () => {
  const panggung = baca("components/imersif/Panggung.jsx");
  const adegan = baca("components/imersif/adegan.js");
  assert.match(panggung, /a\.ikuti\(p\)/, "gulir harus memanggil ikuti(p)");
  assert.doesNotMatch(panggung, /saatGulir[\s\S]{0,400}a\.fokus\(/, "gulir tidak boleh lewat fokus(i) yang memulai tween");
  assert.match(adegan, /ikuti\(p\)\s*\{/, "adegan harus punya ikuti(p)");
  assert.match(adegan, /k_\.kejar != null/, "bingkai harus mengejar posisi gulir");
});
