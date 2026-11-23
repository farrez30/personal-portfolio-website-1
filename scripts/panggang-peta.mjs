// Panggang tekstur peta Nusantara dan bumi malam cerita v5 (F5) jadi WebP, supaya HP tidak
// menggambar kanvas 4096 px saat adegan pertama tampil (previs: peta 302 ms, globe 403 ms bingkai
// pertama, docs/look-dev/cerita-v5.md). Gambarnya sama dengan previs (previs.html, gambarDarat dan
// gambarLampu): Natural Earth 50m dan NASA Black Marble 2016 dari desain/cerita-v5/previs/data
// (asal dan lisensi di PROVENANCE.md di sana). Kanvas dijalankan di Chrome headless lewat CDP,
// hasilnya di-commit ke public/assets/stasiun/. Jalankan ulang bila data atau warnanya berubah:
//   node scripts/panggang-peta.mjs
// Ukuran sengaja pangkat dua (mipmap tanpa salinan): peta 4096 x 2048 dan 2048 x 1024 (bujur
// dan lintang direntang tidak sama, UV bidang yang meluruskannya), bumi 4096 x 2048 dan 2048 x 1024.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { KOTAK_PETA } from "../components/stasiun/peta.js";

const akar = new URL("../", import.meta.url);
const data = (f) => new URL(`desain/cerita-v5/previs/data/${f}`, akar);
const keluar = new URL("public/assets/stasiun/", akar);
mkdirSync(keluar, { recursive: true });

const port = 9800 + Math.floor(Math.random() * 100);
const profil = mkdtempSync(join(tmpdir(), "panggang-peta-"));
const proc = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, "about:blank"], { stdio: "ignore" });
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
  tunggu.get(m.id)?.(m);
  tunggu.delete(m.id);
});
const kirim = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    tunggu.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const js = async (expression) => {
  const r = await kirim("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? "galat JS");
  return r.result.result.value;
};

const darat = readFileSync(data("ne_50m_land.geojson"), "utf8");
const tempat = readFileSync(data("ne_50m_populated_places_simple.geojson"), "utf8");
const malam = `data:image/jpeg;base64,${readFileSync(data("BlackMarble_2016_01deg.jpg")).toString("base64")}`;
await js(`window.DARAT = ${darat}; window.TEMPAT = ${tempat}; true`);

// Fungsi gambar previs, apa adanya (warna gaya terang lembar look-dev).
await js(`(async () => {
  const im = new Image(); im.src = ${JSON.stringify(malam)}; await im.decode(); window.MALAM = im;
  window.gambarDarat = (g, w, h, kotak, isi, garis, tebal) => {
    const [lon0, lon1, lat0, lat1] = kotak, xy = ([lon, lat]) => [((lon - lon0) / (lon1 - lon0)) * w, ((lat1 - lat) / (lat1 - lat0)) * h];
    g.beginPath();
    for (const f of DARAT.features) for (const poli of f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) for (const cincin of poli) { cincin.forEach((c, i) => { const [x, y] = xy(c); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); }
    g.fillStyle = isi; g.fill("evenodd"); if (garis) { g.strokeStyle = garis; g.lineWidth = tebal; g.lineJoin = "round"; g.stroke(); }
  };
  window.gambarLampu = (g, w, h) => {
    const c = document.createElement("canvas"); c.width = MALAM.width; c.height = MALAM.height; const k = c.getContext("2d"); k.drawImage(MALAM, 0, 0);
    const d = k.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const l = 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2], a = Math.max(0, Math.min(1, (l - 45) / 80)) * (p[i] - p[i + 2] > 12 ? 1 : 0.1); p[i] = 255; p[i + 1] = 196 + 40 * a; p[i + 2] = 110 + 80 * a; p[i + 3] = a * 255; }
    k.putImageData(d, 0, 0); g.globalCompositeOperation = "lighter"; g.drawImage(c, 0, 0, w, h); g.globalCompositeOperation = "source-over";
  };
  // Gambar di 4096, lalu turunkan ke 2048 dengan penghalusan (garis pantai ikut menipis setengah).
  window.webp = (besar, w) => { const c = document.createElement("canvas"); c.width = w; c.height = w / 2; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(besar, 0, 0, w, w / 2); return c.toDataURL("image/webp", 0.9).split(",")[1]; };
  return true;
})()`);

const hasil = await js(`(() => {
  const kanvas = () => { const c = document.createElement("canvas"); c.width = 4096; c.height = 2048; return c; };
  // Peta Nusantara (previs ADEGAN["langkah-kecil"], mode satu): laut biru, darat hijau, garis pantai tinta.
  const peta = kanvas(); { const g = peta.getContext("2d"); g.fillStyle = "#a9c4ec"; g.fillRect(0, 0, 4096, 2048); const [b0, b1, s0, s1] = ${JSON.stringify(KOTAK_PETA)};
    // kotak melewati bujur 180: daratan di bujur barat digambar sekali lagi, digeser 360 derajat
    for (const geser of [0, 360]) gambarDarat(g, 4096, 2048, [b0 - geser, b1 - geser, s0, s1], "#b9dcb0", "#3d3a4a", 5); }
  // Bumi malam (previs ADEGAN.penutup): laut biru tua, darat ungu gelap, garis pantai, lampu kota,
  // kota berpenduduk di atas 4 juta sebagai titik kuning bergaris.
  const bumi = kanvas(); { const g = bumi.getContext("2d"); const [W, H] = [4096, 2048];
    g.fillStyle = "#2b3656"; g.fillRect(0, 0, W, H);
    gambarDarat(g, W, H, [-180, 180, -90, 90], "#454459", "#8a9ab8", 2.5);
    gambarLampu(g, W, H);
    for (const f of TEMPAT.features) { const p = f.properties; if ((p.pop_max ?? 0) < 4e6) continue; const [lon, lat] = f.geometry.coordinates, x = ((lon + 180) / 360) * W, y = ((90 - lat) / 180) * H; g.fillStyle = "#ffd98a"; g.strokeStyle = "#3d3a4a"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.stroke(); } }
  return { "peta-4096": webp(peta, 4096), "peta-2048": webp(peta, 2048), "bumi-4096": webp(bumi, 4096), "bumi-2048": webp(bumi, 2048) };
})()`);

for (const [nama, b64] of Object.entries(hasil)) {
  const buf = Buffer.from(b64, "base64");
  writeFileSync(new URL(`${nama}.webp`, keluar), buf);
  console.log(`${nama}.webp ${buf.length} byte`);
}
proc.kill();
await tidur(300);
try {
  rmSync(profil, { recursive: true, force: true });
} catch {}
process.exit(0);
