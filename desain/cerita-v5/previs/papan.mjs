// Papan storyboard previs arah G: tiap baris satu babak, bingkai desktop, bingkai HP, dan catatan set piece.
// Dibagi dua halaman supaya tiap PNG masih terbaca. Lalu: node foto.mjs --papan
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHOT } from "./shot.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const CSS = `*{box-sizing:border-box}body{margin:0;background:#1a1410;color:#ece8e1;font-family:'Schibsted Grotesk',system-ui,sans-serif;padding:56px;width:2400px}
h1{font-size:40px;margin:0 0 8px;letter-spacing:-.01em}.sub{color:#b3ada4;font-size:18px;margin:0 0 36px;max-width:1700px;line-height:1.5}
.baris{display:grid;grid-template-columns:1152px 276px 1fr;gap:28px;padding:28px 0;border-top:1px solid #3a322b;align-items:start}
img{display:block;width:100%;border:1px solid #3a322b}.mono{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:13px;letter-spacing:.06em;color:#f0b35a}
h2{font-size:28px;margin:8px 0 14px}dl{margin:0;display:grid;grid-template-columns:150px 1fr;gap:8px 14px;font-size:16px;line-height:1.45}
dt{color:#847e75;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.06em;padding-top:3px}dd{margin:0;color:#d9d3ca}`;
const isi = (s) => `<div class="baris"><img src="bingkai/d-${s.id}.webp"><img src="bingkai/h-${s.id}.webp"><div><div class="mono">${s.label}, SKALA ${s.skala}</div><h2>${s.judul}</h2><dl>
<dt>KEJADIAN</dt><dd>${s.kejadian}</dd><dt>BENDA</dt><dd>${s.benda}</dd><dt>KAMERA</dt><dd>${s.kamera}</dd>
<dt>PEMICU</dt><dd>${s.pemicu}</dd><dt>PIN</dt><dd>${s.pin}</dd><dt>POLA BANK</dt><dd>${s.pola}</dd><dt>BUKTI</dt><dd>${s.bukti}</dd></dl></div></div>`;
const bagian = [SHOT.slice(0, 5), SHOT.slice(5)];
bagian.forEach((daftar, i) => {
  writeFileSync(join(DIR, `papan-${i + 1}.html`), `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Previs v5 bagian ${i + 1}</title><style>${CSS}</style></head><body>
<div class="mono">CERITA V5, ARAH G, PREVIS BLOCKOUT, BAGIAN ${i + 1} DARI 2</div><h1>Yang ditimbang sebelum memutuskan</h1>
<p class="sub">Render dari adegan blockout three.js (previs.html), kiri desktop 1440x900, kanan HP 390x844. Objek persisten: nota merah di atas timbangan; di skala kota ke atas, nota jadi titik data merah. Antarbabak memakai camera blend dan motion blur seperti sekarang. Benda masih abu-abu polos; bahan dan cahaya akhir ditentukan lewat look-dev sesudah papan ini disetujui.</p>
${daftar.map(isi).join("")}</body></html>`);
});
console.log("papan-1.html, papan-2.html");
