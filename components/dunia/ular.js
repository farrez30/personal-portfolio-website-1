// Loader cakram CD (storyboard desain/transisi/loader.html, varian 3; dipilih Farrez 12 Nov 2026
// setelah semua versi ular ditolak). Selama dunia dimuat cakram berputar makin cepat dan kilau
// pelanginya mengisi mengikuti progres nyata. Lubang tengahnya gelap seperti latar, jadi hero belum
// terlihat. Di 100% cakram menegak menghadap kita (LIUK), lalu lubangnya tembus dan membesar sampai
// menutup layar, dan hero terlihat di dalamnya (TERKAM).
// Kanvas 2D, bukan three.js: loader harus tampil sebelum satu aset dunia pun tiba.

export const LIUK = 0.45;
export const TERKAM = 0.6;
export const PUDAR = 0.4;

const jepit = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const halus = (x) => x * x * (3 - 2 * x);

// Progres gabungan 0..1 dari pekerjaan yang benar-benar terjadi: modul three.js termuat,
// rata-rata tiap aset (byte untuk model, selesai/belum untuk tekstur), lalu pemanasan shader dan
// unggah tekstur. Tidak ada bagian yang dihitung dari waktu.
export function gabungProgres({ modul = false, aset = [], hangat = 0 }) {
  const rata = aset.length ? aset.reduce((s, x) => s + jepit(x), 0) / aset.length : 0;
  return jepit((modul ? 0.08 : 0) + 0.72 * rata + 0.2 * jepit(hangat));
}

// Angka yang tampil mengejar progres nyata dengan halus, tidak pernah mundur, dan tidak pernah
// mendahuluinya. Begitu nyata sudah 1, sisa yang sangat kecil langsung ditutup.
export function kejar(tampil, nyata, dt) {
  if (nyata <= tampil) return tampil;
  const baru = tampil + (nyata - tampil) * (1 - Math.exp(-dt / 0.22));
  return nyata - baru < 0.004 ? nyata : baru;
}

// Fase loader `t` detik sejak progres tampil mencapai 100% (null = masih memuat).
export function faseLoader(t, kurangiGerak = false) {
  if (t == null) return { nama: "muat", u: 0 };
  if (kurangiGerak) return t < PUDAR ? { nama: "pudar", u: t / PUDAR } : { nama: "selesai", u: 1 };
  if (t < LIUK) return { nama: "liuk", u: t / LIUK };
  if (t < LIUK + TERKAM) return { nama: "terkam", u: (t - LIUK) / TERKAM };
  return { nama: "selesai", u: 1 };
}

const masuk = (x) => x * x * x;

// Keadaan cakram `t` detik sejak mulai, `tSiap` = waktu saat 100% (null selama memuat).
// r: jari-jari dalam satuan sisi terpendek layar; miring: 0,35 (terbaring) sampai 1 (menghadap);
// lubang: jari-jari lubang dalam satuan sisi terpendek; tembus: 0 (lubang gelap, hero tertutup)
// sampai 1 (hero terlihat), naik di awal TERKAM; putar: sudut putaran (radian).
export function cakramPada(t, tSiap, progres) {
  const k = tSiap == null ? 0 : Math.max(0, t - tSiap);
  const tegak = halus(jepit(k / LIUK));
  const buka = jepit((k - LIUK) / TERKAM);
  const r = 0.26 * (1 + masuk(buka) * 18);
  const lubang = r * 0.13 * (1 + halus(buka) * 2.5);
  // Laju putar naik dengan progres dan makin kencang saat menegak dan membuka.
  const putar = t * (2 + jepit(progres) * 10) + k * k * 20;
  const tembus = halus(jepit(buka / 0.25));
  return { r, miring: 0.35 + 0.65 * tegak, lubang, tembus, putar, isi: tSiap == null ? jepit(progres) : 1 };
}

const PELANGI = ["#c0c4cc", "#ff6b6b", "#ffd84a", "#6bff9e", "#5aa8ff", "#c46bff", "#c0c4cc"];

// Gambar satu bingkai loader: layar gelap, cakram perak dengan kilau pelangi yang mengisi
// sesuai progres, label tengah, dan lubang yang dilubangi tembus ke hero di bawah kanvas.
export function gambarLoader(g, W, H, t, { tSiap = null, progres = 0, diam = false } = {}) {
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.fillStyle = "#0d0c0b";
  g.fillRect(0, 0, W, H);
  const U = Math.min(W, H);
  // Gerak dikurangi: cakram diam terbaring, kilau tetap mengisi mengikuti progres.
  const c = cakramPada(diam ? 0 : t, diam ? null : tSiap, progres);
  const r = c.r * U;
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(1, c.miring);
  g.rotate(diam ? 0 : c.putar);
  g.fillStyle = "#9aa0aa";
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  const kilau = g.createConicGradient(0, 0, 0);
  PELANGI.forEach((w, i) => kilau.addColorStop(i / (PELANGI.length - 1), w));
  g.fillStyle = kilau;
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, 0, Math.PI * 2 * c.isi); g.fill();
  g.fillStyle = "#e9ecf0";
  g.beginPath(); g.arc(0, 0, r * 0.3, 0, Math.PI * 2); g.fill();
  g.restore();
  // Lubang digambar segelap latar dulu, lalu dihapus sebanyak `tembus` supaya hero baru terlihat
  // setelah 100%. Hapusnya lewat globalAlpha dengan isi #000 pekat; isi semi-transparan hanya
  // menghapus sebagian kecil.
  const lubang = () => {
    g.beginPath();
    g.ellipse(W / 2, H / 2, c.lubang * U, c.lubang * U * c.miring, 0, 0, Math.PI * 2);
    g.fill();
  };
  g.fillStyle = "#0d0c0b";
  lubang();
  if (c.tembus > 0) {
    g.globalCompositeOperation = "destination-out";
    g.globalAlpha = c.tembus;
    g.fillStyle = "#000";
    lubang();
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  }
}
