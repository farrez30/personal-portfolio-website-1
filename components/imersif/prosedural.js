// Peta prosedural untuk cakram dan pemutar, sebagai fungsi murni tanpa DOM supaya
// bisa dites di node. Tiap pembuat adalah generator yang berhenti tiap beberapa baris,
// jadi peta 1024 px bisa dibuat sedikit demi sedikit di waktu senggang tanpa
// menahan halaman. Angka-angkanya dari catatan Discography.

const jepit = (x, a, b) => Math.min(b, Math.max(a, x));

// Hash sin klasik: nilai acak 0 sampai 1 yang tetap untuk tiap (x, y).
export function derau(x, y) {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

// Normal dari peta tinggi (selisih tetangga), dikemas ke RGBA 0 sampai 255.
function* normalDariTinggi(tinggi, ukuran, keluar, langkah) {
  for (let y = 0; y < ukuran; y++) {
    for (let x = 0; x < ukuran; x++) {
      const nx = tinggi[y * ukuran + Math.max(0, x - 1)] - tinggi[y * ukuran + Math.min(ukuran - 1, x + 1)];
      const ny = tinggi[Math.max(0, y - 1) * ukuran + x] - tinggi[Math.min(ukuran - 1, y + 1) * ukuran + x];
      const k = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const i = (y * ukuran + x) * 4;
      keluar[i] = (nx * k * 0.5 + 0.5) * 255;
      keluar[i + 1] = (ny * k * 0.5 + 0.5) * 255;
      keluar[i + 2] = (k * 0.5 + 0.5) * 255;
      keluar[i + 3] = 255;
    }
    if (y % langkah === langkah - 1) yield;
  }
}

export const CETAK = { kasar: 0.42, butir: 0.59, tinta: 0.35, kilap: 1 };

// Muka cetak cakram. Kekasaran: dasar 0,42 dengan butir halus dan bercak tinta,
// dikurangi pita kilap melingkar. Normal: cincin optik samar dan butir tinta.
export function* petaCetak(ukuran, kasar, normal, { langkah = 64 } = {}) {
  const { kasar: dasar, butir, tinta, kilap } = CETAK;
  const tinggi = new Float32Array(ukuran * ukuran);
  for (let y = 0; y < ukuran; y++) {
    for (let x = 0; x < ukuran; x++) {
      const r = Math.hypot(x - ukuran / 2, y - ukuran / 2);
      let v = dasar + (derau(x * 2.3, y * 2.3) - 0.5) * 0.35 * butir + (derau(x * 0.5, y * 0.5) - 0.5) * 0.3 * tinta;
      v -= (Math.sin((r / (ukuran / 2)) * 14) * 0.5 + 0.5) * 0.5 * kilap;
      const i = (y * ukuran + x) * 4;
      kasar[i] = kasar[i + 1] = kasar[i + 2] = jepit(v, 0.02, 1) * 255;
      kasar[i + 3] = 255;
      tinggi[y * ukuran + x] = Math.sin((r + 1e-4) * 0.6) * 0.02 + (derau(x * 0.4, y * 0.4) - 0.5) * 0.5 * tinta;
    }
    if (y % langkah === langkah - 1) yield;
  }
  yield* normalDariTinggi(tinggi, ukuran, normal, langkah);
}

// Bintik halus plastik cetak (seperti nampan kotak), hanya sebagai normal.
export function* petaBintik(ukuran, normal, { kuat = 0.35, langkah = 128 } = {}) {
  const tinggi = new Float32Array(ukuran * ukuran);
  for (let n = 0; n < tinggi.length; n++) tinggi[n] = derau(n % ukuran, Math.floor(n / ukuran)) * kuat;
  yield;
  yield* normalDariTinggi(tinggi, ukuran, normal, langkah);
}

// Permukaan piringan pemutar sebagai warna di sekitar putih untuk UV bubutan
// (u memutar, v sepanjang profil, jadi baris = cincin): bintik, belang, cincin bubut.
export function* petaPiring(ukuran, keluar, { bintik = 0.22, langkah = 128 } = {}) {
  for (let y = 0; y < ukuran; y++) {
    const cincin = (derau(0, y * 3.7) - 0.5) * 0.08;
    for (let x = 0; x < ukuran; x++) {
      const belang = (derau(Math.floor(x / 16), Math.floor(y / 16)) + derau(Math.floor(x / 16) + 1, Math.floor(y / 16) + 7)) / 2;
      const v = 0.86 + (derau(x, y) - 0.5) * bintik + (belang - 0.5) * 0.06 + cincin;
      const i = (y * ukuran + x) * 4;
      keluar[i] = keluar[i + 1] = keluar[i + 2] = jepit(v, 0, 1) * 255;
      keluar[i + 3] = 255;
    }
    if (y % langkah === langkah - 1) yield;
  }
}

// Judul layar yang terlalu panjang: diam `tahan` detik, bergulir lewat satu kali
// (dengan salinan kedua menyusul sejauh `jarak`), lalu diam lagi. Mengembalikan
// geseran dalam satuan yang sama dengan `lebar` dan `laju`.
export function geserJudul(detik, { lebar, jarak, laju, tahan }) {
  const siklus = tahan + (lebar + jarak) / laju;
  const fase = (((detik % siklus) + siklus) % siklus);
  return Math.max(0, fase - tahan) * laju;
}
