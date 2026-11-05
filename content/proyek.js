// Isi rak CD. Satu objek = satu album proyek.
//
// Aturan isi (lihat docs/naskah-adegan.md):
// - `ringkas` dan `arsitektur` (content/arsitektur.js) hanya fakta tentang produknya,
//   dicek dari repo.
// - Halaman buklet selain Overview adalah klaim tentang Farrez. Nilainya null
//   sampai klaim di karier-frz/claims-audit.md dinilai "Bisa dibela"; halaman
//   null tidak ditampilkan. Isi halaman wajib menyebut ID klaimnya di `klaim`.
// - Nama klien mitraPlus tidak pernah ditulis. Pilot iklan tanpa nama orang,
//   merek, ID iklan, harga, atau margin.

import { ARSITEKTUR } from "./arsitektur.js";

/** @typedef {{ id: string, en: string }} Teks */

export const HALAMAN = ["challenge", "decisions", "solution", "delivery", "outcome"];

export const proyek = [
  {
    slug: "erp-software-house",
    ilustrasi: "/assets/ilustrasi/erp-software-house.webp",
    katalog: "FRZ-01",
    judul: { id: "ERP untuk banyak klien", en: "ERP for many clients" },
    jenis: "kerja",
    status: "dipakai",
    periode: "2023 – 2026",
    warna: "#2f4a5c",
    tautan: {},
    gambar: null,
    ringkas: {
      id: "Software house tempat saya bekerja membangun ERP dan back-office untuk beberapa klien: distribusi dan servis, asuransi kesehatan, sampai payroll perkebunan. Nama kliennya disamarkan.",
      en: "The software house I work at builds ERP and back-office systems for several clients: distribution and service, health insurance, plantation payroll. Client names are withheld.",
    },
    arsitektur: ARSITEKTUR["erp-software-house"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "viralytics",
    ilustrasi: "/assets/ilustrasi/viralytics.webp",
    katalog: "FRZ-02",
    judul: { id: "Viralytics", en: "Viralytics" },
    jenis: "studio",
    status: "dipakai",
    periode: "2026",
    warna: "#5a3a2e",
    tautan: {},
    gambar: null, // menunggu izin partner
    ringkas: {
      id: "Sistem kerja untuk agency KOL: kampanye, brief, kontrak, sampai invoice dalam satu tempat, menggantikan spreadsheet dan grup WhatsApp.",
      en: "An operating system for KOL agencies: campaigns, briefs, contracts, and invoices in one place instead of spreadsheets and WhatsApp groups.",
    },
    arsitektur: null, // menunggu izin partner
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "coderoach-os",
    ilustrasi: "/assets/ilustrasi/coderoach-os.webp",
    katalog: "FRZ-03",
    judul: { id: "Coderoach OS", en: "Coderoach OS" },
    jenis: "studio",
    status: "dipakai",
    periode: "2026",
    warna: "#3d4a2c",
    tautan: { kasus: "https://coderoach.id/work/coderoach-os" },
    layar: { desktop: "/assets/layar/coderoach-os-desktop.webp", hp: "/assets/layar/coderoach-os-hp.webp" },
    gambar: null,
    ringkas: {
      id: "Aplikasi internal studio: proyek, jam kerja, invoice, kas, dan pembukuan. Status pekerjaan ikut bergerak sendiri dari pull request dan deploy.",
      en: "The studio's internal app: projects, timesheets, invoices, cash, and bookkeeping. Work status moves on its own from pull requests and deploys.",
    },
    arsitektur: ARSITEKTUR["coderoach-os"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "fifofun",
    ilustrasi: "/assets/ilustrasi/fifofun.webp",
    katalog: "FRZ-04",
    judul: { id: "FiFoFun", en: "FiFoFun" },
    jenis: "pribadi",
    status: "dipakai",
    periode: "2026",
    warna: "#24423b",
    tautan: { situs: "https://fifofun.vercel.app", repo: "https://github.com/farrez30/fifofun", kasus: "https://coderoach.id/work/fifofun" },
    layar: { desktop: "/assets/layar/fifofun-desktop.webp", hp: "/assets/layar/fifofun-hp.webp" },
    tanam: true,
    gambar: null,
    ringkas: {
      id: "Perencana keuangan rumah tangga. Mutasi bank diimpor dari e-Statement, lalu tiap baris dicocokkan dengan saldo dari bank, jadi anggarannya bisa dipercaya.",
      en: "A household budget planner. Bank e-Statements are imported and every line is matched against the bank's own balance, so the budget can be trusted.",
    },
    arsitektur: ARSITEKTUR["fifofun"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "nds-etl",
    ilustrasi: "/assets/ilustrasi/nds-etl.webp",
    katalog: "FRZ-05",
    judul: { id: "Dashboard jaringan distributor", en: "Distributor network dashboard" },
    jenis: "pribadi",
    status: "dipakai",
    periode: "2026",
    warna: "#4a3a52",
    tautan: {},
    gambar: null,
    ringkas: {
      id: "Dashboard untuk distributor sebuah perusahaan network marketing, banyak di antaranya orang tua yang membuka lewat HP. Isinya rencana repeat order mingguan: berapa, di posisi mana, kapan.",
      en: "A dashboard for distributors of a network marketing company, many of them older people on their phones. It plans the weekly repeat order: how much, where in the network, and when.",
    },
    arsitektur: ARSITEKTUR["nds-etl"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "akarkita",
    ilustrasi: "/assets/ilustrasi/akarkita.webp",
    katalog: "FRZ-06",
    judul: { id: "AkarKita", en: "AkarKita" },
    jenis: "pribadi",
    status: "dipakai",
    periode: "2026",
    warna: "#5c4a2a",
    tautan: { situs: "https://akarkita.vercel.app/warisan", kasus: "https://coderoach.id/work/akarkita" },
    gambar: null,
    // AkarKita mengizinkan farrez.vercel.app di frame-ancestors (5 Nov 2026), jadi
    // layar proyektor menampilkannya langsung. Di localhost tetap ditolak.
    tanam: true,
    layar: { desktop: "/assets/layar/akarkita-desktop.jpg", hp: "/assets/layar/akarkita-hp.jpg" },
    ringkas: {
      id: "Pohon keluarga privat, hanya lewat undangan. Sebutan kerabat Sunda dan garis suku Minang ikut dihitung, jadi yang muda tahu harus memanggil siapa dengan sebutan apa.",
      en: "A private, invite-only family tree. It works out Sundanese kinship terms and Minang clan lines, so the younger ones know what to call whom.",
    },
    arsitektur: ARSITEKTUR["akarkita"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "pilot-iklan",
    ilustrasi: "/assets/ilustrasi/pilot-iklan.webp",
    katalog: "FRZ-07",
    judul: { id: "Pilot iklan usaha keluarga", en: "Family shop ad pilot" },
    jenis: "pribadi",
    status: "berjalan",
    periode: "2026",
    warna: "#5c2f36",
    tautan: {},
    gambar: null,
    ringkas: {
      id: "Iklan Meta untuk toko keluarga, dari iklan ke obrolan WhatsApp, dengan aturan iklan produk kesehatan dicek sebelum tayang.",
      en: "Meta ads for a family-run shop, from the ad into a WhatsApp chat, with health-product ad rules checked before anything goes live.",
    },
    arsitektur: ARSITEKTUR["pilot-iklan"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "jeda",
    ilustrasi: "/assets/ilustrasi/jeda.webp",
    katalog: "FRZ-08",
    judul: { id: "Jeda", en: "Jeda" },
    jenis: "pribadi",
    status: "pilot",
    periode: "2026",
    warna: "#2c3f52",
    tautan: { situs: "https://jedaweb.vercel.app", kasus: "https://coderoach.id/work/jeda" },
    layar: { desktop: "/assets/layar/jeda-desktop.webp", hp: "/assets/layar/jeda-hp.webp" },
    tanam: true,
    gambar: null,
    ringkas: {
      id: "Catatan pikiran di antara sesi terapi. Tetap jalan tanpa sinyal, dan psikolog hanya bisa membaca lewat tautan yang dibagikan klien.",
      en: "A thought journal for the days between therapy sessions. It works offline, and the psychologist only reads what the client chooses to share.",
    },
    arsitektur: ARSITEKTUR["jeda"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "yiheecam",
    ilustrasi: "/assets/ilustrasi/yiheecam.webp",
    katalog: "FRZ-09",
    judul: { id: "YiheeCam", en: "YiheeCam" },
    jenis: "pribadi",
    status: "pilot",
    periode: "2026",
    warna: "#33333d",
    tautan: { kasus: "https://coderoach.id/work/yiheecam" },
    layar: { desktop: "/assets/layar/yiheecam-desktop.webp", hp: "/assets/layar/yiheecam-hp.webp" },
    gambar: null,
    ringkas: {
      id: "Aplikasi Android pengganti app kamera aksi yang sudah ditinggalkan vendornya: live view, rekam, setting, baterai, dan kartu SD.",
      en: "An Android app replacing an action camera app its vendor abandoned: live view, recording, settings, battery, and SD card.",
    },
    arsitektur: ARSITEKTUR["yiheecam"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
  {
    slug: "d-day",
    ilustrasi: "/assets/ilustrasi/d-day.webp",
    katalog: "FRZ-10",
    judul: { id: "d-day", en: "d-day" },
    jenis: "pribadi",
    status: "pilot",
    periode: "2026",
    warna: "#3a3f2a",
    tautan: { kasus: "https://coderoach.id/work/d-day" },
    layar: { desktop: "/assets/layar/d-day-desktop.webp", hp: "/assets/layar/d-day-hp.webp" },
    gambar: null,
    ringkas: {
      id: "Mesin trading kripto semi-otomatis untuk seorang teman. Sudah lulus uji di testnet dan belum pernah memakai uang sungguhan.",
      en: "A semi-automatic crypto trading engine built for a friend. It has passed its testnet gate and has never touched real money.",
    },
    arsitektur: ARSITEKTUR["d-day"],
    buklet: { challenge: null, decisions: null, solution: null, delivery: null, outcome: null },
  },
];

/** Halaman buklet yang boleh tampil: hanya yang sudah diisi. */
export function halamanTampil(p) {
  return HALAMAN.filter((h) => p.buklet[h] != null);
}

export function cariProyek(slug) {
  return proyek.find((p) => p.slug === slug) ?? null;
}
