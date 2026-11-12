// Panggang PMREM lingkungan rak ke public/assets/rak/lingkungan.webp (components/imersif/lingkungan.js).
// Halaman kecil di Chrome headless membuat PMREM dengan three dari node_modules, membaca tiap muka
// dan tingkat mip sebagai float, menyandikannya ke sRGB 8 bit, lalu menyusunnya jadi satu atlas.
//   node scripts/panggang-lingkungan.mjs
// Muka dicerminkan dan +X ditukar dengan -X: three membalik sumbu x saat membaca CubeTexture yang
// bukan render target (WebGLMaterials, envMapRotation), sedangkan PMREM asli adalah render target.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { spawn, spawnSync } from "node:child_process";

const akar = process.cwd();
const HALAMAN = `<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js"}}</script>
<script type="module">
import * as THREE from "three";
import { kanvasLingkungan, letakAtlas, UKURAN_ATLAS } from "/components/imersif/lingkungan.js";
const renderer = new THREE.WebGLRenderer();
// Sama dengan buatLingkungan(), tapi render target-nya disimpan untuk dibaca.
const sumber = new THREE.CanvasTexture(kanvasLingkungan());
sumber.mapping = THREE.EquirectangularReflectionMapping;
sumber.colorSpace = THREE.SRGBColorSpace;
const target = new THREE.PMREMGenerator(renderer).fromEquirectangular(sumber);
const env = target.texture;
const gl = renderer.getContext();
const c = document.createElement("canvas");
c.width = UKURAN_ATLAS.w; c.height = UKURAN_ATLAS.h;
const g = c.getContext("2d");
const sRGB = (v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)));
let maks = 0;
for (let m = 0; m < 6; m++) for (let l = 0; l < env.mipmaps.length; l++) {
  const s = env.mipmaps[l].width;
  renderer.setRenderTarget(target, m, l);
  const f = new Float32Array(s * s * 4);
  gl.readPixels(0, 0, s, s, gl.RGBA, gl.FLOAT, f);
  const tujuan = m === 0 ? 1 : m === 1 ? 0 : m;
  const { x, y } = letakAtlas(tujuan, l);
  const im = g.createImageData(s, s);
  for (let r = 0; r < s; r++) for (let k = 0; k < s; k++) {
    const a = (r * s + k) * 4, b = (r * s + (s - 1 - k)) * 4;
    for (let n = 0; n < 3; n++) { im.data[b + n] = sRGB(f[a + n]); maks = Math.max(maks, f[a + n]); }
    im.data[b + 3] = 255;
  }
  g.putImageData(im, x, y);
}
renderer.setRenderTarget(null);
window.__hasil = { png: c.toDataURL("image/png"), maks, tingkat: env.mipmaps.length, sisi: env.mipmaps[0].width };
</script>`;
const jenis = { ".js": "text/javascript", ".html": "text/html" };
const server = createServer((q, r) => {
  if (q.url === "/") return r.writeHead(200, { "content-type": "text/html" }), r.end(HALAMAN);
  try {
    const isi = readFileSync(join(akar, decodeURIComponent(q.url.split("?")[0])));
    r.writeHead(200, { "content-type": jenis[extname(q.url)] ?? "application/octet-stream" });
    r.end(isi);
  } catch {
    r.writeHead(404), r.end();
  }
}).listen(0);
const portWeb = server.address().port;
const port = 9600 + Math.floor(Math.random() * 90);
const proc = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "panggang-"))}`, "--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try {
    const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
  } catch {}
  if (!ws) await tidur(250);
}
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const tunggu = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") console.log("EXC", m.params.exceptionDetails.exception?.description);
  tunggu.get(m.id)?.(m), tunggu.delete(m.id);
});
const kirim = (method, params = {}) => new Promise((r) => { const i = ++id; tunggu.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await kirim("Runtime.enable");
await kirim("Page.enable");
await kirim("Page.navigate", { url: `http://127.0.0.1:${portWeb}/` });
let hasil;
for (let i = 0; i < 100 && !hasil; i++) {
  await tidur(200);
  hasil = (await kirim("Runtime.evaluate", { expression: "window.__hasil", returnByValue: true })).result?.result?.value;
}
proc.kill();
server.close();
if (!hasil) throw new Error("gagal memanggang");
// PNG dari kanvas lalu WebP lossless (ffmpeg): piksel terpakai identik, 470 KB jadi 126 KB.
const png = join(mkdtempSync(join(tmpdir(), "lingkungan-")), "l.png");
writeFileSync(png, Buffer.from(hasil.png.split(",")[1], "base64"));
const ff = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-c:v", "libwebp", "-lossless", "1", "-compression_level", "6", join(akar, "public/assets/rak/lingkungan.webp")], { stdio: "inherit" });
if (ff.status !== 0) throw new Error("ffmpeg gagal");
console.log(`lingkungan.webp: ${hasil.tingkat} tingkat, sisi ${hasil.sisi}, nilai maks ${hasil.maks.toFixed(3)}`);
process.exit(0);
