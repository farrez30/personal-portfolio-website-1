// Loader ular (ADR 0014, storyboard desain/transisi/loader.html). Selama dunia dimuat, ular
// berputar seperti spinner dan makin panjang mengikuti progres nyata. Di 100% ia meliuk ke arah
// kita, menerjang, dan mulutnya yang terbuka menjadi lubang ke hero di bawah kanvas.
// Kanvas 2D, bukan three.js: loader harus tampil sebelum satu aset dunia pun tiba.

export const LIUK = 1.1;
export const TERKAM = 0.75;
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

// Ruas tubuh: 8 saat mulai, 36 saat penuh.
export const panjangUlar = (progres) => Math.round(8 + jepit(progres) * 28);

const PUTAR = 4.2;
const JARI = 0.24;

// Posisi kepala relatif tengah layar dalam satuan sisi terpendek layar, skala (1 = ukuran
// spinner), dan arah hadap. `tSiap` = waktu saat 100% (null selama memuat).
export function kepala(t, tSiap = null) {
  const putaran = (s) => {
    const a = s * PUTAR;
    return { x: Math.cos(a) * JARI, y: Math.sin(a) * JARI, s: 1, a: a + Math.PI / 2, terkam: 0 };
  };
  if (tSiap == null || t <= tSiap) return putaran(t);
  const p0 = putaran(tSiap);
  const k = t - tSiap;
  if (k < LIUK) {
    // Meliuk keluar dari lingkaran ke tengah bawah sambil mengayun kiri kanan, makin dekat.
    const u = halus(k / LIUK);
    const ayun = Math.sin(u * Math.PI * 4) * 0.14 * (1 - u) * u * 4;
    const x = p0.x * (1 - u) + ayun;
    const y = p0.y + (0.12 - p0.y) * u;
    const lurus = Math.atan2(0.12 - p0.y, -p0.x);
    return { x, y, s: 1 + u * 1.6, a: lurus + Math.cos(u * Math.PI * 4) * 0.9 * (1 - u), terkam: 0 };
  }
  // Menerjang: menghadap kamera dan membesar cepat sampai mulutnya melampaui tepi layar.
  const u = jepit((k - LIUK) / TERKAM);
  return { x: 0, y: 0.12 * (1 - u), s: 2.6 + u * u * u * 40, a: -Math.PI / 2, terkam: u };
}

// Lubang mulut (elips, piksel) saat menerjang: membuka di 10%..70% terkam.
export function lubangMulut(h, U) {
  const R = U * 0.05 * h.s;
  const buka = halus(jepit((h.terkam - 0.1) / 0.6));
  return { R, rx: R * 0.92, ry: R * 0.72 * buka, dy: R * 0.15 };
}

const WARNA = {
  layar: "#0d0c0b",
  sisik: ["#3f7a4e", "#5b9a63"],
  perut: "#a9c98a",
  kepala: "#6fb075",
  mata: "#ffd84a",
  lidah: "#e05a4a",
  mulut: "#7a1f2a",
  taring: "#f3ecdf",
};

// Gambar satu bingkai loader. Kanvas menutupi layar; mulut dilubangi dengan destination-out
// sehingga hero di bawahnya terlihat.
export function gambarUlar(g, W, H, t, { tSiap = null, progres = 0, diam = false } = {}) {
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.fillStyle = WARNA.layar;
  g.fillRect(0, 0, W, H);
  const U = Math.min(W, H);
  const cx = W / 2;
  const cy = H / 2;
  const titik = (p) => [cx + p.x * U, cy + p.y * U];
  // Gerak dikurangi: ular melingkar diam, panjang penuh.
  const waktu = diam ? 1.2 : t;
  const n = diam ? panjangUlar(1) : panjangUlar(progres);
  const h = kepala(waktu, diam ? null : tSiap);
  const tebal = U * 0.045;

  // Tubuh dari ekor ke kepala: riwayat posisi kepala, menipis ke ekor, pudar saat menerjang.
  const tubuh = [];
  for (let i = n; i >= 1; i--) {
    const ti = waktu - i * 0.028;
    if (ti >= 0 || diam) tubuh.push(kepala(ti, diam ? null : tSiap));
  }
  g.globalAlpha = 1 - h.terkam;
  g.lineCap = "round";
  for (let i = 1; i < tubuh.length; i++) {
    const k = (i + 1) / tubuh.length;
    const [x0, y0] = titik(tubuh[i - 1]);
    const [x1, y1] = titik(tubuh[i]);
    const lebar = tebal * tubuh[i].s * (0.35 + k * 0.65) * 2;
    g.strokeStyle = WARNA.sisik[i % 2];
    g.lineWidth = lebar;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
    // Garis perut tipis di tengah ruas, supaya tubuh tidak terbaca sebagai tali polos.
    g.strokeStyle = WARNA.perut;
    g.globalAlpha = (1 - h.terkam) * 0.35;
    g.lineWidth = lebar * 0.18;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
    g.globalAlpha = 1 - h.terkam;
  }
  g.globalAlpha = 1;

  if (h.terkam < 0.15) {
    const [hx, hy] = titik(h);
    const r = tebal * h.s * 1.25;
    g.save();
    g.translate(hx, hy);
    g.rotate(h.a);
    g.fillStyle = WARNA.kepala;
    g.beginPath();
    g.ellipse(r * 0.4, 0, r * 1.4, r, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = WARNA.mata;
    g.beginPath();
    g.arc(r * 0.9, -r * 0.45, r * 0.22, 0, Math.PI * 2);
    g.arc(r * 0.9, r * 0.45, r * 0.22, 0, Math.PI * 2);
    g.fill();
    // Lidah menjulur sebentar tiap 0,9 detik.
    if (!diam && waktu % 0.9 < 0.32) {
      g.strokeStyle = WARNA.lidah;
      g.lineWidth = Math.max(1, r * 0.12);
      g.beginPath();
      g.moveTo(r * 1.8, 0);
      g.lineTo(r * 2.4, 0);
      g.lineTo(r * 2.7, -r * 0.3);
      g.moveTo(r * 2.4, 0);
      g.lineTo(r * 2.7, r * 0.3);
      g.stroke();
    }
    g.restore();
    return;
  }

  // Menerjang: kepala menghadap kamera, mulut terbuka lalu dilubangi tembus ke hero.
  const { R, rx, ry, dy } = lubangMulut(h, U);
  const my = cy + h.y * U;
  const buka = ry / (R * 0.72 || 1);
  g.fillStyle = WARNA.sisik[1];
  g.beginPath();
  g.ellipse(cx, my, R * 1.3, R * 1.1, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = WARNA.mata;
  g.beginPath();
  g.arc(cx - R * 0.55, my - R * 0.75, R * 0.14, 0, Math.PI * 2);
  g.arc(cx + R * 0.55, my - R * 0.75, R * 0.14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = WARNA.mulut;
  g.beginPath();
  g.ellipse(cx, my + R * 0.1, R * 1.05, R * 0.85 * buka, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = WARNA.taring;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(cx + s * R * 0.45, my - R * 0.6 * buka);
    g.lineTo(cx + s * R * 0.32, my - R * 0.1 * buka);
    g.lineTo(cx + s * R * 0.58, my - R * 0.5 * buka);
    g.fill();
  }
  g.globalCompositeOperation = "destination-out";
  g.beginPath();
  g.ellipse(cx, my + dy, rx, Math.max(0.001, ry), 0, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = "source-over";
}
