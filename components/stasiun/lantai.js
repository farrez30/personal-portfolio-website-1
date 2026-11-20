// Lantai kantor cerita v5 sebagai data: daftar bentuk dasar (kotak, silinder, bola, kapsul, torus,
// bidang layar) lengkap dengan matriks dunia dan warnanya. Tanpa three.js, supaya tata letak dan
// pose kamera bisa dites di Node (tests/stasiun-lantai.test.mjs); dunia.js mengubahnya jadi
// beberapa mesh gabungan, bukan satu mesh per benda, karena anggaran HP 100 draw call
// (docs/look-dev/cerita-v5.md). Isi tiap meja dipindah dari previs (desain/cerita-v5/previs/
// previs.html, mode ?dunia=penuh&tx=campur), angka dan warnanya sama.
//
// Satuan meter. Lantai 40 x 8 m berpusat di (0, 0, 0), lantai di y = 0. Baris belakang z = -3,2,
// baris depan z = 1,7 diputar 180 derajat (menghadap dinding belakang dari sisi jendela).
// Fasad kaca di z = 4, dinding belakang di z = -4.

export const LANTAI = { lebar: 40, dalam: 8, tinggi: 3.3 };

// Warna pastel (lembar look-dev, PALET previs sesudah dipetakan dari clay).
export const W = {
  kertas: 0xf6efe3,
  gelap: 0x4b4a5c,
  dinding: 0xeadfca,
  kayu: 0xf2d49b,
  biru: 0xa9c4ec,
  hijau: 0xb9dcb0,
  putih: 0xfffaf0,
  kuning: 0xf6c76b,
  ungu: 0xcdb8e8,
  kulit: 0xf2b8a0,
  abu: 0x9a93a8,
  pasir: 0xd8cdbb,
  merah: 0xe3695d,
  nota: 0xb8322a,
  amber: 0xf1ba6a,
  mati: 0x3d3a4a,
  pilar: 0xe6ddcc,
};

// ---- Matriks 4x4 kolom-mayor (urutan yang sama dengan Matrix4.fromArray three.js) ------------
const identitas = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export function kali(a, b) {
  const r = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let rw = 0; rw < 4; rw++) for (let k = 0; k < 4; k++) r[c * 4 + rw] += a[k * 4 + rw] * b[c * 4 + k];
  return r;
}
// Posisi, rotasi Euler XYZ (seperti Object3D.rotation), skala.
export function susun(pos = [0, 0, 0], rot = [0, 0, 0], skala = [1, 1, 1]) {
  const [a, b, c] = rot;
  const [ca, sa, cb, sb, cc, sc] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), Math.cos(c), Math.sin(c)];
  // R = Rx * Ry * Rz (makeRotationFromEuler, urutan XYZ)
  const r = [
    cb * cc, ca * sc + sa * sb * cc, sa * sc - ca * sb * cc,
    -cb * sc, ca * cc - sa * sb * sc, sa * cc + ca * sb * sc,
    sb, -sa * cb, ca * cb,
  ];
  const [x, y, z] = skala;
  return [r[0] * x, r[1] * x, r[2] * x, 0, r[3] * y, r[4] * y, r[5] * y, 0, r[6] * z, r[7] * z, r[8] * z, 0, pos[0], pos[1], pos[2], 1];
}
export function terapkan(m, [x, y, z]) {
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}
// Matriks benda yang sumbu +z-nya menghadap titik `ke` (Object3D.lookAt untuk benda bukan kamera).
function hadap(pos, ke) {
  const z = norm(sub(ke, pos));
  let x = silang([0, 1, 0], z);
  if (Math.hypot(...x) < 1e-6) x = [1, 0, 0];
  x = norm(x);
  const y = silang(z, x);
  return [...x, 0, ...y, 0, ...z, 0, ...pos, 1];
}
const sub = (a, b) => a.map((v, i) => v - b[i]);
const tambah = (a, b) => a.map((v, i) => v + b[i]);
const skalar = (a, k) => a.map((v) => v * k);
const norm = (a) => skalar(a, 1 / (Math.hypot(...a) || 1));
const silang = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerp3 = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);

// ---- Penyusun --------------------------------------------------------------------------------
// Satu benda: { bentuk, ukuran, m (matriks dunia), warna, bahan, ... }. `bahan`:
//   toon   - MeshToonMaterial warna rata, ikut bayangan dan garis tinta (bawaan)
//   layar  - gambar layar menyala (MeshBasicMaterial dari atlas), ikut garis tinta
//   kertas - lembar kertas bergambar (toon dari atlas), ikut garis tinta
//   lampu  - titik lampu menyala, warna rata tanpa bayangan
//   label  - tulisan di dunia, tanpa garis tinta
//   kaca   - dinding kaca tembus, tanpa garis tinta dan tanpa bayangan
// Bentuk keras berbevel (riset-bentuk-prop.md): `bevel` = radius dalam meter, dipakai RoundedBox.
function penyusun() {
  const benda = [];
  const simpul = (m) => ({ m });
  const akar = simpul(identitas());
  const tambahkan = (par, data, pos, rot, skala) => {
    const m = kali(par.m, susun(pos, rot, skala));
    const o = { ...data, m };
    benda.push(o);
    return o;
  };
  const grup = (par, pos, rot, skala) => simpul(kali(par.m, susun(pos, rot, skala)));
  // Benda keras: bevel 10% sisi terpendek, hanya bila sisi itu cukup tebal untuk terlihat (2 cm).
  const bevel = (w, h, d) => {
    const s = Math.min(w, h, d);
    return s >= 0.02 ? +(s * 0.1).toFixed(4) : 0;
  };
  return {
    benda,
    akar,
    grup,
    kotak: (w, h, d, warna, x = 0, y = 0, z = 0, par = akar, rot, o = {}) =>
      tambahkan(par, { bentuk: "kotak", ukuran: [w, h, d], warna, bevel: o.bevel ?? bevel(w, h, d), bayang: o.bayang ?? true, bahan: o.bahan ?? "toon" }, [x, y, z], rot),
    silinder: (r, h, warna, x = 0, y = 0, z = 0, par = akar, rot, o = {}) =>
      tambahkan(par, { bentuk: "silinder", ukuran: [r, h], warna, bayang: o.bayang ?? true, bahan: o.bahan ?? "toon" }, [x, y, z], rot),
    bola: (r, warna, x = 0, y = 0, z = 0, par = akar, o = {}) =>
      tambahkan(par, { bentuk: o.ikosa ? "ikosa" : "bola", ukuran: [r], warna, bayang: o.bayang ?? true, bahan: o.bahan ?? "toon" }, [x, y, z]),
    kapsul: (r, pjg, warna, x = 0, y = 0, z = 0, par = akar) => tambahkan(par, { bentuk: "kapsul", ukuran: [r, pjg], warna, bayang: true, bahan: "toon" }, [x, y, z]),
    torus: (r, tabung, warna, x = 0, y = 0, z = 0, par = akar, rot) => tambahkan(par, { bentuk: "torus", ukuran: [r, tabung], warna, bayang: true, bahan: "toon" }, [x, y, z], rot),
    // Bidang bergambar dari atlas: `isi` = kunci gambar (dunia.js menggambar atlasnya).
    bidang: (w, h, isi, bahan, x = 0, y = 0, z = 0, par = akar, rot) => tambahkan(par, { bentuk: "bidang", ukuran: [w, h], isi, bahan, bayang: bahan === "kertas", warna: 0xffffff }, [x, y, z], rot),
    tabung: (titik, r, warna, par = akar) => tambahkan(par, { bentuk: "tabung", titik, ukuran: [r], warna, bayang: true, bahan: "toon" }, [0, 0, 0]),
    tempel: (data, m) => {
      benda.push({ ...data, m });
    },
  };
}

// ---- Benda berulang (dari previs) --------------------------------------------------------------
function perabot(b) {
  const meja = (par, w = 1.6, d = 0.75) => {
    b.kotak(w, 0.04, d, W.kayu, 0, 0.73, 0, par, undefined, { bevel: 0.008 });
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.kotak(0.04, 0.71, 0.04, W.gelap, x * (w / 2 - 0.05), 0.355, z * (d / 2 - 0.05), par);
  };
  // Map ditumpuk sedikit miring (riset bentuk: hindari garis sejajar sempurna).
  const tumpukanMap = (par, x, z, n = 9) => {
    for (let i = 0; i < n; i++) b.kotak(0.32, 0.028, 0.24, i % 3 ? W.biru : W.hijau, x + Math.sin(i * 7) * 0.012, 0.765 + i * 0.03, z + Math.cos(i * 5) * 0.012, par, [0, Math.sin(i * 3) * 0.08, 0], { bevel: 0.003 });
  };
  const nota = (par, x, y, z, ry = 0) => b.kotak(0.08, 0.003, 0.12, W.nota, x, y, z, par, [0, ry, 0]);
  // Timbangan dua lengan: piring kiri dan kanan dikembalikan supaya benda bisa ditaruh di atasnya.
  const timbangan = (par, x, z, miring = 0.2, s = 1) => {
    const g = b.grup(par, [x, 0.75, z], [0, 0, 0], [s, s, s]);
    b.silinder(0.09, 0.02, W.kuning, 0, 0.01, 0, g);
    b.silinder(0.008, 0.32, W.kuning, 0, 0.17, 0, g);
    const balok = b.grup(g, [0, 0.33, 0], [0, 0, miring]);
    b.kotak(0.42, 0.012, 0.012, W.kuning, 0, 0, 0, balok);
    const piring = [];
    for (const sx of [-1, 1]) {
      const tali = b.grup(balok, [sx * 0.2, 0, 0], [0, 0, -miring]);
      b.kotak(0.002, 0.16, 0.002, W.gelap, 0, -0.08, 0, tali, undefined, { bayang: false });
      b.silinder(0.07, 0.008, W.kuning, 0, -0.16, 0, tali);
      piring.push(b.grup(tali, [0, -0.16, 0]));
    }
    return piring;
  };
  const monitor = (par, x, z, isi, w = 0.56, h = 0.33, ry = 0) => {
    const g = b.grup(par, [x, 0.75, z], [0, ry, 0]);
    b.kotak(0.18, 0.012, 0.14, W.gelap, 0, 0.006, 0, g);
    b.kotak(0.03, 0.16, 0.03, W.gelap, 0, 0.09, -0.02, g);
    b.kotak(w + 0.02, h + 0.02, 0.02, W.gelap, 0, 0.17 + h / 2, -0.03, g, undefined, { bevel: 0.004 });
    b.bidang(w, h, isi, "layar", 0, 0.17 + h / 2, -0.019, g);
  };
  const orang = (par, x, z, duduk = false, warna = W.kulit) => {
    const tinggi = duduk ? 1.25 : 1.7;
    b.kapsul(0.17, tinggi - 0.6, warna, x, tinggi / 2, z, par);
    b.bola(0.11, warna, x, tinggi + 0.08, z, par);
  };
  const kursi = (par, x, z) => {
    b.kotak(0.46, 0.05, 0.46, W.gelap, x, 0.46, z, par);
    b.kotak(0.46, 0.5, 0.05, W.gelap, x, 0.73, z + 0.21, par);
    b.silinder(0.025, 0.44, W.gelap, x, 0.22, z, par);
  };
  const tanaman = (par, x, z) => {
    b.silinder(0.2, 0.45, W.kulit, x, 0.22, z, par);
    b.bola(0.4, W.hijau, x, 0.85, z, par, { ikosa: true });
  };
  return { meja, tumpukanMap, nota, timbangan, monitor, orang, kursi, tanaman };
}

// ---- Tujuh tempat di lantai ------------------------------------------------------------------
// [id babak, x, z, putar]: x dan z pusat meja di lantai. Baris belakang dan depan berselang
// (ADR 0023, previs tx=campur). Ruang server untuk babak data.
export const TEMPAT = [
  ["dorongan", -17, -3.2, 0],
  ["harga-diam", -14.2, 1.7, Math.PI],
  ["tarikan", -10.4, -3.2, 0],
  ["biaya", -6.8, 1.7, Math.PI],
  ["kelangsungan", -3.4, -3.2, 0],
  ["data", 3.2, -2.4, 0],
  ["kebiasaan", 9.2, 1.7, Math.PI],
];
// Alas babak biaya berdiri di atas meja (kamera tampak atas), jadi isinya diangkat setinggi meja.
const ANGKAT = { biaya: 0.74 };

// Pose kamera setempat tiap babak (sebelum diputar dan digeser ke tempatnya): posisi dan titik
// lihat untuk layar lebar (fov 38) dan layar tegak (fov 52), dari previs.
const KAMERA = {
  dorongan: { d: [[0.35, 1.42, 1.5], [0.08, 0.95, 0]], h: [[0.25, 1.5, 2.2], [0.08, 1.05, 0]] },
  "harga-diam": { d: [[0.42, 1.08, 0.72], [0.04, 0.95, 0.05]], h: [[0.25, 1.15, 1.05], [0.06, 0.95, 0.05]] },
  tarikan: { d: [[0.48, 0.98, 0.5], [0, 0.85, 0]], h: [[0.42, 1.05, 0.62], [0, 0.85, 0]] },
  // tampak atas: sedikit dari depan supaya arah atas kamera tetap y (previs dunia penuh)
  biaya: { d: [[0, 0.85, 0.32], [0, 0, 0.02]], h: [[0.02, 1.25, 0.35], [0, 0, 0.02]] },
  kelangsungan: { d: [[1.05, 1.35, 1.25], [0, 0.8, 0]], h: [[1.0, 1.55, 1.7], [0, 0.8, 0]] },
  // Di previs kamera HP mundur sampai 6,6 m, melewati fasad kaca; di sini tetap di dalam gedung
  // dan bidang pandang tegak yang melebar.
  data: { d: [[2.2, 2.3, 5.8], [0.4, 1.3, 1.0]], h: [[2.0, 2.7, 5.9], [0.4, 1.2, 1.0]] },
  kebiasaan: { d: [[0.55, 1.95, 2.7], [0, 1.0, -0.15]], h: [[0.5, 2.1, 3.6], [0, 1.0, -0.15]] },
};
export const FOV = { lebar: 38, tegak: 52 };

const keDunia = (id, p) => {
  const [, x, z, putar] = TEMPAT.find((t) => t[0] === id);
  return terapkan(susun([x, ANGKAT[id] ?? 0, z], [0, putar, 0]), p).map((v) => +v.toFixed(4));
};

// Pose kamera tiap babak di koordinat lantai: { posisi, lihat, fov, tegak: { posisi, lihat, fov } }.
export const POSE = Object.fromEntries(
  TEMPAT.map(([id]) => {
    const k = KAMERA[id];
    return [id, { posisi: keDunia(id, k.d[0]), lihat: keDunia(id, k.d[1]), fov: FOV.lebar, tegak: { posisi: keDunia(id, k.h[0]), lihat: keDunia(id, k.h[1]), fov: FOV.tegak } }];
  }),
);
// Hero: lantai kantor dari ujung lorong, meja pertama di kejauhan kanan bingkai.
POSE.gerbang = {
  posisi: [-19.2, 2.35, 3.2],
  lihat: [-15.6, 0.95, -2.2],
  fov: 44,
  tegak: { posisi: [-19.3, 2.6, 3.4], lihat: [-16.4, 0.9, -2.6], fov: 58 },
};

// Dua pilar struktur di tengah lorong [x, z].
export const PILAR_LORONG = [[-11.9, -0.6], [-2.0, -0.6]];

// Pilar yang dilewati kamera dari kelangsungan ke ruang server (pemicu perpindahan "pilar").
export const PILAR_LEWAT = (() => {
  const m = lerp3(POSE.kelangsungan.posisi, POSE.data.posisi, 0.5);
  return [+m[0].toFixed(3), +(m[2] - 0.55).toFixed(3)];
})();

// Tablet berlayar sama di meja tarikan dan biaya: pintu masuk dan keluar perpindahan "masuk
// layar" (F3). Di previs tablet melayang di samping titik lihat dan di babak biaya menutupi lembar
// lingkup; di sini tablet berdiri di meja tarikan menghadap kamera dan tergeletak di meja biaya,
// di sisi yang kosong.
function letakTablet(id, lokal, tegak) {
  const c = keDunia(id, lokal);
  const m = tegak ? hadap(c, [POSE[id].posisi[0], c[1], POSE[id].posisi[2]]) : kali(susun(c, [0, TEMPAT.find((t) => t[0] === id)[3], 0]), susun([0, 0, 0], [-Math.PI / 2, 0, 0]));
  return { c, m };
}
export const TABLET = { tarikan: letakTablet("tarikan", [0.5, 0.86, -0.18], true), biaya: letakTablet("biaya", [0.42, 0.012, -0.3], false) };

// Tulisan di dunia per bahasa (LEMBUR di piring timbangan, dan seterusnya).
export const LABEL = {
  lembur: { id: "LEMBUR", en: "OVERTIME" },
  selisih: { id: "SELISIH STOK", en: "STOCK GAP" },
  tahap1: { id: "TAHAP 1", en: "PHASE 1" },
  tahap2: { id: "TAHAP 2", en: "PHASE 2" },
  tahap3: { id: "TAHAP 3", en: "PHASE 3" },
  tambahan: { id: "TAMBAHAN", en: "ADD-ON" },
  catatan: { id: "CATATAN CARA KERJA", en: "HOW IT WORKS" },
  utama: { id: "UTAMA", en: "MAIN" },
  cadangan: { id: "KE CADANGAN", en: "TO BACKUP" },
};

// ---- Penyusunan ------------------------------------------------------------------------------
export function susunLantai() {
  const b = penyusun();
  const p = perabot(b);
  const tempat = Object.fromEntries(TEMPAT.map(([id, x, z, putar]) => [id, b.grup(b.akar, [x, ANGKAT[id] ?? 0, z], [0, putar, 0])]));
  // Label menghadap kamera babaknya (bidang datar, satu draw call untuk semua label).
  const label = (par, kunci, x, y, z, tinggi, id) => {
    const posDunia = terapkan(par.m, [x, y, z]);
    const kam = POSE[id].posisi;
    const ke = [kam[0], posDunia[1], kam[2]];
    b.tempel({ bentuk: "bidang", ukuran: [tinggi * 4, tinggi], isi: `label:${kunci}`, bahan: "label", bayang: false, warna: 0xffffff }, hadap(posDunia, ke));
  };

  // Ruangan: lantai bertitik, dinding belakang, dinding samping, fasad jendela dengan celah tanpa
  // tiang di x = 8 (jalan keluar kamera di F4). Tanpa plafon: crane F3 membukanya seperti rumah boneka.
  b.bidang(LANTAI.lebar - 0.6, LANTAI.dalam - 0.6, "lantai", "lantai", 0, 0.005, 0, b.akar, [-Math.PI / 2, 0, 0]);
  b.kotak(LANTAI.lebar - 0.6, LANTAI.tinggi, 0.05, W.dinding, 0, LANTAI.tinggi / 2, -3.8, b.akar, undefined, { bevel: 0 });
  for (const sx of [-1, 1]) b.kotak(0.3, 3.6, LANTAI.dalam, W.putih, sx * LANTAI.lebar / 2, 1.8, 0, b.akar, undefined, { bevel: 0, bayang: false });
  b.kotak(LANTAI.lebar, 0.9, 0.3, W.putih, 0, 0.45, 4, b.akar, undefined, { bevel: 0, bayang: false });
  b.kotak(LANTAI.lebar, 0.4, 0.3, W.putih, 0, 3.25, 4, b.akar, undefined, { bevel: 0, bayang: false });
  for (let x = -20; x <= 20; x += 4) if (Math.abs(x - 8) > 2.5) b.kotak(0.25, 2.3, 0.3, W.gelap, x, 1.55, 4, b.akar, undefined, { bevel: 0, bayang: false });
  b.tempel({ bentuk: "bidang", ukuran: [LANTAI.lebar, 2.3], bahan: "kaca", bayang: false, warna: W.putih }, susun([0, 1.55, 4.16]));

  // Lorong: dua pilar struktur, pilar yang dilewati kamera, tanaman di kedua ujung, dua rekan kerja.
  // Kedua pilar digeser dari previs (x -12,3 dan -0,4): di sana blend harga-diam ke tarikan dan
  // kelangsungan ke ruang server menembusnya (tes blend tidak menembus benda).
  for (const [x, z] of PILAR_LORONG) b.kotak(0.45, LANTAI.tinggi, 0.45, W.putih, x, LANTAI.tinggi / 2, z, b.akar, undefined, { bevel: 0.03 });
  b.kotak(0.45, LANTAI.tinggi, 0.45, W.pilar, PILAR_LEWAT[0], LANTAI.tinggi / 2, PILAR_LEWAT[1], b.akar, undefined, { bevel: 0.03 });
  for (const x of [-18.6, 6.4]) p.tanaman(b.akar, x, -0.6);
  p.orang(b.akar, -8.6, -0.2, false, W.biru);
  p.orang(b.akar, -5.0, -1.0, false, W.kulit);

  // 1. Dorongan: map menumpuk, lembar kerja penuh angka, jam lewat pukul sepuluh malam, nota merah di timbangan.
  {
    const t = tempat.dorongan;
    p.meja(t);
    p.tumpukanMap(t, -0.42, -0.2, 11);
    p.tumpukanMap(t, -0.16, -0.27, 6);
    p.monitor(t, 0.58, -0.26, "lembar", 0.5, 0.3, -0.25);
    b.silinder(0.13, 0.02, W.putih, -0.45, 1.42, -0.57, t, [Math.PI / 2, 0, 0]);
    for (const [pjg, sudut] of [[0.09, ((22 + 10 / 60) / 12) * Math.PI * 2], [0.13, (10 / 60) * Math.PI * 2]]) {
      const j = b.grup(t, [-0.45, 1.42, -0.555], [0, 0, -sudut]);
      b.kotak(0.008, pjg, 0.004, W.gelap, 0, pjg / 2, 0, j);
    }
    const [kiri] = p.timbangan(t, 0.12, 0.16, 0.22, 1.25);
    p.nota(kiri, 0, 0.007, 0, 0.3).terbang = "dari";
  }
  // 2. Harga diam: nota dan koin lembur di satu piring, timbangan miring. Nota yang terbang dari
  // meja 1 mendarat di atas koin, bukan di bawahnya (lembar kontak F3: dari atas ia menembus koin).
  {
    const t = tempat["harga-diam"];
    p.meja(t);
    p.tumpukanMap(t, -0.45, -0.1, 8);
    const [kiri] = p.timbangan(t, 0.15, 0.05, 0.34, 1.1);
    p.nota(kiri, 0.01, 0.058, 0.02).terbang = "ke";
    b.silinder(0.028, 0.05, W.kuning, -0.03, 0.03, -0.02, kiri);
    b.silinder(0.022, 0.04, W.kuning, 0.035, 0.025, 0.02, kiri);
    label(kiri, "lembur", -0.06, 0.22, -0.02, 0.022, "harga-diam");
    label(kiri, "selisih", 0.06, 0.16, 0.03, 0.02, "harga-diam");
  }
  // 3. Tarikan: HP di dudukan dengan angka hari ini, timbangan kecil di belakangnya.
  {
    const t = tempat.tarikan;
    p.meja(t);
    p.tumpukanMap(t, -0.4, -0.05, 9);
    const g = b.grup(t, [0.1, 0.75, 0.05], [0, -0.25, 0]);
    b.kotak(0.1, 0.012, 0.08, W.gelap, 0, 0.006, 0, g);
    const hp = b.grup(g, [0, 0.1, -0.01], [-0.25, 0, 0]);
    b.kotak(0.078, 0.162, 0.008, W.gelap, 0, 0, 0, hp, undefined, { bevel: 0.003 });
    b.bidang(0.07, 0.15, "hp", "layar", 0, 0, 0.0045, hp);
    const [kiri] = p.timbangan(t, -0.12, 0.2, 0.26, 0.8);
    p.nota(kiri, 0, 0.007, 0);
  }
  // 4. Biaya, tampak atas: lembar lingkup, tiga tahap bertingkat, kartu tambahan menuju tahap berikutnya.
  {
    const t = tempat.biaya;
    b.kotak(1.65, 0.02, 1.2, W.kayu, 0, -0.01, 0, t, undefined, { bevel: 0.006 });
    for (const [x, z] of [[-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55]]) b.kotak(0.05, 0.73, 0.05, W.gelap, x, -0.38, z, t);
    b.bidang(0.21, 0.297, "lingkup", "kertas", -0.24, 0.002, 0, t, [-Math.PI / 2, 0, 0.04]);
    const warna = [W.merah, W.kertas, W.pasir];
    for (let i = 0; i < 3; i++) {
      b.kotak(0.08, 0.04 + i * 0.015, 0.08, warna[i], -0.04 + i * 0.1, 0.02 + i * 0.0075, -0.02, t);
      label(t, `tahap${i + 1}`, -0.04 + i * 0.1, 0.006, 0.06, 0.02, "biaya");
    }
    b.kotak(0.07, 0.004, 0.05, W.merah, 0.1, 0.06, 0.13, t, [0, 0.5, 0]);
    label(t, "tambahan", 0.1, 0.08, 0.17, 0.02, "biaya");
    // jalur kartu tambahan ke tahap berikutnya (garis putus-putus merah)
    const kurva = [];
    for (let i = 0; i <= 30; i++) {
      const u = i / 30;
      const [a, c, e] = [[0.1, 0.06, 0.13], [0.18, 0.08, 0.1], [0.16, 0.06, -0.02]];
      kurva.push(a.map((v, k) => (1 - u) * (1 - u) * v + 2 * (1 - u) * u * c[k] + u * u * e[k]));
    }
    b.tempel({ bentuk: "garis", titik: kurva, warna: W.merah, bahan: "garis", bayang: false }, t.m);
  }
  // 5. Kelangsungan: kontrak hak atas kode, catatan cara kerja, kunci, layar "semua layanan jalan".
  {
    const t = tempat.kelangsungan;
    p.meja(t);
    p.kursi(t, 0, 0.62);
    const [kiri] = p.timbangan(t, -0.62, -0.12, 0.08, 0.8);
    p.nota(kiri, 0, 0.007, 0);
    b.kotak(0.24, 0.03, 0.32, W.hijau, -0.35, 0.765, 0.05, t, undefined, { bevel: 0.004 });
    label(t, "catatan", -0.35, 0.83, 0.05, 0.022, "kelangsungan");
    b.bidang(0.21, 0.297, "kontrak", "kertas", 0.05, 0.752, 0.08, t, [-Math.PI / 2, 0, -0.08]);
    const k = b.grup(t, [0.32, 0.755, 0.12]);
    b.torus(0.02, 0.005, W.kuning, 0, 0, 0, k, [Math.PI / 2, 0, 0]);
    b.kotak(0.06, 0.004, 0.01, W.kuning, 0.045, 0, 0, k);
    p.monitor(t, 0.35, -0.2, "layanan", 0.44, 0.27, -0.3);
  }
  // 6. Data: ruang server kaca, rak utama dengan satu rak padam, kabel merah ke cadangan, perisai
  // yang menolak paket asing.
  {
    const t = tempat.data;
    b.kotak(5.6, 3, 4.4, W.putih, 0, 1.5, 0.9, t, undefined, { bevel: 0, bayang: false, bahan: "kaca" });
    [-1.5, 0, 1.5].forEach((x, i) => {
      b.kotak(0.9, 2.1, 0.9, W.gelap, x, 1.05, 0, t);
      for (let k = 0; k < 6; k++) b.bola(0.03, i === 1 ? W.mati : W.amber, x - 0.3, 0.3 + k * 0.3, 0.46, t, { bahan: "lampu", bayang: false });
    });
    label(t, "utama", 0, 2.4, 0.3, 0.12, "data");
    label(t, "cadangan", 2.5, 1.7, 3.0, 0.07, "data");
    b.tabung([[1.5, 2.1, 0], [1.6, 2.6, 0.6], [2.2, 2.6, 1.8], [2.5, 1.9, 3.0]], 0.04, W.merah, t);
    b.torus(0.6, 0.05, W.amber, 2.7, 1.2, 2.4, t, [0, -0.9, 0]);
    for (let j = 0; j < 5; j++) b.bola(0.08, W.abu, 3.2 + j * 0.25, 1.2 + Math.sin(j * 2) * 0.25, 2.9 + j * 0.2, t);
  }
  // 7. Kebiasaan: sistem lama dan baru berdampingan dengan urutan kolom yang sama, orang yang
  // biasa memakainya duduk di depan.
  {
    const t = tempat.kebiasaan;
    p.meja(t, 2.0, 0.8);
    p.monitor(t, -0.35, -0.15, "lama", 0.5, 0.3, 0.12);
    p.monitor(t, 0.35, -0.15, "baru", 0.5, 0.3, -0.12);
    p.kursi(t, -0.6, 0.7);
    p.orang(t, -0.6, 0.73, true);
    const [, kanan] = p.timbangan(t, 0.82, 0.12, -0.05, 0.8);
    p.nota(kanan, 0, 0.007, 0);
    p.orang(t, 1.05, 0.45, false, W.biru);
  }
  // Tablet berlayar sama di meja tarikan dan biaya.
  for (const { m } of Object.values(TABLET)) {
    b.tempel({ bentuk: "kotak", ukuran: [0.27, 0.19, 0.012], warna: W.gelap, bevel: 0.004, bayang: true, bahan: "toon" }, kali(m, susun([0, 0, -0.008])));
    b.tempel({ bentuk: "bidang", ukuran: [0.24, 0.16], isi: "tablet", bahan: "layar", bayang: false, warna: 0xffffff }, kali(m, susun([0, 0, 0.0002])));
  }
  return b.benda;
}

// Nota merah yang terbang dari timbangan meja dorongan ke timbangan meja harga-diam (perpindahan
// "ikut", F3). Satu kertas yang sama: di meja 1 sebelum terbang, di meja 2 sesudahnya, jadi adegan
// menggambarnya sebagai mesh tersendiri, bukan bagian mesh gabungan. Piring timbangan selalu datar,
// jadi pose diamnya cukup posisi, putaran y, dan skala timbangan.
let nota = null;
export function notaTerbang() {
  if (nota) return nota;
  const diam = (o) => ({ posisi: o.m.slice(12, 15), ry: Math.atan2(o.m[8], o.m[10]), s: Math.hypot(o.m[0], o.m[1], o.m[2]) });
  const benda = susunLantai();
  const cari = (k) => benda.find((o) => o.terbang === k);
  nota = { dari: diam(cari("dari")), ke: diam(cari("ke")), ukuran: cari("dari").ukuran, warna: W.nota };
  return nota;
}

// Kotak batas dunia sebuah benda (untuk tes: kamera tidak di dalam benda, meja tidak bertabrakan).
export function batas(o) {
  let s;
  if (o.bentuk === "kotak") s = o.ukuran.map((v) => v / 2);
  else if (o.bentuk === "silinder") s = [o.ukuran[0], o.ukuran[1] / 2, o.ukuran[0]];
  else if (o.bentuk === "bola" || o.bentuk === "ikosa") s = [o.ukuran[0], o.ukuran[0], o.ukuran[0]];
  else if (o.bentuk === "kapsul") s = [o.ukuran[0], o.ukuran[1] / 2 + o.ukuran[0], o.ukuran[0]];
  else if (o.bentuk === "torus") s = [o.ukuran[0] + o.ukuran[1], o.ukuran[0] + o.ukuran[1], o.ukuran[1]];
  else if (o.bentuk === "bidang") s = [o.ukuran[0] / 2, o.ukuran[1] / 2, 0];
  else {
    const t = o.titik.map((q) => terapkan(o.m, q));
    const r = o.ukuran?.[0] ?? 0;
    return { min: [0, 1, 2].map((k) => Math.min(...t.map((q) => q[k])) - r), max: [0, 1, 2].map((k) => Math.max(...t.map((q) => q[k])) + r) };
  }
  const sudut = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) sudut.push(terapkan(o.m, [x * s[0], y * s[1], z * s[2]]));
  return { min: [0, 1, 2].map((k) => Math.min(...sudut.map((q) => q[k]))), max: [0, 1, 2].map((k) => Math.max(...sudut.map((q) => q[k]))) };
}
