// Lembar kontak cerita gulir dari build yang disajikan (next start), lewat Chrome headless.
// Panel browser yang tersembunyi menghentikan requestAnimationFrame, jadi QA gerak dibuat di sini.
//
//   node scripts/kontak-cerita.mjs <url halaman> <folder> [--langkah 0.05] [--dari 0] [--sampai 1]
//     [--hp] [--ringan] [--terang|--gelap]
//
// Menggulir #cerita dari atas sampai bawah per langkah, menunggu gerak yang dihaluskan selesai,
// lalu memotret. Nama berkas: f-000.png (0%), f-050.png (5%), dan seterusnya.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i > -1 ? args[i + 1] : d;
};
const langkah = Number(opt("--langkah", "0.05"));
const dari = Number(opt("--dari", "0"));
const sampai = Number(opt("--sampai", "1"));
const hp = args.includes("--hp");
const mode = args.includes("--ringan") ? "ringan" : "imersif";
if (!url || !out) {
  console.error("pakai: node scripts/kontak-cerita.mjs <url> <folder> [--langkah 0.05] [--hp] [--ringan]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const chrome = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9500 + Math.floor(Math.random() * 400);
const proc = spawn(
  chrome,
  ["--headless=new", "--hide-scrollbars", "--no-first-run", "--enable-unsafe-swiftshader", "--use-angle=swiftshader",
    `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "kontak-cerita-"))}`, "about:blank"],
  { stdio: "ignore" },
);
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
const js = async (expression) =>
  (await kirim("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await kirim("Page.enable");
await kirim("Runtime.enable");
await kirim(
  "Emulation.setDeviceMetricsOverride",
  hp ? { width: 390, height: 844, deviceScaleFactor: 1, mobile: true } : { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false },
);
if (args.includes("--terang") || args.includes("--gelap"))
  await kirim("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: args.includes("--terang") ? "light" : "dark" }],
  });
await kirim("Page.navigate", { url });
await tidur(1500);
await js(`localStorage.setItem("mode", "${mode}"); true`);
await kirim("Page.navigate", { url });
await tidur(4000);

const ukur = await js(`(() => {
  const s = document.querySelector("#cerita");
  const r = s.getBoundingClientRect();
  return { atas: r.top + scrollY, tinggi: r.height, layar: innerHeight };
})()`);
console.log("cerita", JSON.stringify(ukur));

for (let f = dari; f <= sampai + 1e-4; f += langkah) {
  const ff = Math.min(sampai, f);
  const y = ukur.atas + ff * (ukur.tinggi - ukur.layar);
  await js(`window.scrollTo(0, ${y}); true`);
  await tidur(1800);
  const r = await kirim("Page.captureScreenshot", { format: "png" });
  const nama = `f-${String(Math.round(ff * 1000)).padStart(4, "0")}.png`;
  writeFileSync(join(out, nama), Buffer.from(r.result.data, "base64"));
  // Babak panggung dan bab yang teksnya sedang terlihat, untuk mengecek keduanya sejalan.
  console.log(
    nama,
    await js(`[
      document.querySelector(".panggung-cerita")?.dataset.adegan ?? "-",
      "p=" + (document.querySelector(".panggung-cerita")?.dataset.p ?? "-"),
      [...document.querySelectorAll(".bab")]
        .filter((b) => +getComputedStyle(b.querySelector(".bab__teks")).opacity * +getComputedStyle(b.querySelector(".bab__isi")).opacity > 0.5)
        .map((b) => b.dataset.babak)
        .join("+"),
    ].join(" ")`),
  );
}
proc.kill();
process.exit(0);
