// Kontrak kota cerita v5 (F4, babak ramai): gedung klien terlihat dari bidikan kota, kota bisa
// dikenali (jalan, atap, pohon), anggaran segitiga lembar look-dev, lalu lintas tetap di lajurnya
// tanpa menabrak blok, jembatan, atau tiang tol, kepadatannya naik, dan pesanan mendarat di atap
// gedung klien.
import { test } from "node:test";
import assert from "node:assert/strict";
import { susunKota, kulitGedung, batasKota, POSE_KOTA, JALAN_DEPAN, TANAH, TINGGI_LANTAI, MOBIL, dataMobil, posisiMobil, jumlahTampak, PESAN, posisiPesan, pesanTampak } from "../components/stasiun/kota.js";
import { batas, LANTAI, CELAH_JENDELA } from "../components/stasiun/lantai.js";

const K = susunKota();
const BATAS = batasKota();
const potong = (a, b) => [0, 1, 2].every((k) => a.min[k] < b.max[k] && b.min[k] < a.max[k]);
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

test("kota bisa dikenali awam: jalan, atap, pohon, gedung, sungai, tol (lembar look-dev aturan 4)", () => {
  assert.ok(K.atap.length > 300, "rumah beratap");
  assert.ok(K.pohon.length > 1000, "pohon");
  assert.ok(K.kotak.filter((b) => b[4] > 30).length > 40, "gedung tinggi di pusat");
  assert.ok(K.pita.length >= 7, "jalan lingkar, jalan keluar, sungai, tol");
  assert.equal(K.jalan.length, 22);
});

test("anggaran segitiga kota di bawah 250 ribu (kotak 12, limas 6, ikosahedron 20, pita dan petak 2, mobil berkabin 24)", () => {
  const n = K.kotak.length * 12 + K.atap.length * 6 + K.pohon.length * 20 + K.petak.length * 2 + K.pita.reduce((s, p) => s + (p.titik.length - 1) * 2, 0) + MOBIL.jumlah * 24 + PESAN.jumlah * 20;
  assert.ok(n < 250000, `${n} segitiga`);
});

test("susunan kota tetap sama di tiap muat (acak deterministik)", () => {
  const a = JSON.stringify(susunKota());
  assert.equal(a, JSON.stringify(K));
  assert.equal(susunKota(), K, "dibuat sekali, dipakai ulang");
});

test("gedung klien di tepi depan bloknya, fasad jendela menghadap jalan", () => {
  const blok = K.kotak.filter((b) => b[4] === 1 && b[3] === 56).find((b) => Math.abs(b[0]) < 28 && Math.abs(b[2]) < 28);
  assert.ok(blok, "blok klien");
  assert.ok(Math.abs(blok[1] + 0.5 - TANAH) < 1e-9, "atas trotoar di TANAH");
  // fasad di z = 4, tepi blok 3 m di depannya, garis tengah jalan 8 m lagi
  assert.ok(Math.abs(blok[2] + 28 - (4 + 3)) < 1e-9);
  assert.equal(JALAN_DEPAN.z, 4 + 3 + 8);
  // di blok klien tidak ada gedung atau pohon lain yang menabrak gedung klien
  const gedung = { min: [-LANTAI.lebar / 2, -TINGGI_LANTAI, -4], max: [LANTAI.lebar / 2, 2 * TINGGI_LANTAI + 0.6, 4.5] };
  const tabrak = BATAS.filter((b) => b.min[1] > TANAH - 0.01 && potong(gedung, b));
  assert.deepEqual(tabrak, []);
  // celah jendela lantai kantor ada di lantai 2 kulit gedung (lantai 1 dan 3 berpita merah)
  const { bawah, atas } = kulitGedung();
  const depan = [...bawah, ...atas].filter((o) => o.m[14] === 4).map(batas);
  for (const b of depan) assert.ok(b.max[1] <= 0 + 1e-9 || b.min[1] >= TINGGI_LANTAI - 0.3 - 1e-9, "tidak ada kulit depan di depan jendela lantai 2");
  assert.ok(CELAH_JENDELA[1] - CELAH_JENDELA[0] > 7);
});

test("dari bidikan kota (lebar dan tegak) atap dan fasad gedung klien tidak tertutup gedung lain", () => {
  const sasaran = [[0, 2 * TINGGI_LANTAI + 0.6, 0], [0, 0, 4], [-18, 2 * TINGGI_LANTAI, 4], [18, 2 * TINGGI_LANTAI, 4]];
  // benda di sekitar gedung klien sendiri (trotoar bloknya) tidak dihitung
  const lain = BATAS.filter((b) => b.max[1] > TANAH + 0.01);
  for (const kam of [POSE_KOTA.posisi, POSE_KOTA.tegak.posisi]) for (const t of sasaran) {
    // ujung ruas berhenti 0,5 m sebelum sasaran (sasaran ada di permukaan gedung)
    const d = Math.hypot(...t.map((v, k) => v - kam[k]));
    const ujung = t.map((v, k) => v + ((kam[k] - v) / d) * 0.5);
    const kena = lain.find((b) => kenaRuas(kam, ujung, b));
    assert.equal(kena, undefined, `${kam} ke ${t} tertutup benda di ${kena?.min}`);
  }
  // gedung klien ada di dalam bingkai: dekat titik lihat, sudutnya dari sumbu pandang kecil
  for (const p of [POSE_KOTA, POSE_KOTA.tegak]) {
    const a = p.lihat.map((v, k) => v - p.posisi[k]);
    const b = [0, 4, 0].map((v, k) => v - p.posisi[k]);
    const sdt = Math.acos(a.reduce((s, v, k) => s + v * b[k], 0) / (Math.hypot(...a) * Math.hypot(...b)));
    assert.ok(sdt < ((p.fov / 2) * Math.PI) / 180 / 2, `gedung klien ${sdt} rad dari tengah`);
  }
});

test("lalu lintas: lajur mobil di seluruh jalan inti bebas dari blok, pohon, jembatan, tiang tol, dan gedung", () => {
  const padat = BATAS.filter((b) => b.max[1] > -3.0 + 0.05);
  const [p, t, l] = MOBIL.ukuran.map((v) => v / 2); // panjang, tinggi, lebar
  // tiap mobil berjalan di garis lurus: pita sepanjang jalannya selebar badan, setinggi badan
  const lajur = new Map();
  for (let j = 0; j < MOBIL.jumlah; j++) {
    const m = dataMobil(j);
    const [a, b] = [posisiMobil({ ...m, f: 0, v: 0 }, 0).posisi, posisiMobil({ ...m, f: 0.999999, v: 0 }, 0).posisi];
    const sepanjangX = Math.abs(a[0] - b[0]) > 1;
    const s = sepanjangX ? [p, t, l] : [l, t, p];
    const pita = { min: [0, 1, 2].map((k) => Math.min(a[k], b[k]) - s[k]), max: [0, 1, 2].map((k) => Math.max(a[k], b[k]) + s[k]) };
    lajur.set(pita.min.join() + pita.max.join(), pita);
  }
  assert.equal(lajur.size, 44, "22 jalan inti, dua lajur");
  for (const pita of lajur.values()) {
    assert.ok(Math.abs(pita.min[1] - (0.6 - TINGGI_LANTAI)) < 1e-9, "roda di atas aspal");
    const kena = padat.find((b) => potong(pita, b));
    assert.equal(kena, undefined, `lajur ${pita.min} menabrak benda di ${kena?.min}, ${kena?.max}`);
  }
  // posisi pada waktu t memang di pita lajurnya
  const m = dataMobil(11);
  const q = posisiMobil(m, 7.3);
  const d = [m.g.b[0] - m.g.a[0], m.g.b[1] - m.g.a[1]];
  const silang = ((q.posisi[0] - m.g.a[0]) * d[1] - (q.posisi[2] - m.g.a[1]) * d[0]) / Math.hypot(...d);
  assert.ok(Math.abs(Math.abs(silang) - MOBIL.lajur) < 1e-9);
});

test("lalu lintas memadat: jumlah mobil dan pesanan yang tampak naik dengan kepadatan", () => {
  assert.equal(jumlahTampak(1400, 0), 490);
  assert.equal(jumlahTampak(1400, 1), 1400);
  assert.equal(jumlahTampak(1400, 7), 1400);
  assert.equal(pesanTampak(700, -1), 0);
  let lalu = -1;
  for (let k = 0; k <= 20; k++) {
    const n = jumlahTampak(1400, k / 20) + pesanTampak(700, k / 20);
    assert.ok(n >= lalu);
    lalu = n;
  }
  // mobil bergerak: posisi berubah dengan waktu, arah lajur kiri dan kanan berlawanan
  const m = dataMobil(5);
  assert.notDeepEqual(posisiMobil(m, 0).posisi, posisiMobil(m, 1).posisi);
  const arah = new Set(Array.from({ length: 40 }, (_, j) => Math.sign(dataMobil(j).v)));
  assert.deepEqual([...arah].sort(), [-1, 1]);
});

test("pesanan terbang dari atap rumah pinggiran dan mendarat di atap gedung klien", () => {
  assert.ok(K.pesan.length > 100);
  for (let j = 0; j < PESAN.jumlah; j += 7) {
    // f = 1 tepat di atap gedung klien, puncak lengkungnya tinggi di atas kota
    let tiba = null;
    for (let t = 0; t < 2.3; t += 0.001) {
      const p = posisiPesan(j, t);
      if (Math.hypot(p[0], p[2]) < 4) tiba = p;
    }
    assert.ok(tiba, `pesan ${j} tidak tiba`);
    assert.ok(tiba[1] > 2 * TINGGI_LANTAI && tiba[1] < 2 * TINGGI_LANTAI + 4);
  }
});

test("seberang jendela gedung klien: taman tanpa gedung, pohonnya di separuh belakang", () => {
  // blok seberang jalan depan: z dari tepi jalan (JALAN_DEPAN.z + 8) sampai 56 m sesudahnya
  const z0 = JALAN_DEPAN.z + JALAN_DEPAN.lebar / 2;
  const diBlok = (b) => Math.abs(b[0]) < 28 && b[2] > z0 && b[2] < z0 + 56;
  assert.equal(K.kotak.filter((b) => diBlok(b) && b[4] > 1 && b[3] > 2).length, 0, "tidak ada gedung atau rumah");
  const pohon = K.pohon.filter(diBlok);
  assert.ok(pohon.length >= 5, "taman berpohon");
  for (const p of pohon) assert.ok(p[2] - p[3] / 2 > z0 + 20, `pohon di z ${p[2]} terlalu dekat jalan`);
});
