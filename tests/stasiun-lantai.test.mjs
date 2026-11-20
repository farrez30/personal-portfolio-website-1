// Kontrak lantai kantor cerita v5 (F2): susunan meja berselang, pose kamera di dalam gedung dan
// tidak di dalam benda, pandangan ke meja tidak terhalang pilar, tanaman, atau orang di lorong,
// dan matematika matriks sama dengan three.js (dunia.js memakai matriksnya apa adanya).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { susunLantai, susun, batas, TEMPAT, POSE, TABLET, PILAR_LEWAT, LABEL, LANTAI } from "../components/stasiun/lantai.js";
import { ANCHOR_V5, poseAnchor, durasiAntara, poseDalam, poseBlend, DORONG, BATAS_DALAM } from "../components/stasiun/naskah.js";

const BENDA = susunLantai();
const PADAT = BENDA.filter((o) => o.bahan === "toon" || o.bahan === "layar");
const dalam = (p, b, sela = 0) => p.every((v, k) => v > b.min[k] - sela && v < b.max[k] + sela);
const potong = (a, b) => [0, 1, 2].every((k) => a.min[k] < b.max[k] && b.min[k] < a.max[k]);
// Ruas p..q memotong kotak batas b (metode slab).
function kenaRuas(p, q, b) {
  let t0 = 0;
  let t1 = 1;
  for (let k = 0; k < 3; k++) {
    const d = q[k] - p[k];
    if (Math.abs(d) < 1e-9) {
      if (p[k] < b.min[k] || p[k] > b.max[k]) return false;
      continue;
    }
    let a = (b.min[k] - p[k]) / d;
    let c = (b.max[k] - p[k]) / d;
    if (a > c) [a, c] = [c, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, c);
    if (t0 > t1) return false;
  }
  return true;
}
const SEMUA_POSE = Object.entries(POSE).flatMap(([id, p]) => [
  [`${id} lebar`, p],
  [`${id} tegak`, p.tegak],
]);

test("matriks susun sama dengan Matrix4.compose three.js", () => {
  for (const [p, r, s] of [
    [[1, 2, 3], [0.3, -1.1, 0.7], [2, 0.5, 1.5]],
    [[0, 0, 0], [Math.PI / 2, 0, 0.04], [1, 1, 1]],
    [[-17, 0.74, 1.7], [0, Math.PI, 0], [1, 1, 1]],
  ]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
    const a = susun(p, r, s);
    m.elements.forEach((v, i) => assert.ok(Math.abs(v - a[i]) < 1e-9, `elemen ${i}`));
  }
});

test("tablet tarikan berdiri menghadap kamera babaknya, tablet biaya tergeletak menghadap atas", () => {
  const t = TABLET.tarikan;
  const o = new THREE.Object3D();
  o.position.set(...t.c);
  o.lookAt(new THREE.Vector3(POSE.tarikan.posisi[0], t.c[1], POSE.tarikan.posisi[2]));
  o.updateMatrix();
  o.matrix.elements.forEach((v, i) => assert.ok(Math.abs(v - t.m[i]) < 1e-9, `tarikan elemen ${i}`));
  const m = TABLET.biaya.m;
  assert.ok(Math.abs(m[9] - 1) < 1e-9, "layar tablet biaya menghadap ke atas");
  // tidak menutupi lembar lingkup di meja yang sama
  const lingkup = batas(BENDA.find((x) => x.isi === "lingkup"));
  const tablet = batas(BENDA.find((x) => x.isi === "tablet" && Math.abs(x.m[13] - TABLET.biaya.c[1]) < 0.01));
  assert.ok(!potong({ min: [lingkup.min[0], -9, lingkup.min[2]], max: [lingkup.max[0], 9, lingkup.max[2]] }, tablet));
});

test("meja dua baris berselang: belakang menghadap dinding, depan diputar 180 derajat", () => {
  const meja = TEMPAT.filter(([id]) => id !== "data");
  meja.forEach(([id, , z, putar], i) => {
    const belakang = i % 2 === 0;
    assert.equal(putar, belakang ? 0 : Math.PI, `${id} putar`);
    assert.ok(belakang ? z < 0 : z > 0, `${id} baris`);
  });
  // urutan di lantai sama dengan urutan babak, dari kiri ke kanan
  const x = TEMPAT.map((t) => t[1]);
  assert.deepEqual([...x].sort((a, b) => a - b), x);
});

test("setiap babak di lantai kantor punya pose lebar dan tegak di ANCHOR_V5", () => {
  const diLantai = ["gerbang", ...TEMPAT.map((t) => t[0])];
  for (const id of diLantai) {
    const i = ANCHOR_V5.findIndex((a) => a.id === id);
    assert.ok(i >= 0, id);
    for (const tegak of [false, true]) {
      const p = poseAnchor(i, tegak);
      assert.ok(p && p.posisi.length === 3 && p.lihat.length === 3 && p.fov > 20, `${id} tegak=${tegak}`);
    }
  }
  // babak sesudah gedung belum punya dunia (F4 sampai F6)
  for (const id of ["ramai", "langkah-kecil", "penutup", "modul-lab"]) assert.equal(poseAnchor(ANCHOR_V5.findIndex((a) => a.id === id)), null, id);
});

test("kamera selalu di dalam gedung dan tidak di dalam benda apa pun", () => {
  const ruang = { min: [-LANTAI.lebar / 2 + 0.2, 0.3, -3.75], max: [LANTAI.lebar / 2 - 0.2, LANTAI.tinggi, 3.85] };
  for (const [nama, p] of SEMUA_POSE) {
    assert.ok(dalam(p.posisi, ruang), `${nama} di luar gedung: ${p.posisi}`);
    const kena = PADAT.find((o) => dalam(p.posisi, batas(o), 0.05));
    assert.equal(kena, undefined, `${nama} di dalam ${kena?.bentuk} ${kena?.ukuran}`);
  }
});

test("pandangan kamera ke titik lihatnya tidak terhalang pilar, tanaman, atau orang di lorong", () => {
  // benda lorong: semua yang tinggi berdiri di z antara dua baris meja
  const lorong = PADAT.map(batas).filter((b) => b.min[2] > -1.6 && b.max[2] < 0.4 && b.max[1] > 1);
  assert.ok(lorong.length >= 5, "pilar, tanaman, dan orang di lorong ikut diperiksa");
  for (const [nama, p] of SEMUA_POSE) {
    const kena = lorong.find((b) => kenaRuas(p.posisi, p.lihat, b));
    assert.equal(kena, undefined, `${nama} terhalang benda di ${kena?.min}`);
  }
});

test("pilar lorong tidak menabrak meja atau benda lain", () => {
  const tinggi = PADAT.filter((o) => o.bentuk === "kotak" && o.ukuran[1] === LANTAI.tinggi && o.ukuran[0] === 0.45);
  assert.equal(tinggi.length, 3);
  assert.ok(tinggi.some((o) => Math.abs(o.m[12] - PILAR_LEWAT[0]) < 1e-9 && Math.abs(o.m[14] - PILAR_LEWAT[1]) < 1e-9));
  for (const pilar of tinggi) {
    const bp = batas(pilar);
    const tabrak = PADAT.filter((o) => o !== pilar && o.ukuran[0] < 5 && potong(bp, batas(o)) && batas(o).max[1] < LANTAI.tinggi);
    assert.deepEqual(tabrak.map((o) => `${o.bentuk} ${o.ukuran}`), [], `pilar di x ${pilar.m[12]}`);
  }
});

test("hero melihat meja pertama dari ujung lorong", () => {
  const [, x, z] = TEMPAT[0];
  const l = POSE.gerbang.lihat;
  assert.ok(Math.hypot(l[0] - x, l[2] - z) < 2, "titik lihat hero di dekat meja dorongan");
  assert.ok(POSE.gerbang.posisi[0] < x, "kamera di ujung kiri lorong");
});

test("tiap label dunia ditulis di id dan en", () => {
  const dipakai = new Set(BENDA.filter((o) => o.bahan === "label").map((o) => o.isi.slice(6)));
  assert.ok(dipakai.size >= 8);
  for (const k of dipakai) for (const l of ["id", "en"]) assert.ok(LABEL[k]?.[l]?.length > 1, `${k}.${l}`);
});

test("durasi perpindahan: satu langkah memakai durasi keluar, lompatan dibatasi, gerak dikurangi jadi potongan", () => {
  const i = ANCHOR_V5.findIndex((a) => a.id === "dorongan");
  assert.equal(durasiAntara(i, i + 1), ANCHOR_V5[i].durasi);
  assert.equal(durasiAntara(i + 1, i), ANCHOR_V5[i].durasi);
  assert.equal(durasiAntara(0, 5), 1.2);
  assert.equal(durasiAntara(i, i + 1, true), 0);
  assert.equal(durasiAntara(-1, 0), 0);
  // keluar ke anchor tanpa dunia: potongan, kanvas memudar
  const kb = ANCHOR_V5.findIndex((a) => a.id === "kebiasaan");
  assert.equal(durasiAntara(kb, kb + 1), 0);
  for (let a = 0; a < ANCHOR_V5.length; a++) for (let b = 0; b < ANCHOR_V5.length; b++) assert.ok(durasiAntara(a, b) <= BATAS_DALAM);
});

test("dorongan dalam babak: mulai 5% lebih jauh, berakhir tepat di pose, titik lihat tetap", () => {
  const p = POSE.dorongan;
  const jarak = (q) => Math.hypot(...q.posisi.map((v, k) => v - q.lihat[k]));
  const awal = poseDalam(p, 0);
  const akhir = poseDalam(p, 1);
  assert.ok(Math.abs(jarak(awal) / jarak(p) - (1 + DORONG)) < 1e-9);
  assert.deepEqual(akhir.posisi, p.posisi.map((v, k) => p.lihat[k] + (v - p.lihat[k]) * 1));
  assert.deepEqual(awal.lihat, p.lihat);
  assert.ok(jarak(poseDalam(p, 0.5)) < jarak(awal) && jarak(poseDalam(p, 0.5)) > jarak(akhir));
  assert.deepEqual(poseDalam(p, -3).posisi, awal.posisi);
});

// Semua perpindahan satu langkah antara babak berdunia, layar lebar dan tegak, 41 titik.
const PASANGAN = [];
for (let i = 0; i + 1 < ANCHOR_V5.length; i++) for (const tegak of [false, true]) {
  const a = poseAnchor(i, tegak);
  const b = poseAnchor(i + 1, tegak);
  if (a && b) PASANGAN.push([`${ANCHOR_V5[i].id} ke ${ANCHOR_V5[i + 1].id}${tegak ? " tegak" : ""}`, a, b]);
}
const pitch = (p) => Math.asin((p.lihat[1] - p.posisi[1]) / Math.hypot(...p.lihat.map((v, k) => v - p.posisi[k])));

test("blend antarbabak mulai dan berakhir tepat di pose kedua babak", () => {
  assert.ok(PASANGAN.length >= 14);
  for (const [nama, a, b] of PASANGAN) {
    for (const [u, p] of [[0, a], [1, b]]) {
      const q = poseBlend(a, b, u);
      q.posisi.forEach((v, k) => assert.ok(Math.abs(v - p.posisi[k]) < 1e-6, `${nama} u=${u} posisi`));
      q.lihat.forEach((v, k) => assert.ok(Math.abs(v - p.lihat[k]) < 1e-6, `${nama} u=${u} lihat`));
    }
  }
});

test("blend tidak pernah menunduk lebih dalam dari kedua ujungnya (layar lantai kosong)", () => {
  for (const [nama, a, b] of PASANGAN) {
    const bawah = Math.min(pitch(a), pitch(b));
    for (let s = 0; s <= 40; s++) assert.ok(pitch(poseBlend(a, b, s / 40)) >= bawah - 1e-9, `${nama} di ${s / 40}`);
  }
});

test("blend tidak menembus benda", () => {
  for (const [nama, a, b] of PASANGAN) for (let s = 0; s <= 40; s++) {
    const p = poseBlend(a, b, s / 40).posisi;
    const kena = PADAT.find((o) => dalam(p, batas(o), 0.05));
    assert.equal(kena, undefined, `${nama} di ${s / 40} menembus ${kena?.bentuk} ${kena?.ukuran}`);
  }
});

test("putaran antarbaris menoleh ke arah perjalanan, memandang sepanjang lorong", () => {
  const a = POSE.dorongan;
  const b = POSE["harga-diam"];
  const m = poseBlend(a, b, 0.5);
  const arah = m.lihat.map((v, k) => v - m.posisi[k]);
  assert.ok(arah[0] > 0, "di tengah perpindahan kamera menghadap +x, ke meja berikutnya");
});

test("putaran hampir 180 derajat memilih sisi arah perjalanan walau sisi lain lebih pendek", () => {
  // jalan ke +x; putaran terpendek dari arah ini lewat -x (menghadap dinding samping kiri)
  const a = { posisi: [0, 1, 0], lihat: [-0.2, 1, -1], fov: 38 };
  const b = { posisi: [3, 1, 0], lihat: [2.7, 1, 1], fov: 38 };
  for (const u of [0.3, 0.5, 0.7]) {
    const m = poseBlend(a, b, u);
    assert.ok(m.lihat[0] - m.posisi[0] > 0, `u=${u} menghadap arah perjalanan`);
  }
});

test("di tengah perpindahan kamera setinggi ujung yang lebih datar, menunduk ke meja tampak atas di akhir", () => {
  for (const [nama, a, b] of PASANGAN) {
    const datar = Math.max(pitch(a), pitch(b));
    assert.ok(Math.abs(pitch(poseBlend(a, b, 0.5)) - datar) < 1e-6, nama);
  }
});
