// System Design Lab (ADR 0027). Tiap eksperimen satu loker di hub /lab; halamannya sendiri
// disajikan zona Vercel milik repo eksperimennya, lewat rewrite di next.config.mjs.
// Angka flash sale dari hasil/rekaman.json uji penuh 20 Nov 2026, sama dengan content/proyek.js.

// Asal zona per kunci `zona` eksperimen. Bisa diganti lewat env tanpa mengubah kode (mis. untuk uji pratinjau).
export const ZONA = {
  "flash-sale": process.env.LAB_FLASH_SALE_ASAL || "https://flash-sale-lab.vercel.app",
};

// Teks hub. Sengaja tidak di messages/: tiap namespace di sana jadi tabel teks CMS yang butuh
// migrasi database (tests/cms.test.mjs).
export const TEKS_HUB = {
  intro: {
    id: "Eksperimen soal sistem yang harus tetap benar saat dipakai banyak orang di detik yang sama. Tiap eksperimen diuji beban sungguhan, dan rekamannya bisa kamu putar ulang.",
    en: "Experiments on systems that have to stay correct when many people use them in the same second. Each one is load tested for real, and you can play the recording back.",
  },
  catatanProyek: { id: "Catatan proyeknya", en: "Project notes" },
  kembali: { id: "Kembali", en: "Back" },
};

export const eksperimen = [
  {
    slug: "flash-sale",
    zona: "flash-sale",
    nomor: "SDL-01",
    proyek: "flash-sale-lab",
    jalur: { id: "Trafik dan skala", en: "Traffic and scale" },
    judul: { id: "Flash sale", en: "Flash sale" },
    masalah: {
      id: "Ribuan orang datang di detik yang sama untuk 6.000 barang. Siapa yang dapat, dan bagaimana stoknya tidak terjual dua kali?",
      en: "Thousands of people arrive in the same second for 6,000 items. Who gets one, and how does the stock never sell twice?",
    },
    halaman: [
      {
        kunci: "replay",
        judul: { id: "Replay uji beban", en: "Load test replay" },
        ket: {
          id: "Hampir 114 ribu pembeli dan bot. Stok habis di detik ke-42, tidak ada yang terjual lebih.",
          en: "Almost 114 thousand buyers and bots. Sold out at second 42, nothing oversold.",
        },
        meta: { id: "Rekaman 20 Nov 2026", en: "Recorded 20 Nov 2026" },
      },
      {
        kunci: "skala",
        judul: { id: "Simulator skala", en: "Scaling simulator" },
        ket: {
          id: "Dari satu vCPU laptop sampai sejuta permintaan per detik di AWS Jakarta, lengkap dengan tagihannya.",
          en: "From one laptop vCPU to a million requests a second on AWS Jakarta, bill included.",
        },
        meta: { id: "Model, bukan rekaman", en: "A model, not a recording" },
      },
    ],
  },
  // Eksperimen 2 sampai 4 memakai toko dan zona yang sama dengan flash sale (repo flash-sale-lab).
  // Angka dari hasil/gateway, hasil/ledger, hasil/backup, dan hasil/berkas, uji 20 Nov 2026.
  {
    slug: "pembayaran",
    zona: "flash-sale",
    nomor: "SDL-02",
    proyek: "flash-sale-lab",
    jalur: { id: "Integritas data", en: "Data integrity" },
    judul: { id: "Pembayaran dan ledger", en: "Payments and ledger" },
    masalah: {
      id: "Pembeli membayar, menolak, atau pergi begitu saja, dan notifikasi penyedia pembayaran bisa datang dua kali atau palsu. Bagaimana kasnya tetap pas?",
      en: "Buyers pay, decline, or simply walk away, and the payment provider's notifications can arrive twice or forged. How do the books stay right?",
    },
    halaman: [
      {
        kunci: "bayar",
        judul: { id: "Replay pembayaran", en: "Payment replay" },
        ket: {
          id: "7.113 tagihan, 5.998 lunas, 1.288 notifikasi palsu ditolak. Tidak ada yang tercatat dua kali.",
          en: "7,113 bills, 5,998 paid, 1,288 forged notifications rejected. Nothing recorded twice.",
        },
        meta: { id: "Rekaman 20 Nov 2026", en: "Recorded 20 Nov 2026" },
      },
    ],
  },
  {
    slug: "backup",
    zona: "flash-sale",
    nomor: "SDL-03",
    proyek: "flash-sale-lab",
    jalur: { id: "Ketahanan", en: "Resilience" },
    judul: { id: "Backup dan restore", en: "Backup and restore" },
    masalah: {
      id: "Disk database hilang di tengah sale. Berapa lama toko pulih, dan berapa pesanan yang ikut hilang?",
      en: "The database disk is lost mid-sale. How long until the shop recovers, and how many orders go with it?",
    },
    halaman: [
      {
        kunci: "backup",
        judul: { id: "Tiga cara backup", en: "Three backup methods" },
        ket: {
          id: "Pulih dalam 10 sampai 14 detik. Sesudah catatan Redis diputar ulang, tidak ada pesanan yang hilang.",
          en: "Back in 10 to 14 seconds. Once the Redis record is replayed, no order is lost.",
        },
        meta: { id: "Uji 20 Nov 2026, satu putaran per cara", en: "Tested 20 Nov 2026, one run per method" },
      },
    ],
  },
  {
    slug: "berkas",
    zona: "flash-sale",
    nomor: "SDL-04",
    proyek: "flash-sale-lab",
    jalur: { id: "Ketahanan", en: "Resilience" },
    judul: { id: "Unggah berkas besar", en: "Large file upload" },
    masalah: {
      id: "Koneksi putus saat mengunggah video produk. Apakah harus mulai lagi dari nol?",
      en: "The connection drops while a product video uploads. Does it have to start over?",
    },
    halaman: [
      {
        kunci: "berkas",
        judul: { id: "Unggah yang bisa dilanjutkan", en: "Resumable upload" },
        ket: {
          id: "Tiga penyimpanan S3 diuji. Putus di tengah, lanjut dari sisa, dan yang terkirim dua kali hanya 4 MB.",
          en: "Three S3 storage servers tested. Cut off midway, resumed from what was left, and only 4 MB sent twice.",
        },
        meta: { id: "Uji 20 Nov 2026", en: "Tested 20 Nov 2026" },
      },
    ],
  },
  // Eksperimen 5 di zona yang sama, dengan loker sendiri: masalahnya bukan satu angka stok, tapi
  // kursi bernomor yang masing-masing punya pemegang, dan bot yang menahan tanpa membayar.
  // Angka dari hasil/kursi/dengan dan hasil/kursi/tanpa, uji 23 Nov 2026 (ADR 0010 flash-sale-lab).
  {
    slug: "kursi-konser",
    zona: "flash-sale",
    nomor: "SDL-05",
    proyek: "flash-sale-lab",
    jalur: { id: "Integritas data", en: "Data integrity" },
    judul: { id: "Kursi konser", en: "Concert seats" },
    masalah: {
      id: "Ribuan orang memilih kursi bernomor yang sama di detik yang sama, dan bot menahan kursi tanpa pernah membayar. Bagaimana satu kursi tetap jatuh ke satu orang?",
      en: "Thousands of people pick the same numbered seat in the same second, and bots hold seats they never pay for. How does each seat still go to one person?",
    },
    halaman: [
      {
        kunci: "kursi",
        judul: { id: "Kursi dan bot", en: "Seats and bots" },
        ket: {
          id: "Tanpa pertahanan, bot mengunci 423 dari 1.200 kursi sampai penjualan selesai. Dengan pertahanan, semua terjual. Tidak ada kursi yang terjual dua kali.",
          en: "Without defences, bots lock 423 of 1,200 seats until the sale ends. With them, every seat sells. No seat is sold twice.",
        },
        meta: { id: "Rekaman 23 Nov 2026, plus simulator", en: "Recorded 23 Nov 2026, plus a simulator" },
      },
    ],
  },
];

// Alamat halaman eksperimen di farrez.vercel.app. Halaman zona punya pilihan bahasa sendiri
// (?bahasa=en), jadi bahasa situs ikut dibawa.
export function alamatHalaman(e, h, locale) {
  const dasar = `/lab/${e.zona}/${h.kunci}`;
  return locale === "en" ? `${dasar}?bahasa=en` : dasar;
}

export const eksperimenUntukProyek = (slug) => eksperimen.find((e) => e.proyek === slug) ?? null;

// Rewrite untuk next.config.mjs, satu kelompok per zona: hanya halaman yang memang dipajang dan
// aset _next-nya. Akar /lab/<zona> dialihkan ke hub, karena di zona itu isinya toko yang butuh API.
export function aturanZona() {
  const rewrites = [];
  const redirects = [];
  const perZona = new Map();
  for (const e of eksperimen) perZona.set(e.zona, [...(perZona.get(e.zona) ?? []), ...e.halaman]);
  for (const [zona, halaman] of perZona) {
    const asal = ZONA[zona];
    const awal = `/lab/${zona}`;
    redirects.push({ source: awal, destination: "/lab", permanent: false });
    rewrites.push({ source: `${awal}/_next/:path+`, destination: `${asal}${awal}/_next/:path+` });
    for (const h of halaman) {
      rewrites.push({ source: `${awal}/${h.kunci}`, destination: `${asal}${awal}/${h.kunci}` });
      rewrites.push({ source: `${awal}/${h.kunci}/:path+`, destination: `${asal}${awal}/${h.kunci}/:path+` });
    }
  }
  return { rewrites, redirects };
}
