// Lintasan cakram antara nampan kotak dan piringan pemutar. Satu angka kemajuan
// `dengar` (0 di nampan, 1 duduk di piringan) dipakai bolak-balik: masuk berjalan
// maju, keluarkan berjalan mundur di jalur yang sama.

// Fase dalam `dengar`. Bawa (pindah dan berputar datar) selesai tepat saat jatuh
// mulai, jadi cakram sudah datar dan di atas sumur sebelum turun ke piringan.
export const FASE = { dorong: 0.3, bawaDari: 0.35, bawaSampai: 0.82, jatuhSampai: 1 };

// Tinggi angkat di atas piringan, satuan lokal pemutar (1 = 100 mm): bibir badan
// 4 mm di atas piringan, jadi cakram datar melayang sekitar 26 mm di atasnya.
export const ANGKAT = 0.3;

// Seberapa jauh cakram harus dinaikkan supaya titik terendahnya tidak masuk ke
// bawah `lantai` (puncak badan pemutar). `normalY`: komponen tegak normal cakram,
// 1 saat datar, 0 saat berdiri. Titik terendah cakram miring ada di jari * sin(miring).
export function angkatBebas(pusatY, normalY, jari, lantai) {
  const bawah = pusatY - jari * Math.sqrt(Math.max(0, 1 - normalY * normalY));
  return Math.max(0, lantai - bawah);
}
