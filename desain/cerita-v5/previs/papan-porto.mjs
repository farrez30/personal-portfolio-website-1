// Papan lima konsep babak portofolio sesudah globe (arah P di shot.mjs). Lalu: node foto.mjs --papan=papan-porto, ubah PNG ke WebP
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARAH } from "./shot.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const CATATAN = {
  portoCincin: ["Sambungan langsung dari globe, satelit jadi pembawa kartu.", "10 kartu melewati batas 5 bingkai NN/g kalau hanya satu yang terlihat; kartu di sisi jauh kecil."],
  portoKonstelasi: ["Paling mulus: satelit yang sudah ada bertambah jadi sepuluh, tiap proyek bersiluet sendiri (pelajaran Igloo).", "Aset terbanyak, 10 model kecil."],
  portoArsip: ["Cerita melingkar, memakai ulang map berkas dan gedung kantor.", "Klise kamar 3D, bisa antiklimaks sesudah globe."],
  portoShowroom: ["Kesan pameran paling kuat.", "Ruang baru yang tidak ada di cerita; metafora benda fisik untuk software; aset terberat."],
  portoGrid: ["Paling cepat dipindai dan paling ringan di HP.", "Kesan paling rendah, cerita 3D terasa habis."],
};
const CSS = `*{box-sizing:border-box}body{margin:0;background:#1a1410;color:#ece8e1;font-family:'Schibsted Grotesk',system-ui,sans-serif;padding:56px;width:2400px}
h1{font-size:40px;margin:0 0 8px}.sub{color:#b3ada4;font-size:18px;margin:0 0 36px;max-width:1700px;line-height:1.5}
.baris{display:grid;grid-template-columns:1152px 276px 1fr;gap:28px;padding:28px 0;border-top:1px solid #3a322b;align-items:start}
img{display:block;width:100%;border:1px solid #3a322b}.mono{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:13px;letter-spacing:.06em;color:#f0b35a}
h2{font-size:28px;margin:8px 0 14px}p{margin:0 0 12px;font-size:17px;line-height:1.5;color:#d9d3ca}.plus{color:#9fd3a4}.min{color:#f0a08f}.rek{color:#f0b35a;font-weight:600}`;
const isi = (s) => `<div class="baris"><img src="bingkai/toon/P/d-${s.id}.webp"><img src="bingkai/toon/P/h-${s.id}.webp"><div><div class="mono">${s.label}</div><h2>${s.judul}${s.id === "portoKonstelasi" ? ' <span class="rek">(rekomendasi)</span>' : ""}</h2>
<p>${s.kejadian}</p><p class="plus">+ ${CATATAN[s.id][0]}</p><p class="min">− ${CATATAN[s.id][1]}</p></div></div>`;
writeFileSync(join(DIR, "papan-porto.html"), `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Previs v5 portofolio</title><style>${CSS}</style></head><body>
<div class="mono">CERITA V5, BABAK SESUDAH GLOBE, LIMA KONSEP</div><h1>Satelit ke balik bumi, keluar sebagai portofolio</h1>
<p class="sub">Render previs toon, kiri desktop 1440x900, kanan HP 390x844. Semua konsep memakai daftar nama proyek HTML yang selalu terlihat, karena slide tidak boleh jadi satu-satunya jalan ke isi (Baymard) dan carousel paling banyak 5 bingkai (NN/g). Rincian dan sumber di riset-portofolio.md.</p>
${ARAH.P.map(isi).join("")}</body></html>`);
console.log("papan-porto.html");
