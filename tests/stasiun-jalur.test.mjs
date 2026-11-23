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
import { ANCHOR_V5, JENIS, poseAnchor, poseJalur, poseAntara, poseDalam, GESER, TINGGI_CRANE } from "../components/stasiun/naskah.js";
import { kulitGedung, batasKota, JALAN_DEPAN, ATAP_KLIEN } from "../components/stasiun/kota.js";
import { SILANG_PETA } from "../components/stasiun/naskah.js";
import { BIDANG_PETA, JAKARTA_PETA, TITIK_PETA, JAKARTA_BOLA, R_BUMI, rangkaStasiun, titikJendela, lajuOrbit, ORBIT_STASIUN, JENDELA_STASIUN } from "../components/stasiun/peta.js";
import { AKHIR_GLOBE, SILANG_LAB } from "../components/stasiun/naskah.js";
import { susunLab, bendaLab } from "../components/stasiun/lab.js";
import { proyek } from "../content/proyek.js";

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
// Pose utama dan lapisan silangnya (serah terima antartahap).
const lapisan = (q) => (q.silang ? [q, q.silang] : [q]);

test("sebelas perpindahan: blend dari hero, enam jenis di lantai kantor, keluar jendela, serah terima ke peta, globe, dan modul lab", () => {
  assert.deepEqual([...new Set(JALUR.map((j) => j.jenis))], ["blend", "ikut", "whip", "layar", "orbit", "pilar", "crane", "jendela", "serah-peta", "serah-globe", "zoom-satelit"]);
  assert.equal(JALUR.length, 22);
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
    const q = pada(j, e);
    // peta dan globe punya satuan sendiri; tesnya di bagian F5
    if (q.tahap !== "gedung") continue;
    const p = q.posisi;
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
  // zoom-satelit mengejar stasiun di orbit miring, jadi kadang menengadah ke arah stasiun; di luar
  // angkasa dan di dalam modul (berplafon) tidak ada latar kosong. Aturannya dites di bagian F6.
  for (const j of JALUR.filter((x) => x.jenis !== "zoom-satelit")) for (const e of SAMPEL) for (const q of lapisan(pada(j, e))) assert.ok(pitch(q) < 0.1, `${j.nama} di ${e}`);
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

// ---- F5: serah terima kota ke peta dan peta ke globe ----------------------------------------------
// Kamera seperti adegan.js: bingkai digeser dari kolom teks lewat setViewOffset, jadi NDC -1..1
// adalah bagian layar yang tampak.
const UKURAN = { lebar: [1440, 900], tegak: [390, 844] };
function kamera(q, bingkai) {
  const [w, h] = UKURAN[bingkai.tegak ? "tegak" : "lebar"];
  const cam = new THREE.PerspectiveCamera(q.fov, w / h, 0.1, 1e5);
  if (bingkai.tegak) cam.setViewOffset(w, h, 0, h * GESER.tegak, w, h);
  else cam.setViewOffset(w, h, -w * GESER.lebar, 0, w, h);
  cam.position.set(...q.posisi);
  cam.lookAt(...q.lihat);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}
const layar = (cam, p) => new THREE.Vector3(...p).project(cam);
const diBingkai = (v, sela = 0) => Math.abs(v.x) < 1 - sela && Math.abs(v.y) < 1 - sela && v.z < 1;
// Lebar benda selebar `ukuran` di titik p, sebagai bagian dari tinggi bingkai.
const besarLayar = (cam, p, ukuran) => {
  const j = cam.position.distanceTo(new THREE.Vector3(...p));
  return ukuran / (2 * j * Math.tan((cam.fov * Math.PI) / 360));
};
const RAPAT_SERAH = Array.from({ length: 601 }, (_, s) => s / 600);

test("serah-peta: bagian kota tidak memotong benda apa pun, dengan jarak aman setebal bidang dekat", () => {
  for (const j of satu("serah-peta")) for (let s = 0; s + 1 < RAPAT_SERAH.length; s++) {
    const [p, q] = [pada(j, RAPAT_SERAH[s]), pada(j, RAPAT_SERAH[s + 1])];
    if (p.tahap !== "gedung" || q.tahap !== "gedung") continue;
    const r = Math.max(near(p), 0.05);
    const kena = dekat(p.posisi, q.posisi, r).find((b) => kenaRuas(p.posisi, q.posisi, besar(b, r)));
    assert.equal(kena, undefined, `${j.nama} ruas ${RAPAT_SERAH[s]}: kena kotak di ${kena?.min}`);
  }
});

test("serah-peta: silang kota ke peta 0,3 detik, bobotnya hanya naik", () => {
  for (const j of satu("serah-peta")) {
    const dur = ANCHOR_V5[j.i].durasi;
    let lalu = 0;
    const silang = [];
    for (const e of RAPAT_SERAH) {
      const q = pada(j, e);
      const w = q.tahap === "peta" ? 1 : (q.silang?.w ?? 0);
      assert.ok(w >= lalu - 1e-12, `${j.nama} di ${e}: silang mundur`);
      if (w > 0 && w < 1) silang.push(e);
      lalu = w;
      if (q.silang) assert.equal(q.silang.tahap, "peta");
    }
    const lama = (silang.at(-1) - silang[0]) * dur;
    assert.ok(lama > 0.27 && lama < 0.33, `${j.nama}: silang ${lama} s`);
  }
});

test("serah-peta: atap merah gedung klien tetap di bingkai dan mengecil jadi titik di tengah", () => {
  for (const j of satu("serah-peta")) {
    let lalu = Infinity;
    for (const e of RAPAT_SERAH.filter((e) => e < SILANG_PETA[1])) {
      const q = pada(j, e);
      const cam = kamera(q, j.bingkai);
      assert.ok(diBingkai(layar(cam, ATAP_KLIEN.pusat), 0.05), `${j.nama} di ${e}: atap keluar bingkai`);
      const b = besarLayar(cam, ATAP_KLIEN.pusat, ATAP_KLIEN.lebar);
      assert.ok(b <= lalu + 1e-9, `${j.nama} di ${e}: atap membesar lagi`);
      lalu = b;
    }
    // di awal silang atapnya sudah kecil dan di titik bidik (tengah bagian di samping teks)
    const q = pada(j, SILANG_PETA[0]);
    const cam = kamera(q, j.bingkai);
    const [v, c] = [layar(cam, ATAP_KLIEN.pusat), layar(cam, q.lihat)];
    assert.ok(Math.hypot(v.x - c.x, v.y - c.y) < 0.05, `${j.nama}: atap di ${v.x}, ${v.y}`);
    assert.ok(besarLayar(cam, ATAP_KLIEN.pusat, ATAP_KLIEN.lebar) < 0.06, `${j.nama}: atap masih besar`);
  }
});

test("serah-peta: selama silang atap merah dan titik Jakarta berimpit, ukurannya setara", () => {
  for (const j of satu("serah-peta")) for (let e = SILANG_PETA[0] + 0.02; e < SILANG_PETA[1]; e += 0.03) {
    const q = pada(j, e);
    assert.ok(q.silang, `${j.nama} di ${e}: tanpa silang`);
    const [ck, cp] = [kamera(q, j.bingkai), kamera(q.silang, j.bingkai)];
    const [a, b] = [layar(ck, ATAP_KLIEN.pusat), layar(cp, JAKARTA_PETA)];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 0.1, `${j.nama} di ${e.toFixed(2)}: atap ${a.x.toFixed(3)},${a.y.toFixed(3)} Jakarta ${b.x.toFixed(3)},${b.y.toFixed(3)}`);
    const rasio = besarLayar(ck, ATAP_KLIEN.pusat, ATAP_KLIEN.lebar) / besarLayar(cp, JAKARTA_PETA, 2 * TITIK_PETA.cincin[1]);
    assert.ok(rasio > 0.6 && rasio < 1.6, `${j.nama} di ${e.toFixed(2)}: atap ${rasio} kali cincin`);
  }
});

// Sudut bingkai yang tampak harus jatuh di bidang peta: tidak ada tepi kertas kosong.
function bingkaiDiPeta(q, bingkai) {
  const cam = kamera(q, bingkai);
  const r = new THREE.Raycaster();
  const bidang = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    r.setFromCamera(new THREE.Vector2(x, y), cam);
    const t = r.ray.intersectPlane(bidang, new THREE.Vector3());
    if (!t) return `sudut ${x},${y} menatap langit`;
    if (Math.abs(t.x - BIDANG_PETA.pusat[0]) > BIDANG_PETA.lebar / 2 || Math.abs(t.z - BIDANG_PETA.pusat[2]) > BIDANG_PETA.dalam / 2) return `sudut ${x},${y} di luar peta (${t.x.toFixed(0)}, ${t.z.toFixed(0)})`;
  }
  return null;
}

test("peta: bingkai selalu penuh peta, di babak langkah-kecil (dengan dorongan) dan selama kedua serah terima", () => {
  const iL = ANCHOR_V5.findIndex((a) => a.id === "langkah-kecil");
  for (const [nama, bingkai] of BINGKAI) for (const k of [0, 0.5, 1]) {
    const p = poseDalam(poseAnchor(iL, bingkai.tegak), k);
    assert.equal(bingkaiDiPeta(p, bingkai), null, `${nama} k=${k}`);
  }
  for (const j of [...satu("serah-peta"), ...satu("serah-globe")]) for (const e of RAPAT_SERAH) for (const q of lapisan(pada(j, e))) {
    if (q.tahap !== "peta") continue;
    assert.equal(bingkaiDiPeta(q, j.bingkai), null, `${j.nama} di ${e}`);
    assert.ok(q.posisi[1] > TITIK_PETA.y + 50, `${j.nama} di ${e}: kamera terlalu rendah`);
  }
});

test("serah-globe: silang penuh 0,3 detik, Jakarta di depan kamera di peta dan di globe", () => {
  for (const j of satu("serah-globe")) {
    assert.equal(ANCHOR_V5[j.i].durasi, 0.3);
    for (const e of RAPAT_SERAH.filter((e) => e > 0 && e < 1)) {
      const q = pada(j, e);
      assert.ok(q.silang && q.tahap === "peta" && q.silang.tahap === "globe", `${j.nama} di ${e}`);
      assert.ok(diBingkai(layar(kamera(q, j.bingkai), JAKARTA_PETA), 0.02), `${j.nama} di ${e}: Jakarta peta keluar bingkai`);
      assert.ok(diBingkai(layar(kamera(q.silang, j.bingkai), JAKARTA_BOLA), 0.02), `${j.nama} di ${e}: Jakarta globe keluar bingkai`);
    }
    // di tengah silang titik Jakarta peta dan Jakarta globe berimpit
    for (const e of [0.4, 0.5, 0.6]) {
      const q = pada(j, e);
      const [p, g] = [layar(kamera(q, j.bingkai), JAKARTA_PETA), layar(kamera(q.silang, j.bingkai), JAKARTA_BOLA)];
      assert.ok(Math.hypot(p.x - g.x, p.y - g.y) < 0.15, `${j.nama} di ${e}: Jakarta peta ${p.x.toFixed(2)},${p.y.toFixed(2)} globe ${g.x.toFixed(2)},${g.y.toFixed(2)}`);
    }
  }
});

test("globe: kamera di luar bumi, Jakarta menghadap kamera, bumi utuh di bingkai babak penutup", () => {
  const iP = ANCHOR_V5.findIndex((a) => a.id === "penutup");
  const pose = BINGKAI.map(([n, b]) => [n, poseDalam(poseAnchor(iP, b.tegak), 0), b]);
  for (const j of satu("serah-globe")) for (const e of RAPAT_SERAH) for (const q of lapisan(pada(j, e))) if (q.tahap === "globe") pose.push([`${j.nama} ${e}`, q, j.bingkai]);
  for (const [nama, q, bingkai] of pose) {
    const c = new THREE.Vector3(...q.posisi);
    assert.ok(c.length() > 220, `${nama}: kamera ${c.length()} dari pusat bumi`);
    const jkt = new THREE.Vector3(...JAKARTA_BOLA);
    assert.ok(jkt.clone().normalize().dot(c.clone().sub(jkt).normalize()) > 0.3, `${nama}: Jakarta di sisi belakang`);
    const cam = kamera(q, bingkai);
    assert.ok(diBingkai(layar(cam, [0, 0, 0]), 0.2), `${nama}: pusat bumi di tepi bingkai`);
    // di babak penutup bumi utuh di bingkai; selama serah terima kamera boleh mulai dekat Jakarta
    if (!nama.startsWith("serah")) assert.ok(Math.asin(R_BUMI / c.length()) * 2 < (cam.fov * Math.PI) / 180, `${nama}: bumi lebih besar dari bingkai`);
  }
});

// ---- F6: zoom dari globe ke modul lab ----------------------------------------------------------
// Stasiun mengorbit; jam globe dibekukan saat zoom mulai, jadi jalurnya diuji di 24 fase orbit.
const ZOOM = satu("zoom-satelit");
const PUTARAN = (2 * Math.PI) / lajuOrbit(ORBIT_STASIUN.r);
const FASE = Array.from({ length: 24 }, (_, f) => rangkaStasiun((f / 24) * PUTARAN));
const LAYAR_ZOOM = { lebar: [1440, 900], tegak: [390, 844] };
const zoom = (j, R, e) => poseJalur(j.i, j.a, j.b, e, { ...j.bingkai, stasiun: R });
const zNama = (j) => (j.bingkai.tegak ? "tegak" : "lebar");
const kameraZoom = (p, tegak) => {
  const [w, h] = LAYAR_ZOOM[tegak ? "tegak" : "lebar"];
  const c = new THREE.PerspectiveCamera(p.fov, w / h, 0.01, 5000);
  if (tegak) c.setViewOffset(w, h, 0, h * GESER.tegak, w, h);
  else c.setViewOffset(w, h, -w * GESER.lebar, 0, w, h);
  c.position.set(...p.posisi);
  c.lookAt(new THREE.Vector3(...p.lihat));
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
};
const ES = Array.from({ length: 111 }, (_, s) => s / 110);

test("zoom-satelit: stasiun bersikap LVLH, jendela selalu menghadap menjauhi bumi", () => {
  for (const R of FASE) {
    const n = Math.hypot(...R.pusat);
    assert.ok(Math.abs(n - ORBIT_STASIUN.r) < 1e-6);
    const radial = R.pusat.map((v) => v / n);
    assert.ok(R.z.reduce((s, v, k) => s + v * radial[k], 0) > 0.999);
    for (const [u, v] of [[R.x, R.y], [R.y, R.z], [R.x, R.z]]) assert.ok(Math.abs(u.reduce((s, x, k) => s + x * v[k], 0)) < 1e-9);
  }
});

test("zoom-satelit: kamera tidak pernah masuk bumi atau atmosfernya, di fase orbit mana pun", () => {
  for (const j of ZOOM) for (const R of FASE) for (const e of ES) {
    const q = zoom(j, R, e);
    if (q.tahap !== "globe") continue;
    assert.ok(Math.hypot(...q.posisi) > R_BUMI * 1.035 + 1, `${zNama(j)} e=${e}`);
  }
});

test("zoom-satelit: sejak 0,4 jendela stasiun di bingkai dan tidak tertutup bumi", () => {
  for (const j of ZOOM) for (const R of FASE) {
    const W = titikJendela(R);
    for (const e of ES.filter((x) => x >= 0.4 && x <= AKHIR_GLOBE)) {
      const q = zoom(j, R, e);
      const p = q.posisi;
      const d = W.map((v, k) => v - p[k]);
      const L = Math.hypot(...d);
      const t = Math.max(0, Math.min(L, -p.reduce((s, v, k) => s + v * d[k], 0) / L));
      assert.ok(Math.hypot(...p.map((v, k) => v + (d[k] / L) * t)) > R_BUMI, `${zNama(j)} e=${e} tertutup bumi`);
      const v = new THREE.Vector3(...W).project(kameraZoom(q, j.bingkai.tegak));
      assert.ok(Math.abs(v.x) < 1 && Math.abs(v.y) < 1, `${zNama(j)} e=${e} jendela di luar bingkai`);
    }
  }
});

test("zoom-satelit: dari ujung jalur globe sampai silang selesai, kaca gelap menutup seluruh bingkai", () => {
  for (const j of ZOOM) for (const R of FASE) {
    const W = titikJendela(R);
    const n = R.z;
    for (const e of [AKHIR_GLOBE, (AKHIR_GLOBE + SILANG_LAB[0]) / 2, SILANG_LAB[0], (SILANG_LAB[0] + SILANG_LAB[1]) / 2, SILANG_LAB[1] - 1e-6]) {
      const q = zoom(j, R, e);
      const g = q.tahap === "globe" ? q : null;
      assert.ok(g, `${zNama(j)} e=${e} lapis globe hilang`);
      const c = kameraZoom(g, j.bingkai.tegak);
      for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
        const ray = new THREE.Vector3(x, y, 0.5).unproject(c).sub(c.position).normalize();
        const denom = ray.dot(new THREE.Vector3(...n));
        const t = new THREE.Vector3(...W).sub(c.position).dot(new THREE.Vector3(...n)) / denom;
        const hit = c.position.clone().addScaledVector(ray, t);
        assert.ok(t > 0 && hit.distanceTo(new THREE.Vector3(...W)) < JENDELA_STASIUN.r * 1.4, `${zNama(j)} e=${e} sudut ${x},${y} di luar kaca`);
      }
    }
  }
});

test("zoom-satelit: silang ke dalam modul sekitar 0,4 detik, bobotnya hanya naik, ujungnya di modul lab", () => {
  const lama = (SILANG_LAB[1] - SILANG_LAB[0]) * ANCHOR_V5.find((a) => a.keluar === "zoom-satelit").durasi;
  assert.ok(lama >= 0.35 && lama <= 0.5, `${lama} s`);
  for (const j of ZOOM) {
    let w = 0;
    for (const e of ES) {
      const q = pada(j, e);
      const x = q.tahap === "lab" ? 1 : q.silang?.w ?? 0;
      assert.ok(x >= w, `${zNama(j)} e=${e}`);
      w = x;
      if (q.silang) assert.equal(q.silang.tahap, "lab");
    }
    assert.equal(pada(j, 1).tahap, "lab");
  }
});

test("zoom-satelit: bagian di dalam modul tidak menembus rak, peralatan, atau dinding", () => {
  const LAB = bendaLab(susunLab(proyek));
  for (const j of ZOOM) for (const e of ES) {
    const q = pada(j, e);
    const d = q.tahap === "lab" ? q : q.silang;
    if (!d) continue;
    const p = d.posisi;
    assert.ok(Math.abs(p[1]) < 0.9 && Math.abs(p[2]) < 1.15, `${zNama(j)} e=${e}: ${p}`);
    assert.equal(LAB.find((b) => dalam(p, b, 0.08)), undefined, `${zNama(j)} e=${e}`);
  }
});

test("zoom-satelit: tidak ada jeda mati lebih dari 0,25 detik", () => {
  const dur = ANCHOR_V5.find((a) => a.keluar === "zoom-satelit").durasi;
  const langkah = 0.05 / dur;
  for (const j of ZOOM) for (const R of FASE.slice(0, 6)) {
    let diam = 0;
    let lalu = null;
    for (let e = 0; e <= 1 + 1e-9; e += langkah) {
      const q = zoom(j, R, Math.min(1, e));
      // bingkai yang paling tampak: lapis lab saat bobot silangnya di atas setengah
      const v = q.silang && q.silang.w > 0.5 ? q.silang : q;
      const now = [...v.posisi, ...satuanArah(v), v.tahap];
      if (lalu && now[6] === lalu[6]) {
        const gerak = Math.hypot(...[0, 1, 2].map((k) => now[k] - lalu[k])) / Math.max(1e-3, Math.hypot(...v.posisi.map((x, k) => x - v.lihat[k])));
        const putar = Math.hypot(...[3, 4, 5].map((k) => now[k] - lalu[k]));
        diam = gerak < 1e-3 && putar < 1e-3 && !(q.silang && q.silang.w > 0 && q.silang.w < 1) ? diam + 0.05 : 0;
        assert.ok(diam <= 0.25 + 1e-9, `${zNama(j)} diam ${diam.toFixed(2)} s di e=${e.toFixed(3)}`);
      }
      lalu = now;
    }
  }
});
const satuanArah = (p) => {
  const d = p.lihat.map((v, k) => v - p.posisi[k]);
  const L = Math.hypot(...d);
  return d.map((v) => v / L);
};

test("zoom-satelit: gulir mundur memakai rangka beku yang sama, bingkainya persis sama", () => {
  for (const j of ZOOM) for (const R of FASE.slice(0, 4)) for (const e of [0.1, 0.37, 0.61, 0.66, 0.9]) {
    const maju = zoom(j, R, e);
    const mundur = poseAntara(j.i + 1, j.i, j.b, j.a, 1 - e, { ...j.bingkai, stasiun: R });
    maju.posisi.forEach((v, k) => assert.ok(Math.abs(v - mundur.posisi[k]) < 1e-9));
    assert.equal(maju.silang?.w ?? 0, mundur.silang?.w ?? 0);
  }
});
