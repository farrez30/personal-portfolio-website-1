import { test } from "node:test";
import assert from "node:assert/strict";
import { tataLetak } from "../components/sinarx/tataLetak.js";

const s = (...ids) => ids.map((id) => ({ id, label: id }));

test("rantai lurus jadi satu baris, satu kolom per simpul", () => {
  const h = tataLetak(s("a", "b", "c"), [["a", "b"], ["b", "c"]]);
  assert.deepEqual(h.posisi, { a: { kolom: 0, baris: 0 }, b: { kolom: 1, baris: 0 }, c: { kolom: 2, baris: 0 } });
  assert.equal(h.jumlahKolom, 3);
  assert.equal(h.barisTerbanyak, 1);
});

test("simpul diletakkan di kolom setelah induk terjauhnya", () => {
  // a ke b ke c, dan a langsung ke c: c tetap di kolom 2, bukan 1.
  const h = tataLetak(s("a", "b", "c"), [["a", "b"], ["b", "c"], ["a", "c"]]);
  assert.equal(h.posisi.c.kolom, 2);
});

test("dua sumber masuk ke satu simpul: sumbernya bertumpuk di kolom 0", () => {
  const h = tataLetak(s("web", "ops", "api"), [["web", "api"], ["ops", "api"]]);
  assert.equal(h.posisi.web.kolom, 0);
  assert.equal(h.posisi.ops.kolom, 0);
  assert.deepEqual([h.posisi.web.baris, h.posisi.ops.baris].sort(), [0, 1]);
  assert.equal(h.barisTerbanyak, 2);
});

test("siklus di data tidak membuat fungsi berputar selamanya", () => {
  const h = tataLetak(s("a", "b", "c"), [["a", "b"], ["b", "c"], ["c", "b"]]);
  assert.ok(Number.isFinite(h.jumlahKolom));
  assert.equal(Object.keys(h.posisi).length, 3);
});

test("simpul tanpa garis tetap tampil di kolom 0", () => {
  const h = tataLetak(s("sendiri"), []);
  assert.deepEqual(h.posisi.sendiri, { kolom: 0, baris: 0 });
});

test("garis ke simpul yang tidak ada tidak merusak susunan", () => {
  const h = tataLetak(s("a"), [["a", "hantu"]]);
  assert.deepEqual(h.posisi, { a: { kolom: 0, baris: 0 } });
});
