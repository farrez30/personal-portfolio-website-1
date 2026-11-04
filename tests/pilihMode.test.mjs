import { test } from "node:test";
import assert from "node:assert/strict";
import { pilihModeAwal } from "../components/mode/pilihMode.js";

const kuat = { webgl2: true, kurangiGerak: false, hematData: false, memori: 8, inti: 8 };

test("pilihan tersimpan selalu menang, walau perangkat lemah", () => {
  assert.equal(pilihModeAwal("imersif", { webgl2: false, kurangiGerak: true }), "imersif");
  assert.equal(pilihModeAwal("ringan", kuat), "ringan");
});

test("nilai simpanan yang tidak dikenal diabaikan", () => {
  assert.equal(pilihModeAwal("3d", kuat), "imersif");
  assert.equal(pilihModeAwal(null, kuat), "imersif");
});

test("tanpa WebGL2, minta gerak dikurangi, atau hemat data: Ringan", () => {
  assert.equal(pilihModeAwal(null, { ...kuat, webgl2: false }), "ringan");
  assert.equal(pilihModeAwal(null, { ...kuat, kurangiGerak: true }), "ringan");
  assert.equal(pilihModeAwal(null, { ...kuat, hematData: true }), "ringan");
});

test("batas memori dan inti di 4: di bawahnya Ringan, tepat 4 Imersif", () => {
  assert.equal(pilihModeAwal(null, { ...kuat, memori: 2 }), "ringan");
  assert.equal(pilihModeAwal(null, { ...kuat, memori: 4 }), "imersif");
  assert.equal(pilihModeAwal(null, { ...kuat, inti: 3 }), "ringan");
  assert.equal(pilihModeAwal(null, { ...kuat, inti: 4 }), "imersif");
});

test("browser yang tidak melaporkan memori atau inti tidak dihukum", () => {
  assert.equal(pilihModeAwal(null, { ...kuat, memori: null, inti: undefined }), "imersif");
});
