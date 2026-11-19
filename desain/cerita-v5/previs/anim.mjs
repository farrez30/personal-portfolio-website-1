// Susun animatic dari bingkai anim/<arah>/<nn-id>/f###.jpg, 2,4 detik per babak:
// kamera 3D datang, tahan, lalu menukik di tiap babak; antarbabak crossfade 0,25 detik; motion blur dari campuran
// tiga bingkai berdekatan (tmix), jadi hanya bagian yang bergerak cepat yang kabur.
// Lalu lembar kontak tiap 0,1 detik dengan cap waktu, untuk dicek bingkai demi bingkai.
//   node anim.mjs [arah]
import { readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const arah = process.argv[2] ?? "G";
const akar = join(DIR, "anim", arah);
const babak = readdirSync(akar).filter((n) => existsSync(join(akar, n, "f000.jpg"))).sort();
// bila ada rekaman satu ruang kerja (00-dunia), babak meja 00-04 sudah ada di dalamnya
const dasar = babak.includes("tx-campur-lengkap") ? "tx-campur-lengkap" : "00-penuh";
const urut = babak.includes(dasar) ? [dasar, ...babak.filter((n) => /^(0[89]|10)-/.test(n))] : babak.includes("00-penuh") ? ["00-penuh", ...babak.filter((n) => /^0[89]-/.test(n))] : babak.includes("00-dunia") ? ["00-dunia", ...babak.filter((n) => n !== "00-dunia" && Number(n.slice(0, 2)) >= 5)] : babak;
const detik = urut.map((b) => readdirSync(join(akar, b)).filter((x) => x.endsWith(".jpg")).length / 24);
const FPS = 24, DURASI = 2.4, SILANG = 0.25;
const masuk = urut.flatMap((b) => ["-framerate", String(FPS), "-i", join(akar, b, "f%03d.jpg")]);
let filter = urut.map((_, i) => `[${i}:v]scale=1440:900,setsar=1,format=yuv420p[v${i}]`).join(";");
let kiri = "v0";
let mulai = 0;
urut.slice(1).forEach((_, j) => {
  const i = j + 1; mulai += detik[j] - SILANG; const offset = mulai;
  filter += `;[${kiri}][v${i}]xfade=transition=fade:duration=${SILANG}:offset=${offset.toFixed(2)}[x${i}]`;
  kiri = `x${i}`;
});
const total = detik.reduce((x, y) => x + y, 0) - SILANG * (urut.length - 1);
filter += `;[${kiri}]tmix=frames=3:weights='1 2 1'[akhir]`;
const video = join(DIR, `animatic-${arah}.mp4`);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...masuk, "-filter_complex", filter, "-map", "[akhir]", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), video], { stdio: "inherit" });
const huruf = "C\\:/Windows/Fonts/consola.ttf";
const baris = Math.ceil((total * 10) / 10);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", video, "-vf", `fps=10,scale=288:-1,drawtext=fontfile='${huruf}':text='%{pts\\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile=10x${baris}`, "-frames:v", "1", join(DIR, `kontak-${arah}.jpg`)], { stdio: "inherit" });
console.log(video, `${total.toFixed(1)} detik`, `${urut.length} klip`);
