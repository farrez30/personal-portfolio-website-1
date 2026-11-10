// Lembar kontak gulir lewat Chrome headless (Node 22+, tanpa dependensi). Pane yang tersembunyi
// menghentikan requestAnimationFrame, jadi tangkapan dibuat di sini.
//
//   node kontak.mjs <url> <folderKeluar> [--langkah 0.05] [--hp]
//
// Halaman harus menerima ?g=<0..1> untuk mengunci progres dan menulis data-siap="1" saat siap.
// Keluaran: g-000.png, g-005.png, ... per posisi, untuk dirangkai ffmpeg jadi lembar kontak.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const langkah = Number(opt("--langkah", "0.05"));
const hp = args.includes("--hp");
if (!url || !out) { console.error("pakai: node kontak.mjs <url> <folder> [--langkah 0.05] [--hp]"); process.exit(2); }
mkdirSync(out, { recursive: true });

const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(chrome, ["--headless=new", "--hide-scrollbars", "--no-first-run", "--enable-unsafe-swiftshader",
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "kontak-"))}`, "about:blank"], { stdio: "ignore" });
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
let id = 0; const tunggu = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); tunggu.get(m.id)?.(m); tunggu.delete(m.id); });
const kirim = (method, params = {}) => new Promise((r) => { const i = ++id; tunggu.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expression) => (await kirim("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await kirim("Page.enable"); await kirim("Runtime.enable");
await kirim("Emulation.setDeviceMetricsOverride", hp
  ? { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }
  : { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false });

const sep = url.includes("?") ? "&" : "?";
for (let g = 0, n = 0; g <= 1.0001; g += langkah, n++) {
  const gg = Math.min(1, g);
  await kirim("Page.navigate", { url: `${url}${sep}g=${gg.toFixed(4)}&hud=0` });
  for (let i = 0; i < 60; i++) { if (await js("document.documentElement.dataset.siap === '1'")) break; await tidur(100); }
  await tidur(300);
  const r = await kirim("Page.captureScreenshot", { format: "png" });
  const nama = `g-${String(Math.round(gg * 1000)).padStart(4, "0")}.png`;
  writeFileSync(join(out, nama), Buffer.from(r.result.data, "base64"));
  console.log(nama, await js("document.documentElement.dataset.beat"));
}
proc.kill();
process.exit(0);
