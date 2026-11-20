// Rakit video dinding patch vs album patch (anim/P/*-portoPatch-<bentuk>) dan halaman pembanding,
// ditambah gambar diam stasiun, tablet prosedur, dan loker cetak biru.
//   ANIM=144 node foto.mjs --gaya=toon --arah=P portoPatch-dinding portoPatch-album
//   node foto.mjs --gaya=toon --arah=P portoStasiun portoTablet portoCetakBiru, ubah PNG ke WebP, lalu node banding-klien.mjs
import { readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const BENTUK = [
  ["dinding", "Dinding patch", "Patch klien menempel di dinding Velcro node, seperti montase patch yang ikut terbang. Satu patch dibalik, lalu kamera menoleh ke layar kokpit."],
  ["album", "Album patch", "Astronot memegang album patch. Halaman dibalik, satu patch dibalik, lalu kamera menoleh ke layar kokpit."],
];
const DIAM = [
  ["portoStasiun", "Stasiun hari ini", "Dua modul lab dan satu node, dua port kosong untuk modul berikutnya. 22 satelit klien di tiga bidang orbit."],
  ["portoTablet", "Isi proyek", "Cue card di pintu loker, tablet prosedur berisi tab studi kasus."],
  ["portoCetakBiru", "Loker kontak", "Cetak biru urutan perakitan dengan satu port berikutnya."],
];
const akar = join(DIR, "anim", "P");
for (const [id] of BENTUK) {
  const folder = readdirSync(akar).find((n) => n.endsWith("-portoPatch-" + id));
  if (!folder) { console.log("lewati", id); continue; }
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "24", "-i", join(akar, folder, "f%03d.jpg"), "-vf", "scale=1440:900,tmix=frames=3:weights='1 2 1',format=yuv420p", "-c:v", "libx264", "-crf", "22", join(DIR, `patch-${id}.mp4`)], { stdio: "inherit" });
  console.log(id);
}
writeFileSync(join(DIR, "banding-klien.html"), `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banding klien dan stasiun</title>
<style>:root{color-scheme:dark}body{margin:0;background:#1a1410;color:#ece8e1;font-family:system-ui,sans-serif;padding:24px 16px 48px;max-width:1500px;margin:auto}h1{font-size:26px;margin:0 0 6px}h2{font-size:20px;margin:32px 0 10px}p{color:#b3ada4;line-height:1.5;margin:0 0 18px;max-width:72ch}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:22px}figure{margin:0}video,img{width:100%;display:block;border:1px solid #3a322b;background:#000}
figcaption{padding:10px 0}figcaption b{display:block;font-size:18px;margin-bottom:4px}figcaption span{color:#b3ada4;font-size:15px;line-height:1.45}</style></head><body>
<h1>Patch klien, dua bentuk</h1><p>Keduanya berakhir di layar kokpit yang menampilkan situs klien. Isi belakang patch dan tahun di cetak biru masih isian.</p>
<div class="grid">${BENTUK.map(([id, j, k]) => `<figure><video src="patch-${id}.mp4" controls muted preload="metadata" playsinline></video><figcaption><b>${j}</b><span>${k}</span></figcaption></figure>`).join("")}</div>
<h2>Stasiun, isi proyek, dan kontak</h2>
<div class="grid">${DIAM.map(([id, j, k]) => `<figure><img src="bingkai/toon/P/d-${id}.webp" alt=""><figcaption><b>${j}</b><span>${k}</span></figcaption></figure>`).join("")}</div>
<script>const v=[...document.querySelectorAll("video")];v.forEach(x=>x.addEventListener("play",()=>v.forEach(y=>y!==x&&y.pause())));</script></body></html>`);
console.log("banding-klien.html");
