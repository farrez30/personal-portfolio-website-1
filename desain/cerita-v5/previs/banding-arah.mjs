// Papan pembanding empat arah cerita v5 (A, E, F, G) dengan skin toon pilihan Farrez.
// Dua halaman (A dan E, lalu F dan G) supaya tiap PNG masih terbaca. Lalu: node foto.mjs --papan=banding-1,banding-2
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARAH } from "./shot.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const INFO = {
  A: ["Satu nota", "Urutan kerja dari ide sampai rilis. Satu nota merah jadi daftar kebutuhan, layar, lalu titik di peta.", "Kuat: semua babak literal, mudah dipahami. Lemah: sudut pandang developer, cemas pembeli tidak disebut."],
  E: ["Uji tekan", "Satu nota melewati hari terburuk: ramai, padam, serangan, server rusak, pindahan data, ganti orang, cabang.", "Kuat: memuat kasus lapangan, dramatis. Lemah: bisa terasa menakut-nakuti bila tempo salah."],
  F: ["Sehari dua kali", "Satu hari pemilik usaha diputar sebelum dan sesudah punya sistem, Farrez sebagai pemandu di tengah.", "Kuat: emosional, klien jadi tokoh utama. Lemah: kurang kena untuk korporasi, keamanan hanya sekilas."],
  G: ["Yang ditimbang", "Isi kepala pembeli: dorongan, harga diam, tarikan, lalu tiap rasa cemas dijawab satu per satu.", "Kuat: langsung menjawab cemas pembeli, bisa diteruskan ke tim keuangan dan TI. Lemah: risiko terbaca seperti FAQ."],
};
const CSS = `*{box-sizing:border-box}body{margin:0;background:#1a1410;color:#ece8e1;font-family:system-ui,sans-serif;padding:48px;width:2400px}
.mono{font:13px ui-monospace,monospace;letter-spacing:.06em;color:#f0b35a}h1{font-size:38px;margin:4px 0 26px}
section{border-top:1px solid #3a322b;padding:26px 0 34px}h2{font-size:30px;margin:6px 0 6px}.inti{color:#d9d3ca;font-size:17px;margin:0 0 4px}.nilai{color:#b3ada4;font-size:15px;margin:0 0 18px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.p img{width:100%;display:block;border:1px solid #3a322b}.p h3{font-size:14px;margin:7px 0 2px}.p p{margin:0;color:#b3ada4;font-size:12.5px;line-height:1.4}
.hp{display:flex;gap:10px;margin-top:16px}.hp img{width:118px;border:1px solid #3a322b}`;
const blok = (k) => `<section><div class="mono">ARAH ${k}</div><h2>${INFO[k][0]}</h2><p class="inti">${INFO[k][1]}</p><p class="nilai">${INFO[k][2]}</p>
<div class="grid">${ARAH[k].map((s) => `<div class="p"><img src="bingkai/toon/${k}/d-${s.id}.webp"><div class="mono" style="font-size:10px;margin-top:6px">${s.label}, ${s.skala}</div><h3>${s.judul}</h3><p>${s.kejadian}</p></div>`).join("")}</div>
<div class="hp">${ARAH[k].map((s) => `<img src="bingkai/toon/${k}/h-${s.id}.webp">`).join("")}</div></section>`;
[["A", "E"], ["F", "G"]].forEach((pasang, i) => {
  writeFileSync(join(DIR, `banding-${i + 1}.html`), `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Banding arah ${i + 1}</title><style>${CSS}</style></head><body>
<div class="mono">CERITA V5, PREVIS BLOCKOUT SKIN TOON, HALAMAN ${i + 1} DARI 2</div><h1>Empat arah, benda dan skin yang sama</h1>${pasang.map(blok).join("")}</body></html>`);
});
console.log("banding-1.html, banding-2.html");
