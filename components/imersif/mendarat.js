// Album tempat rak mendarat setelah roda berhenti. `x` = posisi pecahan rak
// (0..n), `arah` = arah gulir terakhir (1, -1, atau 0). Satu notch roda kira-kira
// seperempat langkah, dan itu sudah cukup untuk pindah album searah gulir;
// geser di bawah `ambang` dianggap tidak sengaja dan kembali ke album semula.
export function indeksMendarat(x, arah, ambang = 0.12) {
  const sisa = x - Math.floor(x);
  if (arah > 0) return sisa > ambang ? Math.ceil(x) : Math.floor(x);
  if (arah < 0) return sisa < 1 - ambang ? Math.floor(x) : Math.ceil(x);
  return Math.round(x);
}
