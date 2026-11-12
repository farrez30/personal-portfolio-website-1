// Isi seksi klien dan partner: satu objek = satu cakram di cincin.
//
// Aturan isi (keputusan Farrez 12 Nov 2026, memori klien-boleh-tampil):
// - Klien Mitraplus tampil dengan nama dan logo; klien Coderoach semua tampil, izinnya
//   dicatat Farrez di Coderoach OS. Hanya klien yang terbukti dikerjakan Farrez.
// - `kerja` adalah fakta tentang produknya (dari README repo dan coderoach.id/work),
//   bukan klaim peran Farrez.
// - Muka cakram dari Flow dengan logo asli ditimpa kode, asalnya di
//   public/assets/klien/cakram/PROVENANCE.md.

import { cariProyek } from "./proyek.js";

/** @typedef {{ id: string, en: string }} Teks */

const C = (slug) => `/assets/klien/cakram/${slug}.webp`;
const KASUS = (slug) => `https://coderoach.id/work/${slug}`;

export const KELOMPOK = [
  { slug: "coderoach", induk: "/assets/klien/induk/coderoach.svg", nama: "Coderoach" },
  { slug: "mitraplus", induk: "/assets/klien/induk/mitraplus.webp", nama: "Mitraplus" },
  { slug: "pribadi", induk: "/icon.svg", nama: "Personal" },
];

export const KLIEN = [
  // Coderoach Studio
  {
    slug: "uruzin",
    kelompok: "coderoach",
    nama: "Uruzin",
    cakram: C("uruzin"),
    industri: { id: "Jasa perizinan usaha", en: "Business licensing" },
    jenis: ["company-profile", "erp"],
    kerja: {
      id: "Situs perusahaan sejak 2023, lalu sistem operasional dan keuangan untuk timnya.",
      en: "The company site since 2023, then an operations and finance system for the team.",
    },
    tautan: KASUS("uruzin"),
  },
  {
    slug: "masaya-food",
    kelompok: "coderoach",
    nama: "Masaya Food",
    cakram: C("masaya-food"),
    industri: { id: "F&B, jaringan gerai", en: "Food and beverage chain" },
    jenis: ["website", "operasional"],
    kerja: {
      id: "Dua merek dari satu perusahaan, PT Maharani Sukses Jaya.",
      en: "Two brands from one company, PT Maharani Sukses Jaya.",
    },
    anak: [
      {
        slug: "chicken-wow",
        nama: "Chicken Wow",
        cakram: C("chicken-wow"),
        industri: { id: "F&B, ayam goreng", en: "Fried chicken" },
        jenis: ["website", "link-in-bio"],
        kerja: {
          id: "Situs dengan menu dan daftar gerai yang mudah diperbarui, plus halaman link-in-bio sendiri.",
          en: "A site with an easy-to-update menu and outlet list, plus its own link-in-bio page.",
        },
        tautan: KASUS("chicken-wow"),
      },
      {
        slug: "geprek-wow",
        nama: "Geprek Wow",
        cakram: C("geprek-wow"),
        industri: { id: "F&B, 12 gerai", en: "Food and beverage, 12 outlets" },
        jenis: ["operasional", "keuangan"],
        kerja: {
          id: "Tutup shift dari ponsel crew, setoran kas sampai bank, dan laporan harian ke WhatsApp.",
          en: "Shift closing from the crew's phone, cash deposits to the bank, and a daily report on WhatsApp.",
        },
        tautan: KASUS("laporta"),
      },
    ],
  },
  {
    slug: "rpn-agro",
    kelompok: "coderoach",
    nama: "RPN Agro",
    cakram: C("rpn-agro"),
    industri: { id: "Produksi pangan", en: "Food production" },
    jenis: ["erp"],
    kerja: {
      id: "Sistem dapur produksi sambal: bahan masuk per harga, biaya dihitung dari batch yang benar-benar dimasak.",
      en: "A system for a chilli sauce kitchen: stock in by price layer, costs from the batch actually cooked.",
    },
    tautan: KASUS("rpn-os"),
  },
  {
    slug: "tgr",
    kelompok: "coderoach",
    nama: "The Global Review",
    cakram: C("tgr"),
    industri: { id: "Media", en: "Media" },
    jenis: ["website"],
    kerja: {
      id: "Situs media untuk Global Future Institute, isinya tetap diatur dari WordPress.",
      en: "A media site for Global Future Institute, still managed from WordPress.",
    },
    tautan: KASUS("the-global-review"),
  },
  {
    slug: "raja-roti",
    kelompok: "coderoach",
    nama: "Raja Roti Cemerlang",
    cakram: C("raja-roti"),
    industri: { id: "Manufaktur pangan", en: "Food manufacturing" },
    jenis: ["company-profile", "landing"],
    kerja: {
      id: "Situs perusahaan dengan halaman hubungan investor, plus landing merek Royal Breadcrumb.",
      en: "A company site with an investor relations page, plus a landing page for the Royal Breadcrumb brand.",
    },
  },
  {
    slug: "saychick",
    kelompok: "coderoach",
    nama: "SayChick",
    cakram: C("saychick"),
    industri: { id: "Pengolahan unggas", en: "Poultry processing" },
    jenis: ["erp"],
    kerja: {
      id: "Sistem produksi dan distribusi untuk PT Jantan Jadi Juara.",
      en: "A production and distribution system for PT Jantan Jadi Juara.",
    },
  },
  {
    slug: "success-career",
    kelompok: "coderoach",
    nama: "Success Career",
    cakram: C("success-career"),
    industri: { id: "Pengembangan karier", en: "Career development" },
    jenis: ["aplikasi-web"],
    kerja: {
      id: "Platform asesmen psikometri untuk PT Sukses Cipta Inspirasi.",
      en: "A psychometric assessment platform for PT Sukses Cipta Inspirasi.",
    },
  },
  {
    slug: "studentchanges",
    kelompok: "coderoach",
    nama: "StudentChanges!",
    cakram: C("studentchanges"),
    industri: { id: "Pendidikan", en: "Education" },
    jenis: ["aplikasi-web"],
    kerja: {
      id: "Pemetaan bakat siswa, dengan laporan yang bisa dibaca orang tua dan guru.",
      en: "Student talent mapping, with reports parents and teachers can read.",
    },
  },
  {
    slug: "terasol",
    kelompok: "coderoach",
    nama: "Rumah Sehat Terasol",
    cakram: C("terasol"),
    industri: { id: "Kesehatan", en: "Wellness" },
    jenis: ["pwa"],
    kerja: {
      id: "Aplikasi untuk mengelola mitra dan acara skrining kesehatan.",
      en: "An app to manage partners and health screening events.",
    },
  },
  {
    slug: "viralytics",
    kelompok: "coderoach",
    nama: "Viralytics",
    cakram: C("viralytics"),
    industri: { id: "Agency KOL", en: "KOL agency" },
    jenis: ["saas"],
    kerja: {
      id: "Kampanye, brief, kontrak, sampai invoice agency KOL dalam satu tempat.",
      en: "Campaigns, briefs, contracts, and invoices for a KOL agency in one place.",
    },
    tautan: KASUS("viralytics"),
  },
  {
    slug: "tumtim",
    kelompok: "coderoach",
    nama: "Tumtim Cookies & Bakery",
    cakram: C("tumtim"),
    industri: { id: "Toko kue", en: "Bakery" },
    jenis: ["website"],
    kerja: {
      id: "Situs toko kue yang bisa diperbarui sendiri lewat WordPress.",
      en: "A bakery site the owners can update themselves in WordPress.",
    },
  },

  // Mitraplus (tempat kerja Farrez sejak 2023)
  {
    slug: "sanden",
    kelompok: "mitraplus",
    nama: "Sanden Intercool Indonesia",
    cakram: C("sanden"),
    industri: { id: "Distribusi pendingin komersial", en: "Commercial refrigeration" },
    jenis: ["erp", "enterprise"],
    kerja: {
      id: "ERP distribusi dan servis, plus portal untuk pelanggannya.",
      en: "A distribution and service ERP, plus a portal for its customers.",
    },
  },
  {
    slug: "jasindo",
    kelompok: "mitraplus",
    nama: "Asuransi Jasindo",
    cakram: C("jasindo"),
    industri: { id: "Asuransi", en: "Insurance" },
    jenis: ["enterprise"],
    kerja: {
      id: "Sistem administrasi klaim asuransi kesehatan dan asuransi kecelakaan diri.",
      en: "Claims administration for health and personal accident insurance.",
    },
  },
  {
    slug: "bni",
    kelompok: "mitraplus",
    nama: "BNI",
    cakram: C("bni"),
    industri: { id: "Perbankan", en: "Banking" },
    jenis: ["enterprise"],
    kerja: {
      id: "ACMS, sistem pengelolaan klaim asuransi aset untuk Divisi PFA.",
      en: "ACMS, an asset insurance claims system for the PFA division.",
    },
  },
  {
    slug: "pbt",
    kelompok: "mitraplus",
    nama: "Putera Bangka Tani",
    cakram: C("pbt"),
    industri: { id: "Perkebunan sawit", en: "Oil palm estate" },
    jenis: ["erp"],
    kerja: {
      id: "Payroll untuk perkebunan dan pabrik kelapa sawit.",
      en: "Payroll for an oil palm estate and mill.",
    },
  },
  {
    slug: "saksama",
    kelompok: "mitraplus",
    nama: "Saksama",
    cakram: C("saksama"),
    industri: { id: "Asuransi kesehatan", en: "Health insurance" },
    jenis: ["enterprise"],
    kerja: {
      id: "Sistem administrasi klaim asuransi kesehatan.",
      en: "Health insurance claims administration.",
    },
  },

  // Proyek pribadi (album di rak)
  ...[
    ["fifofun", "FiFoFun", { id: "Keuangan rumah tangga", en: "Household finance" }, ["aplikasi-web"]],
    ["nds-etl", "NDS RO", { id: "Jaringan distributor", en: "Distributor network" }, ["dashboard"]],
    ["akarkita", "AkarKita", { id: "Keluarga", en: "Family" }, ["aplikasi-web"]],
    ["jeda", "Jeda", { id: "Kesehatan mental", en: "Mental health" }, ["pwa"]],
    ["yiheecam", "YiheeCam", { id: "Kamera aksi", en: "Action camera" }, ["android"]],
    ["d-day", "d-day", { id: "Trading kripto", en: "Crypto trading" }, ["tools"]],
  ].map(([slug, nama, industri, jenis]) => ({
    slug,
    kelompok: "pribadi",
    nama,
    cakram: C(`pribadi-${slug}`),
    industri,
    jenis,
    kerja: cariProyek(slug)?.ringkas,
    album: slug,
  })),
];

export const klienKelompok = (k) => KLIEN.filter((x) => x.kelompok === k);

/** Sudut cakram ke-i dari n di cincin, dalam derajat. */
export const sudutCakram = (i, n) => (360 / n) * i;

/**
 * Indeks cakram yang paling dekat ke depan untuk putaran cincin `putar` (derajat).
 * Cincin berputar ke kiri saat `putar` naik, jadi cakram ke-i di depan saat
 * sudutnya sama dengan `putar` (mod 360).
 */
export function cakramDepan(putar, n) {
  if (n <= 0) return -1;
  const langkah = 360 / n;
  const i = Math.round((((putar % 360) + 360) % 360) / langkah) % n;
  return i;
}
