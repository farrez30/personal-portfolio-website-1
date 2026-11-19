// Sketsa storyboard cerita v5: empat arah narasi, sebelas panel per arah (sepuluh babak plus
// penutup). Garis tangan sederhana di SVG, objek persisten tiap arah digambar merah.
//   node desain/cerita-v5/pratinjau/sketsa.mjs   lalu potret papan-*.html dengan Chrome headless
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PULAU, KOTA } from "../peta.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const INK = "#ece8e1", DIM = "#847e75", RED = "#e0574b", AMB = "#f0b35a";

// ---------- primitif ----------
const p = (d, o = {}) => `<path d="${d}" fill="${o.fill ?? "none"}" stroke="${o.c ?? INK}" stroke-width="${o.w ?? 2}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.op ? ` opacity="${o.op}"` : ""}/>`;
const r = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 2}" fill="${o.fill ?? "none"}" stroke="${o.c ?? INK}" stroke-width="${o.w ?? 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.op ? ` opacity="${o.op}"` : ""}/>`;
const c = (x, y, rad, o = {}) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${o.fill ?? "none"}" stroke="${o.c ?? INK}" stroke-width="${o.w ?? 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.op ? ` opacity="${o.op}"` : ""}/>`;
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.c ?? DIM}" font-size="${o.size ?? 11}" font-family="IBM Plex Mono, monospace" text-anchor="${o.a ?? "middle"}">${s}</text>`;
const g = (x, y, s, isi, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${isi}</g>`;
const tanah = (y = 205) => p(`M10 ${y} H390`, { c: DIM, w: 1.5 });

const nota = (x, y, rot = 0, m = false, s = 1) => g(x, y, s, r(-10, -14, 20, 28, { c: m ? RED : INK, fill: m ? "rgba(224,87,75,.12)" : "none" }) + p("M-6 -7 H6 M-6 -1 H6 M-6 5 H2", { c: m ? RED : DIM, w: 1.5 }), rot);
const hp = (x, y, s = 1, m = false) => g(x, y, s, r(-12, -22, 24, 44, { rx: 4, c: m ? RED : INK }) + p("M-6 -10 H6 M-6 -4 H6 M-6 2 H3", { c: DIM, w: 1.5 }) + c(0, 16, 1.5, { w: 1.5 }));
const laptop = (x, y, s = 1) => g(x, y, s, r(-26, -34, 52, 34, { rx: 2 }) + p("M-34 2 H34 L28 -2 H-28 Z") + p("M-18 -24 H10 M-18 -16 H18 M-18 -8 H4", { c: DIM, w: 1.5 }));
const chat = (x, y, s = 1) => g(x, y, s, p("M-22 -16 H22 Q26 -16 26 -12 V6 Q26 10 22 10 H-8 L-16 18 L-14 10 H-22 Q-26 10 -26 6 V-12 Q-26 -16 -22 -16 Z") + p("M-16 -6 H16 M-16 1 H8", { c: DIM, w: 1.5 }));
const orang = (x, y, s = 1, col = INK) => g(x, y, s, c(0, -38, 8, { c: col }) + p("M-16 0 Q-16 -26 0 -26 Q16 -26 16 0", { c: col }));
const meja = (x, y, w) => p(`M${x} ${y} H${x + w} M${x + 8} ${y} V${y + 40} M${x + w - 8} ${y} V${y + 40}`);
const papanJepit = (x, y, s = 1, m = false) => g(x, y, s, r(-20, -26, 40, 52, { c: m ? RED : INK }) + r(-8, -30, 16, 7, { fill: "#1a1410" }) + p("M-12 -12 H12 M-12 -4 H12 M-12 4 H12 M-12 12 H4", { c: m ? RED : DIM, w: 1.5 }) + p("M-12 -12 l2 2 l4 -4 M-12 -4 l2 2 l4 -4", { c: m ? RED : INK, w: 1.5 }));
const stempel = (x, y, s = 1) => g(x, y, s, p("M-6 -22 H6 V-10 H-6 Z M-12 -10 H12 V-2 H-12 Z") + c(0, -26, 5));
const toko = (x, y, w = 120, h = 80, gelap = false) => p(`M${x} ${y} V${y - h} H${x + w} V${y}`) + p(`M${x - 6} ${y - h + 4} H${x + w + 6} L${x + w} ${y - h + 20} H${x} Z`) + Array.from({ length: 6 }, (_, i) => p(`M${x + (i * w) / 6} ${y - h + 4} L${x + (i * w) / 6 + 4} ${y - h + 20}`, { c: DIM, w: 1 })).join("") + r(x + 10, y - h + 30, w * 0.45, h * 0.4, { fill: gelap ? "#0d0a08" : "rgba(240,179,90,.15)", c: INK }) + r(x + w * 0.65, y - h + 30, w * 0.25, h - 30, {});
const gudang = (x, y, w = 90, h = 50) => p(`M${x} ${y} V${y - h} L${x + w / 2} ${y - h - 20} L${x + w} ${y - h} V${y}`) + r(x + w * 0.3, y - h * 0.7, w * 0.4, h * 0.7, {}) + p(`M${x + w * 0.3} ${y - h * 0.45} H${x + w * 0.7} M${x + w * 0.3} ${y - h * 0.2} H${x + w * 0.7}`, { c: DIM, w: 1 });
const ruko = (x, y, w = 70, lantai = 2, o = {}) => { let s = ""; const lh = 40; for (let i = 0; i < lantai; i++) s += r(x, y - lh * (i + 1), w, lh, { rx: 0, dash: o.dashAtas && i === lantai - 1 ? "5 5" : undefined, c: o.dashAtas && i === lantai - 1 ? DIM : INK }) + r(x + 10, y - lh * (i + 1) + 10, w - 20, 16, { rx: 0, c: DIM, w: 1.5 }); return s; };
const kota = (x, y, cols, rows, sz, gap = 6, m = []) => { let s = ""; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = m.some(([a, b]) => a === i && b === j); s += r(x + i * (sz + gap), y + j * (sz + gap), sz, sz, { rx: 1, w: 1.5, c: on ? RED : DIM, fill: on ? "rgba(224,87,75,.25)" : "none" }); } return s; };
const titik = (pts, col = RED, rad = 3) => pts.map(([x, y]) => c(x, y, rad, { c: col, fill: col, w: 1 })).join("");
const garisMerah = (d, o = {}) => p(d, { c: RED, w: o.w ?? 2.5, dash: o.dash });
const kunci = (x, y, s = 1, col = INK) => g(x, y, s, c(0, -6, 5, { c: col }) + p("M0 -1 V10 M0 6 H4 M0 10 H3", { c: col }));
const gembok = (x, y, s = 1, col = INK) => g(x, y, s, r(-7, -6, 14, 12, { rx: 2, c: col }) + p("M-4 -6 V-10 Q0 -15 4 -10 V-6", { c: col }));
const tiang = (x, y, h = 90) => p(`M${x} ${y} V${y - h} M${x - 14} ${y - h + 8} H${x + 14} M${x - 10} ${y - h + 18} H${x + 10}`);
const gardu = (x, y) => r(x, y - 36, 44, 36, { rx: 1 }) + p(`M${x + 16} ${y - 28} l-6 10 h8 l-6 10`, { c: AMB, w: 1.5 });
const pembangkit = (x, y) => p(`M${x} ${y} L${x + 8} ${y - 60} Q${x + 18} ${y - 66} ${x + 28} ${y - 60} L${x + 36} ${y}`) + p(`M${x + 50} ${y} V${y - 40} H${x + 90} V${y}`) + p(`M${x + 14} ${y - 70} q6 -10 0 -18 q-6 -8 2 -16`, { c: DIM, w: 1.5 });
const lampu = (x, y, nyala = true, col = AMB) => p(`M${x} ${y - 30} V${y - 14}`, { c: DIM, w: 1.5 }) + c(x, y - 8, 6, { c: nyala ? col : DIM, fill: nyala ? "rgba(240,179,90,.35)" : "none" });
const toren = (x, y) => r(x, y - 36, 30, 36, { rx: 6 }) + p(`M${x} ${y - 26} H${x + 30}`, { c: DIM, w: 1.5 }) + p(`M${x + 15} ${y} V${y + 20}`);
const genset = (x, y) => r(x, y - 26, 46, 26, { rx: 3 }) + p(`M${x + 6} ${y - 18} H${x + 22} M${x + 6} ${y - 10} H${x + 22}`, { c: DIM, w: 1.5 }) + c(x + 35, y - 13, 6, { c: AMB });
const mcb = (x, y, n = 4, labels = []) => r(x, y, 26 * n + 8, 52, { rx: 2 }) + Array.from({ length: n }, (_, i) => r(x + 6 + i * 26, y + 8, 18, 26, { rx: 1, w: 1.5 }) + (labels[i] ? t(x + 15 + i * 26, y + 46, labels[i], { size: 7 }) : "")).join("");
const truk = (x, y, s = 1) => g(x, y, s, r(-40, -34, 50, 28, { rx: 1 }) + p("M10 -24 H26 L34 -14 V-6 H10 Z") + c(-26, -2, 6) + c(22, -2, 6));
const motor = (x, y, s = 1) => g(x, y, s, c(-16, -6, 7) + c(16, -6, 7) + p("M-16 -6 L-4 -18 H8 L16 -6 M8 -18 L12 -26 H16"));
const pikap = (x, y, s = 1) => g(x, y, s, p("M-34 -8 V-22 H2 V-32 H18 L28 -22 V-8 Z") + c(-20, -4, 6) + c(16, -4, 6));
const paket = (x, y, s = 1, m = true) => g(x, y, s, p("M-14 -6 L0 -14 L14 -6 V10 L0 18 L-14 10 Z M-14 -6 L0 2 L14 -6 M0 2 V18", { c: m ? RED : INK, fill: m ? "rgba(224,87,75,.14)" : "none" }));
const kapal = (x, y, s = 1) => g(x, y, s, p("M-40 -6 H40 L30 8 H-30 Z M-24 -6 V-20 H6 V-6 M10 -6 V-14 H24 V-6"));
const pesawat = (x, y, s = 1) => g(x, y, s, p("M-20 0 H20 M4 0 L-6 -12 M4 0 L-6 12 M-16 0 L-20 -6"));
const satelit = (x, y, s = 1, col = INK) => g(x, y, s, r(-5, -5, 10, 10, { rx: 1, c: col }) + r(-22, -3, 14, 6, { rx: 0, c: col, w: 1.5 }) + r(8, -3, 14, 6, { rx: 0, c: col, w: 1.5 }));
const bts = (x, y, h = 70) => p(`M${x - 12} ${y} L${x} ${y - h} L${x + 12} ${y} M${x - 8} ${y - h * 0.3} H${x + 8} M${x - 4} ${y - h * 0.65} H${x + 4}`) + p(`M${x + 8} ${y - h - 4} q8 4 0 12 M${x + 14} ${y - h - 10} q14 10 0 24`, { c: DIM, w: 1.5 });
// Peta Nusantara dari titik bujur/lintang kasar (Natural Earth dipakai nanti saat build).
const LL = (lon, lat) => [(lon - 118) * 6, -(lat + 2) * 6];
const nusantara = (cx, cy, s = 1, col = DIM) => g(cx, cy, s, PULAU.map((pts) => p("M" + pts.map((q) => LL(...q).join(" ")).join(" L") + " Z", { c: col, w: 1.5 / s, fill: "rgba(236,232,225,.05)" })).join(""));
const kotaXY = (cx, cy, s, nama) => { const [x, y] = LL(...KOTA[nama]); return [cx + x * s, cy + y * s]; };
const jaringKota = (cx, cy, s, pusat, ke, col = RED, o = {}) => { const [x0, y0] = kotaXY(cx, cy, s, pusat); return ke.map((n) => { const [x, y] = kotaXY(cx, cy, s, n); return garisMerah(`M${x0} ${y0} Q${(x0 + x) / 2} ${Math.min(y0, y) - 18} ${x} ${y}`, { w: 1.5, dash: o.dash }); }).join("") + titik([[x0, y0], ...ke.map((n) => kotaXY(cx, cy, s, n))], col, o.rad ?? 3); };
const globe = (cx, cy, rad, o = {}) => {
  let s = c(cx, cy, rad + 8, { c: DIM, w: 1, op: 0.4 }) + c(cx, cy, rad, { c: INK, w: 1.5 });
  for (const k of [0.35, 0.7]) s += `<ellipse cx="${cx}" cy="${cy}" rx="${rad * k}" ry="${rad}" fill="none" stroke="${DIM}" stroke-width="1"/>`;
  for (const k of [-0.5, 0, 0.5]) s += `<ellipse cx="${cx}" cy="${cy + rad * k}" rx="${rad * Math.sqrt(1 - k * k)}" ry="${rad * 0.12}" fill="none" stroke="${DIM}" stroke-width="1"/>`;
  const asal = o.asal ?? [cx + rad * 0.38, cy + rad * 0.18];
  for (const [x, y, h] of o.tujuan ?? []) s += garisMerah(`M${asal[0]} ${asal[1]} Q${(asal[0] + x) / 2} ${Math.min(asal[1], y) - h} ${x} ${y}`, { w: 1.8 }) + c(x, y, 2.5, { c: RED, fill: RED, w: 1 });
  s += c(asal[0], asal[1], 4, { c: RED, fill: RED, w: 1 });
  return s;
};
const tujuanGlobe = (cx, cy, rad) => [[cx - rad * 0.5, cy - rad * 0.3, 40], [cx - rad * 0.1, cy - rad * 0.6, 30], [cx + rad * 0.7, cy - rad * 0.5, 26], [cx - rad * 0.7, cy + rad * 0.2, 36], [cx + rad * 0.15, cy + rad * 0.62, 20]];
const perisai = (x, y, s = 1, col = AMB) => g(x, y, s, p("M0 -22 L18 -14 V2 Q18 16 0 24 Q-18 16 -18 2 V-14 Z", { c: col }) + p("M-7 1 l5 5 l9 -11", { c: col }));
const server = (x, y, s = 1, col = INK) => g(x, y, s, [0, 1, 2].map((i) => r(-22, -36 + i * 16, 44, 14, { rx: 1, c: col, w: 1.5 }) + c(-14, -29 + i * 16, 2, { c: AMB, fill: AMB, w: 1 })).join(""));
const timbangan = (x, y, s = 1, miring = 0) => g(x, y, s, p("M0 -40 V20 M-20 20 H20") + g(0, -40, 1, p("M-44 0 H44") + p("M-44 0 L-54 18 H-34 Z M44 0 L34 18 H54 Z", { c: DIM }), miring));
const kotakSerah = (x, y, s = 1) => g(x, y, s, r(-34, -20, 68, 40, { rx: 2, c: RED }) + p("M-34 -8 H34", { c: RED, w: 1.5 }) + t(0, 3, "MILIK ATAU LISENSI", { size: 5.5, c: INK }) + t(0, 13, "DATA TETAP ANDA", { size: 5.5, c: AMB }));
const antreanTitik = (x0, y0, n, col = DIM) => Array.from({ length: n }, (_, i) => c(x0 + (i % 12) * 12, y0 + Math.floor(i / 12) * 12, 3, { c: col, fill: col, w: 1 })).join("");
const matahari = (x, y, rad = 12, col = AMB) => c(x, y, rad, { c: col }) + Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return p(`M${x + Math.cos(a) * (rad + 4)} ${y + Math.sin(a) * (rad + 4)} L${x + Math.cos(a) * (rad + 9)} ${y + Math.sin(a) * (rad + 9)}`, { c: col, w: 1.5 }); }).join("");
const bulan = (x, y) => p(`M${x} ${y - 12} A12 12 0 1 0 ${x + 9} ${y + 8} A9 9 0 1 1 ${x} ${y - 12} Z`, { c: AMB });
const zoomBingkai = (x, y, w, h) => r(x, y, w, h, { c: RED, w: 1.5, dash: "4 4", rx: 0 });

// ---------- empat arah ----------
const G = (cx = 200, cy = 118, rad = 78) => globe(cx, cy, rad, { tujuan: tujuanGlobe(cx, cy, rad) });

const ARAH = [
  {
    kode: "A",
    nama: "Satu nota, dari laci kasir sampai Nusantara",
    inti: "Usaha pembaca sendiri, apa adanya. Kamera selalu berada di toko klien, bukan di meja developer.",
    objek: "Satu nota merah: keluhan yang ditulis di nota, lalu jadi daftar kebutuhan, layar, dan akhirnya satu titik data yang menyala di peta.",
    panel: [
      ["40 cm", "Meja kasir dari atas. Nota berserakan, satu nota merah berisi keluhan.", "Dekat, menunduk ke meja", meja(60, 170, 280) + nota(120, 140, -12) + nota(160, 150, 8) + nota(250, 142, 18) + nota(205, 128, -4, true, 1.4) + r(285, 120, 34, 44, { rx: 3 }) + p("M292 130 H312 M292 140 h6 m4 0 h6 m4 0 h6 M292 150 h6 m4 0 h6 m4 0 h6", { c: DIM, w: 1.5 })],
      ["40 cm", "Nota merah membuka dan berubah jadi daftar kebutuhan di papan jepit. Tangan pemilik memberi paraf.", "Turun mendekat ke papan", meja(60, 180, 280) + papanJepit(200, 120, 1.7, true) + stempel(300, 168) + p("M150 170 q20 -24 40 -40", { c: INK }) + p("M186 132 l10 -6", { c: RED, w: 2.5 })],
      ["1 m", "Dari papan, tiga garis merah memancar ke HP sales, laptop admin, dan chat pesanan.", "Mundur sedikit, tiga benda masuk bingkai", nota(200, 70, 0, true, 1.2) + garisMerah("M200 88 L90 150 M200 88 L200 140 M200 88 L310 150") + hp(90, 172, 1.2) + laptop(200, 188, 1.1) + chat(310, 170, 1.1)],
      ["1 m", "Kamera turun ke bawah meja kasir: kabel rapi berlabel, router, dan buku catatan cara kerja.", "Rendah, dari kolong meja", p("M40 60 H360", { w: 3 }) + p("M60 60 V200 M340 60 V200") + r(110, 150, 70, 26, { rx: 3 }) + c(124, 163, 3, { c: AMB, fill: AMB }) + c(136, 163, 3, { c: AMB, fill: AMB }) + garisMerah("M145 150 V90 H300 V60") + p("M160 150 V100 H290 V60 M170 150 V110 H280 V60", { c: DIM, w: 1.5 }) + r(220, 150, 60, 44, { rx: 2 }) + p("M228 162 H272 M228 172 H272 M228 182 H260", { c: DIM, w: 1.5 }) + t(250, 210, "CARA KERJA", { size: 8 })],
      ["1 m", "Pemilik memegang HP berisi rancangan layar. Sketsa kertas di belakang, bagian yang kurang pas dicoret.", "Dari balik bahu pemilik", r(70, 50, 110, 80, { rx: 0, c: DIM }) + p("M82 66 H150 M82 80 H130 M82 94 H160", { c: DIM, w: 1.5 }) + p("M120 74 l30 26 M150 74 l-30 26", { c: RED, w: 2 }) + orang(250, 205, 2.2) + hp(230, 140, 1.4, true)],
      ["3 m", "Dinding toko: papan kabar dengan kolom sudah jadi dan belum. Di HP masuk kabar mingguan.", "Mundur, dinding toko terlihat", r(70, 50, 200, 120, { rx: 0 }) + p("M170 50 V170", { c: DIM, w: 1.5 }) + t(120, 68, "SUDAH JADI", { size: 9 }) + t(220, 68, "BELUM", { size: 9 }) + [86, 108, 130].map((y) => r(90, y, 60, 14, { rx: 1, w: 1.5 })).join("") + r(190, 86, 60, 14, { rx: 1, w: 1.5, c: RED }) + hp(320, 140, 1.3) + c(330, 112, 5, { c: RED, fill: RED })],
      ["5 m", "Kasir sungguhan mencoba. Pembeli antre, transaksi lancar, satu langkah yang membingungkan dipangkas.", "Lebar, dari sisi meja kasir", meja(70, 150, 120) + laptop(130, 148, 0.8) + orang(100, 150, 1.4) + orang(240, 205, 1.4, DIM) + orang(290, 205, 1.4, DIM) + orang(340, 205, 1.4, DIM) + tanah()],
      ["10 m", "Toko dari depan, malam. Listrik padam, jendela gelap, layar kasir tetap menyala. Lampu kembali, data menyusul.", "Dari seberang jalan", tanah() + toko(120, 205, 160, 120, true) + r(150, 130, 22, 14, { rx: 1, c: AMB, fill: "rgba(240,179,90,.5)" }) + p("M300 70 a14 14 0 1 1 -4 -10 m4 -4 v6 h-6", { c: RED, w: 2 }) + t(320, 104, "SINKRON", { size: 8, c: RED })],
      ["100 m", "Toko, gudang, dan kantor pemilik tersambung. Tiap pintu punya kunci sesuai peran. Cabang kedua muncul putus-putus.", "Naik ke atas atap", tanah(190) + toko(30, 190, 90, 60) + gudang(160, 190, 80, 44) + ruko(280, 190, 60, 2) + garisMerah("M75 120 Q140 90 200 116 Q250 90 310 100") + gembok(75, 158, 1, AMB) + gembok(200, 160, 1, AMB) + gembok(310, 168, 1, AMB) + t(75, 206, "KASIR", { size: 8 }) + t(200, 206, "GUDANG", { size: 8 }) + t(310, 206, "PEMILIK", { size: 8 }) + r(350, 150, 36, 40, { rx: 0, dash: "4 4", c: DIM })],
      ["1.000 km", "Zoom out bertahap: blok kota, lalu peta Nusantara. Titik cabang dan distributor menyala, tersambung garis merah.", "Terbang naik, kamera tegak lurus", nusantara(210, 110, 1.1) + jaringKota(210, 110, 1.1, "jakarta", ["medan", "surabaya", "pontianak", "balikpapan", "makassar", "denpasar", "jayapura"])],
      ["36.000 km", "Penutup: globe. Garis dari Indonesia menjangkau banyak tempat, satelit mengorbit dan memantulkan sinyal ke titik-titik itu. Paling akhir, kamera masuk ke rak koleksi proyek.", "Zoom out penuh sampai orbit satelit, globe berputar pelan", G() + `<ellipse cx="200" cy="118" rx="140" ry="36" fill="none" stroke="${DIM}" stroke-width="1" stroke-dasharray="3 5" transform="rotate(-12 200 118)"/>` + `<ellipse cx="200" cy="118" rx="120" ry="58" fill="none" stroke="${DIM}" stroke-width="1" stroke-dasharray="3 5" transform="rotate(24 200 118)"/>` + satelit(328, 92, 0.9, RED) + satelit(78, 146, 0.8) + satelit(262, 196, 0.7) + p("M328 92 L230 132 M328 92 L161 95", { c: RED, w: 1, dash: "2 4" })],
    ],
  },
  {
    kode: "B",
    nama: "Ruko yang tumbuh jadi kota",
    inti: "Membangun tempat usaha: denah, fondasi, maket, serah kunci. Setelah jadi, kamera naik dan ruko itu tersambung ke listrik, air, jalan, dan sinyal kota.",
    objek: "Satu kabel merah dari meteran ruko: tersembunyi di dinding saat fondasi, lalu menyambung ke gardu, kota, dan kabel bawah laut.",
    panel: [
      ["6 m", "Ruko lama yang sesak: dus menumpuk sampai ke pintu, pemilik sulit lewat.", "Dari trotoar depan", tanah() + ruko(120, 205, 160, 2) + [0, 1, 2, 3].map((i) => r(140 + i * 26, 181 - (i % 2) * 22, 24, 22, { rx: 0, c: DIM, w: 1.5 })).join("") + r(250, 160, 24, 22, { rx: 0, c: DIM, w: 1.5 }) + orang(320, 205, 1.3)],
      ["50 cm", "Denah di atas meja. Pemilik membaca, lalu stempel turun: setuju.", "Dari atas meja, menunduk", r(80, 50, 240, 140, { rx: 0 }) + p("M80 120 H200 V50 M200 120 V190 M260 120 H320", { c: DIM, w: 1.5 }) + t(140, 90, "KASIR", { size: 9 }) + t(260, 90, "GUDANG", { size: 9 }) + t(140, 160, "KANTOR", { size: 9 }) + c(270, 160, 22, { c: RED, w: 2.5 }) + t(270, 164, "OK", { size: 11, c: RED })],
      ["30 m", "Tiga pilihan bangunan berjajar: kios, ruko, gudang. Yang cocok dengan usahanya disorot.", "Lebar, menyamping", tanah() + r(40, 165, 60, 40, { rx: 0, c: DIM }) + ruko(160, 205, 80, 2) + gudang(290, 205, 80, 50) + r(150, 115, 100, 100, { rx: 0, c: RED, dash: "5 4", w: 1.5 }) + t(70, 225, "KIOS", { size: 8 }) + t(200, 225, "RUKO", { size: 8 }) + t(330, 225, "GUDANG", { size: 8 })],
      ["2 m", "Potongan dinding: fondasi, pipa, dan kabel merah berlabel. Bagian yang nanti tertutup tetap rapi.", "Tembus dinding, dari samping", p("M100 40 V190 H300 V40", { w: 3 }) + r(80, 190, 240, 22, { rx: 0, c: DIM }) + garisMerah("M140 50 V170 H250 V120") + p("M180 50 V190 M200 50 V190", { c: DIM, w: 3 }) + r(240, 100, 22, 22, { rx: 2 }) + t(150, 70, "L1", { size: 8, c: RED, a: "start" })],
      ["50 cm", "Maket ruko di meja. Tangan pemilik membuka pintu maket dan mencoba alurnya sebelum bata pertama dipasang.", "Dekat, setinggi maket", meja(60, 180, 280) + ruko(150, 180, 100, 2) + p("M230 150 q20 -10 40 0", { c: INK }) + p("M150 100 L200 80 L250 100", { c: DIM, w: 1.5 })],
      ["10 m", "Papan proyek di depan bangunan dan foto mingguan dari mandor di HP: mana yang sudah, mana yang belum.", "Dari depan pagar proyek", tanah() + p("M60 205 V80 H220 V205 M60 120 H220 M60 160 H220", { c: DIM, w: 1.5 }) + r(80, 60, 120, 40, { rx: 0 }) + t(140, 84, "MINGGU 6 DARI 9", { size: 8, c: INK }) + hp(300, 140, 1.4) + r(290, 124, 20, 14, { rx: 1, c: RED, w: 1.5 })],
      ["3 m", "Serah kunci. Penghuni mencoba saklar dan keran. Yang masih janggal dicatat dan dibetulkan.", "Setinggi mata, di ambang pintu", r(80, 50, 90, 155, { rx: 0 }) + kunci(220, 120, 2.5, AMB) + orang(300, 205, 1.6) + p("M260 140 l20 -8", { c: INK }) + tanah()],
      ["20 m", "Kompleks padam. Ruko ini punya toren dan genset, lampunya tetap menyala.", "Malam, dari ujung jalan", tanah() + ruko(30, 205, 70, 2) + ruko(280, 205, 70, 2) + ruko(150, 205, 90, 2) + toren(180, 106) + genset(250, 205) + lampu(195, 150, true) + lampu(215, 150, true) + lampu(65, 150, false) + lampu(315, 150, false)],
      ["6 m", "Potongan ruko: kunci berbeda per ruang (kasir, gudang, pemilik). Lantai tambahan sudah disiapkan, garis putus-putus.", "Potongan depan", tanah() + ruko(120, 205, 160, 3, { dashAtas: true }) + gembok(160, 190, 1, AMB) + gembok(240, 190, 1, AMB) + gembok(200, 150, 1, AMB) + t(160, 220, "KASIR", { size: 8 }) + t(240, 220, "GUDANG", { size: 8 }) + t(320, 150, "PEMILIK", { size: 8, a: "start" }) + t(320, 100, "TUMBUH", { size: 8, a: "start" })],
      ["2 km", "Kamera naik: ruko di blok kota. Kabel merah menyambung ke gardu, jalan, dan menara sinyal, lalu blok demi blok menyala.", "Terbang naik, miring 45 derajat", kota(70, 40, 8, 5, 22, 10, [[3, 2], [5, 1], [1, 3], [6, 4]]) + garisMerah("M137 112 H201 V80 M137 112 V144 H105 M201 80 H233 M201 80 V176 H265", { w: 2 })],
      ["10.000 km", "Penutup: pulau, lalu globe. Kabel bawah laut dan garis sinyal menyambung kota itu ke banyak tempat.", "Zoom out penuh", G()],
    ],
  },
  {
    kode: "C",
    nama: "Dari stopkontak sampai satelit",
    inti: "Listrik dan sinyal di toko. Masalah dimulai dari colokan yang ruwet, berakhir dengan peta lampu malam Nusantara dan satelit di atasnya. Paling dekat dengan ide awal Farrez.",
    objek: "Satu pulsa cahaya merah yang mengalir di kabel: dari stopkontak, panel, gardu, pembangkit, sampai lintasan satelit.",
    panel: [
      ["40 cm", "Stopkontak penuh colokan bertumpuk, kabel ruwet, lampu toko berkedip.", "Dekat, setinggi stopkontak", r(150, 70, 100, 70, { rx: 6 }) + c(180, 105, 10) + c(220, 105, 10) + p("M180 115 Q160 170 90 180 M220 115 Q240 160 310 190 M175 118 Q200 190 130 210 M225 118 Q260 140 340 150", { c: DIM, w: 2 }) + garisMerah("M200 70 V40") + lampu(200, 40, true)],
      ["50 cm", "Gambar instalasi di meja: titik lampu, colokan, dan jalur kabel tiap ruang. Pemilik menyetujui.", "Dari atas meja", r(80, 50, 240, 140, { rx: 0 }) + p("M80 120 H320 M200 50 V190", { c: DIM, w: 1.5 }) + [[120, 80], [270, 80], [120, 160], [270, 160]].map(([x, y]) => c(x, y, 6)).join("") + garisMerah("M120 80 H270 V160 H120 Z", { dash: "6 4", w: 1.8 }) + stempel(300, 182)],
      ["1 m", "Tiga alat dicolok: HP, laptop, dan mesin kasir. Dayanya disesuaikan dengan kebutuhan masing-masing alat.", "Setinggi meja", meja(50, 190, 300) + hp(100, 170, 1) + laptop(200, 188, 1) + r(280, 150, 50, 38, { rx: 3 }) + garisMerah("M100 192 V215 H300 V188 M200 190 V215")],
      ["1 m", "Dinding dibuka: kabel rapi di dalam pipa, panel MCB berlabel per ruang.", "Tembus dinding", p("M60 40 V200 M340 40 V200", { w: 3 }) + mcb(120, 60, 4, ["KASIR", "GUDANG", "KANTOR", "AC"]) + garisMerah("M137 112 V200") + p("M163 112 V200 M189 112 V200 M215 112 V200", { c: DIM, w: 3 })],
      ["50 cm", "Sebelum dipasang permanen, rangkaian diuji di papan uji. Lampu uji menyala, baru dipasang.", "Dekat, di meja kerja", meja(60, 180, 280) + r(110, 120, 180, 56, { rx: 2 }) + lampu(160, 160, true) + lampu(200, 160, true) + lampu(240, 160, true) + garisMerah("M120 170 H280")],
      ["2 m", "Meteran dan layar pantau: aliran tiap ruang terlihat, termasuk yang belum tersambung.", "Dari depan panel", r(110, 50, 180, 120, { rx: 3 }) + p("M130 140 L160 110 L190 120 L220 80 L250 90 L270 70", { c: RED, w: 2.5 }) + p("M130 150 H270", { c: DIM, w: 1 }) + t(200, 190, "KASIR  GUDANG  KANTOR", { size: 9 })],
      ["3 m", "Saklar di tempat yang pas: satu tekan di pintu, semua yang perlu langsung menyala.", "Di ambang pintu toko", r(80, 50, 90, 155, { rx: 0 }) + r(190, 110, 22, 34, { rx: 3 }) + r(196, 116, 10, 12, { rx: 1, c: RED }) + lampu(260, 90, true) + lampu(300, 90, true) + lampu(340, 90, true) + tanah()],
      ["10 m", "Listrik padam satu blok. UPS dan genset mengambil alih, layar kasir tetap menyala.", "Malam, dari seberang jalan", tanah() + toko(60, 205, 140, 110, true) + r(90, 140, 22, 14, { rx: 1, c: AMB, fill: "rgba(240,179,90,.5)" }) + genset(230, 205) + garisMerah("M230 190 H200") + tiang(330, 205) + p("M316 117 l28 28 M344 117 l-28 28", { c: DIM, w: 1.5 })],
      ["2 m", "Panel MCB terkunci per ruang. Daya bisa dinaikkan tanpa membongkar instalasi.", "Dari depan panel", mcb(100, 60, 4, ["KASIR", "GUDANG", "PEMILIK", "CADANG"]) + gembok(127, 140, 1.2, AMB) + gembok(153, 140, 1.2, AMB) + gembok(179, 140, 1.2, AMB) + r(200, 68, 18, 26, { rx: 1, w: 1.5, dash: "3 3", c: DIM }) + t(270, 178, "900 KE 2.200 VA", { size: 9 })],
      ["50 km", "Zoom out: tiang listrik, gardu, pembangkit, lalu peta lampu malam Nusantara.", "Terbang naik dari tiang ke langit", tanah(150) + tiang(60, 150, 70) + gardu(100, 150) + pembangkit(250, 150) + garisMerah("M60 88 Q90 100 120 114 M144 120 Q200 100 250 140") + nusantara(210, 200, 0.55) + titik(Object.keys(KOTA).map((n) => kotaXY(210, 200, 0.55, n)), AMB, 2.5)],
      ["36.000 km", "Penutup: globe dengan kabel bawah laut, menara sinyal, dan satelit. Pulsa merah berlari di lintasannya.", "Zoom out penuh", G() + `<ellipse cx="200" cy="118" rx="130" ry="34" fill="none" stroke="${DIM}" stroke-width="1" stroke-dasharray="3 5"/>` + satelit(320, 106, 0.9, RED) + satelit(90, 138, 0.8)],
    ],
  },
  {
    kode: "D",
    nama: "Satu paket, satu resi",
    inti: "Perjalanan satu pesanan dari chat sampai diterima. Terkuat untuk babak progres, andal, dan rilis; paling lemah di babak membangun.",
    objek: "Satu paket merah dengan resinya: dibungkus, dipindai, berpindah kendaraan, dan sampai di tangan penerima.",
    panel: [
      ["40 cm", "Chat pesanan bertumpuk di HP, alamat tertulis tangan dan salah. Satu paket merah belum jelas tujuannya.", "Dekat, dari atas meja", hp(130, 120, 2) + chat(250, 80, 0.9) + chat(270, 130, 0.9) + paket(260, 180, 1.3)],
      ["40 cm", "Label resi dicetak: isi, tujuan, penerima. Pemilik memeriksa dan menyetujui.", "Dekat ke label", paket(200, 130, 4) + r(170, 112, 60, 36, { rx: 1, fill: "#1a1410" }) + p("M178 122 H222 M178 130 H214 M178 138 H206", { c: DIM, w: 1.5 })],
      ["10 m", "Motor, pikap, truk berjajar. Kendaraan dipilih sesuai muatan, bukan yang paling besar.", "Lebar, menyamping", tanah() + motor(80, 205, 1.3) + pikap(200, 205, 1.3) + truk(320, 205, 1.3) + r(160, 150, 90, 60, { rx: 0, c: RED, dash: "5 4", w: 1.5 })],
      ["20 m", "Gudang sortir: rak berlabel, jalur ban berjalan rapi. Tidak ada paket yang tercecer.", "Dari atas rak", [0, 1, 2].map((i) => r(70, 50 + i * 50, 260, 30, { rx: 0, c: DIM })).join("") + p("M70 190 H330", { w: 3 }) + paket(200, 180, 1.2) + [100, 160, 240, 300].map((x) => paket(x, 64, 0.8, false)).join("")],
      ["1 m", "Paket contoh dikirim lebih dulu: isinya dibuka dan dicoba sebelum pengiriman besar.", "Dekat, setinggi meja", meja(60, 180, 280) + paket(160, 155, 2.2) + p("M240 150 l30 -30 l30 30", { c: DIM, w: 1.5 }) + orang(300, 180, 1.2)],
      ["peta", "Layar lacak resi: titik demi titik terlewati, kabarnya tidak putus.", "Layar HP penuh", hp(200, 120, 3.6) + p("M170 70 V170", { c: DIM, w: 1.5 }) + titik([[170, 76], [170, 100], [170, 124]], RED, 4) + c(170, 148, 4, { c: DIM }) + c(170, 170, 4, { c: DIM }) + p("M182 76 H226 M182 100 H220 M182 124 H230", { c: DIM, w: 1.5 })],
      ["1 m", "Penerima membuka paket. Isinya pas dengan yang dipesan.", "Dekat, dari depan", paket(200, 160, 2.8) + orang(200, 100, 1.4)],
      ["50 km", "Jalan utama terputus banjir. Rute cadangan dipakai, paket tetap jalan.", "Dari udara, peta", p("M40 120 H360", { c: DIM, w: 6 }) + p("M180 104 V136 M220 104 V136", { c: AMB, w: 2 }) + garisMerah("M40 120 H150 Q170 60 200 60 Q230 60 250 120 H360") + paket(200, 60, 0.8)],
      ["1 m", "Serah terima: tiap petugas memindai. Hanya penerima yang membubuhkan tanda tangan.", "Setinggi tangan", orang(110, 200, 1.6, DIM) + orang(290, 200, 1.6) + paket(200, 150, 1.8) + p("M240 120 h14 l-6 -8 m6 8 l-6 8", { c: DIM, w: 1.5 }) + gembok(320, 110, 1.2, AMB)],
      ["3.000 km", "Zoom out: rute Nusantara, truk, kapal, dan pesawat membawa paket ke banyak kota.", "Terbang naik", nusantara(210, 110, 1.1) + jaringKota(210, 110, 1.1, "surabaya", ["jakarta", "medan", "makassar", "balikpapan", "jayapura", "denpasar"], RED, { dash: "5 4" }) + kapal(250, 168, 0.5) + pesawat(300, 70, 0.8)],
      ["10.000 km", "Penutup: globe dengan rute ke seluruh dunia, lalu rak proyek.", "Zoom out penuh", G()],
    ],
  },
];

// ---------- putaran 2: alternatif dari riset keluhan pembeli dan kasus lapangan ----------
const orbitSatelit = () => `<ellipse cx="200" cy="118" rx="140" ry="36" fill="none" stroke="${DIM}" stroke-width="1" stroke-dasharray="3 5" transform="rotate(-12 200 118)"/>` + satelit(328, 92, 0.9, RED) + satelit(78, 146, 0.8) + p("M328 92 L230 132", { c: RED, w: 1, dash: "2 4" });

const ARAH2 = [
  {
    kode: "E",
    nama: "Uji tekan: satu nota melewati hari terburuk",
    inti: "Pre-mortem yang dipentaskan. Hal yang paling sering membuat sistem usaha gagal di lapangan datang satu per satu, dan di adegan yang sama penonton melihat nota itu selamat. Urutan kerja lama (rencana, fondasi, uji) masuk sebagai jawaban tiap ujian.",
    objek: "Satu nota merah dan penghitung kecil 'nota selamat' yang terus bertambah. Zoom makro hanya di adegan yang memang terjadi sekota atau senusantara.",
    panel: [
      ["40 cm", "Meja kasir, nota merah tercetak. Taruhannya disebut sekali: uang hari ini dan nama baik toko.", "Dekat, menunduk ke meja", meja(60, 170, 280) + nota(200, 132, 0, true, 1.6) + t(320, 80, "SELAMAT 1", { size: 10, c: RED }), "01 HARI BIASA", "Satu nota, satu transaksi."],
      ["2 km", "Tanggal gajian dan promo. Kamera naik ke kota, ribuan titik transaksi datang bersamaan dan antre. Nota kita tetap lolos.", "Naik dari meja ke atas kota", kota(50, 40, 10, 5, 20, 10, [[4, 2]]) + antreanTitik(70, 196, 24, AMB) + garisMerah("M150 112 V200", { dash: "4 3" }), "02 RAMAI", "Semua datang di jam yang sama."],
      ["2 km", "Listrik padam satu blok. Kota meredup, toko ini tetap mencatat. Lampu kembali, jumlahnya cocok.", "Tetap di atas kota, malam", kota(50, 40, 10, 5, 20, 10, [[4, 2]]) + r(40, 30, 160, 160, { rx: 0, fill: "rgba(0,0,0,.6)", c: "none" }) + r(170, 100, 20, 20, { rx: 1, c: AMB, fill: "rgba(240,179,90,.75)", w: 1.5 }) + p("M246 218 a8 8 0 1 1 -2 -6 m2 -3 v4 h-4", { c: RED, w: 1.8 }) + t(256, 222, "LAMPU KEMBALI, JUMLAH COCOK", { size: 8, c: RED, a: "start" }), "03 PADAM", "Lampu mati, catatan jalan terus."],
      ["10 m", "Permintaan palsu datang dari luar dan ditolak di gerbang. Di dalam, kasir hanya melihat bagian kasir.", "Dari depan toko", tanah() + toko(170, 205, 150, 110) + perisai(130, 130, 1.6) + [[40, 90], [60, 140], [30, 180]].map(([x, y]) => p(`M${x} ${y} L${x + 40} ${130 + (y - 130) * 0.2}`, { c: DIM, w: 1.5, dash: "3 3" }) + p(`M${x + 44} ${126 + (y - 130) * 0.2} l8 8 m0 -8 l-8 8`, { c: DIM, w: 1.5 })).join("") + gembok(245, 165, 1.2, AMB), "04 SERANGAN", "Yang tidak berhak tidak masuk."],
      ["1 m", "Server rusak. Cadangan di tempat lain dipulihkan, dan latihan pulihnya pernah dicoba. Nota kembali utuh.", "Dekat ke rak server", server(120, 150, 1.6, DIM) + p("M92 96 l56 56 M148 96 l-56 56", { c: DIM, w: 2 }) + server(290, 150, 1.6) + garisMerah("M170 120 Q220 80 260 120") + nota(290, 70, 0, true, 0.9), "05 DATA HILANG", "Rusak di satu tempat, utuh di tempat lain."],
      ["1 m", "Tumpukan buku dan Excel lama pindah ke sistem baru. Hitungan sebelum dan sesudah sama, sistem lama tetap jalan berdampingan sampai yakin.", "Dari samping meja", [0, 1, 2, 3].map((i) => r(70, 150 - i * 14, 70, 12, { rx: 1, c: DIM, w: 1.5 })).join("") + garisMerah("M150 120 H230") + laptop(280, 150, 1.2) + t(105, 180, "1.284", { size: 10, c: INK }) + t(280, 180, "1.284", { size: 10, c: RED }), "06 PINDAHAN", "Data lama ikut pindah, angkanya sama."],
      ["5 m", "Karyawan baru langsung bisa di hari pertama. Karyawan yang keluar, aksesnya dicabut hari itu juga.", "Setinggi mata, dari meja kasir", tanah() + meja(60, 150, 120) + orang(110, 150, 1.4) + laptop(150, 148, 0.7) + orang(300, 205, 1.4, DIM) + kunci(330, 120, 1.6, DIM) + p("M318 108 l24 24", { c: RED, w: 2 }), "07 GANTI ORANG", "Orang datang dan pergi, sistemnya tetap."],
      ["1.000 km", "Cabang bertambah. Kamera naik ke Nusantara, nota dari cabang di zona waktu lain masuk ke laporan pusat.", "Terbang naik", nusantara(210, 110, 1.1) + jaringKota(210, 110, 1.1, "jakarta", ["medan", "surabaya", "makassar", "balikpapan", "jayapura"]), "08 CABANG", "Usaha tumbuh, laporannya tetap satu."],
      ["1 m", "Developernya pergi. Yang Anda dapat sudah tertulis sejak awal: kode milik Anda atau lisensi, sesuai kesepakatan. Di skema mana pun data tetap milik Anda dan bisa diekspor, dan catatan cara kerjanya ada.", "Dekat, kotak di atas meja", meja(60, 180, 280) + kotakSerah(200, 150, 1.8), "09 KELANGSUNGAN", "Tetap jalan walau saya tidak ada."],
      ["36.000 km", "Penutup: globe dan satelit. Kebun atau cabang terpencil tetap tersambung. Lalu langkah kecil: mulai dari prototipe, dan rak bukti proyek.", "Zoom out sampai orbit", G() + orbitSatelit(), "PENUTUP", "Mulai dari yang kecil."],
    ],
  },
  {
    kode: "F",
    nama: "Sehari, diputar dua kali",
    inti: "Satu hari kerja pemilik usaha, sekali dengan cara lama dan sekali sesudah punya sistem. Di tengahnya pemandu (Farrez) dengan tiga langkah. Klien jadi tokoh utama.",
    objek: "Nota merah dan arah matahari sebagai jam. Peta cabang yang sama muncul dua kali: gelap dan terputus, lalu menyala.",
    panel: [
      ["40 cm", "Pagi, sebelum. Toko buka, nota tulis tangan sudah menumpuk dari kemarin.", "Dekat, menunduk", meja(60, 170, 280) + [[120, 140, -12], [150, 146, 8], [180, 138, -4], [230, 148, 14], [260, 140, -8]].map(([x, y, a]) => nota(x, y, a)).join("") + nota(205, 128, 4, true, 1.3) + matahari(340, 60, 10), "01 PAGI", "Hari dimulai dari tumpukan kemarin."],
      ["5 m", "Siang, sebelum. Ramai, salah hitung, antrean memanjang.", "Lebar, dari sisi kasir", tanah() + meja(60, 150, 120) + orang(100, 150, 1.4) + [200, 240, 280, 320, 360].map((x) => orang(x, 205, 1.2, DIM)).join("") + matahari(200, 40, 12), "02 SIANG", "Ramai itu bagus, kalau tidak salah hitung."],
      ["1.000 km", "Sore, sebelum. Laporan cabang belum datang, ditelepon satu per satu. Peta cabang gelap dan terputus.", "Terbang naik", nusantara(210, 110, 1.1) + titik(["medan", "surabaya", "makassar", "balikpapan"].map((n) => kotaXY(210, 110, 1.1, n)), DIM, 3) + titik([kotaXY(210, 110, 1.1, "jakarta")], RED, 4), "03 SORE", "Cabang terasa jauh sekali."],
      ["1 m", "Malam, sebelum. Rekap manual sampai larut. Pertanyaannya: berapa sebenarnya untung hari ini?", "Dekat, lampu meja", meja(60, 170, 280) + lampu(120, 140, true) + papanJepit(220, 120, 1.4) + bulan(340, 50) + t(220, 70, "UNTUNG?", { size: 11, c: AMB }), "04 MALAM", "Pertanyaan yang sama tiap malam."],
      ["1 m", "Jembatan. Bertemu pemandu, tiga langkah: ngobrol dulu, prototipe yang bisa dicoba, rilis bertahap dengan harga per tahap.", "Dua orang di meja", meja(60, 170, 280) + orang(120, 170, 1.4) + orang(280, 170, 1.4, RED) + t(200, 60, "NGOBROL  PROTOTIPE  BERTAHAP", { size: 9, c: INK }), "05 PEMANDU", "Tiga langkah, bukan satu lompatan."],
      ["40 cm", "Pagi, sesudah. Nota yang sama tercatat sekali, tidak ada tumpukan.", "Dekat, menunduk", meja(60, 170, 280) + nota(200, 132, 0, true, 1.6) + hp(290, 140, 1.1) + matahari(340, 60, 10), "06 PAGI", "Hari dimulai dari nol."],
      ["5 m", "Siang, sesudah. Antrean jalan. Listrik sempat padam, kasir tetap mencatat.", "Lebar, dari sisi kasir", tanah() + meja(60, 150, 120) + laptop(130, 148, 0.8) + orang(100, 150, 1.4) + [240, 290].map((x) => orang(x, 205, 1.2, DIM)).join("") + matahari(200, 40, 12), "07 SIANG", "Antrean pendek, angkanya benar."],
      ["1.000 km", "Sore, sesudah. Peta yang sama menyala: semua cabang terlihat dari satu HP.", "Terbang naik", nusantara(210, 110, 1.1) + jaringKota(210, 110, 1.1, "jakarta", ["medan", "surabaya", "makassar", "balikpapan"]), "08 SORE", "Semua cabang, satu layar."],
      ["10 m", "Malam, sesudah. Lampu toko mati lebih cepat, pemilik pulang.", "Dari seberang jalan", tanah() + toko(100, 205, 160, 110, true) + orang(320, 205, 1.3) + bulan(340, 50), "09 MALAM", "Pulang tepat waktu."],
      ["36.000 km", "Penutup: kamera naik dari atap ke langit malam, satelit lewat di atas Nusantara. Lalu rak bukti proyek.", "Zoom out ke langit", G() + orbitSatelit(), "PENUTUP", "Besok pagi, hari yang sama, cara yang baru."],
    ],
  },
  {
    kode: "G",
    nama: "Yang ditimbang sebelum memutuskan",
    inti: "Mengikuti isi kepala pembeli: apa yang mendorong, apa yang menarik, lalu tiap rasa cemas dijawab satu per satu (Jobs To Be Done, empat gaya kemajuan). Paling mudah diteruskan ke orang keuangan atau TI di perusahaan klien.",
    objek: "Nota di atas timbangan. Tiap babak mengangkat satu beban sampai timbangan condong ke 'mulai'.",
    panel: [
      ["1 m", "Dorongan: rekap manual yang bikin capek, data beda antar cabang.", "Dekat", meja(60, 170, 280) + [0, 1, 2, 3, 4].map((i) => r(150, 150 - i * 12, 90, 10, { rx: 1, c: DIM, w: 1.5 })).join("") + nota(270, 140, 10, true), "01 DORONGAN", "Yang sekarang bikin capek."],
      ["40 cm", "Harga diam: yang hilang tiap bulan kalau tidak berubah. Jam lembur, selisih stok.", "Dekat ke timbangan", timbangan(200, 150, 1.6, 0) + t(112, 122, "LEMBUR", { size: 8 }) + t(288, 122, "SELISIH", { size: 8 }), "02 HARGA DIAM", "Diam juga ada harganya."],
      ["1 m", "Tarikan: gambaran sesudahnya dalam satu layar.", "Dekat ke HP", hp(200, 120, 3) + p("M178 100 L190 88 L202 94 L216 80", { c: RED, w: 2 }), "03 TARIKAN", "Bayangan sesudahnya."],
      ["40 cm", "Cemas biaya molor: lingkup tertulis, harga per tahap. Angka di nota tidak berubah.", "Dari atas meja", papanJepit(140, 120, 1.5) + [0, 1, 2].map((i) => r(220 + i * 40, 100, 32, 40, { rx: 1, c: i === 0 ? RED : DIM })).join("") + t(276, 160, "TAHAP 1  2  3", { size: 8 }), "04 BIAYA", "Harganya jelas sejak awal."],
      ["1 m", "Cemas vendor menghilang: hak atas kode (milik atau lisensi) tertulis sejak awal, data tetap milik Anda dan bisa diekspor, catatan cara kerjanya ada.", "Dekat, kotak di meja", meja(60, 180, 280) + kotakSerah(200, 150, 1.8), "05 VENDOR", "Tidak bergantung pada satu orang."],
      ["2 km", "Cemas tumbang saat ramai: uji beban dipentaskan. Kamera naik ke kota.", "Naik ke atas kota", kota(50, 40, 10, 5, 20, 10, [[4, 2]]) + antreanTitik(70, 196, 24, AMB), "06 RAMAI", "Diuji sebelum hari ramai."],
      ["10 m", "Cemas data bocor atau hilang: akses per peran, cadangan yang pernah dicoba dipulihkan.", "Dari depan toko", tanah() + toko(60, 205, 150, 110) + perisai(280, 120, 1.6) + server(300, 200, 0.9), "07 DATA", "Aman dan bisa dipulihkan."],
      ["5 m", "Kebiasaan: tim tidak mau pindah. Layar mengikuti alur lama, data lama ikut, berjalan berdampingan dulu.", "Dari sisi meja", tanah() + meja(60, 150, 260) + orang(110, 150, 1.3) + orang(270, 150, 1.3) + laptop(190, 148, 0.8), "08 KEBIASAAN", "Tim tidak perlu belajar dari nol."],
      ["1.000 km", "Langkah kecil: mulai dari satu cabang atau prototipe, lalu melebar.", "Terbang naik", nusantara(210, 110, 1.1) + jaringKota(210, 110, 1.1, "jakarta", ["surabaya"]) + titik(["medan", "makassar", "balikpapan"].map((n) => kotaXY(210, 110, 1.1, n)), DIM, 3), "09 LANGKAH KECIL", "Satu cabang dulu."],
      ["36.000 km", "Penutup: timbangan condong ke 'mulai'. Globe dan satelit, lalu rak bukti proyek.", "Zoom out sampai orbit", G() + orbitSatelit(), "PENUTUP", "Mulai."],
    ],
  },
];

const BABAK = ["01 IDE", "02 RENCANA", "03 BENTUK", "04 FONDASI", "05 BANGUN", "06 PROGRES", "07 RAPI", "08 ANDAL", "09 AMAN", "10 RILIS", "PENUTUP"];
const JUDUL = ["Berawal dari keluhan sehari-hari.", "Semua dimulai dari rencana yang Anda setujui.", "Bentuknya dipilih sesuai masalahnya.", "Rapi sampai ke bagian yang tidak kelihatan.", "Sudah kelihatan sebelum dibangun.", "Progresnya jelas, kabarnya tidak putus.", "Enak dipakai, bukan cuma bisa dipakai.", "Tetap bisa diandalkan saat paling dibutuhkan.", "Data penting tetap di tangan yang berhak.", "Dan akhirnya, dipakai tiap hari.", "Rak koleksi proyek"];

const panelSvg = (skala, isi, label) => `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="250" fill="#211a15"/>${isi}${t(14, 22, `SKALA ${skala}`, { a: "start", size: 10, c: AMB })}${t(386, 22, label, { a: "end", size: 10 })}</svg>`;

const CSS = `*{box-sizing:border-box}body{margin:0;background:#1a1410;color:#ece8e1;font-family:'Schibsted Grotesk',system-ui,sans-serif;padding:48px}
h1{font-size:34px;margin:0 0 6px;letter-spacing:-.01em}.sub{color:#b3ada4;font-size:16px;margin:0 0 4px;max-width:1200px;line-height:1.5}
.objek{color:#e0574b;font-size:15px;margin:8px 0 28px;max-width:1200px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.p svg{width:100%;display:block;border:1px solid #3a322b}.p h3{font-size:14px;margin:10px 0 4px;font-weight:600}.p p{margin:0;color:#b3ada4;font-size:12.5px;line-height:1.45}
.p .k{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#847e75;margin-top:6px}.p.akhir svg{border-color:#e0574b}.mono{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#847e75;letter-spacing:.04em}`;

const SEMUA = [...ARAH, ...ARAH2];
for (const a of SEMUA) {
  const akhir = a.panel.length - 1;
  const isi = a.panel.map(([skala, momen, kamera, svg, label, judul], i) => `<div class="p${i === akhir ? " akhir" : ""}">${panelSvg(skala, svg, label ?? BABAK[i])}<h3>${judul ?? JUDUL[i]}</h3><p>${momen}</p><div class="k">KAMERA: ${kamera}</div></div>`).join("");
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Arah ${a.kode}</title><style>${CSS}</style></head><body><div class="mono">CERITA V5, ARAH ${a.kode}, SKETSA STORYBOARD</div><h1>${a.nama}</h1><p class="sub">${a.inti}</p><p class="objek">Objek persisten: ${a.objek}</p><div class="grid">${isi}</div></body></html>`;
  writeFileSync(join(DIR, `papan-${a.kode.toLowerCase()}.html`), html);
}
writeFileSync(join(DIR, "arah.json"), JSON.stringify(SEMUA.map(({ kode, nama, inti, objek, panel }) => ({ kode, nama, inti, objek, babak: panel.map(([skala, momen, kamera, , label, judul], i) => ({ babak: label ?? BABAK[i], judul: judul ?? JUDUL[i], skala, momen, kamera })) })), null, 2));
console.log("papan ditulis:", SEMUA.map((a) => a.kode).join(", "));
