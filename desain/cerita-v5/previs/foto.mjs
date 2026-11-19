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
const keluar = join(DIR, "bingkai", gaya + (process.env.GARIS ? "-" + process.env.GARIS : "") + (process.env.SILUET ? "-siluet" : ""), arah);
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
  "--headless=new", "--hide-scrollbars", "--allow-file-access-from-files", ...(process.env.UKUR ? ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]),
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

if (process.env.DUNIA) {
  await kirim("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await kirim("Page.navigate", { url: pathToFileURL(join(DIR, "previs.html")).href + "?dunia=" + (process.env.DUNIA === "penuh" ? "penuh" : "1") + (gaya ? "&gaya=" + gaya : "") + (process.env.TX ? "&tx=" + process.env.TX : "") });
  let siap = false; for (let i = 0; i < 480 && !siap; i++) { await tidur(250); siap = (await kirim("Runtime.evaluate", { expression: "window.SIAP === true && typeof window.aturDunia === 'function'", returnByValue: true })).result?.value; }
  const durasi = (await kirim("Runtime.evaluate", { expression: "window.durasiDunia", returnByValue: true })).result.value, N = Math.round(durasi * 24);
  const folder = join(DIR, "anim", "G", process.env.TX ? "tx-" + process.env.TX : process.env.DUNIA === "penuh" ? "00-penuh" : "00-dunia"); mkdirSync(folder, { recursive: true });
  for (let i = 0; i < N; i++) { await kirim("Runtime.evaluate", { expression: "window.aturDunia(" + (i / 24) + ")", returnByValue: true }); const g = await kirim("Page.captureScreenshot", { format: "jpeg", quality: 88 }); writeFileSync(join(folder, "f" + String(i).padStart(3, "0") + ".jpg"), Buffer.from(g.data, "base64")); }
  console.log("DUNIA", N, "bingkai", durasi.toFixed(2), "detik");
  id.length = 0;
}
for (const s of id) {
  for (const [k, w, h, mobile] of [["d", 1440, 900, false], ["h", 390, 844, true]]) {
    await kirim("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
    if (process.env.UKUR) await kirim("Emulation.setCPUThrottlingRate", { rate: mobile ? 4 : 1 });
    await kirim("Page.navigate", { url: `${pathToFileURL(join(DIR, "previs.html"))}?s=${s}${gaya ? "&gaya=" + gaya : ""}${arah ? "&a=" + arah : ""}${process.env.GARIS ? "&garis=" + process.env.GARIS : ""}${process.env.SILUET ? "&siluet=1" : ""}${process.env.UKUR ? "&ukur=1&dpr=" + (mobile ? 2 : 1) : ""}${process.env.ANIM ? "&anim=1" : ""}` });
    let siap = false;
    for (let i = 0; i < 120 && !siap; i++) { await tidur(250); siap = (await kirim("Runtime.evaluate", { expression: "window.SIAP === true", returnByValue: true })).result?.value; }
    const err = (await kirim("Runtime.evaluate", { expression: "window.GALAT || ''", returnByValue: true })).result?.value;
    if (process.env.ANIM) {
      if (mobile) continue;
      const folder = join(DIR, "anim", arah || "G", String(semua.indexOf(s)).padStart(2, "0") + "-" + s); mkdirSync(folder, { recursive: true });
      const N = Number(process.env.ANIM) || 48;
      for (let i = 0; i < N; i++) { await kirim("Runtime.evaluate", { expression: `window.atur(${i / (N - 1)})`, returnByValue: true }); const g = await kirim("Page.captureScreenshot", { format: "jpeg", quality: 88 }); writeFileSync(join(folder, `f${String(i).padStart(3, "0")}.jpg`), Buffer.from(g.data, "base64")); }
      console.log("ANIM", s, N); continue;
    }
    if (process.env.UKUR) { const u = (await kirim("Runtime.evaluate", { expression: "JSON.stringify(window.UKUR)", returnByValue: true })).result?.value; console.log("UKUR", k, s, u); continue; }
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
