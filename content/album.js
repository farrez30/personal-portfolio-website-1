// Seni album per proyek: satu genre desain rekaman per CD (docs/genre-cd.md).
// Gambar dari Google Flow, tanpa teks; judul ditulis kode di atasnya dengan huruf
// genre itu, jadi ejaannya pasti dan ikut bahasa halaman. Asal tiap berkas di
// public/assets/album/PROVENANCE.md.
//
// `judul` mengatur letak teks di sampul dalam pecahan sisi sampul (0..1):
// x, y = titik jangkar, rata = left | center | right, ukuran = tinggi huruf,
// lebar = lebar maksimum baris, putar = derajat. `judul: null` berarti sampul
// murni gambar; judulnya cukup di punggung dan cakram.
// Halaman `buklet` sengaja menyisakan sepertiga kanan kosong untuk teks yang
// diisi setelah Farrez menyetujui naskahnya.

const dasar = (slug) => {
  const akar = `/assets/album/${slug}`;
  return {
    sampul: `${akar}/sampul.webp`,
    label: `${akar}/label.webp`,
    belakang: `${akar}/belakang.webp`,
    buklet: Array.from({ length: 8 }, (_, i) => `${akar}/buklet-${String(i + 1).padStart(2, "0")}.webp`),
  };
};

const huruf = (keluarga, berkas, berat = 400) => ({ keluarga, berkas: `/assets/album/huruf/${berkas}.woff2`, berat });

export const ALBUM = {
  "erp-software-house": {
    genre: "Swiss International Style",
    huruf: { keluarga: "var(--font-sans)", berat: 650 },
    tinta: "#111111",
    judul: { x: 0.05, y: 0.05, rata: "left", ukuran: 0.05, lebar: 0.4, warna: "#111111", latar: "#f3f1ec" },
  },
  viralytics: {
    genre: "70s photo collage",
    huruf: huruf("Shrikhand", "shrikhand"),
    tinta: "#5b1e4a",
    judul: null,
  },
  "coderoach-os": {
    genre: "Bauhaus",
    huruf: huruf("Josefin Sans", "josefinsans", 700),
    tinta: "#1b1b1b",
    judul: { x: 0.06, y: 0.9, rata: "left", ukuran: 0.075, lebar: 0.9, warna: "#1b1b1b", kapital: true, latar: "#f1e7d3" },
  },
  fifofun: {
    genre: "Mid-century modern",
    huruf: huruf("Pacifico", "pacifico"),
    tinta: "#1f4f55",
    judul: { x: 0.06, y: 0.035, rata: "left", ukuran: 0.14, lebar: 0.6, warna: "#173f44" },
  },
  "nds-etl": {
    genre: "Constructivist poster",
    huruf: huruf("Oswald", "oswald", 700),
    tinta: "#b3221c",
    judul: { x: 0.05, y: 0.06, rata: "left", ukuran: 0.07, lebar: 0.62, warna: "#f3ead8", kapital: true, latar: "#141414", putar: -8 },
  },
  akarkita: {
    genre: "Linocut folk print",
    huruf: huruf("Alfa Slab One", "alfaslabone"),
    tinta: "#22305a",
    judul: null,
  },
  "pilot-iklan": {
    genre: "Pop art",
    huruf: huruf("Bangers", "bangers"),
    tinta: "#1a1a1a",
    // Di dalam balon kata kosong kanan atas.
    judul: { x: 0.865, y: 0.085, rata: "center", ukuran: 0.058, lebar: 0.21, warna: "#1a1a1a" },
  },
  jeda: {
    genre: "ECM minimalism",
    huruf: huruf("Cormorant Garamond", "cormorantgaramond", 500),
    tinta: "#2c3a46",
    judul: { x: 0.5, y: 0.4, rata: "center", ukuran: 0.06, lebar: 0.8, warna: "#2c3a46", kapital: true, renggang: 0.35 },
  },
  yiheecam: {
    genre: "Japanese city-pop",
    huruf: huruf("Kaushan Script", "kaushanscript"),
    tinta: "#3a2a6a",
    judul: { x: 0.06, y: 0.05, rata: "left", ukuran: 0.11, lebar: 0.6, warna: "#ffffff", bayang: "#e0559b" },
  },
  "d-day": {
    genre: "Blue Note jazz",
    huruf: huruf("Bebas Neue", "bebasneue"),
    tinta: "#0b1a3a",
    judul: { x: 0.06, y: 0.035, rata: "left", ukuran: 0.17, lebar: 0.9, warna: "#ffffff", kapital: true },
  },
};

for (const [slug, a] of Object.entries(ALBUM)) Object.assign(a, dasar(slug));

export function albumUntuk(slug) {
  return ALBUM[slug] ?? null;
}
