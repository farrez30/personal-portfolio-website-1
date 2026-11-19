// Durasi lagu untuk halaman daftar lagu di buklet CD musik. Tanpa alias "@/" supaya bisa dites di Node.
export function formatDurasi(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const detik = Math.round(ms / 1000);
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  const sisa = String(detik % 60).padStart(2, "0");
  return jam ? `${jam}:${String(menit).padStart(2, "0")}:${sisa}` : `${menit}:${sisa}`;
}
