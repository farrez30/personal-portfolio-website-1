// Kontrak data peta Nusantara dan globe malam cerita v5 (F5, components/stasiun/peta.js): koordinat
// bola cocok dengan UV SphereGeometry (tekstur equirectangular), rute satu cabang, satelit dari
// data klien tanpa pengisi, orbit tidak menembus bumi atau saling bertabrakan, dan tekstur WebP
// hasil panggang berukuran pangkat dua sesuai lembar look-dev.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { KLIEN } from "../content/klien.js";
import {
  KOTAK_PETA,
  BIDANG_PETA,
  keLokal,
  kurvaRute,
  KOTA_PETA,
  RUTE_PETA,
  TITIK_PETA,
  R_BUMI,
  keBola,
  ORBIT_KLIEN,
  ORBIT_STASIUN,
  posisiSatelit,
  posisiStasiun,
  lajuOrbit,
  SATELIT,
} from "../components/stasiun/peta.js";

const jarak = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

test("titik bujur dan lintang di bola sama dengan titik SphereGeometry di UV teksturnya", () => {
  const g = new THREE.SphereGeometry(R_BUMI, 72, 36);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i += 37) {
    const [u, v] = [uv.getX(i), uv.getY(i)];
    // baris kutub memakai u bergeser setengah segmen; atribut uv float32
    if (v > 0.98 || v < 0.02) continue;
    // tekstur: bujur -180 di kiri (u 0), lintang 90 di atas (v 1)
    const q = keBola(u * 360 - 180, v * 180 - 90);
    assert.ok(jarak(q, [p.getX(i), p.getY(i), p.getZ(i)]) < 1e-3, `uv ${u}, ${v}`);
  }
});

test("bidang peta mencakup kotaknya, Indonesia di tengah, utara ke -z", () => {
  const [b0, b1, s0, s1] = KOTAK_PETA;
  const pojok = [keLokal(b0, s1), keLokal(b1, s0)];
  assert.ok(Math.abs(pojok[0][0] - (BIDANG_PETA.pusat[0] - BIDANG_PETA.lebar / 2)) < 1e-9);
  assert.ok(Math.abs(pojok[1][2] - (BIDANG_PETA.pusat[2] + BIDANG_PETA.dalam / 2)) < 1e-9);
  assert.ok(keLokal(106.8, 10)[2] < keLokal(106.8, -10)[2], "utara di -z");
  for (const [n, [lon, lat]] of Object.entries(KOTA_PETA)) assert.ok(lon > 95 && lon < 141 && lat > -11 && lat < 6, n);
});

test("rute satu cabang: dari Jakarta ke Surabaya, melengkung di atas bidang peta", () => {
  assert.deepEqual(RUTE_PETA, ["jakarta", "surabaya"]);
  const { a, c, b } = kurvaRute();
  assert.deepEqual(a, keLokal(...KOTA_PETA.jakarta, TITIK_PETA.y));
  assert.deepEqual(b, keLokal(...KOTA_PETA.surabaya, TITIK_PETA.y));
  assert.ok(c[1] > TITIK_PETA.y + 10);
});

test("satelit: satu per klien di orbit kelompoknya, tanpa satelit pengisi", () => {
  const semua = ORBIT_KLIEN.flatMap((o) => o.klien);
  assert.equal(semua.length, KLIEN.length);
  assert.deepEqual([...semua].sort(), KLIEN.map((k) => k.slug).sort());
  for (const o of ORBIT_KLIEN) for (const s of o.klien) assert.equal(KLIEN.find((k) => k.slug === s).kelompok, o.kelompok);
});

// Panel surya selebar 12: dua satelit lebih dekat dari ini saling menembus.
const SELA = Math.hypot(SATELIT.panel[0], SATELIT.panel[2]) + 1;

test("orbit di luar bumi dan tidak bertabrakan selama satu putaran stasiun penuh", () => {
  const T = (2 * Math.PI) / lajuOrbit(ORBIT_STASIUN.r);
  let dekat = Infinity;
  for (let t = 0; t <= T; t += 0.5) {
    const titik = [...ORBIT_KLIEN.flatMap((o) => o.klien.map((_, i) => posisiSatelit(o, i, t))), posisiStasiun(t)];
    for (const p of titik) assert.ok(Math.hypot(...p) > R_BUMI * 1.3, `t ${t}: satelit terlalu dekat bumi`);
    for (let i = 0; i < titik.length; i++) for (let k = i + 1; k < titik.length; k++) dekat = Math.min(dekat, jarak(titik[i], titik[k]));
  }
  assert.ok(dekat > SELA, `dua satelit sedekat ${dekat.toFixed(1)}`);
});

test("orbit dalam lebih cepat (Kepler), satelit di satu orbit berjarak rata", () => {
  assert.ok(lajuOrbit(ORBIT_STASIUN.r) > lajuOrbit(ORBIT_KLIEN[0].r));
  for (const o of ORBIT_KLIEN) {
    const [a, b] = [posisiSatelit(o, 0, 7), posisiSatelit(o, 1, 7)];
    const tali = 2 * o.r * Math.sin(Math.PI / o.klien.length);
    assert.ok(Math.abs(jarak(a, b) - tali) < 1e-6, o.kelompok);
  }
});

// Lebar dan tinggi WebP (VP8, VP8L, atau VP8X) dari headernya.
function ukuranWebp(buf) {
  const jenis = buf.toString("ascii", 12, 16);
  if (jenis === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (jenis === "VP8L") {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
}

test("tekstur peta dan bumi dipanggang jadi WebP pangkat dua: 4096 desktop, 2048 HP", () => {
  for (const nama of ["peta", "bumi"]) for (const w of [4096, 2048]) {
    const buf = readFileSync(new URL(`../public/assets/stasiun/${nama}-${w}.webp`, import.meta.url));
    assert.equal(buf.toString("ascii", 0, 4), "RIFF");
    assert.deepEqual(ukuranWebp(buf), [w, w / 2], `${nama}-${w}`);
    assert.ok(buf.length < 600_000, `${nama}-${w} ${buf.length} byte`);
  }
});
