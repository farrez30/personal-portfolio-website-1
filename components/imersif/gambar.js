// Semua "cetakan" di adegan 3D digambar di kanvas 2D dari data proyek:
// sampul, label cakram, halaman buklet, dan layar hologram. Tanpa berkas
// gambar, jadi ringan dan ikut berganti bahasa.
import { tataLetak } from "@/components/sinarx/tataLetak";
import { albumUntuk } from "@/content/album";
import { hurufTermuat, muatHuruf, namaHuruf, tulisJudul } from "./tipografi";

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

// Gambar yang dimuat sekali dan dipakai bersama (ilustrasi sampul dan halaman).
const simpanan = new Map();
export function muatGambar(src) {
  if (!simpanan.has(src)) {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    simpanan.set(src, im);
  }
  return simpanan.get(src);
}

// Butir cetak: titik acak halus yang membuat gambar terasa dicetak di kertas, bukan layar.
function butir(g, w, h, kuat = 0.06) {
  const [c, gb] = kanvas(256, 256);
  const data = gb.createImageData(256, 256);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  gb.putImageData(data, 0, 0);
  g.save();
  g.globalAlpha = kuat;
  g.globalCompositeOperation = "overlay";
  g.fillStyle = g.createPattern(c, "repeat");
  g.fillRect(0, 0, w, h);
  g.restore();
}

// Gambar dipotong tengah supaya mengisi kotak tanpa gepeng.
function gambarPenuh(g, im, x, y, w, h, skala = 1) {
  const sk = Math.max(w / im.naturalWidth, h / im.naturalHeight) * skala;
  const iw = im.naturalWidth * sk;
  const ih = im.naturalHeight * sk;
  g.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

// Seperti siapkanGambar, tapi menunggu huruf genre album juga, supaya judul
// tidak sempat tergambar dengan huruf cadangan lalu tertinggal di tekstur.
function siapkanAlbum(c, src, a, gambar) {
  const im = muatGambar(src);
  const hurufSiap = muatHuruf(a.huruf);
  // Sudah termuat semua (mis. buklet dibuka setelah rak tampil): gambar langsung,
  // karena pemakai seperti buklet membaca kanvasnya saat itu juga.
  if (im.complete && im.naturalWidth && hurufTermuat(a.huruf)) {
    gambar(im);
    return;
  }
  const imSiap = im.complete && im.naturalWidth
    ? Promise.resolve()
    : new Promise((selesai) => {
        im.addEventListener("load", selesai, { once: true });
        im.addEventListener("error", selesai, { once: true });
      });
  gambar(null);
  c.siap = Promise.all([imSiap, hurufSiap]).then(() => gambar(im.naturalWidth ? im : null));
}

// Sampul album bergenre: gambar penuh dan judul dicetak langsung di atasnya
// dengan huruf genre itu (letak di content/album.js). Tanpa pita judul.
function gambarSampulAlbum(p, a, locale, ukuran) {
  const [c, g] = kanvas(ukuran, ukuran);
  siapkanAlbum(c, a.sampul, a, (im) => {
    g.fillStyle = im ? KERTAS : p.warna;
    g.fillRect(0, 0, ukuran, ukuran);
    if (!im) return;
    gambarPenuh(g, im, 0, 0, ukuran, ukuran);
    tulisJudul(g, ukuran, p.judul[locale], a.judul, a.huruf);
    butir(g, ukuran, ukuran, 0.05);
  });
  return c;
}

// Sampul: tanpa seni album, ilustrasi orang yang memakai produknya di atas kertas
// krem dengan pita bawah berisi judul. Sebelum ilustrasinya termuat (atau bila
// tidak ada), sampul warna polos dengan judul besar.
export function gambarSampul(p, locale, ukuran = 1024) {
  const a = albumUntuk(p.slug);
  if (a) return gambarSampulAlbum(p, a, locale, ukuran);
  const [c, g] = kanvas(ukuran, ukuran);
  const s = ukuran / 512;
  const polos = () => {
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
  };
  const bergambar = (im) => {
    const pita = 104 * s;
    const tinggi = ukuran - pita;
    g.fillStyle = "#efe9df";
    g.fillRect(0, 0, ukuran, ukuran);
    // Potong tengah supaya ilustrasi mengisi bidang atas tanpa gepeng.
    const sk = Math.max(ukuran / im.naturalWidth, tinggi / im.naturalHeight);
    const w = im.naturalWidth * sk;
    const h = im.naturalHeight * sk;
    g.drawImage(im, (ukuran - w) / 2, (tinggi - h) / 2, w, h);
    // Pita bawah berwarna proyek, supaya tiap sampul di rak mudah dibedakan.
    g.fillStyle = p.warna;
    g.fillRect(0, tinggi, ukuran, pita);
    g.fillStyle = "#f4efe7";
    g.font = `650 ${26 * s}px ${fontKeluarga()}`;
    g.textBaseline = "top";
    tulisParagraf(g, p.judul[locale], 28 * s, tinggi + 18 * s, 360 * s, 28 * s);
    g.font = `500 ${11 * s}px ${fontMono()}`;
    g.fillStyle = "rgba(244, 239, 231, 0.75)";
    g.textAlign = "right";
    g.fillText(p.katalog, ukuran - 28 * s, tinggi + 22 * s);
    g.fillText(p.periode, ukuran - 28 * s, tinggi + 40 * s);
    g.textAlign = "left";
    butir(g, ukuran, ukuran);
  };
  const im = p.ilustrasi ? muatGambar(p.ilustrasi) : null;
  if (im?.complete && im.naturalWidth) {
    bergambar(im);
  } else {
    polos();
    if (im) {
      // Pemakai kanvas (tekstur) menunggu ini lalu menandai teksturnya perlu diunggah ulang.
      c.siap = new Promise((selesai) => {
        im.addEventListener("load", () => {
          bergambar(im);
          selesai();
        }, { once: true });
      });
    }
  }
  return c;
}

// Cetakan cakram sebagai cincin di sekitar hub bening (proporsi cakram asli, pecahan
// jari-jari): cetak dari 0,345 sampai 0,978, pita cermin 0,31 sampai 0,345 yang sedikit
// lebih gelap karena lapisan pantul terlihat lewat plastik polos, lalu hampir hitam
// sampai tepi. Tanpa alur: cakram cetak asli tidak punya alur di labelnya.
export const CETAK_CAKRAM = { hub: 0.31, label: 0.345, tepi: 0.978, sisa: "#0c0c0e" };

// Cakram bergambar (picture disc): ilustrasi proyek dicetak penuh di bidang cetak, dengan
// nomor katalog kecil. Tanpa ilustrasi, warna proyek polos.
export function gambarCakram(p, ukuran = 1024) {
  const [c, g] = kanvas(ukuran, ukuran);
  const m = ukuran / 2;
  const { hub, label, tepi, sisa } = CETAK_CAKRAM;
  const a = albumUntuk(p.slug);
  // Seni label album sudah berkomposisi lingkaran dengan sedikit latar di sudut;
  // diperbesar sedikit supaya lingkarannya sampai ke tepi cetak.
  const perbesar = a ? 1.12 : 1;
  const gambar = (im) => {
    g.save();
    g.clearRect(0, 0, ukuran, ukuran);
    g.beginPath();
    g.arc(m, m, m, 0, Math.PI * 2);
    g.arc(m, m, m * hub, 0, Math.PI * 2, true);
    g.clip("evenodd");
    g.fillStyle = p.warna;
    g.fillRect(0, 0, ukuran, ukuran);
    if (im) {
      gambarPenuh(g, im, 0, 0, ukuran, ukuran, perbesar);
      // Sablon pada polikarbonat sedikit lebih gelap dan kurang jenuh dari kertas.
      g.fillStyle = "rgba(20, 18, 16, 0.18)";
      g.fillRect(0, 0, ukuran, ukuran);
    }
    g.fillStyle = "#f4efe7";
    g.font = `600 ${ukuran * 0.03}px ${fontMono()}`;
    g.textAlign = "center";
    g.lineWidth = ukuran * 0.006;
    g.strokeStyle = "rgba(20, 18, 16, 0.55)";
    g.strokeText(p.katalog, m, m * 1.5);
    g.fillText(p.katalog, m, m * 1.5);
    g.beginPath();
    g.arc(m, m, m * label, 0, Math.PI * 2);
    g.arc(m, m, m * hub, 0, Math.PI * 2, true);
    g.fillStyle = "rgba(6, 6, 10, 0.2)";
    g.fill("evenodd");
    // Cetak berhenti sebelum tepi supaya cakram yang berputar tidak membawa garis terang.
    g.beginPath();
    g.arc(m, m, m, 0, Math.PI * 2);
    g.arc(m, m, m * tepi, 0, Math.PI * 2, true);
    g.fillStyle = sisa;
    g.fill("evenodd");
    g.restore();
  };
  siapkanGambar(c, a?.label ?? p.ilustrasi, gambar);
  return c;
}

// Halaman belakang buklet (yang terlihat di tutup kotak terbuka): ilustrasi proyek dicetak
// satu warna, warna proyek, di atas kertas, dengan judul dan katalog kecil di bawah.
export function gambarBelakang(p, locale, ukuran = 1024) {
  const a = albumUntuk(p.slug);
  if (a) return gambarBelakangAlbum(p, a, locale, ukuran);
  const [c, g] = kanvas(ukuran, ukuran);
  const s = ukuran / 512;
  const gambar = (im) => {
    g.fillStyle = "#efe9df";
    g.fillRect(0, 0, ukuran, ukuran);
    if (im) {
      const sk = Math.max(ukuran / im.naturalWidth, ukuran / im.naturalHeight);
      const w = im.naturalWidth * sk;
      const h = im.naturalHeight * sk;
      g.save();
      g.filter = "grayscale(1) contrast(1.15) brightness(1.05)";
      g.drawImage(im, (ukuran - w) / 2, (ukuran - h) / 2, w, h);
      g.filter = "none";
      // Satu warna: warna proyek menggantikan hitam, kertas tetap krem.
      g.globalCompositeOperation = "screen";
      g.fillStyle = p.warna;
      g.fillRect(0, 0, ukuran, ukuran);
      g.globalCompositeOperation = "multiply";
      g.fillStyle = "#efe9df";
      g.fillRect(0, 0, ukuran, ukuran);
      g.restore();
    }
    g.fillStyle = "#efe9df";
    g.fillRect(0, ukuran - 56 * s, ukuran, 56 * s);
    g.fillStyle = "#1d1b19";
    g.font = `500 ${11 * s}px ${fontMono()}`;
    g.textBaseline = "middle";
    g.fillText(`${p.katalog}  ${p.judul[locale]}  ${p.periode}`, 28 * s, ukuran - 28 * s);
    butir(g, ukuran, ukuran, 0.08);
  };
  siapkanGambar(c, p.ilustrasi, gambar);
  return c;
}

// Halaman belakang buklet album: gambar penutup buklet (hasil akhir) penuh warna,
// dengan katalog dan judul kecil di sepertiga kanan yang memang dibiarkan kosong.
function gambarBelakangAlbum(p, a, locale, ukuran) {
  const [c, g] = kanvas(ukuran, ukuran);
  siapkanAlbum(c, a.buklet[a.buklet.length - 1], a, (im) => {
    g.fillStyle = KERTAS;
    g.fillRect(0, 0, ukuran, ukuran);
    if (!im) return;
    gambarPenuh(g, im, 0, 0, ukuran, ukuran);
    g.fillStyle = a.tinta;
    g.textBaseline = "bottom";
    g.textAlign = "right";
    g.font = `${a.huruf.berat ?? 400} ${ukuran * 0.032}px ${namaHuruf(a.huruf)}`;
    g.fillText(p.judul[locale], ukuran * 0.95, ukuran * 0.9);
    g.font = `500 ${ukuran * 0.02}px ${fontMono()}`;
    g.fillText(`${p.katalog}  ${p.periode}`, ukuran * 0.95, ukuran * 0.94);
    butir(g, ukuran, ukuran, 0.06);
  });
  return c;
}

// Gambar sekarang bila ilustrasinya sudah termuat; bila belum, gambar versi tanpa ilustrasi
// dan beri kanvas janji `siap` yang selesai setelah digambar ulang dengan ilustrasinya.
function siapkanGambar(c, src, gambar) {
  const im = src ? muatGambar(src) : null;
  if (!im || (im.complete && im.naturalWidth)) {
    gambar(im);
    return;
  }
  gambar(null);
  c.siap = new Promise((selesai) => {
    im.addEventListener(
      "load",
      () => {
        gambar(im);
        selesai();
      },
      { once: true },
    );
  });
}

// Aus pada plastik mengilap: merah = goresan halus pendek, beberapa goresan panjang
// samar, dan pusaran busur bekas lap; hijau = noda lembut di sekitar abu-abu tengah.
// Berulang (tile). Acaknya berbenih supaya tiap muat terlihat sama.
export function gambarAus(ukuran = 512, benih = 11) {
  const [c, g] = kanvas(ukuran, ukuran);
  let s = benih >>> 0;
  const acak = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  g.fillStyle = "rgb(0, 110, 0)";
  g.fillRect(0, 0, ukuran, ukuran);
  g.globalCompositeOperation = "lighter";
  g.lineCap = "round";
  const gores = (panjang, alfa, tebal) => {
    const x = acak() * ukuran;
    const y = acak() * ukuran;
    const a = acak() * Math.PI;
    g.strokeStyle = `rgba(255, 0, 0, ${alfa})`;
    g.lineWidth = tebal;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * panjang, y + Math.sin(a) * panjang);
    g.stroke();
  };
  for (let n = 0; n < 70; n++) gores(ukuran * (0.008 + acak() * 0.035), 0.2 + acak() * 0.4, 0.5 + acak() * 0.4);
  for (let n = 0; n < 4; n++) gores(ukuran * (0.15 + acak() * 0.25), 0.15 + acak() * 0.2, 0.7);
  for (let n = 0; n < 4; n++) {
    const cx = acak() * ukuran;
    const cy = acak() * ukuran;
    for (let k = 0; k < 14; k++) {
      const r = ukuran * (0.05 + acak() * 0.12);
      const awal = acak() * Math.PI * 2;
      g.strokeStyle = `rgba(255, 0, 0, ${0.1 + acak() * 0.15})`;
      g.lineWidth = 0.6;
      g.beginPath();
      g.arc(cx, cy, r, awal, awal + 0.3 + acak() * 0.6);
      g.stroke();
    }
  }
  for (let n = 0; n < 26; n++) {
    const x = acak() * ukuran;
    const y = acak() * ukuran;
    const r = ukuran * (0.03 + acak() * 0.08);
    const noda = g.createRadialGradient(x, y, 0, x, y, r);
    noda.addColorStop(0, `rgba(0, 255, 0, ${0.15 + acak() * 0.2})`);
    noda.addColorStop(1, "rgba(0, 255, 0, 0)");
    g.fillStyle = noda;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return c;
}

// Sisipan belakang kotak, digelar datar: punggung 6,5 mm, panel 138 mm, punggung
// 6,5 mm (tinggi 118 mm). Seperti sisi belakang CD, "daftar lagu"-nya adalah
// komponen sistem, ditambah ringkasan dan nomor katalog. Kedua punggung memuat
// nomor katalog dan judul, terbaca dari atas ke bawah.
export const SISIPAN = { panel: 138, punggung: 6.5, tinggi: 118 };

// Terang rata-rata (0..1) satu kotak kanvas, untuk memilih tinta gelap atau terang.
function terang(g, x, y, w, h) {
  const d = g.getImageData(x, y, Math.max(1, w), Math.max(1, h)).data;
  let t = 0;
  for (let i = 0; i < d.length; i += 4) t += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return t / (d.length / 4) / 255;
}

// Sisipan album: gambar belakang dicetak di panel, punggung berwarna tinta album
// dengan judul berhuruf genre. "Daftar lagu" (komponen sistem) dicetak langsung di
// pita bawah gambar yang sengaja dibiarkan polos, tanpa kotak tambahan.
function gambarSisipanAlbum(p, a, locale, w) {
  const total = SISIPAN.panel + SISIPAN.punggung * 2;
  const h = Math.round((w * SISIPAN.tinggi) / total);
  const [c, g] = kanvas(w, h);
  const pg = Math.round((w * SISIPAN.punggung) / total);
  const lebarPanel = w - pg * 2;
  siapkanAlbum(c, a.belakang, a, (im) => {
    g.fillStyle = KERTAS;
    g.fillRect(0, 0, w, h);
    if (im) {
      g.save();
      g.beginPath();
      g.rect(pg, 0, lebarPanel, h);
      g.clip();
      gambarPenuh(g, im, pg, 0, lebarPanel, h);
      g.restore();
    }
    g.fillStyle = a.tinta;
    g.fillRect(0, 0, pg, h);
    g.fillRect(w - pg, 0, pg, h);
    for (const x of [pg / 2, w - pg / 2]) {
      g.save();
      g.translate(x, h / 2);
      g.rotate(Math.PI / 2);
      g.fillStyle = "#f4efe7";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `${a.huruf.berat ?? 400} ${pg * 0.5}px ${namaHuruf(a.huruf)}`;
      g.fillText(p.judul[locale], 0, 0);
      g.font = `500 ${pg * 0.36}px ${fontMono()}`;
      g.fillText(p.katalog, -h * 0.4, 0);
      g.restore();
    }
    if (!im) return;
    // Pita bawah gambar: 22% tinggi terbawah panel.
    const s = lebarPanel / 512;
    const atas = h * 0.78;
    const gelap = terang(g, pg, Math.round(atas), lebarPanel, Math.round(h * 0.2)) < 0.45;
    const tinta = gelap ? "#f4efe7" : a.tinta;
    g.fillStyle = tinta;
    g.textBaseline = "top";
    const lagu = p.arsitektur?.simpul ?? [];
    g.font = `400 ${10 * s}px ${fontMono()}`;
    const kolom = Math.ceil(lagu.length / 2) || 1;
    lagu.forEach((n, i) => {
      const x = pg + 22 * s + Math.floor(i / kolom) * 150 * s;
      const y = atas + 10 * s + (i % kolom) * 15 * s;
      g.fillText(`${String(i + 1).padStart(2, "0")}  ${n.label}`, x, y);
    });
    // Barcode hiasan dengan nomor katalog, bukan kode produk sungguhan.
    for (let i = 0; i < 30; i++) {
      const lebarBatang = (i * 7) % 3 === 0 ? 3 : 1.5;
      g.fillRect(pg + 400 * s + i * 2.6 * s, atas + 8 * s, lebarBatang * s * 0.6, 26 * s);
    }
    g.font = `400 ${8 * s}px ${fontMono()}`;
    g.fillText(p.katalog, pg + 400 * s, atas + 38 * s);
    butir(g, w, h, 0.05);
  });
  return c;
}

export function gambarSisipan(p, locale, w = 1024) {
  const a = albumUntuk(p.slug);
  if (a) return gambarSisipanAlbum(p, a, locale, w);
  const total = SISIPAN.panel + SISIPAN.punggung * 2;
  const h = Math.round((w * SISIPAN.tinggi) / total);
  const [c, g] = kanvas(w, h);
  const pg = Math.round((w * SISIPAN.punggung) / total);
  g.fillStyle = "#e9e3d8";
  g.fillRect(0, 0, w, h);
  g.fillStyle = p.warna;
  g.fillRect(0, 0, pg, h);
  g.fillRect(w - pg, 0, pg, h);
  for (const x of [pg / 2, w - pg / 2]) {
    g.save();
    g.translate(x, h / 2);
    g.rotate(Math.PI / 2);
    g.fillStyle = "#f4efe7";
    g.font = `500 ${pg * 0.42}px ${fontMono()}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(`${p.katalog}   ${p.judul[locale]}`.toUpperCase(), 0, 0);
    g.restore();
  }
  // Isi panel di ruang 512 satuan selebar panel, digeser masuk setelah punggung kiri.
  const s = (w - pg * 2) / 512;
  g.save();
  g.translate(pg - 22 * s, 0);
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
  g.restore();
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

// Gambar dari luar (sampul Spotify) dicetak ulang supaya senada dengan CD lain dan tidak
// mengilap seperti layar: warna sedikit pudar dan hitam terangkat ke warna kertas, raster
// titik 45 derajat yang samar, lalu butir. Acaknya berbenih, jadi hasilnya tetap.
// `im` boleh gambar atau kanvas yang sudah termuat (dan lolos CORS).
export function cetakKertas(im, { ukuran = 1024, benih = 7, butir: kuatButir = 0.07, raster = 0.22, pudar = 0.16 } = {}) {
  const [c, g] = kanvas(ukuran, ukuran);
  const lw = im.naturalWidth || im.width;
  const lh = im.naturalHeight || im.height;
  const sk = Math.max(ukuran / lw, ukuran / lh);
  g.imageSmoothingQuality = "high";
  g.drawImage(im, (ukuran - lw * sk) / 2, (ukuran - lh * sk) / 2, lw * sk, lh * sk);

  const d = g.getImageData(0, 0, ukuran, ukuran);
  const px = d.data;
  let s = benih >>> 0;
  const acak = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  // Warna kertas (#efe9df) yang terlihat di sela tinta.
  const kr = 239;
  const kg = 233;
  const kb = 223;
  const sel = ukuran / 150;
  const k = Math.SQRT1_2 / sel;
  for (let y = 0; y < ukuran; y++) {
    for (let x = 0; x < ukuran; x++) {
      const i = (y * ukuran + x) * 4;
      let r = px[i];
      let gg = px[i + 1];
      let b = px[i + 2];
      const l = 0.299 * r + 0.587 * gg + 0.114 * b;
      // Pudar: saturasi turun, lalu dicampur sedikit ke kertas (hitam jadi abu-abu hangat).
      r += (l - r) * pudar;
      gg += (l - gg) * pudar;
      b += (l - b) * pudar;
      r = r * (1 - pudar * 0.55) + kr * pudar * 0.55;
      gg = gg * (1 - pudar * 0.55) + kg * pudar * 0.55;
      b = b * (1 - pudar * 0.55) + kb * pudar * 0.55;
      // Raster: titik tinta tumbuh di bidang gelap; di luar titik kertasnya sedikit tampak.
      const u = (x + y) * k;
      const v = (x - y) * k;
      const pola = (Math.cos(u * 2 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 0.25 + 0.5;
      const tinta = 1 - l / 255;
      const f = tinta > pola ? 1 - raster * 0.45 : 1 + raster * 0.3;
      const n = (acak() - 0.5) * 2 * kuatButir * 255;
      px[i] = r * f + n;
      px[i + 1] = gg * f + n;
      px[i + 2] = b * f + n;
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Warna rata-rata gambar, digelapkan sedikit, untuk pita sampul dan cakram.
export function warnaRata(c, gelap = 0.72) {
  const [k, g] = kanvas(8, 8);
  g.drawImage(c, 0, 0, 8, 8);
  const px = g.getImageData(0, 0, 8, 8).data;
  let r = 0;
  let gg = 0;
  let b = 0;
  for (let i = 0; i < px.length; i += 4) {
    r += px[i];
    gg += px[i + 1];
    b += px[i + 2];
  }
  const n = px.length / 4;
  const hex = (v) => Math.round((v / n) * gelap).toString(16).padStart(2, "0");
  k.width = 0;
  return `#${hex(r)}${hex(gg)}${hex(b)}`;
}
