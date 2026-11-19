// Potret previs tiap babak lewat CDP dengan viewport yang dipaksa persis (desktop 1440x900, HP 390x844).
//   node desain/cerita-v5/previs/foto.mjs [id babak ...]
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const gaya = (process.argv.find((a) => a.startsWith("--gaya=")) ?? "").slice(7);
const arah = (process.argv.find((a) => a.startsWith("--arah=")) ?? "").slice(7);
const keluar = join(DIR, "bingkai", gaya, arah);
mkdirSync(keluar, { recursive: true });
const { ARAH } = await import(pathToFileURL(join(DIR, "shot.mjs")).href);
const semua = ARAH[arah || "G"].map((s) => s.id);
const argPapan = process.argv.find((a) => a.startsWith("--papan"));
const papan = Boolean(argPapan);
const daftarPapan = argPapan?.includes("=") ? argPapan.split("=")[1].split(",") : ["papan-1", "papan-2"];
const arg = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const id = papan ? [] : arg.length ? arg : semua;

const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--hide-scrollbars", "--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "previs-"))}`, "about:blank",
], { stdio: "ignore" });
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60 && !ws; i++) {
  try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
  if (!ws) await tidur(250);
}
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let n = 0; const tunggu = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (tunggu.has(m.id)) { tunggu.get(m.id)(m.result ?? m); tunggu.delete(m.id); } });
const kirim = (method, params = {}) => new Promise((r) => { const i = ++n; tunggu.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

for (const s of id) {
  for (const [k, w, h, mobile] of [["d", 1440, 900, false], ["h", 390, 844, true]]) {
    await kirim("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
    await kirim("Page.navigate", { url: `${pathToFileURL(join(DIR, "previs.html"))}?s=${s}${gaya ? "&gaya=" + gaya : ""}${arah ? "&a=" + arah : ""}` });
    let siap = false;
    for (let i = 0; i < 120 && !siap; i++) { await tidur(250); siap = (await kirim("Runtime.evaluate", { expression: "window.SIAP === true", returnByValue: true })).result?.value; }
    const err = (await kirim("Runtime.evaluate", { expression: "window.GALAT || ''", returnByValue: true })).result?.value;
    const r = await kirim("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(keluar, `${k}-${s}.png`), Buffer.from(r.data, "base64")); // ubah ke webp dengan ffmpeg sebelum commit
    console.log(k, s, siap ? "siap" : "TIDAK SIAP", err);
  }
}
if (papan) {
  for (const b of daftarPapan) {
    await kirim("Emulation.setDeviceMetricsOverride", { width: 2400, height: 1200, deviceScaleFactor: 1, mobile: false });
    await kirim("Page.navigate", { url: pathToFileURL(join(DIR, b + ".html")).href });
    await tidur(1500);
    const tinggi = (await kirim("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true })).result.value;
    await kirim("Emulation.setDeviceMetricsOverride", { width: 2400, height: tinggi, deviceScaleFactor: 1, mobile: false });
    await tidur(500);
    const r = await kirim("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(DIR, b + ".png"), Buffer.from(r.data, "base64"));
    console.log(b, tinggi);
  }
}
ws.close(); chrome.kill();
