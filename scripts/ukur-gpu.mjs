// Waktu GPU per lintasan dunia (adegan dengan bayangan, AO, lintasan layar) di tiap anchor, lewat
// timer query yang dipasang dunia.js saat URL memuat ?uji-dunia. Dipakai untuk memilih efek yang
// dikorbankan di HP berdasarkan angka, bukan tebakan.
//   node scripts/ukur-gpu.mjs <url beranda> [lebarxtinggi]
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const [url, ukuran = "1440x900"] = process.argv.slice(2);
const [W, H] = ukuran.split("x").map(Number);
const hp = W < 768;
const port = 9400 + Math.floor(Math.random() * 300);
const profil = mkdtempSync(join(tmpdir(), "ukur-gpu-"));
// Profil Chrome sementara dihapus saat skrip selesai; dulu menumpuk sampai 9 GB di folder temp.
process.on("exit", () => {
  try {
    proc.kill();
  } catch {}
  for (let i = 0; i < 20; i++) {
    try {
      rmSync(profil, { recursive: true, force: true });
      return;
    } catch {
      const t = Date.now() + 250;
      while (Date.now() < t);
    }
  }
});
const proc = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, "--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
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
const kirim = (method, params = {}) => new Promise((r) => { const i = ++id; tunggu.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expression) => (await kirim("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
await kirim("Page.enable");
await kirim("Runtime.enable");
await kirim("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: hp ? 3 : 1, mobile: hp });
await kirim("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem("mode", "imersif");` });
await kirim("Page.navigate", { url: url + (url.includes("?") ? "&" : "?") + "uji-dunia" });
for (let i = 0; i < 400; i++) {
  await tidur(100);
  if ((await js(`document.documentElement.dataset.dunia`)) === "siap") break;
}
for (let i = 0; i < 200; i++) {
  if ((await js(`document.querySelector(".dunia")?.dataset.cerita`)) === "siap") break;
  await tidur(100);
}
await tidur(1500);
console.log("info", JSON.stringify(await js(`window.__duniaUji?.info()`)));
const titik = (await js(`document.querySelector(".dunia").dataset.titik`)).split(" ").map((x) => x.split(":")).map(([n, y]) => ({ n, y: +y }));
const ringkas = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? { n: s.length, median: +s[s.length >> 1].toFixed(2), p95: +s[Math.floor(s.length * 0.95)].toFixed(2) } : null;
};
for (let i = 0; i < titik.length; i++) {
  const t = titik[i];
  const akhir = titik[i + 1]?.y ?? t.y + H;
  await js(`for (const k in window.__duniaUji.gpu) window.__duniaUji.gpu[k].length = 0; scrollTo({ top: ${Math.max(0, t.y + 0.5 * (akhir - t.y) - H / 2)}, behavior: "instant" }); true`);
  await tidur(2200);
  const g = await js(`JSON.parse(JSON.stringify(window.__duniaUji.gpu))`);
  console.log(t.n.padEnd(8), JSON.stringify({ adegan: ringkas(g.adegan), ao: ringkas(g.ao), layar: ringkas(g.layar) }));
}
proc.kill();
process.exit(0);
