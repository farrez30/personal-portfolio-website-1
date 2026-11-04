// Semua "cetakan" di adegan 3D digambar di kanvas 2D dari data proyek:
// sampul, label cakram, halaman buklet, dan layar hologram. Tanpa berkas
// gambar, jadi ringan dan ikut berganti bahasa.
import { tataLetak } from "@/components/sinarx/tataLetak";

const KERTAS = "#efe9df";
const TINTA = "#1d1b19";

function fontKeluarga() {
  return getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
}

function fontMono() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-mono");
  return v.trim() || "ui-monospace, monospace";
}

function kanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

// Memecah teks ke baris sesuai lebar; mengembalikan y sesudah baris terakhir.
function tulisParagraf(g, teks, x, y, lebar, tinggiBaris) {
  for (const para of String(teks).split("\n")) {
    let baris = "";
    for (const kata of para.split(" ")) {
      const coba = baris ? `${baris} ${kata}` : kata;
      if (g.measureText(coba).width > lebar && baris) {
        g.fillText(baris, x, y);
        y += tinggiBaris;
        baris = kata;
      } else {
        baris = coba;
      }
    }
    if (baris) {
      g.fillText(baris, x, y);
      y += tinggiBaris;
    }
  }
  return y;
}

function alur(g, cx, cy, r, warna) {
  g.save();
  g.strokeStyle = warna;
  g.lineWidth = 1;
  for (let i = r * 0.25; i < r; i += 7) {
    g.globalAlpha = 0.08 + (i / r) * 0.08;
    g.beginPath();
    g.arc(cx, cy, i, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

export function gambarSampul(p, locale, ukuran = 1024) {
  const [c, g] = kanvas(ukuran, ukuran);
  const s = ukuran / 512;
  g.fillStyle = p.warna;
  g.fillRect(0, 0, ukuran, ukuran);
  alur(g, ukuran * 0.86, ukuran * 0.9, ukuran * 0.62, "#ffffff");
  g.fillStyle = "#f4efe7";
  g.font = `650 ${44 * s}px ${fontKeluarga()}`;
  g.textBaseline = "top";
  tulisParagraf(g, p.judul[locale], 36 * s, 36 * s, 400 * s, 48 * s);
  g.font = `500 ${15 * s}px ${fontMono()}`;
  g.globalAlpha = 0.8;
  g.fillText(`${p.katalog}  ${p.periode}`, 36 * s, 460 * s);
  g.globalAlpha = 1;
  return c;
}

export function gambarCakram(p, ukuran = 1024) {
  const [c, g] = kanvas(ukuran, ukuran);
  const m = ukuran / 2;
  g.fillStyle = "#d9d6d0";
  g.fillRect(0, 0, ukuran, ukuran);
  g.fillStyle = p.warna;
  g.beginPath();
  g.arc(m, m, m * 0.98, 0, Math.PI * 2);
  g.fill();
  alur(g, m, m, m * 0.98, "#ffffff");
  g.fillStyle = "#f4efe7";
  g.font = `500 ${ukuran * 0.035}px ${fontMono()}`;
  g.textAlign = "center";
  g.fillText(p.katalog, m, m * 1.45);
  g.fillStyle = "#cfcac2";
  g.beginPath();
  g.arc(m, m, m * 0.3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#111";
  g.beginPath();
  g.arc(m, m, m * 0.08, 0, Math.PI * 2);
  g.fill();
  return c;
}

// Sisipan belakang kotak: seperti sisi belakang CD, "daftar lagu"-nya adalah
// komponen sistem, ditambah ringkasan dan nomor katalog.
export function gambarSisipan(p, locale, w = 1024, h = 900) {
  const [c, g] = kanvas(w, h);
  const s = w / 512;
  g.fillStyle = "#e9e3d8";
  g.fillRect(0, 0, w, h);
  g.fillStyle = p.warna;
  g.fillRect(0, 0, 22 * s, h);
  g.fillRect(w - 22 * s, 0, 22 * s, h);
  g.save();
  g.translate(11 * s, h / 2);
  g.rotate(-Math.PI / 2);
  g.fillStyle = "#f4efe7";
  g.font = `500 ${10 * s}px ${fontMono()}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(`${p.katalog}  ${p.judul[locale]}`.toUpperCase(), 0, 0);
  g.restore();
  g.textBaseline = "top";
  g.fillStyle = TINTA;
  g.font = `650 ${22 * s}px ${fontKeluarga()}`;
  let y = tulisParagraf(g, p.judul[locale], 44 * s, 32 * s, 420 * s, 26 * s) + 10 * s;
  if (p.arsitektur) {
    g.font = `400 ${12 * s}px ${fontMono()}`;
    p.arsitektur.simpul.forEach((n, i) => {
      g.fillText(`${String(i + 1).padStart(2, "0")}  ${n.label}`, 44 * s, y);
      y += 19 * s;
    });
    y += 10 * s;
  }
  g.fillStyle = "#4f4a43";
  g.font = `400 ${12 * s}px ${fontKeluarga()}`;
  tulisParagraf(g, p.ringkas[locale], 44 * s, y, 420 * s, 17 * s);
  g.fillStyle = TINTA;
  for (let i = 0; i < 34; i++) {
    const lebarBatang = (i * 7) % 3 === 0 ? 3 : 1.5;
    g.fillRect(380 * s + i * 2.6 * s, 380 * s, lebarBatang * s * 0.6, 34 * s);
  }
  g.font = `400 ${10 * s}px ${fontMono()}`;
  g.fillText(p.katalog, 380 * s, 418 * s);
  return c;
}

// Halaman buklet persegi (kotak CD), dengan label bagian berbahasa Inggris
// dan isi dalam bahasa halaman.
export function gambarHalaman({ label, judul, isi, catatan }, ukuran = 1024) {
  const [c, g] = kanvas(ukuran, ukuran);
  const s = ukuran / 512;
  g.fillStyle = KERTAS;
  g.fillRect(0, 0, ukuran, ukuran);
  g.textBaseline = "top";
  g.fillStyle = "#b3322a";
  g.font = `500 ${12 * s}px ${fontMono()}`;
  g.fillText(label.toUpperCase(), 40 * s, 40 * s);
  g.fillStyle = TINTA;
  let y = 72 * s;
  if (judul) {
    g.font = `650 ${24 * s}px ${fontKeluarga()}`;
    y = tulisParagraf(g, judul, 40 * s, y, 432 * s, 30 * s) + 14 * s;
  }
  if (isi) {
    g.font = `400 ${15 * s}px ${fontKeluarga()}`;
    y = tulisParagraf(g, isi, 40 * s, y, 432 * s, 23 * s);
  }
  if (catatan) {
    g.fillStyle = "#6f695f";
    g.font = `400 ${11 * s}px ${fontMono()}`;
    tulisParagraf(g, catatan, 40 * s, 450 * s, 432 * s, 16 * s);
  }
  return c;
}

// Diagram arsitektur untuk halaman buklet dan layar hologram.
export function gambarArsitektur(arsitektur, { latar, garis, kotak, teks, aksen, huruf = 22 }, w = 1024, h = 640) {
  const [c, g] = kanvas(w, h);
  if (latar) {
    g.fillStyle = latar;
    g.fillRect(0, 0, w, h);
  }
  const { simpul, garis: sambung } = arsitektur;
  const { posisi, perKolom, jumlahKolom } = tataLetak(simpul, sambung);
  const kw = Math.min(huruf * 12, (w - 60) / Math.max(jumlahKolom, 1) - 30);
  const kh = huruf * 2.9;
  const jarakX = jumlahKolom > 1 ? (w - kw - 80) / (jumlahKolom - 1) : 0;
  const titik = (id) => {
    const p = posisi[id];
    const n = perKolom.get(p.kolom);
    const jarakY = Math.min(huruf * 6, (h - 80) / n);
    const awal = (h - n * jarakY) / 2 + jarakY / 2;
    return { x: jumlahKolom > 1 ? 40 + kw / 2 + p.kolom * jarakX : w / 2, y: awal + p.baris * jarakY };
  };
  g.lineWidth = 3;
  for (const [a, b] of sambung) {
    const p = titik(a);
    const q = titik(b);
    g.strokeStyle = garis;
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(q.x, q.y);
    g.stroke();
    g.fillStyle = aksen;
    g.beginPath();
    g.arc((p.x + q.x) / 2, (p.y + q.y) / 2, 6, 0, Math.PI * 2);
    g.fill();
  }
  g.font = `600 ${huruf}px ${fontMono()}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const s of simpul) {
    const p = titik(s.id);
    g.fillStyle = kotak;
    g.strokeStyle = garis;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(p.x - kw / 2, p.y - kh / 2, kw, kh, 10);
    g.fill();
    g.stroke();
    g.fillStyle = teks;
    tulisParagraf(g, s.label, p.x, p.y - (g.measureText(s.label).width > kw - 20 ? huruf * 0.55 : 0), kw - 20, huruf * 1.1);
  }
  return c;
}
