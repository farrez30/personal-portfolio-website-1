// System Design Lab (ADR 0027). Tiap eksperimen satu loker di hub /lab; halamannya sendiri
// disajikan zona Vercel milik repo eksperimennya, lewat rewrite di next.config.mjs.
// Angka flash sale dari hasil/rekaman.json uji penuh 20 Nov 2026, sama dengan content/proyek.js.

// Asal zona per eksperimen. Bisa diganti lewat env tanpa mengubah kode (mis. untuk uji pratinjau).
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
];

// Alamat halaman eksperimen di farrez.vercel.app. Halaman zona punya pilihan bahasa sendiri
// (?bahasa=en), jadi bahasa situs ikut dibawa.
export function alamatHalaman(e, h, locale) {
  const dasar = `/lab/${e.slug}/${h.kunci}`;
  return locale === "en" ? `${dasar}?bahasa=en` : dasar;
}

export const eksperimenUntukProyek = (slug) => eksperimen.find((e) => e.proyek === slug) ?? null;

// Rewrite untuk next.config.mjs: hanya halaman yang memang dipajang dan aset _next-nya. Akar
// /lab/<slug> dialihkan ke hub, karena di zona itu isinya toko yang butuh API.
export function aturanZona() {
  const rewrites = [];
  const redirects = [];
  for (const e of eksperimen) {
    const asal = ZONA[e.slug];
    const awal = `/lab/${e.slug}`;
    redirects.push({ source: awal, destination: "/lab", permanent: false });
    rewrites.push({ source: `${awal}/_next/:path+`, destination: `${asal}${awal}/_next/:path+` });
    for (const h of e.halaman) {
      rewrites.push({ source: `${awal}/${h.kunci}`, destination: `${asal}${awal}/${h.kunci}` });
      rewrites.push({ source: `${awal}/${h.kunci}/:path+`, destination: `${asal}${awal}/${h.kunci}/:path+` });
    }
  }
  return { rewrites, redirects };
}
