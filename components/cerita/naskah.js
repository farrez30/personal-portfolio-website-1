// Naskah adegan cerita gulir v2 (docs/storyboard-gulir.md): satu kotak CD di satu dunia 3D,
// sembilan babak (0 pembuka, lalu delapan bab). Progres p berjalan dari 0 sampai BABAK.length;
// babak c memakai u = p - c (0 sampai 1). Setiap babak bergerak dari POSE[c] ke POSE[c + 1],
// jadi di batas babak keadaannya selalu sama (dites di tests/naskah.test.mjs). Gerak sisipan di
// tengah babak (sinyal hilang, segel, layar penuh) memakai `bukit(u)` yang nol di kedua ujung.
// Murni, tanpa three.js, supaya bisa dites di Node.

// Bobot tinggi tiap babak dalam layar. Urutan sama dengan BAB di content/cerita.js, diawali pembuka.
// `pindah` adalah jendela u tempat pose bergeser ke babak berikutnya; sebelum itu pose ditahan,
// jadi benda tetap di sisi yang berlawanan dengan teks selama teks bab itu dibaca.
export const BABAK = [
  { id: "pembuka", bobot: 1.1, pindah: [0, 1] },
  { id: "demo", bobot: 1.8 },
  { id: "aransemen", bobot: 3 },
  { id: "transparansi", bobot: 1.6 },
  { id: "keamanan", bobot: 1.6 },
  { id: "keandalan", bobot: 1.6 },
  { id: "skala", bobot: 1.6 },
  { id: "infrastruktur", bobot: 2.4 },
  { id: "rak", bobot: 1.3, pindah: [0.35, 1] },
];

// Pose di awal tiap babak, plus satu pose akhir. Satuan dunia: 1 = 100 mm.
// sisi: 1 berarti teks di kiri dan benda di kanan, -1 sebaliknya.
const DASAR = {
  cam: [0, 0, 5.3], arah: [0, 0, 0], sisi: 0,
  kotak: [0, -2.6, 0], putar: [0.35, -0.9, 0.12], skala: 0.8,
  tutup: 0, cakramNaik: 0, putaran: 0, buklet: 0, segel: 0, uv: 0,
  perangkat: 0, laptop: 0, layarPenuh: 0, tumpuk: 0, urai: 0, sinyal: 0, ruang: 0, coret: 0,
  hilang: 0, iris: 0,
};

const pose = (ubah) => ({ ...DASAR, ...ubah });

export const POSE = [
  // 0 pembuka: kotak naik dari bawah judul seksi.
  pose({}),
  // 1 demo: kotak di kanan, tutup terbuka sedikit, coretan "DEMO" mulai.
  pose({ kotak: [0, 0, 0], putar: [0.08, -0.35, 0.03], skala: 1, sisi: 1, tutup: 0.12 }),
  // 2 aransemen: kamera menyelam ke lubang cakram, keluar di meja perangkat.
  pose({ kotak: [0, 0, 0], putar: [0, 0, 0], skala: 1, sisi: -1, tutup: 0.85, coret: 1, cakramNaik: 0.2 }),
  // 3 liner notes: kembali ke kotak, buklet keluar dari tutup.
  pose({ kotak: [0, 0, 0], putar: [0.1, 0.45, 0], skala: 1, sisi: 1, tutup: 1, coret: 1 }),
  // 4 sealed: kotak tertutup, segel membungkus, senter UV menyapu.
  pose({ kotak: [0, 0, 0], putar: [0.05, -0.4, 0], skala: 1, sisi: -1, tutup: 0, coret: 1 }),
  // 5 on repeat: cakram terangkat dan berputar.
  pose({ cam: [0, 1.1, 6.3], arah: [0, -0.2, 0], kotak: [0, -0.25, 0], putar: [-0.95, 0.3, 0], skala: 1, sisi: 1, tutup: 1, cakramNaik: 1, putaran: 1, coret: 1 }),
  // 6 press run: cakram berlipat ganda, kamera mundur.
  pose({ cam: [0, 1.1, 6.3], arah: [0, -0.2, 0], kotak: [0, -0.25, 0], putar: [-0.95, -0.3, 0], skala: 1, sisi: -1, tutup: 1, cakramNaik: 1, putaran: 1, coret: 1 }),
  // 7 the plant: kotak dirakit lagi, menghadap tiga perempat.
  pose({ kotak: [0, 0, 0], putar: [0.15, -0.75, 0], skala: 1, sisi: 1, tutup: 0, coret: 1 }),
  // 8 in the rack: kotak berdiri, ruang berubah ke panggung beige rak.
  pose({ kotak: [0, 0, 0], putar: [0, -0.2, 0], skala: 0.9, sisi: -1, tutup: 0, coret: 1, ruang: 0.4 }),
  // akhir: kotak turun ke rak di bawahnya.
  pose({ kotak: [0, -3.4, 0.4], putar: [0.6, 0, 0], skala: 0.7, sisi: 0, tutup: 0, coret: 1, ruang: 1, hilang: 1 }),
];

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const halus = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
// Nol di 0 dan 1, puncak 1 di tengah, datar di puncak supaya momennya sempat ditahan.
export const bukit = (u, naik = 0.3, turun = 0.3) => halus(u / naik) * halus((1 - u) / turun);
const jendela = (u, a, b) => halus((u - a) / (b - a));

function campur(a, b, t) {
  if (Array.isArray(a)) return a.map((v, i) => v + (b[i] - v) * t);
  return a + (b - a) * t;
}

function antara(A, B, t) {
  const hasil = {};
  for (const k of Object.keys(A)) hasil[k] = campur(A[k], B[k], t);
  return hasil;
}

// Gerak sisipan per babak: diterapkan di atas campuran dua pose, nilainya nol di u = 0 dan 1.
const SISIPAN = {
  demo: (s, u) => {
    s.coret = jendela(u, 0.25, 0.85);
  },
  aransemen: (s, u) => {
    // Menyelam ke lubang cakram (0 sampai 0,22), meja perangkat (0,22 sampai 0,85), keluar.
    const masuk = jendela(u, 0.04, 0.22);
    const keluar = jendela(u, 0.85, 0.98);
    s.perangkat = masuk * (1 - keluar);
    s.laptop = jendela(u, 0.28, 0.45) * (1 - keluar);
    s.layarPenuh = bukit((u - 0.55) / 0.27, 0.35, 0.35) * (u > 0.55 && u < 0.82 ? 1 : 0);
    // Kamera mendekat ke pusat cakram lalu "tembus".
    const selam = bukit(u / 0.24, 0.85, 0.15);
    // Tirai bulat menutup layar tepat saat kamera tembus, lalu membuka di meja perangkat.
    s.iris = bukit((u - 0.12) / 0.18, 0.45, 0.45);
    s.cam = [s.cam[0] * (1 - selam), s.cam[1] * (1 - selam), s.cam[2] - selam * 5.4];
    s.arah = [s.arah[0] * (1 - selam), s.arah[1] * (1 - selam), s.arah[2]];
    // Di meja perangkat kamera bergeser pelan dari kiri ke kanan dan sedikit naik.
    s.cam = [s.cam[0] + s.perangkat * (u - 0.5) * 1.8, s.cam[1] + s.perangkat * 0.7, s.cam[2]];
  },
  transparansi: (s, u) => {
    s.buklet = bukit(u, 0.35, 0.3);
  },
  keamanan: (s, u) => {
    s.segel = bukit(u, 0.4, 0.2);
    s.uv = bukit((u - 0.35) / 0.55, 0.3, 0.3) * (u > 0.35 && u < 0.9 ? 1 : 0);
  },
  keandalan: (s, u) => {
    s.sinyal = bukit((u - 0.25) / 0.55, 0.25, 0.4) * (u > 0.25 && u < 0.8 ? 1 : 0);
  },
  skala: (s, u) => {
    s.tumpuk = bukit(u, 0.45, 0.25);
    const mundur = s.tumpuk;
    s.cam = [s.cam[0], s.cam[1] + mundur * 1.6, s.cam[2] + mundur * 5.5];
  },
  infrastruktur: (s, u) => {
    s.urai = bukit(u, 0.35, 0.25);
  },
};

// Keadaan dunia pada progres p (0 sampai BABAK.length).
export function keadaanPada(p) {
  const n = BABAK.length;
  const pp = clamp(p, 0, n);
  const c = Math.min(n - 1, Math.floor(pp));
  const u = pp - c;
  const [a, b] = BABAK[c].pindah ?? [0.55, 1];
  const s = antara(POSE[c], POSE[c + 1], halus((u - a) / (b - a)));
  SISIPAN[BABAK[c].id]?.(s, u);
  s.babak = c;
  s.u = u;
  return s;
}

// Progres dari posisi gulir: babak yang memuat garis tengah layar, ditambah posisi garis itu
// di dalamnya. `blok` berisi { atas, tinggi } tiap babak dalam piksel dokumen.
export function progresDari(tengah, blok) {
  if (!blok.length) return 0;
  if (tengah <= blok[0].atas) return 0;
  for (let i = 0; i < blok.length; i++) {
    const b = blok[i];
    if (tengah < b.atas + b.tinggi) return i + clamp((tengah - b.atas) / b.tinggi);
  }
  return blok.length;
}
