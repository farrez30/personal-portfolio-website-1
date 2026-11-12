// Ukur dunia toko kaset lewat Chrome headless (pola skrip ukur rak PR #54): waktu loader, progres
// yang tercatat, tugas panjang, bingkai saat kamera pindah, bingkai saat diam, dan tangkapan
// layar tiap anchor.
//   node scripts/ukur-dunia.mjs <url beranda> [lebarxtinggi] [--gpu] [--keluar <folder>] [--terang] [--kurangi] [--tanpa-teks]
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const arg = process.argv.slice(2);
const url = arg[0];
const ukuran = arg[1] && /^\d+x\d+$/.test(arg[1]) ? arg[1] : "1440x900";
const [W, H] = ukuran.split("x").map(Number);
const gpu = arg.includes("--gpu");
const keluar = arg.includes("--keluar") ? arg[arg.indexOf("--keluar") + 1] : null;
const tema = arg.includes("--terang") ? "light" : "dark";
const kurangi = arg.includes("--kurangi");
const hp = W < 768;
if (keluar) mkdirSync(keluar, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const bendera = ["--headless=new", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "ukur-dunia-"))}`];
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
const log = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") log.push("ERR " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300));
  if (m.method === "Runtime.exceptionThrown") log.push("EXC " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 300));
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
// --tanpa-teks: tiap tangkapan ditambah versi kanvas dunia saja (<nama>-dunia.png), untuk cek
// nilai di lembar look-dev (docs/look-dev.md), karena teks dan panel seksi ikut menggelapkan.
const tanpaTeks = arg.includes("--tanpa-teks");
// Selubung UI di atas kanvas (.dunia::before di kasir dan pintu, .dunia::after di sisi teks) ikut
// disembunyikan: yang diukur terang ruangannya, bukan redupan untuk keterbacaan seksi.
const SEMBUNYI = `body * { visibility: hidden !important; } .dunia, .dunia * { visibility: visible !important; } .dunia::before, .dunia::after { display: none !important; }`;
const foto = async (nama) => {
  if (!keluar) return;
  const r = await kirim("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(keluar, `${nama}.png`), Buffer.from(r.result.data, "base64"));
  if (!tanpaTeks) return;
  await js(`(() => { const s = document.createElement("style"); s.id = "ukur-sembunyi"; s.textContent = ${JSON.stringify(SEMBUNYI)}; document.head.append(s); return true; })()`);
  const d = await kirim("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(keluar, `${nama}-dunia.png`), Buffer.from(d.result.data, "base64"));
  await js(`document.getElementById("ukur-sembunyi")?.remove(); true`);
};

await kirim("Page.enable");
await kirim("Runtime.enable");
await kirim("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: Number(process.env.DPR || (hp ? 3 : 1)), mobile: hp });
if (hp) await kirim("Emulation.setTouchEmulationEnabled", { enabled: true });
if (kurangi) await kirim("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
// Catat sejak dokumen dibuat: tugas panjang dan tiap perubahan data-dunia serta persen loader.
await kirim("Page.addScriptToEvaluateOnNewDocument", {
  source: `localStorage.setItem("mode", "imersif"); localStorage.setItem("theme", ${JSON.stringify(tema)});
  window.__lt = []; window.__ltSemua = []; new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); window.__ltSemua.push([Math.round(e.startTime), Math.round(e.duration)]); } }).observe({ type: "longtask", buffered: true });
  window.__fase = []; window.__persen = [];
  new MutationObserver(() => { const d = document.documentElement.dataset.dunia; const l = window.__fase[window.__fase.length - 1]; if (!l || l[0] !== d) window.__fase.push([d, Math.round(performance.now())]); }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-dunia"] });
  setInterval(() => { const p = document.querySelector(".dunia-ular__persen"); if (p) window.__persen.push([Math.round(performance.now()), +p.getAttribute("aria-valuenow")]); }, 100);`,
});
await kirim("Page.navigate", { url });
let siap = false;
let fotoPortal = !keluar;
for (let i = 0; i < 300 && !siap; i++) {
  await tidur(100);
  siap = (await js(`document.documentElement.dataset.dunia`)) === "siap" || (await js(`document.documentElement.dataset.dunia`)) === "gagal";
  if (i === 6) await foto("00-loader");
  // Ular meliuk lalu menerjang (data-dunia = portal): dua tangkapan untuk melihat mulutnya.
  if (!fotoPortal && (await js(`document.documentElement.dataset.dunia`)) === "portal") {
    fotoPortal = true;
    await tidur(500);
    await foto("00b-liuk");
    await tidur(800);
    await foto("00c-terkam");
  }
}
console.log("gpu", await js(`(() => { const g = document.createElement("canvas").getContext("webgl2"); const e = g?.getExtension("WEBGL_debug_renderer_info"); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "?"; })()`));
console.log("fase data-dunia (ms):", JSON.stringify(await js("window.__fase")));
const persen = await js("window.__persen");
const turun = persen.filter((p, i) => i && p[1] < persen[i - 1][1]).length;
console.log("persen loader (sampel per 100 ms):", JSON.stringify(persen.map((p) => p[1])), "mundur:", turun);
console.log("tugas panjang saat memuat [mulai, lama] (ms):", JSON.stringify(await js("window.__lt")));
console.log("tahap dunia (ms):", JSON.stringify(await js(`performance.getEntriesByType("mark").filter(m => m.name.startsWith("dunia:")).map(m => [m.name.slice(6), Math.round(m.startTime)])`)));
console.log("LCP (ms):", await js(`new Promise(r => new PerformanceObserver(l => { const e = l.getEntries(); r(Math.round(e[e.length - 1].startTime) + " " + e[e.length - 1].element?.tagName); }).observe({ type: "largest-contentful-paint", buffered: true }))`));
await tidur(600);
await foto("01-bilik");

const bingkai = (ms, aksi = "") =>
  js(`(async () => { window.__lt = []; const fr = []; let last = performance.now(); const t0 = last; ${aksi}; await new Promise(res => { const f = t => { fr.push(t - last); last = t; if (t - t0 < ${ms}) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); const s = [...fr].sort((a,b)=>a-b); return { n: fr.length, median: +s[s.length>>1].toFixed(1), p95: +s[Math.floor(s.length*.95)].toFixed(1), terburuk: +s[s.length-1].toFixed(1), lt: window.__lt.map(x=>x[1]) }; })()`);

// Sesudah loader: props cerita v4 dimuat dan dipanaskan di sini (requestIdleCallback), jadi jendela
// ini juga mengukur apakah hero tersendat saat itu.
console.log("diam di hero 4 s (props cerita dimuat):", JSON.stringify(await bingkai(4000)));
console.log("props cerita:", await js(`document.querySelector(".dunia")?.dataset.cerita ?? "belum"`));
const tempat = [
  ["02-dinding", "#cerita"],
  // Dua babak tur props: pindah dari babak ke babak di dalam cerita.
  ["02b-bentuk", ".bab--bentuk"],
  ["02c-andal", ".bab--andal"],
  ["03-rak", "#rak"],
  ["04-kasir", "[data-dunia=kasir]"],
];
for (const [nama, sel] of tempat) {
  // Lompat ke seksi, lalu ukur bingkai selama kamera terbang. Satu tangkapan di tengah jalan
  // untuk melihat motion blur, satu setelah mendarat.
  // Dekati dulu sampai setengah layar sebelum batas seksi, tunggu (seksi lain boleh menyiapkan
  // dirinya di sini, seperti saat pengunjung menggulir biasa), lalu lewati batasnya dengan gulir
  // 0,3 detik dan ukur bingkai selama kamera terbang.
  await js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight, behavior: "instant" }); return true; })()`);
  await tidur(3000);
  const aksi = `(() => { const awal = scrollY, t0 = performance.now(); const f = (t) => { const u = Math.min(1, (t - t0) / 300); scrollTo({ top: awal + innerHeight * 0.7 * u, behavior: "instant" }); if (u < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
  console.log(`  mulai pindah ke ${nama} (ms):`, await js("Math.round(performance.now())"));
  const ukur = bingkai(1500, aksi);
  // Tangkapan di tengah terbang menahan bingkai (di 390x844 DPR 3 sampai 1 detik), jadi hanya
  // diambil dengan --foto-terbang, dan angka bingkainya tidak dipakai.
  if (arg.includes("--foto-terbang")) {
    await tidur(280);
    await foto(`${nama}-terbang`);
  }
  console.log(`pindah ke ${nama} 1,5 s:`, JSON.stringify(await ukur), await js(`document.querySelector(".dunia")?.dataset.anchor`));
  await tidur(1500);
  await foto(nama);
}
// Diam di babak bangun: piringan berputar, jadi dunia digambar tiap bingkai dengan AO dan depth
// of field. Ini beban terberat yang bertahan lama, tempat lag paling terasa.
if (await js(`!!document.querySelector(".bab--bangun")`)) {
  await js(`(() => { const el = document.querySelector(".bab--bangun"); scrollTo({ top: el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.4 - innerHeight / 2, behavior: "instant" }); return true; })()`);
  await tidur(2500);
  console.log("diam di babak bangun 2 s (gambar terus):", JSON.stringify(await bingkai(2000)));
}
// Di dalam seksi rak: rak 3D yang sudah ada di depan rak toko, dua kanvas menggambar bersamaan.
await js(`(() => { const el = document.querySelector("#rak"); scrollTo({ top: el.getBoundingClientRect().top + scrollY + innerHeight * 0.4, behavior: "instant" }); return true; })()`);
await tidur(3000);
await foto("03b-rak-dalam");
console.log("rak, menggulir antar album 2 s:", JSON.stringify(await bingkai(2000, `(() => { const awal = scrollY, t0 = performance.now(); const f = (t) => { const u = Math.min(1, (t - t0) / 1500); scrollTo({ top: awal + innerHeight * 0.8 * u, behavior: "instant" }); if (u < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`)));
await js(`scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }); true`);
await tidur(1800);
await foto("05-pintu");
console.log("program shader rak:", await js(`[...document.querySelectorAll("[data-program]")].map(e => e.dataset.program).join(",")`));
console.log("tahap rak (ms):", JSON.stringify(await js(`performance.getEntriesByType("mark").filter(m => m.name.startsWith("rak:")).map(m => [m.name.slice(4), Math.round(m.startTime)])`)));
console.log("semua tugas panjang sejak siap [mulai, lama]:", JSON.stringify(await js("window.__ltSemua")));
console.log("titik:", await js(`document.querySelector(".dunia")?.dataset.titik`));
console.log("anchor akhir, piksel kanvas:", await js(`(() => { const c = document.querySelector(".dunia canvas"); return c ? c.width + "x" + c.height : "tidak ada"; })()`));
console.log(log.join("\n"));
proc.kill();
process.exit(0);
