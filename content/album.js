// Seni album per proyek: satu genre desain rekaman per CD (docs/genre-cd.md).
// Gambar dari Google Flow. Sampul depan memakai `sampulJudul`: sampul yang sama
// dengan judul berbahasa Indonesia yang digambar Nano Banana sendiri (pilihan
// Farrez 5 Nov 2026, ejaannya dicek satu per satu). Punggung, cakram, dan sisipan
// tetap ditulis kode dengan huruf genre, jadi ikut bahasa halaman. Asal tiap
// berkas di public/assets/album/PROVENANCE.md.
//
// `judul` mengatur letak teks bila sampul ditulis kode (cadangan saat
// `sampulJudul` gagal dimuat), dalam pecahan sisi sampul (0..1): x, y = titik
// jangkar, rata = left | center | right, ukuran = tinggi huruf, lebar = lebar
// maksimum baris, putar = derajat. `judul: null` berarti tanpa judul.
// `tata` mengatur sisi belakang (daftar lagu, barcode, kredit) supaya tiap album
// punya tata letak sendiri; pecahan panel 0..1, ukuran huruf dalam 1/512 lebar panel.
// Halaman `buklet` sengaja menyisakan sepertiga kanan kosong untuk teks yang
// diisi setelah Farrez menyetujui naskahnya.

const dasar = (slug) => {
  const akar = `/assets/album/${slug}`;
  return {
    sampul: `${akar}/sampul.webp`,
    sampulJudul: `${akar}/sampul-judul.webp`,
    label: `${akar}/label.webp`,
    belakang: `${akar}/belakang.webp`,
    buklet: Array.from({ length: 8 }, (_, i) => `${akar}/buklet-${String(i + 1).padStart(2, "0")}.webp`),
  };
};

// Logo situs dipakai sebagai "label rekaman" di punggung, stiker belakang, dan cakram.
export const LOGO_LABEL = "/icon.svg";

const huruf = (keluarga, berkas, berat = 400) => ({ keluarga, berkas: `/assets/album/huruf/${berkas}.woff2`, berat });

export const ALBUM = {
  "erp-software-house": {
    genre: "Swiss International Style",
    huruf: { keluarga: "var(--font-sans)", berat: 650 },
    tinta: "#111111",
    tata: { lagu: { x: 0.06, y: 0.06, huruf: "sans", ukuran: 11, warna: "#111111", kotak: "#f3f1ec" }, barcode: { x: 0.06, y: 0.82, gaya: "stiker" }, kredit: { x: 0.95, y: 0.95, rata: "right", warna: "#111111" } },
    judul: { x: 0.05, y: 0.05, rata: "left", ukuran: 0.05, lebar: 0.4, warna: "#111111", latar: "#f3f1ec" },
  },
  viralytics: {
    genre: "70s photo collage",
    huruf: huruf("Shrikhand", "shrikhand"),
    tinta: "#5b1e4a",
    tata: { lagu: { x: 0.5, y: 0.6, rata: "center", ukuran: 10, kotak: "#f6efe1", garis: "#5b1e4a", putar: -3 }, barcode: { x: 0.72, y: 0.05 }, kredit: { x: 0.5, y: 0.95, rata: "center", warna: "#f6efe1" } },
    judul: null,
  },
  "coderoach-os": {
    logo: "/assets/album/coderoach-os/logo.svg",
    genre: "Bauhaus",
    huruf: huruf("Josefin Sans", "josefinsans", 700),
    tinta: "#1b1b1b",
    tata: { lagu: { x: 0.95, y: 0.6, rata: "right", huruf: "genre", ukuran: 12, kapital: true, kotak: "#f1e7d3" }, barcode: { x: 0.05, y: 0.05 }, kredit: { x: 0.05, y: 0.95 } },
    judul: { x: 0.06, y: 0.9, rata: "left", ukuran: 0.075, lebar: 0.9, warna: "#1b1b1b", kapital: true, latar: "#f1e7d3" },
  },
  fifofun: {
    logo: "/assets/album/fifofun/logo.svg",
    genre: "Mid-century modern",
    huruf: huruf("Pacifico", "pacifico"),
    tinta: "#1f4f55",
    tata: { lagu: { x: 0.05, y: 0.05 }, barcode: { x: 0.7, y: 0.82 }, kredit: { x: 0.05, y: 0.95 } },
    judul: { x: 0.06, y: 0.035, rata: "left", ukuran: 0.14, lebar: 0.6, warna: "#173f44" },
  },
  "nds-etl": {
    logo: "/assets/album/nds-etl/logo.svg",
    genre: "Constructivist poster",
    huruf: huruf("Oswald", "oswald", 700),
    tinta: "#b3221c",
    tata: { lagu: { x: 0.07, y: 0.12, huruf: "genre", ukuran: 13, kapital: true, warna: "#f3ead8", kotak: "#141414", putar: -6 }, barcode: { x: 0.7, y: 0.06 }, kredit: { x: 0.06, y: 0.95, warna: "#141414" } },
    judul: { x: 0.05, y: 0.06, rata: "left", ukuran: 0.07, lebar: 0.62, warna: "#f3ead8", kapital: true, latar: "#141414", putar: -8 },
  },
  akarkita: {
    logo: "/assets/album/akarkita/logo.svg",
    genre: "Linocut folk print",
    huruf: huruf("Alfa Slab One", "alfaslabone"),
    tinta: "#22305a",
    tata: { lagu: { x: 0.5, y: 0.3, rata: "center", huruf: "genre", ukuran: 11, nomor: false, kotak: "#f2e8d3", garis: "#22305a", tebalGaris: 3 }, barcode: { x: 0.39, y: 0.8 }, kredit: { x: 0.5, y: 0.95, rata: "center", warna: "#f2e8d3" } },
    judul: null,
  },
  "pilot-iklan": {
    genre: "Pop art",
    huruf: huruf("Bangers", "bangers"),
    tinta: "#1a1a1a",
    tata: { lagu: { x: 0.05, y: 0.06, huruf: "genre", ukuran: 13, kapital: true, kotak: "#ffffff", garis: "#1a1a1a", tebalGaris: 3 }, barcode: { x: 0.05, y: 0.8 }, kredit: { x: 0.95, y: 0.95, rata: "right" } },
    // Di dalam balon kata kosong kanan atas.
    judul: { x: 0.865, y: 0.085, rata: "center", ukuran: 0.058, lebar: 0.21, warna: "#1a1a1a" },
  },
  jeda: {
    logo: "/assets/album/jeda/logo.svg",
    genre: "ECM minimalism",
    huruf: huruf("Cormorant Garamond", "cormorantgaramond", 500),
    tinta: "#2c3a46",
    tata: { lagu: { x: 0.5, y: 0.6, rata: "center", huruf: "genre", ukuran: 11, kapital: true, renggang: 0.2, nomor: false, kotak: null }, barcode: { x: 0.4, y: 0.04 }, kredit: { x: 0.5, y: 0.94, rata: "center" } },
    judul: { x: 0.5, y: 0.4, rata: "center", ukuran: 0.06, lebar: 0.8, warna: "#2c3a46", kapital: true, renggang: 0.35 },
  },
  yiheecam: {
    genre: "Japanese city-pop",
    huruf: huruf("Kaushan Script", "kaushanscript"),
    tinta: "#3a2a6a",
    tata: { lagu: { x: 0.05, y: 0.06, huruf: "genre", ukuran: 13, warna: "#ffffff", kotak: "rgba(58, 42, 106, 0.6)" }, barcode: { x: 0.7, y: 0.82 }, kredit: { x: 0.05, y: 0.95, warna: "#ffffff" } },
    judul: { x: 0.06, y: 0.05, rata: "left", ukuran: 0.11, lebar: 0.6, warna: "#ffffff", bayang: "#e0559b" },
  },
  "d-day": {
    logo: "/assets/album/d-day/logo.svg",
    genre: "Blue Note jazz",
    huruf: huruf("Bebas Neue", "bebasneue"),
    tinta: "#0b1a3a",
    tata: { lagu: { x: 0.06, y: 0.3, huruf: "genre", ukuran: 15, kapital: true, warna: "#ffffff", kotak: null }, barcode: { x: 0.68, y: 0.06, gaya: "warna", latar: "#1f4fbf", warna: "#0b1a3a" }, kredit: { x: 0.06, y: 0.95, warna: "#9fb4e6" } },
    judul: { x: 0.06, y: 0.035, rata: "left", ukuran: 0.17, lebar: 0.9, warna: "#ffffff", kapital: true },
  },
};

for (const [slug, a] of Object.entries(ALBUM)) Object.assign(a, dasar(slug));

export function albumUntuk(slug) {
  return ALBUM[slug] ?? null;
}
