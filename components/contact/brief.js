// Isi wizard kontak dan fungsi murninya, terpisah dari komponen supaya bisa dites di Node.

export const PERTANYAAN = [
  { kunci: "kebutuhan", pilihan: ["android", "kantor", "iklan", "konten", "belum"] },
  { kunci: "pemakai", pilihan: ["sendiri", "tim", "perusahaan"] },
  { kunci: "waktu", pilihan: ["bulanIni", "tigaBulan", "menjajaki"] },
  { kunci: "anggaran", pilihan: ["bawah", "antara1", "antara2", "atas", "belum"] },
];

// Batas pita anggaran dalam rupiah. Pita ini menanyakan anggaran calon klien, bukan tarif.
export const BATAS_ANGGARAN = [10_000_000, 50_000_000, 150_000_000];

export function rupiah(n, locale) {
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(n);
}

// Kunci pesan dan nilainya untuk satu pita anggaran.
export function labelAnggaran(pilihan, locale) {
  const [a, b, c] = BATAS_ANGGARAN.map((n) => rupiah(n, locale));
  return {
    bawah: ["anggaran.bawah", { a }],
    antara1: ["anggaran.antara", { a, b }],
    antara2: ["anggaran.antara", { a: b, b: c }],
    atas: ["anggaran.atas", { a: c }],
    belum: ["anggaran.belum", {}],
  }[pilihan];
}

// Sapaan menurut jam lokal pengunjung. Tidak memakai lokasi apa pun.
export function sapaanUntuk(jam) {
  if (jam >= 4 && jam < 11) return "pagi";
  if (jam >= 11 && jam < 15) return "siang";
  if (jam >= 15 && jam < 18) return "sore";
  return "malam";
}

// Pilihan wizard jadi beberapa baris di awal pesan. `label(kunci, pilihan)` mengembalikan teks
// yang tampil di layar; pertanyaan yang dilewati tidak ditulis.
export function susunBrief(dipilih, label) {
  return PERTANYAAN.filter((q) => dipilih[q.kunci])
    .map((q) => `- ${label(q.kunci, dipilih[q.kunci])}`)
    .join("\n");
}
