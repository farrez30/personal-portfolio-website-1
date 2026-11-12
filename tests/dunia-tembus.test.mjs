// Benda yang menembus benda lain (masukan Farrez 13 Nov 2026): pemutar kaset tenggelam ke papan
// karena titik asal modelnya di tengah badan, dan tutup vitrin babak aman berputar ke dalam kaca.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
const dunia = baca("components/dunia/dunia.js");
const props = baca("components/dunia/props.js");

test("pemutar kaset didudukkan di permukaan menurut kotak batasnya", () => {
  assert.match(dunia, /o\.position\.y \+= atas - new THREE\.Box3\(\)\.setFromObject\(o\)\.min\.y;/);
  // Papan rak dengar bilik (atas 1,045) dan meja kasir (atas 1,01).
  assert.match(dunia, /dudukkan\(taruh\(kaset, -4\.05, 0, -3\.74, 0\.35, 1\.5\), 1\.045\)/);
  assert.match(dunia, /dudukkan\(taruh\(kaset, 1\.35, 0, 3\.0, -0\.6, 1\.4\), 1\.01\)/);
  assert.doesNotMatch(dunia, /taruh\(kaset, [-\d.]+, 1\.0\d+,/);
});

test("tutup vitrin terbuka ke atas: engsel di belakang, tepi depan di -z, sudut positif", () => {
  assert.match(props, /tutup\.position\.set\(0, 0\.045 \+ H, D \/ 2\);/);
  assert.match(props, /kotak\(W, 0\.006, D, bahan\.kaca, 0, 0\.003, -D \/ 2, tutup/);
  // Rotasi x sebesar t: y tepi depan (z = -D) menjadi D * sin(t). Positif berarti di atas kaca.
  const m = props.match(/tutup\.rotation\.x = (-?[\d.]+) \* \(1 - halus/);
  assert.ok(m, "rumus sudut tutup ditemukan");
  const sudut = Number(m[1]);
  assert.ok(0.34 * Math.sin(sudut) > 0, `tepi depan harus terangkat, sudut ${sudut}`);
});
