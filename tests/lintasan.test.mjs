import { test } from "node:test";
import assert from "node:assert/strict";
import { FASE, ANGKAT, angkatBebas } from "../components/imersif/lintasan.js";

const JARI = 0.6; // cakram 120 mm, satuan 100 mm

test("cakram datar di atas lantai tidak dinaikkan", () => {
  assert.equal(angkatBebas(0.5, 1, JARI, 0.2), 0);
});

test("cakram berdiri dinaikkan sampai tepi bawahnya tepat di lantai", () => {
  // Pusat di 0,3, berdiri: tepi bawah di -0,3, lantai 0,2, jadi naik 0,5.
  assert.ok(Math.abs(angkatBebas(0.3, 0, JARI, 0.2) - 0.5) < 1e-12);
});

test("miring 30 derajat: titik terendah turun jari * sin(30)", () => {
  const ny = Math.cos(Math.PI / 6);
  const bawah = 0.5 - JARI * Math.sin(Math.PI / 6);
  assert.ok(Math.abs(angkatBebas(0.5, ny, JARI, 0.4) - (0.4 - bawah)) < 1e-12);
});

test("normal terbalik (cakram menghadap bawah) diperlakukan sama dengan menghadap atas", () => {
  assert.equal(angkatBebas(0.3, -0.5, JARI, 0.1), angkatBebas(0.3, 0.5, JARI, 0.1));
});

test("normal sedikit di atas 1 karena pembulatan tidak menghasilkan NaN", () => {
  assert.equal(angkatBebas(0.3, 1 + 1e-9, JARI, 0.1), 0);
});

test("setelah diangkat, tidak ada sudut miring yang tepinya di bawah lantai", () => {
  for (let i = 0; i <= 90; i++) {
    const ny = Math.cos((i * Math.PI) / 180);
    for (const pusat of [-1, 0, 0.1, 0.25, 0.9]) {
      const y = pusat + angkatBebas(pusat, ny, JARI, 0.25);
      const bawah = y - JARI * Math.sqrt(1 - ny * ny);
      assert.ok(bawah >= 0.25 - 1e-12, `miring ${i}, pusat ${pusat}: tepi ${bawah}`);
    }
  }
});

test("fase berurutan dan jatuh baru mulai saat bawa selesai", () => {
  assert.ok(FASE.dorong < FASE.bawaDari);
  assert.ok(FASE.bawaDari < FASE.bawaSampai);
  assert.ok(FASE.bawaSampai < FASE.jatuhSampai);
  assert.equal(FASE.jatuhSampai, 1);
});

test("tinggi angkat cukup supaya cakram datar melewati bibir pemutar", () => {
  // Bibir badan 4 mm di atas piringan, puncak sumur 6 mm; sisakan ruang.
  assert.ok(ANGKAT > 0.1);
});
