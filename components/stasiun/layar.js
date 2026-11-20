// Gambar layar, kertas, dan label lantai kantor v5, digambar ke tiga atlas kanvas supaya semua
// layar satu draw call, semua kertas satu, semua label satu. Isinya dari previs (previs.html:
// lembarKerja, isi HP tarikan, layar kelangsungan, angka kebiasaan, tablet, kertas biaya dan
// kontrak), dengan teks per bahasa. Letak tiap gambar di atlasnya ada di WILAYAH.
import { LABEL } from "./lantai.js";

// [atlas, x, y, lebar, tinggi] dalam piksel atlas ukuran penuh.
export const ATLAS = { layar: [2048, 2048], kertas: [1024, 1024], label: [1024, 640] };
export const WILAYAH = {
  lembar: ["layar", 0, 0, 1024, 600],
  layanan: ["layar", 1024, 0, 1024, 600],
  lama: ["layar", 0, 600, 1024, 600],
  baru: ["layar", 1024, 600, 1024, 600],
  hp: ["layar", 0, 1200, 380, 800],
  tablet: ["layar", 380, 1200, 480, 320],
  lingkup: ["kertas", 0, 0, 420, 594],
  kontrak: ["kertas", 420, 0, 420, 594],
  ...Object.fromEntries(Object.keys(LABEL).map((k, i) => [`label:${k}`, ["label", (i % 2) * 512, Math.floor(i / 2) * 128, 512, 128]])),
};

const T = {
  hariIni: { id: "Hari ini", en: "Today" },
  penjualan: { id: "Penjualan", en: "Sales" },
  stok: { id: "Stok menipis", en: "Low stock" },
  stokNilai: { id: "6 barang", en: "6 items" },
  kas: { id: "Kas", en: "Cash" },
  cocok: { id: "cocok", en: "matches" },
  jalan: { id: "Semua layanan jalan", en: "All services running" },
  layanan: { id: ["Kasir", "Gudang", "Laporan"], en: ["Till", "Warehouse", "Reports"] },
  menyala: { id: "menyala", en: "up" },
  lama: { id: "Sistem lama", en: "Old system" },
  baru: { id: "Sistem baru", en: "New system" },
  transaksi: { id: "transaksi hari ini", en: "transactions today" },
  kolom: { id: ["Tanggal", "Pelanggan", "Jumlah"], en: ["Date", "Customer", "Amount"] },
  ringkasan: { id: "Ringkasan hari ini", en: "Today at a glance" },
  lingkup: { id: "Lingkup kerja", en: "Scope of work" },
  butir: { id: ["1. Kasir dan stok", "2. Laporan cabang", "Di luar lingkup: integrasi pajak"], en: ["1. Till and stock", "2. Branch reports", "Out of scope: tax integration"] },
  disetujui: { id: "Disetujui", en: "Approved" },
  hak: { id: "Hak atas kode", en: "Rights to the code" },
  milik: { id: "Milik klien", en: "Client owns it" },
  lisensi: { id: "Lisensi", en: "Licensed" },
  data: { id: ["Data tetap milik klien,", "bisa diekspor kapan saja"], en: ["The data stays the client's,", "exportable any time"] },
};

const HURUF = "system-ui, sans-serif";
const MONO = "ui-monospace, monospace";
// Warna tulisan label di dunia terang (previs: krem jadi tinta, amber jadi cokelat, merah tetap).
const WARNA_LABEL = { lembur: "#a8641a", selisih: "#a8641a", tambahan: "#e0574b", cadangan: "#e0574b" };

const GAMBAR = {
  // Lembar kerja penuh angka kecil (dorongan).
  lembar(g, w, h) {
    g.fillStyle = "#e9e5dc";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b7b1a6";
    g.lineWidth = 1;
    for (let x = 0; x < w; x += 90) g.strokeRect(x, 0, 0, h);
    for (let y = 0; y < h; y += 30) g.strokeRect(0, y, w, 0);
    g.fillStyle = "#6f695f";
    g.font = `18px ${MONO}`;
    for (let y = 50; y < h; y += 30) for (let x = 12; x < w; x += 90) if ((x + y) % 7) g.fillText(String((x * 13 + y * 7) % 9000), x, y - 8);
  },
  hp(g, w, h, l) {
    g.fillStyle = "#211a15";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ece8e1";
    g.font = `600 40px ${HURUF}`;
    g.fillText(T.hariIni[l], 40, 90);
    const baris = [[T.penjualan[l], l === "en" ? "IDR 18.4M" : "Rp18,4 jt"], [T.stok[l], T.stokNilai[l]], [T.kas[l], T.cocok[l]]];
    baris.forEach(([a, b], i) => {
      g.font = `30px ${HURUF}`;
      g.fillStyle = "#b3ada4";
      g.fillText(a, 40, 190 + i * 110);
      g.fillStyle = i === 2 ? "#e0574b" : "#ece8e1";
      g.font = `600 44px ${HURUF}`;
      g.fillText(b, 40, 240 + i * 110);
    });
    g.strokeStyle = "#e0574b";
    g.lineWidth = 6;
    g.beginPath();
    [[40, 700], [120, 660], [200, 680], [280, 600], [340, 620]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  },
  layanan(g, w, h, l) {
    g.fillStyle = "#211a15";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f0b35a";
    g.beginPath();
    g.arc(90, 90, 30, 0, 7);
    g.fill();
    g.fillStyle = "#ece8e1";
    g.font = `600 52px ${HURUF}`;
    g.fillText(T.jalan[l], 150, 108);
    g.font = `34px ${HURUF}`;
    T.layanan[l].forEach((s, i) => {
      g.fillStyle = "#b3ada4";
      g.fillText(s, 150, 220 + i * 90);
      g.fillStyle = "#f0b35a";
      g.fillText(T.menyala[l], 520, 220 + i * 90);
    });
  },
  // Sistem lama dan baru: angka dan urutan kolom sama (babak kebiasaan).
  lama: (g, w, h, l) => angka(g, w, h, T.lama[l], l),
  baru: (g, w, h, l) => angka(g, w, h, T.baru[l], l),
  tablet(g, w, h, l) {
    g.fillStyle = "#f6efe3";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e0574b";
    g.fillRect(0, 0, w, 46);
    g.fillStyle = "#fff";
    g.font = `600 24px ${HURUF}`;
    g.fillText(T.ringkasan[l], 18, 31);
    [["#a9c4ec", 18, 66], ["#b9dcb0", 250, 66], ["#f2d27a", 18, 196], ["#cdb8e8", 250, 196]].forEach(([c, x, y]) => {
      g.fillStyle = c;
      g.fillRect(x, y, 212, 112);
      g.fillStyle = "#2a2836";
      g.fillRect(x + 14, y + 16, 90, 12);
      g.fillRect(x + 14, y + 70, 140, 22);
    });
  },
  lingkup(g, w, h, l) {
    g.fillStyle = "#ece8e1";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1d1b19";
    g.font = `600 26px ${HURUF}`;
    g.fillText(T.lingkup[l], 30, 50);
    g.font = `18px ${HURUF}`;
    T.butir[l].forEach((s, i) => g.fillText(s, 30, 100 + i * 34));
    g.fillRect(30, 520, 160, 2);
    g.fillText(T.disetujui[l], 30, 550);
  },
  kontrak(g, w, h, l) {
    g.fillStyle = "#ece8e1";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1d1b19";
    g.font = `600 28px ${HURUF}`;
    g.fillText(T.hak[l], 30, 60);
    g.font = `22px ${HURUF}`;
    g.strokeStyle = "#1d1b19";
    g.lineWidth = 3;
    g.strokeRect(30, 110, 26, 26);
    g.fillText(T.milik[l], 70, 132);
    g.strokeRect(30, 160, 26, 26);
    g.fillText(T.lisensi[l], 70, 182);
    g.fillStyle = "#b3322a";
    g.font = `600 22px ${HURUF}`;
    T.data[l].forEach((s, i) => g.fillText(s, 30, 260 + i * 32));
  },
};

function angka(g, w, h, judul, l) {
  g.fillStyle = "#e9e5dc";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#6f695f";
  g.font = `30px ${HURUF}`;
  g.fillText(judul, 40, 60);
  g.fillStyle = "#1d1b19";
  g.font = `600 150px ${HURUF}`;
  g.fillText(l === "en" ? "1,284" : "1.284", 40, 300);
  g.font = `30px ${HURUF}`;
  g.fillStyle = "#6f695f";
  g.fillText(T.transaksi[l], 40, 360);
  T.kolom[l].forEach((s, i) => {
    const y = 430 + i * 50;
    g.strokeStyle = "#b7b1a6";
    g.strokeRect(40, y - 34, 600, 44);
    g.fillText(s, 52, y);
  });
}

function gambarLabel(g, w, h, kunci, l) {
  g.clearRect(0, 0, w, h);
  g.font = `600 64px ${MONO}`;
  g.fillStyle = WARNA_LABEL[kunci] ?? "#2a2420";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(LABEL[kunci][l], w / 2, h / 2, w - 16);
}

// Menggambar ketiga atlas. `skala` 0,5 di HP (layar produk 512 px, lembar look-dev).
// Mengembalikan { layar, kertas, label } berisi kanvas.
export function gambarAtlas(bahasa = "id", skala = 1) {
  const l = bahasa === "en" ? "en" : "id";
  const kanvas = {};
  for (const [nama, [w, h]] of Object.entries(ATLAS)) {
    const c = document.createElement("canvas");
    c.width = Math.round(w * skala);
    c.height = Math.round(h * skala);
    kanvas[nama] = c;
  }
  for (const [kunci, [atlas, x, y, w, h]] of Object.entries(WILAYAH)) {
    const g = kanvas[atlas].getContext("2d");
    g.save();
    g.scale(skala, skala);
    g.translate(x, y);
    g.beginPath();
    g.rect(0, 0, w, h);
    g.clip();
    if (kunci.startsWith("label:")) gambarLabel(g, w, h, kunci.slice(6), l);
    else GAMBAR[kunci](g, w, h, l);
    g.restore();
  }
  return kanvas;
}

// UV bidang (0..1) dipetakan ke wilayahnya di atlas. Kanvas dibalik (flipY), jadi v = 1 di atas.
export function uvWilayah(kunci) {
  const [atlas, x, y, w, h] = WILAYAH[kunci];
  const [W, H] = ATLAS[atlas];
  return { atlas, u0: x / W, du: w / W, v0: (H - y - h) / H, dv: h / H };
}
