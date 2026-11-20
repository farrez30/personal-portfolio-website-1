// Kontrak perpindahan bertipe cerita v5 (F3, ADR 0023): tiap jenis mulai dan berakhir tepat di pose
// babaknya, tidak menembus benda, tidak menatap ke atas dinding, gulir mundur memutar jalur yang
// sama, dan tiap jenis benar-benar melakukan geraknya (nota terbang dan diikuti, whip diam dulu lalu
// lewat sedikit, layar memenuhi bingkai di potongan, orbit memutari meja, pilar menyapu bingkai
// sebentar, crane naik di atas denah tanpa gambar terbalik).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { susunLantai, susun, batas, LANTAI, TABLET, notaTerbang } from "../components/stasiun/lantai.js";
import { ANCHOR_V5, JENIS, poseAnchor, poseJalur, poseAntara, GESER, TINGGI_CRANE } from "../components/stasiun/naskah.js";

const BENDA = susunLantai();
const PADAT = BENDA.filter((o) => o.bahan === "toon" || o.bahan === "layar");
const dalam = (p, b, sela = 0) => p.every((v, k) => v > b.min[k] - sela && v < b.max[k] + sela);
const potong = (a, b) => [0, 1, 2].every((k) => a.min[k] < b.max[k] && b.min[k] < a.max[k]);
// Layar HP 390x844 dan desktop 1440x900, seperti lembar kontak.
const BINGKAI = [
  ["lebar", { aspek: 1440 / 900, tegak: false }],
  ["tegak", { aspek: 390 / 844, tegak: true }],
];
const N = 80;
const SAMPEL = Array.from({ length: N + 1 }, (_, s) => s / N);

// Semua perpindahan satu langkah antara babak berdunia.
const JALUR = [];
for (let i = 0; i + 1 < ANCHOR_V5.length; i++) for (const [nama, bingkai] of BINGKAI) {
  const a = poseAnchor(i, bingkai.tegak);
  const b = poseAnchor(i + 1, bingkai.tegak);
  if (a && b) JALUR.push({ i, jenis: ANCHOR_V5[i].keluar, nama: `${ANCHOR_V5[i].keluar} ${ANCHOR_V5[i].id} ke ${ANCHOR_V5[i + 1].id} ${nama}`, a, b, bingkai });
}
const satu = (jenis) => JALUR.filter((j) => j.jenis === jenis);
const pada = (j, e) => poseJalur(j.i, j.a, j.b, e, j.bingkai);
const pitch = (p) => Math.asin((p.lihat[1] - p.posisi[1]) / Math.hypot(...p.lihat.map((v, k) => v - p.posisi[k])));
const sudut = (u, v) => Math.acos(Math.min(1, Math.max(-1, u.reduce((s, x, k) => s + x * v[k], 0) / (Math.hypot(...u) * Math.hypot(...v)))));
const arah = (p) => p.lihat.map((v, k) => v - p.posisi[k]);

test("tujuh perpindahan lantai kantor, enam jenis bertipe ditambah blend dari hero", () => {
  assert.deepEqual([...new Set(JALUR.map((j) => j.jenis))], ["blend", "ikut", "whip", "layar", "orbit", "pilar", "crane"]);
  assert.equal(JALUR.length, 14);
  for (const j of JALUR) assert.ok(JENIS[j.jenis], j.nama);
});

test("tiap jalur mulai dan berakhir tepat di pose kedua babak", () => {
  for (const j of JALUR) for (const [e, p] of [[0, j.a], [1, j.b]]) {
    const q = pada(j, e);
    q.posisi.forEach((v, k) => assert.ok(Math.abs(v - p.posisi[k]) < 1e-6, `${j.nama} e=${e} posisi`));
    q.lihat.forEach((v, k) => assert.ok(Math.abs(v - p.lihat[k]) < 1e-6, `${j.nama} e=${e} lihat`));
    assert.equal(q.fov, p.fov);
  }
});

test("tiap jalur tidak menembus benda", () => {
  for (const j of JALUR) for (const e of SAMPEL) {
    const p = pada(j, e).posisi;
    const kena = PADAT.find((o) => dalam(p, batas(o), 0.05));
    assert.equal(kena, undefined, `${j.nama} di ${e} menembus ${kena?.bentuk} ${kena?.ukuran}`);
  }
});

test("tiap jalur tetap di atas lantai dan di dalam denah gedung, hanya crane yang naik di atas dinding", () => {
  for (const j of JALUR) for (const e of SAMPEL) {
    const p = pada(j, e).posisi;
    assert.ok(Math.abs(p[0]) < LANTAI.lebar / 2 - 0.2 && p[2] > -3.75 && p[2] < 3.85 && p[1] > 0.3, `${j.nama} di ${e}: ${p}`);
    if (j.jenis !== "crane") assert.ok(p[1] < LANTAI.tinggi, `${j.nama} di ${e} di atas dinding`);
  }
});

test("kamera tidak pernah menengadah ke atas dinding (tanpa plafon, di atasnya latar kosong)", () => {
  for (const j of JALUR) for (const e of SAMPEL) assert.ok(pitch(pada(j, e)) < 0.1, `${j.nama} di ${e}`);
});

test("gulir mundur memutar jalur yang sama dengan waktu dibalik", () => {
  for (const j of JALUR) for (const e of [0, 0.13, 0.5, 0.77, 1]) {
    assert.deepEqual(poseAntara(j.i + 1, j.i, j.b, j.a, e, j.bingkai), pada(j, 1 - e), `${j.nama} e=${e}`);
    assert.deepEqual(poseAntara(j.i, j.i + 1, j.a, j.b, e, j.bingkai), pada(j, e));
  }
  // lompatan jauh dan perpindahan yang disela: blend biasa tanpa nota
  const [a, b] = [poseAnchor(1), poseAnchor(4)];
  const q = poseAntara(1, 4, a, b, 0.5);
  assert.equal(q.nota, null);
  poseAntara(-1, 2, a, b, 1).posisi.forEach((v, k) => assert.ok(Math.abs(v - b.posisi[k]) < 1e-9));
});

test("ikut: nota lepas dari timbangan meja 1, kamera mengikutinya, nota mendarat di timbangan meja 2", () => {
  const nota = notaTerbang();
  for (const j of satu("ikut")) {
    const n0 = pada(j, 0).nota;
    const n1 = pada(j, 1).nota;
    assert.deepEqual(n0.posisi, nota.dari.posisi);
    n1.posisi.forEach((v, k) => assert.ok(Math.abs(v - nota.ke.posisi[k]) < 1e-9));
    // putaran akhir sama dengan pose diam nota meja 2 (modulo satu putaran)
    const beda = n1.rot[1] - nota.ke.ry;
    assert.ok(Math.abs(Math.atan2(Math.sin(beda), Math.cos(beda))) < 1e-9 && Math.abs(n1.rot[0]) < 1e-9);
    assert.ok(Math.abs(n1.s - nota.ke.s) < 1e-9 && n0.s === nota.dari.s);
    // nota naik di tengah jalan dan kamera menatapnya (di tengah bingkai) selama terbang
    assert.ok(pada(j, 0.5).nota.posisi[1] > Math.max(nota.dari.posisi[1], nota.ke.posisi[1]) + 0.35);
    for (const e of [0.25, 0.4, 0.55, 0.7]) {
      const q = pada(j, e);
      assert.ok(sudut(arah(q), q.nota.posisi.map((v, k) => v - q.posisi[k])) < 0.12, `${j.nama} e=${e} nota keluar bingkai`);
    }
  }
  // selama terbang badan nota tidak menembus benda (koin, piring, timbangan); tali timbangan
  // setipis 2 mm yang lewat di tengah piring tidak dihitung
  const lain = PADAT.filter((o) => !o.terbang && Math.min(...o.ukuran.slice(0, 2)) > 0.005);
  for (const j of satu("ikut")) for (const e of SAMPEL) {
    const n = pada(j, e).nota;
    const kotak = batas({ bentuk: "kotak", ukuran: nota.ukuran, m: susun(n.posisi, n.rot, [n.s, n.s, n.s]) });
    const kena = lain.find((o) => potong(kotak, batas(o)));
    assert.equal(kena, undefined, `nota di ${e} menembus ${kena?.bentuk} ${kena?.ukuran}`);
  }
  // perpindahan lain tidak membawa nota
  for (const j of JALUR.filter((x) => x.jenis !== "ikut")) assert.equal(pada(j, 0.5).nota, null);
});

test("whip: diam di tempat selama menoleh, menoleh lewat sedikit dari sasaran lalu balik, baru maju", () => {
  for (const j of satu("whip")) {
    for (const e of [0.1, 0.2, 0.3, 0.39]) assert.deepEqual(pada(j, e).posisi, j.a.posisi, `${j.nama} e=${e} bergerak saat menoleh`);
    const keB = j.b.lihat.map((v, k) => v - j.a.posisi[k]);
    const awal = sudut(arah(j.a), keB);
    assert.ok(awal > 1.7, "meja berikutnya di belakang samping kamera (menoleh lebih dari 97 derajat)");
    // di 0,2 sampai 0,39 arah pandang sempat melewati sasaran: sudut ke arah awal lebih besar dari sudut sasaran
    const lewat = Math.max(...[0.25, 0.3, 0.35].map((e) => sudut(arah(j.a), arah(pada(j, e)))));
    assert.ok(lewat > awal + 0.02, `${j.nama} tidak lewat sasaran (${lewat} vs ${awal})`);
    assert.deepEqual(pada(j, 0.6).lihat, j.b.lihat);
  }
});

// Sudut layar yang tampak (termasuk bagian yang digeser dari kolom teks) dalam koordinat NDC kamera
// tanpa offset, lalu sinar dari kamera ke tiap sudut harus kena layar tablet.
function layarPenuh(q, T, bingkai) {
  const cam = new THREE.PerspectiveCamera(q.fov, bingkai.aspek, 0.01, 50);
  cam.position.set(...q.posisi);
  cam.lookAt(...q.lihat);
  cam.updateMatrixWorld();
  const [gx, gy] = bingkai.tegak ? [0, GESER.tegak] : [GESER.lebar, 0];
  const m = new THREE.Matrix4().fromArray(T.m);
  const inv = m.clone().invert();
  const bidang = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(...T.m.slice(8, 11)).normalize(), new THREE.Vector3(...T.c));
  const r = new THREE.Raycaster();
  for (const x of [-1 - 2 * gx, 1 - 2 * gx]) for (const y of [-1 + 2 * gy, 1 + 2 * gy]) {
    r.setFromCamera(new THREE.Vector2(x, y), cam);
    const titik = r.ray.intersectPlane(bidang, new THREE.Vector3());
    if (!titik) return false;
    const lokal = titik.applyMatrix4(inv);
    if (Math.abs(lokal.x) > 0.12 || Math.abs(lokal.y) > 0.08) return false;
  }
  return true;
}

test("layar: tepat sebelum dan sesudah potongan, layar tablet memenuhi seluruh bingkai yang tampak", () => {
  for (const j of satu("layar")) {
    const [ida, idb] = [ANCHOR_V5[j.i].id, ANCHOR_V5[j.i + 1].id];
    assert.ok(layarPenuh(pada(j, 0.4999), TABLET[ida], j.bingkai), `${j.nama} sebelum potongan`);
    assert.ok(layarPenuh(pada(j, 0.5), TABLET[idb], j.bingkai), `${j.nama} sesudah potongan`);
    // arah atas gambar kamera sama di kedua sisi potongan: tablet sama, gambar tidak berputar
    const atas = (q, T) => {
      const cam = new THREE.PerspectiveCamera();
      cam.position.set(...q.posisi);
      cam.lookAt(...q.lihat);
      const kam = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      return kam.dot(new THREE.Vector3(...T.m.slice(4, 7)).normalize());
    };
    assert.ok(atas(pada(j, 0.4999), TABLET[ida]) > 0.95 && atas(pada(j, 0.5), TABLET[idb]) > 0.95, `${j.nama} gambar terbalik di potongan`);
  }
});

test("orbit: memutari titik lihat meja sedikitnya 90 derajat sebelum pindah", () => {
  for (const j of satu("orbit")) {
    const r = (q) => [q.posisi[0] - j.a.lihat[0], q.posisi[2] - j.a.lihat[2]];
    const sdt = Math.acos(r(j.a).reduce((s, v, k) => s + v * r(pada(j, 0.55))[k], 0) / (Math.hypot(...r(j.a)) * Math.hypot(...r(pada(j, 0.55)))));
    assert.ok(sdt > Math.PI / 2, `${j.nama}: ${sdt}`);
    assert.deepEqual(pada(j, 0.25).lihat, j.a.lihat, "selama memutar titik lihatnya tetap");
  }
});

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

test("pilar: pilar menyapu tengah bingkai sebentar (tirai), tidak menutupi lama", () => {
  const pilar = PADAT.filter((o) => o.bentuk === "kotak" && o.ukuran[1] === LANTAI.tinggi && o.ukuran[0] === 0.45).map(batas);
  for (const j of satu("pilar")) {
    const tutup = SAMPEL.filter((e) => {
      const q = pada(j, e);
      return pilar.some((b) => kenaRuas(q.posisi, q.lihat, b));
    });
    assert.ok(tutup.length > 0, `${j.nama}: pilar tidak pernah lewat di depan kamera`);
    // durasi 0,8 s: tertutup paling lama 0,25 s
    assert.ok((tutup.length / N) * ANCHOR_V5[j.i].durasi <= 0.25, `${j.nama}: tertutup ${tutup.length} sampel`);
  }
});

test("crane: naik ke atas denah, menunduk hampir tegak lurus, gambar tidak terbalik mendadak", () => {
  for (const j of satu("crane")) {
    const puncak = pada(j, 0.5);
    assert.ok(Math.abs(puncak.posisi[1] - TINGGI_CRANE) < 1e-9);
    assert.ok(pitch(puncak) < -1.5, "di atas menatap denah");
    // arah atas gambar kamera (Object3D.lookAt) berubah halus: antarsampel paling banyak 25 derajat
    let lalu = null;
    for (const e of SAMPEL) {
      const q = pada(j, e);
      const cam = new THREE.PerspectiveCamera();
      cam.position.set(...q.posisi);
      cam.lookAt(...q.lihat);
      const atas = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      if (lalu) assert.ok(atas.angleTo(lalu) < (25 * Math.PI) / 180, `${j.nama} e=${e} gambar berputar ${atas.angleTo(lalu)}`);
      lalu = atas;
    }
  }
});
