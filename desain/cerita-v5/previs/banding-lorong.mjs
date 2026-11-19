// Rakit video tiga cara menyusuri lorong modul lab (anim/P/*-portoLab-<varian>) dan halaman pembanding.
//   ANIM=144 node foto.mjs --gaya=toon --arah=P portoLab-gulir portoLab-geser portoLab-lebar, lalu node banding-lorong.mjs
import { readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const VARIAN = [
  ["gulir", "Gulir maju di lorong", "Gulir menggerakkan kamera maju di lorong, berhenti lembut di depan tiap kelompok loker. Lampu loker di depan kamera menyala, daftar ikut menandai."],
  ["geser", "Kamera diam, rak bergeser", "Kamera tetap di tengah lorong. Rak loker bergeser seperti rak arsip berjalan sampai loker terpilih ada di depan."],
  ["lebar", "Satu bidikan lebar", "Semua loker terlihat dari ujung lorong. Memilih dari daftar, lalu kamera terbang mendekat ke loker itu."],
];
const huruf = "C\\:/Windows/Fonts/consola.ttf";
const akar = join(DIR, "anim", "P");
for (const [id] of VARIAN) {
  const folder = readdirSync(akar).find((n) => n.endsWith("-portoLab-" + id));
  if (!folder) { console.log("lewati", id); continue; }
  const video = join(DIR, `lorong-${id}.mp4`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "24", "-i", join(akar, folder, "f%03d.jpg"), "-vf", "scale=1440:900,tmix=frames=3:weights='1 2 1',format=yuv420p", "-c:v", "libx264", "-crf", "22", video], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", video, "-vf", `fps=10,scale=200:-1,drawtext=fontfile='${huruf}':text='%{pts\\:hms}':x=4:y=4:fontsize=12:fontcolor=white:box=1:boxcolor=black@0.6,tile=10x6`, "-frames:v", "1", join(DIR, `kontak-lorong-${id}.jpg`)], { stdio: "inherit" });
  console.log(id);
}
writeFileSync(join(DIR, "banding-lorong.html"), `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banding lorong modul lab</title>
<style>:root{color-scheme:dark}body{margin:0;background:#1a1410;color:#ece8e1;font-family:system-ui,sans-serif;padding:24px 16px 48px}h1{font-size:26px;margin:0 0 6px}p{color:#b3ada4;line-height:1.5;margin:0 0 18px;max-width:72ch}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:22px}figure{margin:0}video{width:100%;display:block;border:1px solid #3a322b;background:#000}
figcaption{padding:10px 0}figcaption b{display:block;font-size:18px;margin-bottom:4px}figcaption span{color:#b3ada4;font-size:15px;line-height:1.45}a{color:#f0b35a}</style></head><body>
<h1>Menyusuri rak proyek, tiga cara</h1><p>Isi modul sama di ketiganya: robot di rel plafon, astronot melayang di ujung lorong, tas kargo tertambat, lampu plafon bernapas. Di akhir, loker ERP meluncur keluar dan kamera mendekat ke kartunya. <a href="#" id="semua">Putar semua</a></p>
<div class="grid">${VARIAN.map(([id, j, k]) => `<figure><video src="lorong-${id}.mp4" controls muted preload="metadata" playsinline></video><figcaption><b>${j}</b><span>${k}</span> <a href="kontak-lorong-${id}.jpg">Lembar kontak</a></figcaption></figure>`).join("")}</div>
<script>const v=[...document.querySelectorAll("video")];let bareng=false;v.forEach(x=>x.addEventListener("play",()=>{if(!bareng)v.forEach(y=>y!==x&&y.pause())}));
document.getElementById("semua").onclick=e=>{e.preventDefault();bareng=true;v.forEach(x=>{x.currentTime=0;x.play()});setTimeout(()=>bareng=false,500)};</script></body></html>`);
console.log("banding-lorong.html");
