// Naskah kamera cerita v5 arah G (ADR 0019, 0023, 0024): lantai kantor, keluar jendela ke kota, peta,
// globe malam, lalu masuk ke modul lab satelit. Satu anchor satu seksi halaman, seperti naskah toko
// kaset (components/dunia/naskah.js); bedanya tiap anchor menyebut jenis perpindahan keluarnya.
// Pose kamera (posisi, lihat, fov) diisi di fase F2 bersama lantai kantornya. Dipisah dari three.js
// supaya aturan urutan dan variasi bisa dites di Node. Peta babak: desain/cerita-v5/storyboard-build.md §2.

import { pemicuAnchor as pemicuDasar } from "../dunia/naskah.js";
import { BABAK_V5 } from "../../content/cerita-v5.js";

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

export const ANCHOR_V5 = [
  { id: "gerbang", seksi: [{ sel: ".gerbang", di: 0 }], tempat: "lantai kantor, meja 1 dari jauh", keluar: "blend", durasi: 0.9 },
  ...BABAK_V5.map((b) => {
    const [keluar, durasi, pemicu] = KELUAR[b.id];
    return { id: b.id, seksi: [{ sel: `.bab--${b.id}`, di: 0 }], keluar, durasi, pemicu };
  }),
  // modul lab: gulir menggerakkan kamera di rel lorong, bukan perpindahan berwaktu
  { id: "modul-lab", seksi: [{ sel: "#modul-lab", di: 0 }], tempat: "modul lab, lorong rak", keluar: "rel", durasi: 0 },
];

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
