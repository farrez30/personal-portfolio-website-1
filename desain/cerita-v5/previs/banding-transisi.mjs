// Rakit video empat arah perpindahan antarmeja (anim/G/tx-<arah>) dan halaman pembanding.
//   DUNIA=penuh TX=<arah> node foto.mjs --gaya=toon --arah=G   (per arah), lalu node banding-transisi.mjs
import { readdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const ARAH = [
  ["campur", "Tata ulang dan pola campur", "Meja di dua sisi lorong. Nota terbang diikuti kamera, whip pan ke seberang, masuk layar tablet lalu keluar di meja biaya, orbit, lewat di balik pilar, crane ke denah."],
  ["layar", "Masuk layar berantai", "Di tiap meja ada tablet dengan layar yang sama. Kamera masuk ke layar sampai penuh, lalu keluar dari tablet di meja berikutnya."],
  ["crane", "Crane ke denah", "Plafon dibuka seperti rumah boneka. Kamera naik ke tampak atas lantai, bergeser, lalu turun di meja berikutnya."],
  ["oner", "Satu take berliku", "Tata letak tetap. Kamera tidak pernah berhenti: bergantian merendah ke lorong dan meninggi di atas meja."],
];
const huruf = "C\\:/Windows/Fonts/consola.ttf";
for (const [id] of ARAH) {
  const folder = join(DIR, "anim", "G", "tx-" + id);
  if (!existsSync(join(folder, "f000.jpg"))) { console.log("lewati", id); continue; }
  const n = readdirSync(folder).filter((f) => f.endsWith(".jpg")).length, video = join(DIR, `tx-${id}.mp4`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "24", "-i", join(folder, "f%03d.jpg"), "-vf", "scale=1440:900,tmix=frames=3:weights='1 2 1',format=yuv420p", "-c:v", "libx264", "-crf", "22", video], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", video, "-vf", `fps=10,scale=200:-1,drawtext=fontfile='${huruf}':text='%{pts\\:hms}':x=4:y=4:fontsize=12:fontcolor=white:box=1:boxcolor=black@0.6,tile=12x${Math.ceil(n / 24 * 10 / 12)}`, "-frames:v", "1", join(DIR, `kontak-tx-${id}.jpg`)], { stdio: "inherit" });
  console.log(id, (n / 24).toFixed(1), "detik");
}
writeFileSync(join(DIR, "banding-transisi.html"), `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banding transisi antarmeja</title>
<style>:root{color-scheme:dark}body{margin:0;background:#1a1410;color:#ece8e1;font-family:system-ui,sans-serif;padding:24px 16px 48px}h1{font-size:26px;margin:0 0 6px}p{color:#b3ada4;line-height:1.5;margin:0 0 18px;max-width:72ch}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,560px),1fr));gap:22px}figure{margin:0}video{width:100%;display:block;border:1px solid #3a322b;background:#000}
figcaption{padding:10px 0}figcaption b{display:block;font-size:18px;margin-bottom:4px}figcaption span{color:#b3ada4;font-size:15px;line-height:1.45}a{color:#f0b35a}</style></head><body>
<h1>Perpindahan antarmeja, empat arah</h1><p>Bagian kantor saja, dari babak 1 sampai babak 7. Video dimulai bersamaan bila ditekan <a href="#" id="semua">putar semua</a>; satu video diputar sendiri menghentikan yang lain.</p>
<div class="grid">${ARAH.map(([id, j, k]) => `<figure><video src="tx-${id}.mp4" controls muted preload="metadata" playsinline></video><figcaption><b>${j}</b><span>${k}</span> <a href="kontak-tx-${id}.jpg">Lembar kontak</a></figcaption></figure>`).join("")}</div>
<script>const v=[...document.querySelectorAll("video")];let bareng=false;v.forEach(x=>x.addEventListener("play",()=>{if(!bareng)v.forEach(y=>y!==x&&y.pause())}));
document.getElementById("semua").onclick=e=>{e.preventDefault();bareng=true;v.forEach(x=>{x.currentTime=0;x.play()});setTimeout(()=>bareng=false,500)};</script></body></html>`);
console.log("banding-transisi.html");
