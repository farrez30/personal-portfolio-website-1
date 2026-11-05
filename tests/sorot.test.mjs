import { test } from "node:test";
import assert from "node:assert/strict";
import { kedip, ujungSorot } from "../components/imersif/sorot.js";

test("kedip tetap dalam rentang dan sebagian besar waktu nyaris penuh", () => {
  let tenang = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const v = kedip(i * 0.005);
    assert.ok(v >= 0.55 && v <= 1.1, `di luar rentang: ${v}`);
    if (v > 0.94) tenang++;
  }
  // Redupnya singkat: lebih dari 90% bingkai harus tenang.
  assert.ok(tenang / n > 0.9, `terlalu sering berkedip: ${tenang / n}`);
});

test("kedip punya setidaknya satu redup dalam 10 detik", () => {
  let min = 1;
  for (let i = 0; i < 10000; i++) min = Math.min(min, kedip(i * 0.001));
  assert.ok(min < 0.7, `tidak pernah redup: ${min}`);
});

test("kedip deterministik", () => {
  assert.equal(kedip(12.345), kedip(12.345));
});

test("ujung sorot di tengah panel, sedikit di atas dan lebih lebar dari panel", () => {
  const kanvas = { left: 0, top: 60, width: 1000, height: 800 };
  const panel = { left: 300, top: 160, width: 400, height: 200 };
  const u = ujungSorot(panel, kanvas);
  assert.equal(u.x, 0.5);
  // 160 - 0,14 x 200 - 60 = 72 px dari atas kanvas
  assert.ok(Math.abs(u.y - 72 / 800) < 1e-9, `y ${u.y}`);
  // setengah lebar 200 px x 1,3 = 260 px
  assert.ok(Math.abs(u.w - 0.26) < 1e-9, `w ${u.w}`);
});

test("ujung sorot kosong bila panel atau kanvas belum berukuran", () => {
  assert.equal(ujungSorot(null, { left: 0, top: 0, width: 10, height: 10 }), null);
  assert.equal(ujungSorot({ left: 0, top: 0, width: 0, height: 0 }, { left: 0, top: 0, width: 10, height: 10 }), null);
  assert.equal(ujungSorot({ left: 0, top: 0, width: 5, height: 5 }, { left: 0, top: 0, width: 0, height: 0 }), null);
});
