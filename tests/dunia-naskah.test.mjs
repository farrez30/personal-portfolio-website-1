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
  anchorTegak,
  bunyiCerita,
  nyalaFondasi,
} from "../components/dunia/naskah.js";
import { BAB } from "../content/cerita.js";

const BABAK = BAB.map((b) => b.id);

test("anchor berurutan: bilik, pembuka cerita, sepuluh babak, rak, kasir, pintu", () => {
  assert.deepEqual(
    ANCHOR.map((a) => a.id),
    ["bilik", "dinding", ...BABAK, "rak", "kasir", "pintu"],
  );
  for (const a of ANCHOR) {
    assert.equal(a.posisi.length, 3, `${a.id} posisi`);
    assert.equal(a.lihat.length, 3, `${a.id} lihat`);
    assert.ok(a.fov >= 30 && a.fov <= 60, `${a.id} fov ${a.fov}`);
    // Kamera tidak boleh menembus lantai atau langit-langit ruangan (tinggi 3,2 m).
    assert.ok(a.posisi[1] > 0.4 && a.posisi[1] < 3, `${a.id} tinggi kamera ${a.posisi[1]}`);
    assert.ok(a.seksi.length > 0, `${a.id} tanpa seksi`);
    // Kamera tetap di dalam ruangan toko (x -5..5, z -4..4).
    assert.ok(Math.abs(a.posisi[0]) < 4.95 && Math.abs(a.posisi[2]) < 3.95, `${a.id} di luar toko`);
  }
});

test("tiap babak cerita punya benda, dipicu blok bab-nya sendiri, dan menghadap bendanya", () => {
  for (const id of BABAK) {
    const a = ANCHOR.find((x) => x.id === id);
    assert.ok(a?.cerita, `${id} bukan anchor cerita`);
    assert.equal(a.seksi[0].sel, `.bab--${id}`);
    assert.equal(a.benda?.length, 3, `${id} tanpa benda`);
    // Benda ada di depan kamera: sudut antara arah pandang dan arah ke benda di bawah 35 derajat.
    const d = (p, q) => p.map((v, i) => q[i] - v);
    const lihat = d(a.posisi, a.lihat);
    const benda = d(a.posisi, a.benda);
    const kos = lihat.reduce((s, v, i) => s + v * benda[i], 0) / (Math.hypot(...lihat) * Math.hypot(...benda));
    assert.ok(kos > Math.cos((35 * Math.PI) / 180), `${id}: benda di luar arah pandang`);
  }
  // Anchor di luar cerita tidak punya benda dan tidak ditandai cerita.
  for (const a of ANCHOR.filter((x) => !BABAK.includes(x.id))) assert.ok(!a.cerita && !a.benda, a.id);
});

test("layar tegak: kamera mundur dari benda dan menunduk, anchor biasa tidak berubah", () => {
  for (const id of BABAK) {
    const a = ANCHOR.find((x) => x.id === id);
    const t = anchorTegak(a);
    const jauh = (p) => Math.hypot(...p.map((v, i) => v - a.benda[i]));
    assert.ok(jauh(t.posisi) > jauh(a.posisi), `${id} tidak mundur`);
    // Membidik di bawah benda, supaya benda naik ke separuh atas layar (teks ada di bawah).
    assert.ok(t.lihat[1] < a.benda[1], `${id} tidak menunduk`);
    assert.equal(t.lihat[0], a.benda[0]);
    assert.equal(t.lihat[2], a.benda[2]);
    assert.equal(t.fov, a.fov);
  }
  const rak = ANCHOR.find((x) => x.id === "rak");
  assert.equal(anchorTegak(rak), rak);
});

test("bunyi babak: masuk babak, momen yang dilewati maju, dan diam saat mundur atau melompat", () => {
  const b = (id, u) => ({ id, u });
  assert.deepEqual(bunyiCerita(b("dinding", 0.9), b("ide", 0)), ["kertas"]);
  assert.deepEqual(bunyiCerita(b("rencana", 0.45), b("rencana", 0.55)), ["rapat"]);
  assert.deepEqual(bunyiCerita(b("aman", 0.4), b("aman", 0.5)), ["segel"]);
  // Tiga kotak CD mendarat berurutan; satu gulir panjang tetap maksimal 0,6 babak.
  assert.deepEqual(bunyiCerita(b("rilis", 0.3), b("rilis", 0.6)), ["rapat", "rapat", "rapat"]);
  assert.deepEqual(bunyiCerita(b("rencana", 0.55), b("rencana", 0.45)), [], "mundur berbunyi");
  assert.deepEqual(bunyiCerita(b("rencana", 0.1), b("rencana", 0.9)), [], "lompatan jauh berbunyi");
  assert.deepEqual(bunyiCerita(b("ide", 0.5), b("bentuk", 0.1)), [], "lompat dua babak berbunyi");
  assert.deepEqual(bunyiCerita(b("bentuk", 0.1), b("rencana", 0.9)), [], "mundur babak berbunyi");
  assert.deepEqual(bunyiCerita(null, b("ide", 0.5)), []);
  // Lampu fondasi: satu relay tiap lampu status yang baru menyala, tidak lebih.
  assert.deepEqual([0, 0.2, 0.3, 0.4, 0.5, 1].map(nyalaFondasi), [0, 0, 1, 2, 3, 3]);
  assert.deepEqual(bunyiCerita(b("fondasi", 0), b("fondasi", 0.3)), ["relay"]);
  assert.deepEqual(bunyiCerita(b("fondasi", 0.3), b("fondasi", 0.6)), ["relay", "relay"]);
  assert.deepEqual(bunyiCerita(b("fondasi", 0.6), b("fondasi", 1)), []);
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
  const y = (r, id) => r.find((x) => x.id === id).y;
  // Belum ada seksi klien: meja kasir di awal kontak, pintu di tengahnya.
  assert.equal(y(p, "kasir"), 9000);
  assert.equal(y(p, "pintu"), 9600);
  // Pemicu selalu maju, supaya urutan anchor tidak pernah terbalik.
  for (let i = 1; i < p.length; i++) assert.ok(p[i].y >= p[i - 1].y, `${p[i].id} mundur`);

  atas["[data-dunia=kasir]"] = 8800;
  tinggi["[data-dunia=kasir]"] = 900;
  const q = pemicuAnchor(ukur);
  assert.equal(y(q, "kasir"), 8800);
  assert.equal(y(q, "pintu"), 9000);
});

test("durasi perpindahan tetap cepat, lebih lama untuk jarak jauh", () => {
  const d = [];
  for (let i = 0; i < ANCHOR.length; i++)
    for (let j = 0; j < ANCHOR.length; j++) if (i !== j) d.push(durasiBlend(ANCHOR[i], ANCHOR[j]));
  for (const x of d) assert.ok(x >= 0.7 && x <= 1.3, `durasi ${x}`);
  const cari = (id) => ANCHOR.find((a) => a.id === id);
  assert.ok(durasiBlend(cari("bilik"), cari("pintu")) >= durasiBlend(cari("bilik"), cari("dinding")));
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
