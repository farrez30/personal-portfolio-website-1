// Kontrak perpindahan bertipe cerita v5 (F3, ADR 0023): tiap jenis mulai dan berakhir tepat di pose
// babaknya, tidak menembus benda, tidak menatap ke atas dinding, gulir mundur memutar jalur yang
// sama, dan tiap jenis benar-benar melakukan geraknya (nota terbang dan diikuti, whip diam dulu lalu
// lewat sedikit, layar memenuhi bingkai di potongan, orbit memutari meja, pilar menyapu bingkai
// sebentar, crane naik di atas denah tanpa gambar terbalik). Jalur keluar jendela F4 punya tesnya
// sendiri di bagian akhir.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { susunLantai, susun, batas, LANTAI, TABLET, notaTerbang, CELAH_JENDELA, FASAD } from "../components/stasiun/lantai.js";
import { ANCHOR_V5, JENIS, poseAnchor, poseJalur, poseAntara, GESER, TINGGI_CRANE } from "../components/stasiun/naskah.js";
import { kulitGedung, batasKota, JALAN_DEPAN } from "../components/stasiun/kota.js";

const BENDA = susunLantai();
const PADAT = BENDA.filter((o) => o.bahan === "toon" || o.bahan === "layar");
// Kulit gedung klien dan kota di sekitarnya. Pelat atas, lantai 3, dan atap hanya tampak sesudah
// kamera keluar jendela (crane membuka lantai kantor dari atas), jadi hanya padat bagi jalur itu.
const KULIT = kulitGedung();
const LUAR = [...KULIT.bawah.map(batas), ...batasKota()];
const LUAR_JENDELA = [...LUAR, ...KULIT.atas.map(batas)];
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

test("delapan perpindahan: blend dari hero, enam jenis di lantai kantor, keluar jendela ke kota", () => {
  assert.deepEqual([...new Set(JALUR.map((j) => j.jenis))], ["blend", "ikut", "whip", "layar", "orbit", "pilar", "crane", "jendela"]);
  assert.equal(JALUR.length, 16);
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

test("tiap jalur tidak menembus benda, juga kulit gedung dan kota di luarnya", () => {
  for (const j of JALUR) for (const e of SAMPEL) {
    const p = pada(j, e).posisi;
    const kena = PADAT.find((o) => dalam(p, batas(o), 0.05));
    assert.equal(kena, undefined, `${j.nama} di ${e} menembus ${kena?.bentuk} ${kena?.ukuran}`);
    const luar = (JENIS[j.jenis].makro ? LUAR_JENDELA : LUAR).find((b) => dalam(p, b, 0.05));
    assert.equal(luar, undefined, `${j.nama} di ${e} menembus benda luar di ${luar?.min}`);
  }
});

test("tiap jalur di dalam gedung tetap di atas lantai dan di dalam denah, hanya crane yang naik di atas dinding", () => {
  for (const j of JALUR.filter((x) => !JENIS[x.jenis].makro)) for (const e of SAMPEL) {
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

// ---- F4: keluar jendela ke atas kota ------------------------------------------------------------
// Sampel rapat untuk jalur panjang: 2,8 detik, 1201 titik (sekitar 2 ms per titik).
const RAPAT = Array.from({ length: 1201 }, (_, s) => s / 1200);
const SEMUA_PADAT = [...PADAT.map(batas), ...LUAR_JENDELA];
// Kotak yang berdekatan dengan ruas p..q saja (ribuan kotak kota, ribuan ruas).
const dekat = (p, q, r) => SEMUA_PADAT.filter((b) => [0, 1, 2].every((k) => Math.min(p[k], q[k]) - r < b.max[k] && Math.max(p[k], q[k]) + r > b.min[k]));
const besar = (b, r) => ({ min: b.min.map((v) => v - r), max: b.max.map((v) => v + r) });
// Bidang dekat (near) kamera pada pose ini, sama dengan adegan.js pasang().
const near = (q) => Math.min(4, Math.max(0.03, Math.hypot(...arah(q)) * 0.015));

test("jendela: raycast sepanjang jalur tidak memotong benda apa pun, dengan jarak aman setebal bidang dekat", () => {
  for (const j of satu("jendela")) for (let s = 0; s + 1 < RAPAT.length; s++) {
    const p = pada(j, RAPAT[s]);
    const q = pada(j, RAPAT[s + 1]);
    // ruas antarsampel diperbesar setebal bidang dekat: tidak ada benda yang terpotong bidang dekat
    const r = Math.max(near(p), 0.05);
    const kena = dekat(p.posisi, q.posisi, r).find((b) => kenaRuas(p.posisi, q.posisi, besar(b, r)));
    assert.equal(kena, undefined, `${j.nama} ruas ${RAPAT[s]}: kena kotak di ${kena?.min}`);
  }
});

test("jendela: lewat celah tanpa tiang, datar setinggi ambang sampai di luar fasad", () => {
  for (const j of satu("jendela")) {
    const titik = RAPAT.map((e) => pada(j, e).posisi);
    // tiap titik yang berada di tebal fasad (ambang, kusen, kaca) ada di dalam celah dengan sela
    const diFasad = titik.filter((p) => p[2] > FASAD.z - 0.3 && p[2] < FASAD.kaca + 0.3);
    assert.ok(diFasad.length >= 3, `${j.nama}: jalur tidak melewati fasad`);
    for (const p of diFasad) {
      assert.ok(p[0] > CELAH_JENDELA[0] + 1 && p[0] < CELAH_JENDELA[1] - 1, `${j.nama}: x ${p[0]} terlalu dekat kusen`);
      assert.ok(p[1] > FASAD.ambang + 1 && p[1] < FASAD.lintel - 0.4, `${j.nama}: y ${p[1]} terlalu dekat ambang atau lintel`);
    }
    // datar: dari setinggi celah (2,3 m) sampai 2 m di luar fasad, naik turunnya paling banyak 25 cm
    const mulai = titik.findIndex((p) => p[1] >= 2.3);
    const akhir = titik.findIndex((p) => p[2] > FASAD.kaca + 2);
    const ys = titik.slice(mulai, akhir).map((p) => p[1]);
    assert.ok(mulai >= 0 && akhir > mulai);
    assert.ok(Math.max(...ys) - Math.min(...ys) < 0.25, `${j.nama}: tidak datar (${Math.min(...ys)} sampai ${Math.max(...ys)})`);
  }
});

test("jendela: selama di dalam gedung kamera memandang keluar lewat celah, bukan ke kusen atau dinding", () => {
  const fasad = PADAT.filter((o) => o.bentuk === "kotak" && Math.abs(o.m[14] - FASAD.z) < 0.01).map(batas);
  assert.ok(fasad.length >= 10, "ambang, lintel, dan kusen ikut diperiksa");
  for (const j of satu("jendela")) for (const e of RAPAT) {
    const q = pada(j, e);
    if (q.posisi[2] < 2 || q.posisi[2] > FASAD.z) continue;
    // sinar tengah layar sejauh 30 m ke depan
    const d = arah(q).map((v) => v / Math.hypot(...arah(q)));
    const ujung = q.posisi.map((v, k) => v + d[k] * 30);
    const kena = fasad.find((b) => kenaRuas(q.posisi, ujung, b));
    assert.equal(kena, undefined, `${j.nama} di ${e}: sinar tengah kena fasad di ${kena?.min}`);
  }
});

test("jendela: naik hampir tegak di atas jalan depan, lalu menjauh ke bidikan kota", () => {
  for (const j of satu("jendela")) {
    const titik = RAPAT.map((e) => pada(j, e).posisi);
    const naik = titik.filter((p) => p[1] > 6 && p[1] < 60);
    assert.ok(naik.length > 20);
    for (const p of naik) assert.ok(Math.abs(p[2] - JALAN_DEPAN.z) < JALAN_DEPAN.lebar / 2, `${j.nama}: naik di z ${p[2]}, di luar jalan`);
    const geser = Math.hypot(naik.at(-1)[0] - naik[0][0], naik.at(-1)[2] - naik[0][2]);
    assert.ok(geser < 0.15 * (naik.at(-1)[1] - naik[0][1]), `${j.nama}: bergeser ${geser} m selama naik`);
    // tinggi tidak pernah turun sesudah keluar fasad
    const luar = titik.findIndex((p) => p[2] > FASAD.kaca + 1);
    for (let s = luar + 1; s < titik.length; s++) assert.ok(titik[s][1] >= titik[s - 1][1] - 0.25, `${j.nama}: turun di sampel ${s}`);
  }
});

test("jendela: tidak ada jeda mati, kamera terus bergerak atau berputar sampai bidikan kota", () => {
  for (const j of satu("jendela")) {
    const dur = ANCHOR_V5[j.i].durasi;
    // jendela 0,2 s: posisi bergeser atau arah pandang berputar
    for (let e = 0.05; e + 0.0714 <= 0.95; e += 0.05) {
      const [p, q] = [pada(j, e), pada(j, e + 0.2 / dur)];
      const pindah = Math.hypot(...p.posisi.map((v, k) => v - q.posisi[k]));
      const putar = sudut(arah(p), arah(q));
      assert.ok(pindah > 0.05 || putar > 0.02, `${j.nama} di ${e.toFixed(2)}: diam`);
    }
  }
});
