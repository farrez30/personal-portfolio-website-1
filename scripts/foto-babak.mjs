// Foto tiap babak cerita di dunia toko (storyboard previs dan gambar mode Ringan): lompat ke
// babak, tunggu kamera mendarat, lalu tangkap kanvas saja dan halaman lengkap.
//   node scripts/foto-babak.mjs <url beranda> <lebarxtinggi> --keluar <folder> [--u 0.6] [--gpu] [--terang]
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const arg = process.argv.slice(2);
const url = arg[0];
const [W, H] = (arg[1] ?? "1440x900").split("x").map(Number);
const keluar = arg[arg.indexOf("--keluar") + 1];
const u = arg.includes("--u") ? Number(arg[arg.indexOf("--u") + 1]) : 0.6;
const gpu = arg.includes("--gpu");
const tema = arg.includes("--terang") ? "light" : "dark";
const hp = W < 768;
mkdirSync(keluar, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const bendera = ["--headless=new", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "foto-babak-"))}`];
bendera.push(...(gpu ? ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"]));
const proc = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", [...bendera, "about:blank"], { stdio: "ignore" });
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
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") console.log("ERR", m.params.args.map((x) => x.value ?? x.description).join(" ").slice(0, 300));
  if (m.method === "Runtime.exceptionThrown") console.log("EXC", m.params.exceptionDetails.exception?.description?.slice(0, 300));
  tunggu.get(m.id)?.(m);
  tunggu.delete(m.id);
});
const kirim = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    tunggu.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const js = async (expression) => (await kirim("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const SEMBUNYI = `body * { visibility: hidden !important; } .dunia, .dunia * { visibility: visible !important; } .dunia::after { display: none; }`;
const foto = async (nama) => {
  const r = await kirim("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(keluar, `${nama}.png`), Buffer.from(r.result.data, "base64"));
  await js(`(() => { const s = document.createElement("style"); s.id = "sembunyi"; s.textContent = ${JSON.stringify(SEMBUNYI)}; document.head.append(s); return true; })()`);
  await tidur(150);
  const d = await kirim("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(keluar, `${nama}-dunia.png`), Buffer.from(d.result.data, "base64"));
  await js(`document.getElementById("sembunyi")?.remove(); true`);
};

await kirim("Page.enable");
await kirim("Runtime.enable");
await kirim("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: Number(process.env.DPR || (hp ? 2 : 1)), mobile: hp });
await kirim("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem("mode", "imersif"); localStorage.setItem("theme", ${JSON.stringify(tema)});` });
await kirim("Page.navigate", { url });
for (let i = 0; i < 400; i++) {
  await tidur(100);
  const d = await js(`document.documentElement.dataset.dunia`);
  if (d === "siap" || d === "gagal") break;
}
// Tunggu props cerita yang dimuat sesudah hero (data-cerita di .dunia).
for (let i = 0; i < 200; i++) {
  if ((await js(`document.querySelector(".dunia")?.dataset.cerita`)) === "siap") break;
  await tidur(100);
}
await tidur(800);
const titik = (await js(`document.querySelector(".dunia")?.dataset.titik`)).split(" ").map((x) => {
  const [n, y] = x.split(":");
  return { n, y: +y };
});
const ambil = arg.includes("--hanya") ? arg[arg.indexOf("--hanya") + 1].split(",") : titik.map((t) => t.n);
for (let i = 0; i < titik.length; i++) {
  const t = titik[i];
  if (!ambil.includes(t.n)) continue;
  const akhir = titik[i + 1]?.y ?? t.y + H;
  const y = Math.max(0, t.y + u * (akhir - t.y) - H / 2);
  await js(`scrollTo({ top: ${y}, behavior: "instant" }); true`);
  await tidur(2600);
  await foto(`${String(i).padStart(2, "0")}-${t.n}`);
  console.log(t.n, await js(`document.querySelector(".dunia")?.dataset.anchor`));
}
proc.kill();
process.exit(0);
