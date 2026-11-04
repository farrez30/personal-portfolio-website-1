import { test } from "node:test";
import assert from "node:assert/strict";
import { derau, petaCetak, petaBintik, petaPiring, geserJudul, CETAK } from "../components/imersif/prosedural.js";

const habiskan = (gen) => {
  let n = 0;
  while (!gen.next().done) n++;
  return n;
};

test("derau tetap dan di antara 0 dan 1", () => {
  for (let i = 0; i < 500; i++) {
    const v = derau(i * 1.7, i * 0.3);
    assert.ok(v >= 0 && v < 1);
    assert.equal(v, derau(i * 1.7, i * 0.3));
  }
});

test("peta cetak: kekasaran dalam batas, rata-rata di bawah dasar karena pita kilap", () => {
  const u = 128;
  const kasar = new Uint8Array(u * u * 4);
  const normal = new Uint8Array(u * u * 4);
  const jeda = habiskan(petaCetak(u, kasar, normal, { langkah: 16 }));
  // Berhenti tiap 16 baris, dua tahap (kekasaran, lalu normal).
  assert.equal(jeda, (u / 16) * 2);
  let jumlah = 0;
  for (let i = 0; i < kasar.length; i += 4) {
    assert.ok(kasar[i] >= Math.floor(0.02 * 255) && kasar[i] <= 255);
    assert.equal(kasar[i + 3], 255);
    jumlah += kasar[i] / 255;
  }
  const rata = jumlah / (u * u);
  // Pita kilap rata-rata mengurangi 0,25 dari dasar 0,42.
  assert.ok(rata < CETAK.kasar && rata > 0.1, `rata ${rata}`);
});

test("normal mengarah keluar (z positif) dan nyaris satuan", () => {
  const u = 64;
  const n = new Uint8Array(u * u * 4);
  habiskan(petaBintik(u, n));
  for (let i = 0; i < n.length; i += 4) {
    const [x, y, z] = [n[i], n[i + 1], n[i + 2]].map((v) => (v / 255) * 2 - 1);
    assert.ok(z > 0.5);
    assert.ok(Math.abs(Math.hypot(x, y, z) - 1) < 0.03);
  }
});

test("bintik nampan: kekasaran 0,5 ± 0,15 mengikuti tinggi bintik", () => {
  const u = 64;
  const n = new Uint8Array(u * u * 4);
  const k = new Uint8Array(u * u * 4);
  habiskan(petaBintik(u, n, { kasar: k }));
  let min = 1, maks = 0;
  for (let i = 0; i < k.length; i += 4) {
    const v = k[i] / 255;
    min = Math.min(min, v);
    maks = Math.max(maks, v);
  }
  assert.ok(min >= 0.34 && maks <= 0.66, `${min} ${maks}`);
  assert.ok(maks - min > 0.25);
});

test("peta piringan berpusat di sekitar 0,86", () => {
  const u = 64;
  const p = new Uint8Array(u * u * 4);
  habiskan(petaPiring(u, p));
  let s = 0;
  for (let i = 0; i < p.length; i += 4) s += p[i];
  const rata = s / (u * u) / 255;
  assert.ok(Math.abs(rata - 0.86) < 0.03, `rata ${rata}`);
});

test("judul diam dulu, bergulir, lalu mengulang dari awal", () => {
  const opsi = { lebar: 300, jarak: 100, laju: 100, tahan: 1.5 };
  assert.equal(geserJudul(0, opsi), 0);
  assert.equal(geserJudul(1.49, opsi), 0);
  assert.ok(Math.abs(geserJudul(2.5, opsi) - 100) < 1e-9);
  // Satu siklus = 1,5 + 400/100 = 5,5 detik.
  assert.ok(Math.abs(geserJudul(5.5 + 2.5, opsi) - 100) < 1e-9);
  assert.equal(geserJudul(5.5, opsi), 0);
  assert.ok(geserJudul(5.49, opsi) <= 400);
});
