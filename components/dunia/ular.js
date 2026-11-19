// Loader cakram CD (storyboard desain/transisi/loader.html, varian 3; dipilih Farrez 12 Nov 2026
// setelah semua versi ular ditolak). Selama dunia dimuat cakram berputar makin cepat dan bagian
// berdatanya melebar mengikuti progres nyata. Lubang tengahnya gelap seperti latar, jadi hero belum
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

// Difraksi sisi data CD asli (riset 19 Nov 2026: Zucconi, CU Boulder, Uni Kiel): sebagian besar
// permukaan cermin perak; warna hanya muncul sebagai dua baji sempit berseberangan di sekitar
// pantulan terang, urut violet di dekat pantulan lalu biru, hijau, kuning, merah ke luar. Alurnya
// melingkar, jadi baji itu diam terhadap lampu walau cakram berputar; yang ikut berputar hanya
// noda dan cetakan kecil. Dulu gradien pelangi penuh yang ikut berputar, terbaca hologram.
// Progres = luas bagian berdata (beralur, berpelangi), melebar dari hub ke tepi seperti CD-R ditulis.
const SPEKTRUM = [
  [0, "255,255,255", 0.85],
  [0.018, "196,150,255", 0.55],
  [0.034, "110,140,255", 0.6],
  [0.05, "90,220,170", 0.55],
  [0.066, "255,226,110", 0.5],
  [0.082, "255,120,90", 0.42],
  [0.11, "255,120,90", 0],
];
const SUDUT_LAMPU = -0.75; // arah pantulan terang dari pusat (radian), tetap terhadap layar

// Conic gradient berisi dua baji spektrum simetris di sekitar `sudut` dan `sudut + PI`.
function bajiSpektrum(g, sudut, kuat) {
  const k = g.createConicGradient(sudut, 0, 0);
  const henti = [];
  for (const pusat of [0, 0.5, 1]) {
    for (const [d, w, a] of SPEKTRUM) {
      for (const tanda of [-1, 1]) {
        const f = pusat + tanda * d;
        if (f >= 0 && f <= 1) henti.push([f, `rgba(${w},${(a * kuat).toFixed(3)})`]);
      }
    }
  }
  henti.sort((a, b) => a[0] - b[0]);
  // Celah di antara baji transparan.
  henti.push([0.25, "rgba(0,0,0,0)"], [0.75, "rgba(0,0,0,0)"]);
  henti.sort((a, b) => a[0] - b[0]);
  for (const [f, w] of henti) k.addColorStop(f, w);
  return k;
}

const cincin = (g, rLuar, rDalam) => {
  g.beginPath();
  g.arc(0, 0, rLuar, 0, Math.PI * 2);
  g.arc(0, 0, rDalam, 0, Math.PI * 2, true);
};

// Noda debu dan goresan halus yang ikut berputar: satu-satunya tanda putaran di cakram asli.
const NODA = Array.from({ length: 14 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.678;
  return { sudut: (a - Math.floor(a)) * Math.PI * 2, jarak: 0.38 + (b - Math.floor(b)) * 0.56, panjang: 0.01 + ((a * 7) % 1 + 1) % 1 * 0.05 };
});

// Gambar satu bingkai loader: layar gelap, cakram cermin perak dengan difraksi di bagian berdata
// yang melebar sesuai progres, dan lubang yang dilubangi tembus ke hero di bawah kanvas.
export function gambarLoader(g, W, H, t, { tSiap = null, progres = 0, diam = false } = {}) {
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.fillStyle = "#0d0c0b";
  g.fillRect(0, 0, W, H);
  const U = Math.min(W, H);
  // Gerak dikurangi: cakram diam terbaring, bagian berdata tetap melebar mengikuti progres.
  const c = cakramPada(diam ? 0 : t, diam ? null : tSiap, progres);
  const r = c.r * U;
  const rHub = r * 0.33;
  const rData = rHub + (r * 0.97 - rHub) * c.isi;
  // Pantulan bergeser sedikit saat cakram menegak, seperti lampu yang terlihat dari sudut lain.
  const sudut = SUDUT_LAMPU + (1 - c.miring) * 0.5;
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(1, c.miring);
  // Badan cermin: memantulkan ruangan gelap, sedikit lebih terang searah lampu.
  const badan = g.createLinearGradient(-r * Math.cos(sudut), -r * Math.sin(sudut), r * Math.cos(sudut), r * Math.sin(sudut));
  badan.addColorStop(0, "#3c4047");
  badan.addColorStop(0.5, "#767c86");
  badan.addColorStop(1, "#3c4047");
  g.fillStyle = badan;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();
  // Bagian berdata sedikit lebih gelap dan kebiruan dari cermin polos di luarnya.
  if (c.isi > 0) {
    g.fillStyle = "rgba(24,28,44,0.28)";
    cincin(g, rData, rHub);
    g.fill("evenodd");
  }
  g.globalCompositeOperation = "lighter";
  // Kilau putih sempit searah lampu di seluruh cermin (pantulan orde 0, tanpa warna).
  g.fillStyle = bajiSpektrum(g, sudut, 0.32);
  cincin(g, r * 0.99, rHub);
  g.fill("evenodd");
  // Difraksi hanya di bagian berdata. Tiap cincin tipis bajinya sedikit bergeser (sudut pandang
  // berubah dengan jari-jari), jadi pita warnanya melengkung seperti di cakram sungguhan.
  const lapis = 14;
  for (let i = 0; i < lapis; i++) {
    const r0 = rHub + ((rData - rHub) * i) / lapis;
    const r1 = rHub + ((rData - rHub) * (i + 1)) / lapis;
    if (r1 - r0 < 0.5) break;
    const rho = (r0 + r1) / 2 / r;
    const kuat = Math.pow(Math.sin(Math.PI * Math.min(1, (rho - 0.3) / 0.7)), 0.6) * 0.95;
    g.fillStyle = bajiSpektrum(g, sudut + (rho - 0.65) * 0.55, kuat);
    cincin(g, r1, r0);
    g.fill("evenodd");
  }
  g.globalCompositeOperation = "source-over";
  // Alur halus: beberapa garis melingkar samar di bagian berdata, dan batas tulisan CD-R.
  g.lineWidth = Math.max(0.5, r * 0.002);
  for (let i = 1; i < 9; i++) {
    const rr = rHub + ((rData - rHub) * i) / 9;
    g.strokeStyle = `rgba(255,255,255,${0.025 + (i % 3) * 0.012})`;
    g.beginPath();
    g.arc(0, 0, rr, 0, Math.PI * 2);
    g.stroke();
  }
  if (c.isi > 0 && c.isi < 1) {
    g.strokeStyle = "rgba(255,255,255,0.14)";
    g.beginPath();
    g.arc(0, 0, rData, 0, Math.PI * 2);
    g.stroke();
  }
  // Hub plastik bening: abu tembus dengan cincin tumpuk cetakan.
  g.fillStyle = "rgba(150,156,166,0.22)";
  cincin(g, rHub, r * 0.15);
  g.fill("evenodd");
  g.strokeStyle = "rgba(220,225,235,0.18)";
  g.lineWidth = Math.max(1, r * 0.006);
  for (const rr of [rHub, r * 0.24]) {
    g.beginPath();
    g.arc(0, 0, rr, 0, Math.PI * 2);
    g.stroke();
  }
  // Tepi luar cakram: garis terang tipis.
  g.strokeStyle = "rgba(235,238,244,0.35)";
  g.lineWidth = Math.max(1, r * 0.008);
  g.beginPath();
  g.arc(0, 0, r * 0.995, 0, Math.PI * 2);
  g.stroke();
  // Yang ikut berputar: noda debu, goresan halus, dan nomor cetak di hub.
  g.rotate(diam ? 0 : c.putar);
  g.strokeStyle = "rgba(255,255,255,0.16)";
  g.lineWidth = Math.max(0.6, r * 0.003);
  for (const n of NODA) {
    const rr = n.jarak * r;
    g.beginPath();
    g.arc(0, 0, rr, n.sudut, n.sudut + n.panjang);
    g.stroke();
  }
  g.fillStyle = "rgba(230,234,240,0.28)";
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 0.9;
    g.fillRect(Math.cos(a) * r * 0.285 - 0.6, Math.sin(a) * r * 0.285 - 0.6, Math.max(1, r * 0.006), Math.max(1, r * 0.006));
  }
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
