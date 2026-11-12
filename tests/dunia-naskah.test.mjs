// Naskah kamera dunia toko kaset (ADR 0014). Kamera berpindah antar-anchor dengan ease in-out
// dan motion blur yang sebanding dengan kecepatannya, jadi yang dijaga di sini: urutan dan isi
// anchor, pemetaan gulir ke anchor, kurva yang benar-benar diam di kedua ujung, durasi yang
// tetap cepat, dan blur yang nol saat kamera diam.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANCHOR,
  anchorAktif,
  durasiBlend,
  easeInOut,
  poseAntara,
  kekuatanBlur,
  pemicuAnchor,
} from "../components/dunia/naskah.js";

test("lima anchor berurutan sesuai seksi halaman", () => {
  assert.deepEqual(
    ANCHOR.map((a) => a.id),
    ["bilik", "dinding", "rak", "kasir", "pintu"],
  );
  for (const a of ANCHOR) {
    assert.equal(a.posisi.length, 3, `${a.id} posisi`);
    assert.equal(a.lihat.length, 3, `${a.id} lihat`);
    assert.ok(a.fov >= 30 && a.fov <= 60, `${a.id} fov ${a.fov}`);
    // Kamera tidak boleh menembus lantai atau langit-langit ruangan (tinggi 3,2 m).
    assert.ok(a.posisi[1] > 0.4 && a.posisi[1] < 3, `${a.id} tinggi kamera ${a.posisi[1]}`);
    assert.ok(a.seksi.length > 0, `${a.id} tanpa seksi`);
  }
});

test("easeInOut diam di kedua ujung, simetris, dan naik terus", () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(easeInOut(-1), 0);
  assert.equal(easeInOut(2), 1);
  assert.ok(Math.abs(easeInOut(0.5) - 0.5) < 1e-12);
  for (const u of [0.1, 0.25, 0.4]) assert.ok(Math.abs(easeInOut(u) + easeInOut(1 - u) - 1) < 1e-12);
  // Kecepatan awal dan akhir mendekati nol: itu yang membuat kamera tidak tersentak.
  const h = 1e-4;
  assert.ok(easeInOut(h) / h < 0.01, "awal tidak landai");
  assert.ok((1 - easeInOut(1 - h)) / h < 0.01, "akhir tidak landai");
  let lalu = 0;
  for (let i = 1; i <= 100; i++) {
    const v = easeInOut(i / 100);
    assert.ok(v >= lalu, `turun di ${i}`);
    lalu = v;
  }
});

test("pose antara dua anchor tepat di ujungnya dan sedikit melengkung di tengah", () => {
  const [a, b] = ANCHOR;
  const awal = poseAntara(a, b, 0);
  const akhir = poseAntara(a, b, 1);
  assert.deepEqual(awal.posisi.map((x) => +x.toFixed(9)), a.posisi);
  assert.deepEqual(akhir.posisi.map((x) => +x.toFixed(9)), b.posisi);
  assert.deepEqual(akhir.lihat.map((x) => +x.toFixed(9)), b.lihat);
  assert.equal(akhir.fov, b.fov);
  const tengah = poseAntara(a, b, 0.5);
  const lurus = (a.posisi[1] + b.posisi[1]) / 2;
  assert.ok(tengah.posisi[1] > lurus, "tanpa lengkung");
  assert.ok(tengah.posisi[1] - lurus < 0.4, "lengkung terlalu tinggi");
});

const titik = [
  { id: "bilik", y: 0 },
  { id: "dinding", y: 1800 },
  { id: "rak", y: 6000 },
  { id: "kasir", y: 9000 },
  { id: "pintu", y: 9600 },
];

test("anchor aktif dipilih dari garis tengah layar", () => {
  const tinggi = 800;
  assert.equal(anchorAktif(0, tinggi, titik), 0);
  // Seksi berikutnya aktif begitu tepinya melewati tengah layar.
  assert.equal(anchorAktif(1800 - 401, tinggi, titik), 0);
  assert.equal(anchorAktif(1800 - 400, tinggi, titik), 1);
  assert.equal(anchorAktif(7000, tinggi, titik), 2);
  assert.equal(anchorAktif(9300, tinggi, titik), 4);
  assert.equal(anchorAktif(99999, tinggi, titik), 4);
  assert.equal(anchorAktif(-50, tinggi, titik), 0);
});

test("pemicu anchor memakai seksi pengganti bila seksi utamanya belum ada", () => {
  const atas = { ".gerbang": 0, "#cerita": 1800, "#rak": 6000, "#kontak": 9000 };
  const tinggi = { ".gerbang": 1800, "#cerita": 4200, "#rak": 3000, "#kontak": 1200 };
  const ukur = (sel) => (sel in atas ? { atas: atas[sel], tinggi: tinggi[sel] } : null);
  const p = pemicuAnchor(ukur);
  assert.deepEqual(p.map((x) => x.id), ANCHOR.map((a) => a.id));
  // Belum ada seksi klien: meja kasir di awal kontak, pintu di tengahnya.
  assert.equal(p[3].y, 9000);
  assert.equal(p[4].y, 9600);
  // Pemicu selalu maju, supaya urutan anchor tidak pernah terbalik.
  for (let i = 1; i < p.length; i++) assert.ok(p[i].y >= p[i - 1].y, `${p[i].id} mundur`);

  atas["[data-dunia=kasir]"] = 8800;
  tinggi["[data-dunia=kasir]"] = 900;
  const q = pemicuAnchor(ukur);
  assert.equal(q[3].y, 8800);
  assert.equal(q[4].y, 9000);
});

test("durasi perpindahan tetap cepat, lebih lama untuk jarak jauh", () => {
  const d = [];
  for (let i = 0; i < ANCHOR.length; i++)
    for (let j = 0; j < ANCHOR.length; j++) if (i !== j) d.push(durasiBlend(ANCHOR[i], ANCHOR[j]));
  for (const x of d) assert.ok(x >= 0.7 && x <= 1.3, `durasi ${x}`);
  assert.ok(durasiBlend(ANCHOR[0], ANCHOR[4]) >= durasiBlend(ANCHOR[0], ANCHOR[1]));
});

test("blur nol saat diam, sebanding dengan kecepatan, lalu dibatasi", () => {
  assert.equal(kekuatanBlur(0), 0);
  assert.equal(kekuatanBlur(0.05), 0);
  const a = kekuatanBlur(2);
  const b = kekuatanBlur(4);
  assert.ok(a > 0 && b > a, "tidak naik dengan kecepatan");
  assert.ok(Math.abs(b / a - 2) < 0.35, "tidak sebanding");
  assert.equal(kekuatanBlur(1000), 1);
  assert.equal(kekuatanBlur(4, true), 0, "gerak dikurangi tetap mendapat blur");
});

test("paparan per tempat: bawaan 1, dalam rentang wajar, dan ikut dihaluskan selama terbang", () => {
  for (const a of ANCHOR) {
    const p = a.paparan ?? 1;
    assert.ok(p >= 1 && p <= 1.8, `${a.id} paparan ${p}`);
  }
  const kasir = ANCHOR.find((a) => a.id === "kasir");
  const pintu = ANCHOR.find((a) => a.id === "pintu");
  assert.ok(kasir.paparan > 1 && pintu.paparan > 1, "kasir dan pintu jauh dari lampu gantung");
  const bilik = ANCHOR[0];
  assert.equal(poseAntara(bilik, kasir, 0).paparan, 1);
  assert.equal(poseAntara(bilik, kasir, 1).paparan, kasir.paparan);
  const tengah = poseAntara(bilik, kasir, 0.5).paparan;
  assert.ok(tengah > 1 && tengah < kasir.paparan);
});
