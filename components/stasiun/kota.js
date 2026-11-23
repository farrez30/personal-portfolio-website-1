// Kota di luar gedung kantor cerita v5 (F4, babak ramai) sebagai data: blok, gedung, rumah beratap,
// pohon, jalan, sungai, tol, lalu lintas, dan arus pesanan ke gedung klien. Tanpa three.js supaya
// jalur keluar jendela dan bidikan kota bisa dites di Node (tests/stasiun-kota.test.mjs);
// kota3d.js mengubahnya jadi satu mesh gabungan plus dua InstancedMesh (mobil dan pesanan).
//
// Sumbernya kota previs (desain/cerita-v5/previs/previs.html, ADEGAN.kota): angka acak, ukuran blok,
// dan warna sama (warna sudah dipetakan ke palet terang lembar look-dev). Bedanya, gedung klien
// tidak di tengah blok tetapi di tepi depannya, supaya fasad jendela menghadap jalan: kamera keluar
// lewat celah jendela langsung ke atas jalan (storyboard-build.md §3).
//
// Koordinat sama dengan lantai.js: lantai kantor di y = 0 (lantai 2 gedung), pusat gedung di x = 0,
// z = 0, fasad jendela di z = 4. Tanah blok di y = -2,2; aspal di y = -3,2.

import { W } from "./lantai.js";

// Tinggi satu lantai gedung klien (previs). Lantai kantor adalah lantai 2, jadi tanah di bawahnya.
export const TINGGI_LANTAI = 3.6;
const N = 10;
const BLOK = 56;
const JALAN = 16;
const LANGKAH = BLOK + JALAN;
const SETENGAH = (N * LANGKAH) / 2;
const KLIEN = [6, 5];
// Pusat gedung di blok klien: digeser ke tepi depan, trotoar 3 m sebelum jalan.
const MAJU = BLOK / 2 - 4 - 3;
const cx = (KLIEN[0] - N / 2 + 0.5) * LANGKAH;
const cz = (KLIEN[1] - N / 2 + 0.5) * LANGKAH;
// Koordinat previs (tanah y = 0) ke koordinat lantai kantor.
const ASAL = [cx, TINGGI_LANTAI, cz + MAJU];
const keLantai = (x, y, z) => [x - ASAL[0], y - ASAL[1], z - ASAL[2]];

// Garis tengah jalan di depan fasad (z) dan tepi blok seberangnya, di koordinat lantai.
export const JALAN_DEPAN = { z: cz + BLOK / 2 + JALAN / 2 - ASAL[2], lebar: JALAN, y: 0.4 - TINGGI_LANTAI };
// Tinggi atas trotoar blok (previs: kotak tebal 1 di y 0,9).
export const TANAH = 1.4 - TINGGI_LANTAI;

// Palet terang (PALET previs): warna clay ke warna look-dev.
const P = {
  biru: 0xa9c4ec,
  hijau: 0xb9dcb0,
  ungu: 0xcdb8e8,
  putih: 0xfffaf0,
  kayu: 0xf2d49b,
  kulit: 0xf2b8a0,
  gelap: 0x4b4a5c,
  pasir: 0xd8cdbb,
  sawah: 0xcfe3b0,
};
const WARNA_GEDUNG = [P.biru, P.hijau, P.hijau, P.ungu, P.putih, P.kayu];
export const WARNA_MOBIL = [0xe0574b, 0xa9c4ec, 0xf6c76b, 0xfffaf0, 0xb9dcb0, 0xcdb8e8];

const acak = (i) => {
  const x = Math.sin(i * 127.1 + 3.7) * 43758.5453;
  return x - Math.floor(x);
};
const sungaiX = (z) => -330 + 70 * Math.sin(z / 170);
const TOL0 = [-1500, -560];
const TOL1 = [1500, 420];
function jarakTol(x, z) {
  const ab = [TOL1[0] - TOL0[0], TOL1[1] - TOL0[1]];
  const ap = [x - TOL0[0], z - TOL0[1]];
  const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / (ab[0] * ab[0] + ab[1] * ab[1])));
  return Math.hypot(TOL0[0] + ab[0] * t - x, TOL0[1] + ab[1] * t - z);
}
const kosong = (x, z, r = 0) => Math.abs(x - sungaiX(z)) < 46 + r || jarakTol(x, z) < 30 + r;

// ---- Gedung klien ------------------------------------------------------------------------------
// Kulit luar gedung tiga lantai (40 x 8 m, previs): lantai 2 berisi lantai kantor dari lantai.js
// (dinding samping, ambang, kusen, dan kaca jendelanya sudah di sana). `bawah` selalu ada; `atas`
// (pelat di atas kantor, lantai 3, atap) hanya tampak setelah kamera keluar jendela, karena crane
// F3 membuka lantai kantor dari atas seperti rumah boneka. Format benda sama dengan lantai.js.
const kotak = (w, h, d, warna, x, y, z) => ({ bentuk: "kotak", ukuran: [w, h, d], warna, bevel: 0, bayang: false, bahan: "toon", m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1] });
export function kulitGedung() {
  const [GW, GD, L] = [40, 8, TINGGI_LANTAI];
  const bawah = [
    kotak(GW, 0.3, GD, P.putih, 0, -0.15, 0),
    kotak(GW, L, 0.3, W.merah, 0, -L / 2, GD / 2),
    kotak(GW, L, 0.3, P.putih, 0, -L / 2, -GD / 2),
    kotak(0.3, L, GD, P.putih, -GW / 2, -L / 2, 0),
    kotak(0.3, L, GD, P.putih, GW / 2, -L / 2, 0),
  ];
  const atas = [
    kotak(GW, 0.3, GD, P.putih, 0, L - 0.15, 0),
    kotak(GW, L, 0.3, W.merah, 0, L * 1.5, GD / 2),
    kotak(GW, L + 0.3, 0.3, P.putih, 0, L * 1.5 - 0.15, -GD / 2),
    kotak(0.3, L + 0.3, GD, P.putih, -GW / 2, L * 1.5 - 0.15, 0),
    kotak(0.3, L + 0.3, GD, P.putih, GW / 2, L * 1.5 - 0.15, 0),
    // atap merah: dari bidikan kota gedung klien terbaca di antara gedung pastel, lalu jadi titik
    // merah saat serah terima ke peta (F5)
    kotak(GW + 1, 0.6, GD + 1, W.merah, 0, L * 2 + 0.3, 0),
  ];
  return { bawah, atas };
}

// ---- Pose kamera babak ramai ----------------------------------------------------------------
// Bidikan kota previs (ADEGAN.kota, kamera: true) relatif ke gedung klien.
export const POSE_KOTA = {
  posisi: [330, 360 - TINGGI_LANTAI, 470],
  lihat: [-40, 20 - TINGGI_LANTAI, 0],
  fov: 38,
  tegak: { posisi: [300, 520 - TINGGI_LANTAI, 460], lihat: [-40, 20 - TINGGI_LANTAI, 0], fov: 52 },
};

// ---- Penyusunan ------------------------------------------------------------------------------
// Hasil di koordinat lantai kantor:
//   kotak: [x, y, z, sx, sy, sz, warna] kotak tegak (pusat dan ukuran penuh)
//   atap:  limas empat sisi, sama formatnya (alas sx x sz, tinggi sy)
//   pohon: bola, [x, y, z, diameter, warna]
//   petak: petak sawah datar [x, z, w, d, warna] di atas tanah
//   pita:  jalan, sungai, dan tol sebagai pita datar { titik: [[x, z]], lebar, y, warna }
//   jalan: garis tengah jalan inti untuk lalu lintas { a: [x, z], b: [x, z] }
//   pesan: titik asal arus pesanan (atap rumah pinggiran)
let cache = null;
export function susunKota() {
  if (cache) return cache;
  const k = { kotak: [], atap: [], pohon: [], petak: [], pita: [], jalan: [], pesan: [] };
  const kot = (x, y, z, sx, sy, sz, w) => k.kotak.push([...keLantai(x, y, z), sx, sy, sz, w]);
  const pohon = (x, y, z, d) => {
    k.kotak.push([...keLantai(x, 4, z), 2, 8, 2, P.ungu]);
    k.pohon.push([...keLantai(x, y, z), d, P.hijau]);
  };
  const rumah = (x, z, w, h, d, atap, warna) => {
    kot(x, h / 2 + 1, z, w, h, d, warna);
    k.atap.push([...keLantai(x, h + 1 + atap.h / 2, z), atap.w, atap.h, atap.d, P.kulit]);
  };

  // tanah: sawah dan ladang sampai cakrawala (petak berwarna, bukan tekstur kanvas)
  k.petak.push([...keLantai(0, 0, 0).filter((_, i) => i !== 1), 6000, 6000, P.sawah]);
  for (let i = 0; i < 700; i++) {
    const [x, , z] = keLantai((acak(i) - 0.5) * 6000, 0, (acak(i + 7) - 0.5) * 6000);
    k.petak.push([x, z, 40 + acak(i + 3) * 90, 30 + acak(i + 5) * 70, [0xbcd99a, 0xd6e8b4, 0xc4dfa4, 0xe3e9b8, 0xb5d394][i % 5]]);
  }
  // aspal inti, jalan lingkar, jalan ke luar kota
  kot(0, 0.2, 0, N * LANGKAH + 20, 0.4, N * LANGKAH + 20, P.gelap);
  const pita = (titik, lebar, y, warna) => k.pita.push({ titik: titik.map(([x, z]) => [x - ASAL[0], z - ASAL[2]]), lebar, y: y - ASAL[1], warna });
  const lingkar = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const r = 470 + 30 * Math.sin(a * 3);
    lingkar.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  pita(lingkar, 22, 0.25, P.gelap);
  for (const sudut of [0.4, 2.2, 3.9, 5.3]) {
    const t = [];
    for (let i = 0; i <= 30; i++) {
      const r = 470 + i * 40;
      t.push([Math.cos(sudut + i * 0.012) * r, Math.sin(sudut + i * 0.012) * r]);
    }
    pita(t, 16, 0.25, P.gelap);
  }
  // sungai bertepi pasir; jembatan di tiap jalan inti yang menyeberanginya, rata dengan aspal
  // (previs menaruh empat jembatan setinggi 2 sampai 4 m, satu di jalur mobil)
  const sungai = [];
  for (let z = -3000; z <= 3000; z += 25) sungai.push([sungaiX(z), z]);
  pita(sungai, 70, 0.3, P.putih);
  pita(sungai, 46, 0.45, P.biru);
  for (let i = 0; i <= N; i++) {
    const z = (i - N / 2) * LANGKAH;
    kot(sungaiX(z), 0.45, z, 80, 0.3, 14, P.gelap);
  }
  // tol layang bertiang; tiang yang jatuh di jalan inti digeser ke tepinya
  const diJalan = (v) => Math.abs(v) <= SETENGAH && Math.abs(v - Math.round(v / LANGKAH) * LANGKAH) < JALAN / 2 + 2;
  const tol = [];
  for (let i = 0; i <= 60; i++) tol.push([TOL0[0] + ((TOL1[0] - TOL0[0]) * i) / 60, TOL0[1] + ((TOL1[1] - TOL0[1]) * i) / 60]);
  pita(tol, 26, 15, P.biru);
  for (const [x, z] of tol) {
    const dalamKota = Math.abs(x) < SETENGAH + 10 && Math.abs(z) < SETENGAH + 10;
    if (dalamKota && (diJalan(x) || diJalan(z))) continue;
    kot(x, 7, z, 4, 14, 4, P.pasir);
  }

  // blok kota: taman, rumah, gedung tinggi di pusat; blok klien hanya trotoar (gedungnya kulitGedung)
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
    const bx = (a - N / 2 + 0.5) * LANGKAH;
    const bz = (b - N / 2 + 0.5) * LANGKAH;
    const id = a * N + b;
    const padat = Math.max(0, 1 - Math.hypot(a - N / 2 + 0.5, b - N / 2 + 0.5) / (N * 0.55));
    if (a === KLIEN[0] && b === KLIEN[1]) {
      kot(bx, 0.9, bz, BLOK, 1, BLOK, P.putih);
      continue;
    }
    if (kosong(bx, bz, 12)) continue;
    // Blok di seberang jendela gedung klien selalu taman: kamera yang keluar jendela memandang jalan,
    // mobil, dan pohon, bukan dinding menara 8 m di depannya (lembar kontak F4 pertama).
    if (acak(id * 13) < 0.1 || (a === KLIEN[0] && b === KLIEN[1] + 1)) {
      kot(bx, 0.9, bz, BLOK, 1, BLOK, P.hijau);
      // di taman seberang jendela pohonnya di separuh belakang: tajuk di tepi jalan memenuhi bingkai
      // kamera yang naik (lembar kontak F4 kedua, 1,4 sampai 1,5 s)
      const seberang = a === KLIEN[0] && b === KLIEN[1] + 1;
      for (let j = 0; j < 9; j++) pohon(bx + (acak(id + j) - 0.5) * 44, 12, bz + (seberang ? acak(id * 3 + j) * 22 : (acak(id * 3 + j) - 0.5) * 44), 12);
      continue;
    }
    kot(bx, 0.9, bz, BLOK, 1, BLOK, P.putih);
    for (let j = 0; j < 4; j++) {
      const kx = bx + ((j % 2) - 0.5) * 26;
      const kz = bz + (Math.floor(j / 2) - 0.5) * 26;
      const r = acak(id * 4 + j);
      const warna = WARNA_GEDUNG[Math.floor(acak(id * 7 + j * 3) * 6)];
      if (r < 0.12) pohon(kx, 13, kz, 13);
      else if (r < 0.3 + padat * 0.55) {
        const h = 24 + acak(id * 9 + j) * 140 * padat;
        kot(kx, h / 2 + 1, kz, 20, h, 20, warna);
      } else rumah(kx, kz, 20, 10, 18, { w: 30, h: 10, d: 26 }, warna);
    }
  }
  // pinggiran: rumah kecil berkelompok dan pohon, makin jarang ke luar; tidak ada yang jatuh di
  // jalan inti terluar (previs: pohon kelompok dan pohon tepi sungai tumbuh di lajur mobil)
  const diInti = (x, z) => Math.abs(x) < SETENGAH + 16 && Math.abs(z) < SETENGAH + 16;
  for (let i = 0; i < 900; i++) {
    const a = acak(i * 2) * Math.PI * 2;
    const r = 520 + Math.pow(acak(i * 5), 1.6) * 1300;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (kosong(x, z, 6) || diInti(x, z)) continue;
    if (acak(i * 9) < 0.45) {
      rumah(x, z, 12, 6, 10, { w: 18, h: 7, d: 15 }, WARNA_GEDUNG[i % 6]);
      k.pesan.push(keLantai(x, 12, z));
    } else {
      const n = 3 + Math.floor(acak(i) * 5);
      for (let j = 0; j < n; j++) pohon(x + (acak(i + j * 7) - 0.5) * 40, 12, z + (acak(i * 3 + j) - 0.5) * 40, 12);
    }
  }
  for (let z = -1400; z <= 1400; z += 34) for (const sisi of [-1, 1]) {
    const x = sungaiX(z) + sisi * 44;
    if (diInti(x, z)) continue;
    pohon(x, 12, z, 11);
  }
  // jalan inti untuk lalu lintas
  for (let i = 0; i <= N; i++) {
    const p = (i - N / 2) * LANGKAH;
    for (const [a, b] of [[[p, -SETENGAH], [p, SETENGAH]], [[-SETENGAH, p], [SETENGAH, p]]]) k.jalan.push({ a: [a[0] - ASAL[0], a[1] - ASAL[2]], b: [b[0] - ASAL[0], b[1] - ASAL[2]] });
  }
  cache = k;
  return k;
}

// ---- Lalu lintas dan pesanan -----------------------------------------------------------------
// Mobil j di jalan inti pada waktu t detik: posisi tengah badan dan arah (sudut y). Lajur 3,6 m di
// kiri atau kanan garis tengah; jumlah yang tampak naik dengan `padat` (0..1), seperti previs.
export const MOBIL = { jumlah: 1400, ukuran: [4.4, 2, 2.2], lajur: 3.6 };
export function dataMobil(j) {
  const { jalan } = susunKota();
  const g = jalan[j % jalan.length];
  const lajur = (acak(j * 3) < 0.5 ? -1 : 1) * MOBIL.lajur;
  return { g, lajur, f: acak(j * 7), v: (0.04 + acak(j) * 0.05) * (lajur > 0 ? 1 : -1), warna: WARNA_MOBIL[j % 6] };
}
export function posisiMobil(m, t) {
  const f = (((m.f + m.v * t) % 1) + 1) % 1;
  const d = [m.g.b[0] - m.g.a[0], m.g.b[1] - m.g.a[1]];
  const j = Math.hypot(...d);
  const n = [-d[1] / j, d[0] / j];
  return { posisi: [m.g.a[0] + d[0] * f + n[0] * m.lajur, 1.6 - TINGGI_LANTAI, m.g.a[1] + d[1] * f + n[1] * m.lajur], ry: -Math.atan2(d[1], d[0]) };
}
export const jumlahTampak = (n, padat) => Math.round(n * (0.35 + 0.65 * Math.min(1, Math.max(0, padat))));

// Pesanan: titik amber terbang dari atap rumah pinggiran ke atap gedung klien (lengkung kuadrat).
// Jari-jari 5 m: dari bidikan kota (sekitar 700 m) titiknya 2 sampai 3 piksel; 1,8 m previs hilang.
export const PESAN = { jumlah: 700, jari: 5 };
export function posisiPesan(j, t) {
  const { pesan } = susunKota();
  const a = pesan[Math.floor(acak(j * 11) * pesan.length)];
  const b = [0, 2 * TINGGI_LANTAI + 2, 0];
  const c = [(a[0] + b[0]) / 2, 80 + acak(j) * 120, (a[2] + b[2]) / 2];
  const f = (acak(j * 17) + t * 0.45) % 1;
  return a.map((v, i) => (1 - f) * (1 - f) * v + 2 * (1 - f) * f * c[i] + f * f * b[i]);
}
export const pesanTampak = (n, padat) => Math.floor(n * Math.min(1, Math.max(0, padat)));

// Kotak batas dunia semua benda padat kota (untuk tes: jalur kamera tidak menembus gedung kota).
export function batasKota() {
  const k = susunKota();
  const kotakBatas = ([x, y, z, sx, sy, sz]) => ({ min: [x - sx / 2, y - sy / 2, z - sz / 2], max: [x + sx / 2, y + sy / 2, z + sz / 2] });
  // limas: alas sx x sz (setengah sisi = 0,509 dari kerucut empat sisi jari-jari 0,72 diputar 45 derajat)
  const atap = ([x, y, z, sx, sy, sz]) => ({ min: [x - sx * 0.51, y - sy / 2, z - sz * 0.51], max: [x + sx * 0.51, y + sy / 2, z + sz * 0.51] });
  const bola = ([x, y, z, d]) => ({ min: [x - d / 2, y - d / 2, z - d / 2], max: [x + d / 2, y + d / 2, z + d / 2] });
  return [...k.kotak.map(kotakBatas), ...k.atap.map(atap), ...k.pohon.map(bola)];
}
