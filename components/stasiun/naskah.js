// Naskah kamera cerita v5 arah G (ADR 0019, 0023, 0024): lantai kantor, keluar jendela ke kota, peta,
// globe malam, lalu masuk ke modul lab satelit. Satu anchor satu seksi halaman, seperti naskah toko
// kaset (components/dunia/naskah.js); bedanya tiap anchor menyebut jenis perpindahan keluarnya.
// Pose kamera lantai kantor datang dari components/stasiun/lantai.js (F2). Dipisah dari three.js
// supaya aturan urutan dan variasi bisa dites di Node. Peta babak: desain/cerita-v5/storyboard-build.md §2.

import { pemicuAnchor as pemicuDasar } from "../dunia/naskah.js";
import { BABAK_V5 } from "../../content/cerita-v5.js";
import { POSE } from "./lantai.js";

// Jenis perpindahan. `makro` = serah terima antarskala (gedung ke kota ke peta ke globe ke modul),
// boleh lebih lama dari batas perpindahan di dalam gedung.
export const JENIS = {
  blend: { makro: false },
  ikut: { makro: false }, // kamera mengikuti benda yang terbang (nota merah)
  whip: { makro: false }, // whip pan ke meja berikutnya
  layar: { makro: false }, // masuk lewat layar yang sama di dua meja
  orbit: { makro: false }, // kamera memutari benda
  pilar: { makro: false }, // lewat di balik pilar struktur
  crane: { makro: false }, // naik, plafon dibuka seperti rumah boneka
  jendela: { makro: true }, // keluar lewat celah jendela lalu naik ke atas kota
  "serah-peta": { makro: true },
  "serah-globe": { makro: true },
  "zoom-satelit": { makro: true },
  rel: { makro: false }, // gulir di rel lorong modul lab
};

// Batas perpindahan di dalam gedung (riset-modul-lab.md, pelajaran lift Mass Effect).
export const BATAS_DALAM = 1.8;

const KELUAR = {
  dorongan: ["ikut", 1.4, "nota merah terbang ke meja 2"],
  "harga-diam": ["whip", 0.6, "HP berdering di meja 3"],
  tarikan: ["layar", 1.2, "tablet berlayar sama di meja 3 dan 4"],
  biaya: ["orbit", 1.1, "timbangan diputari"],
  kelangsungan: ["pilar", 0.8, "pilar struktur di lorong"],
  data: ["crane", 1.8, "plafon dibuka"],
  kebiasaan: ["jendela", 2.8, "celah jendela tanpa tiang"],
  ramai: ["serah-peta", 0.9, "gedung klien jadi titik merah"],
  "langkah-kecil": ["serah-globe", 0.3, "Jakarta jadi titik di globe"],
  penutup: ["zoom-satelit", 5.5, "satelit melayang masuk dari atas"],
};

// `pose` diisi untuk anchor di lantai kantor (F2, components/stasiun/lantai.js); anchor kota, peta,
// globe, dan modul lab menyusul di F4 sampai F6. Anchor tanpa pose: dunia memudar dan seksinya
// tampil sebagai halaman biasa.
export const ANCHOR_V5 = [
  { id: "gerbang", seksi: [{ sel: ".gerbang", di: 0 }], tempat: "lantai kantor, meja 1 dari jauh", keluar: "blend", durasi: 0.9, pose: POSE.gerbang },
  ...BABAK_V5.map((b) => {
    const [keluar, durasi, pemicu] = KELUAR[b.id];
    return { id: b.id, seksi: [{ sel: `.bab--${b.id}`, di: 0 }], keluar, durasi, pemicu, pose: POSE[b.id] ?? null };
  }),
  // modul lab: gulir menggerakkan kamera di rel lorong, bukan perpindahan berwaktu
  { id: "modul-lab", seksi: [{ sel: "#modul-lab", di: 0 }], tempat: "modul lab, lorong rak", keluar: "rel", durasi: 0, pose: null },
];

// Pose kamera anchor ke-i untuk layar lebar atau tegak (lebar/tinggi di bawah 0,8), atau null.
export function poseAnchor(i, tegak = false) {
  const p = ANCHOR_V5[i]?.pose;
  if (!p) return null;
  const t = tegak && p.tegak ? p.tegak : p;
  return { posisi: [...t.posisi], lihat: [...t.lihat], fov: t.fov };
}

// Lama perpindahan dari anchor `dari` ke `ke` dalam detik. Maju satu langkah memakai durasi
// keluar anchor asalnya; mundur satu langkah memakai durasi yang sama (jalur yang sama dibalik);
// lompatan jauh (tautan, muat ulang di tengah) dibatasi supaya kamera tidak terbang lama.
// Gerak dikurangi: potongan. Perpindahan ke anchor tanpa pose juga potongan (dunianya memudar).
export function durasiAntara(dari, ke, kurangiGerak = false) {
  if (kurangiGerak || dari === ke || dari < 0 || !ANCHOR_V5[ke]?.pose || !ANCHOR_V5[dari]?.pose) return 0;
  if (Math.abs(ke - dari) === 1) return Math.min(ANCHOR_V5[Math.min(dari, ke)].durasi, BATAS_DALAM);
  return 1.2;
}

// Dorongan pelan selama satu babak dibaca: kamera mulai 5% lebih jauh dan mendekat ke posenya
// sejalan progres gulir k (0..1), supaya bingkai tidak diam tapi benda tetap di tempat.
export const DORONG = 0.05;
export function poseDalam(pose, k) {
  const x = Math.min(1, Math.max(0, k));
  const f = 1 + DORONG * (1 - x * x * (3 - 2 * x));
  return { ...pose, posisi: pose.posisi.map((v, i) => pose.lihat[i] + (v - pose.lihat[i]) * f) };
}

// Pose di u (0..1, sudah di-ease) antara dua pose. Yang diinterpolasi arah pandangnya (yaw dan
// pitch) dan jarak ke sasaran, bukan titik lihatnya: meja berselang menghadap berlawanan, dan titik
// lihat yang digeser lurus dari meja belakang ke meja depan lewat tepat di bawah kamera, jadi
// kamera sempat menatap lantai kosong (lembar kontak F2). Putaran hampir 180 derajat dipilih ke
// sisi arah perjalanan, sehingga di tengah perpindahan kamera memandang sepanjang lorong. Jalurnya
// sedikit naik di tengah seperti kamera yang diangkat.
const arahPandang = (p) => {
  const d = p.lihat.map((v, i) => v - p.posisi[i]);
  const j = Math.hypot(...d);
  return { yaw: Math.atan2(d[0], d[2]), pitch: Math.asin(d[1] / j), jarak: j };
};
export function poseBlend(a, b, u) {
  const A = arahPandang(a);
  const B = arahPandang(b);
  let dy = B.yaw - A.yaw;
  dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  if (Math.abs(dy) > (150 * Math.PI) / 180) {
    const jalan = [b.posisi[0] - a.posisi[0], b.posisi[2] - a.posisi[2]];
    const tengah = (d) => Math.sin(A.yaw + d / 2) * jalan[0] + Math.cos(A.yaw + d / 2) * jalan[1];
    const lain = dy - Math.sign(dy) * 2 * Math.PI;
    if (tengah(lain) > tengah(dy)) dy = lain;
  }
  const yaw = A.yaw + dy * u;
  // Pitch di tengah perpindahan setinggi ujung yang lebih datar: ke dan dari meja biaya (tampak
  // atas) kamera baru menunduk di akhir, tidak menatap lantai sepanjang jalan.
  const lurus = A.pitch + (B.pitch - A.pitch) * u;
  const pitch = lurus + (Math.max(A.pitch, B.pitch) - lurus) * Math.sin(Math.PI * u);
  const jarak = A.jarak + (B.jarak - A.jarak) * u;
  const pindah = Math.hypot(...a.posisi.map((v, i) => v - b.posisi[i]));
  const naik = Math.sin(Math.PI * u) * Math.min(0.45, 0.08 + pindah * 0.06);
  const posisi = a.posisi.map((v, i) => v + (b.posisi[i] - v) * u + (i === 1 ? naik : 0));
  const arah = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
  return { posisi, lihat: posisi.map((v, i) => v + arah[i] * jarak), fov: a.fov + (b.fov - a.fov) * u };
}

export const pemicuAnchorV5 = (ukur) => pemicuDasar(ukur, ANCHOR_V5);

// Lama perpindahan keluar dari anchor ke-i. Gerak dikurangi: semua jadi potongan (0 detik).
export function durasiPindah(i, kurangiGerak = false) {
  const a = ANCHOR_V5[i];
  if (!a || kurangiGerak) return 0;
  return a.durasi;
}

// Pelanggaran aturan naskah, kosong bila sehat. Dipakai tes dan bisa dipanggil saat dev.
export function periksaNaskah(daftar = ANCHOR_V5) {
  const salah = [];
  daftar.forEach((a, i) => {
    if (!JENIS[a.keluar]) salah.push(`${a.id}: jenis "${a.keluar}" tidak dikenal`);
    else if (!JENIS[a.keluar].makro && a.durasi > BATAS_DALAM) salah.push(`${a.id}: ${a.durasi} s melewati ${BATAS_DALAM} s`);
    const lalu = daftar[i - 1];
    if (lalu && lalu.keluar === a.keluar) salah.push(`${lalu.id} dan ${a.id}: jenis sama berturut-turut (${a.keluar})`);
  });
  const id = daftar.map((a) => a.id);
  if (new Set(id).size !== id.length) salah.push("id anchor ganda");
  return salah;
}
