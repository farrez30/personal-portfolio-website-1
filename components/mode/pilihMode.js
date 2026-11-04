// Dipisah dari komponen supaya bisa dites tanpa browser.
// Pilihan pengunjung selalu menang; tanpa pilihan, perangkat yang lemah,
// hemat data, atau minta gerak dikurangi mendapat mode Ringan.
export function pilihModeAwal(simpanan, env) {
  if (simpanan === "imersif" || simpanan === "ringan") return simpanan;
  if (!env.webgl2 || env.kurangiGerak || env.hematData) return "ringan";
  if (env.memori != null && env.memori < 4) return "ringan";
  if (env.inti != null && env.inti < 4) return "ringan";
  return "imersif";
}
