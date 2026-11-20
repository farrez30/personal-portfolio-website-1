// Ukur dan potret dunia cerita v5 (components/stasiun) di Chrome headless lewat CDP:
// - tiap babak di lantai kantor: draw call, segitiga, foto kanvas;
// - tiap perpindahan antarbabak dengan jam dibekukan: bingkai per 0,1 detik, raycast tengah layar,
//   draw call terbanyak, lalu lembar kontak berlabel waktu.
//   node scripts/ukur-stasiun.mjs <url /v5> <lebarxtinggi> --keluar <folder> [--dpr 2] [--cpu 4] [--gpu] [--kontak]
// Hasil angka di <folder>/ukur.json. Profil Chrome sementara dihapus di akhir.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const arg = process.argv.slice(2);
const nilai = (k, b) => (arg.includes(k) ? arg[arg.indexOf(k) + 1] : b);
const url = arg[0];
const [W, H] = (arg[1] ?? "390x844").split("x").map(Number);
const keluar = resolve(nilai("--keluar", "ukur-stasiun"));
const dpr = Number(nilai("--dpr", W < 768 ? 2 : 1));
const cpu = Number(nilai("--cpu", 1));
const gpu = arg.includes("--gpu");
const kontak = arg.includes("--kontak");
const hp = W < 768;
mkdirSync(keluar, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const profil = mkdtempSync(join(tmpdir(), "ukur-stasiun-"));
let proc;
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
const bendera = ["--headless=new", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`];
bendera.push(...(gpu ? ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"]));
proc = spawn(process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", [...bendera, "about:blank"], { stdio: "ignore" });
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
const galat = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") galat.push(m.params.args.map((x) => x.value ?? x.description).join(" ").slice(0, 300));
  if (m.method === "Runtime.exceptionThrown") galat.push(m.params.exceptionDetails.exception?.description?.slice(0, 300));
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
  return r.result?.result?.value;
};
// Kanvas saja: isi halaman dibuat tembus supaya bingkai yang dinilai hanya dunianya. visibility
// saja tidak cukup: latar tombol pemutar musik tetap terpotret sebagai bulatan hitam.
const SEMBUNYI = `body > *:not(.stasiun), body > *:not(.stasiun) * { opacity: 0 !important; visibility: hidden !important; transition: none !important; } .stasiun::after { display: none; }`;
const foto = async (berkas, kanvasSaja = true) => {
  if (kanvasSaja) await js(`(() => { if (!document.getElementById("sembunyi")) { const s = document.createElement("style"); s.id = "sembunyi"; s.textContent = ${JSON.stringify(SEMBUNYI)}; document.head.append(s); } return true; })()`);
  else await js(`document.getElementById("sembunyi")?.remove(); true`);
  const r = await kirim("Page.captureScreenshot", { format: "jpeg", quality: 82 });
  writeFileSync(berkas, Buffer.from(r.result.data, "base64"));
};

await kirim("Page.enable");
await kirim("Runtime.enable");
await kirim("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: dpr, mobile: hp });
if (hp) await kirim("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await kirim("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem("mode", "imersif");` });
await kirim("Page.navigate", { url: url + (url.includes("?") ? "&" : "?") + "uji-stasiun" });
for (let i = 0; i < 120; i++) {
  if (await js(`!!document.querySelector(".stasiun[data-siap]")`)) break;
  await tidur(250);
}
if (!(await js(`!!window.__stasiunUji`))) {
  console.log("dunia tidak siap", galat);
  process.exit(1);
}
if (cpu > 1) await kirim("Emulation.setCPUThrottlingRate", { rate: cpu });

const anchor = await js(`document.querySelector(".stasiun").dataset.titik`);
const titik = anchor.split(" ").map((x) => {
  const [nama, y] = x.split(":");
  return { nama, y: Number(y) };
});
const keAnchor = (i) => js(`(() => { scrollTo(0, Math.max(0, ${titik[i].y} - innerHeight / 2 + 40)); dispatchEvent(new Event("scroll")); return document.querySelector(".stasiun").dataset.anchor; })()`);

const hasil = { layar: `${W}x${H}@${dpr}`, cpu, babak: [], pindah: [], galat };
// 1. Diam di tiap babak
let maks = 0;
for (let i = 0; i < titik.length; i++) {
  const aktif = await keAnchor(i);
  await tidur(2600);
  const kosong = await js(`document.querySelector(".stasiun").hasAttribute("data-kosong")`);
  if (kosong) continue;
  const info = await js(`(() => { const u = window.__stasiunUji; u.waktu(performance.now()); const x = u.info(); u.waktu(null); return x; })()`);
  maks = Math.max(maks, info.calls);
  hasil.babak.push({ anchor: aktif, calls: info.calls, segitiga: info.segitiga, programs: info.programs });
  await foto(join(keluar, `babak-${String(i).padStart(2, "0")}-${aktif}.jpg`));
  await foto(join(keluar, `halaman-${String(i).padStart(2, "0")}-${aktif}.jpg`), false);
}

// 2. Perpindahan, jam dibekukan: bingkai per 0,1 detik
if (kontak) {
  for (let i = 0; i + 1 < titik.length; i++) {
    await keAnchor(i);
    await tidur(1500);
    if (await js(`document.querySelector(".stasiun").hasAttribute("data-kosong")`)) continue;
    const T0 = 1e7;
    await js(`window.__stasiunUji.waktu(${T0}); true`);
    const ke = await keAnchor(i + 1);
    if (await js(`document.querySelector(".stasiun").hasAttribute("data-kosong")`)) {
      await js(`window.__stasiunUji.waktu(null); true`);
      continue;
    }
    const map = join(keluar, `pindah-${String(i).padStart(2, "0")}-${titik[i].nama}-${ke}`);
    mkdirSync(map, { recursive: true });
    const bingkai = [];
    for (let k = 0; k <= 30; k++) {
      const s = await js(`(() => { const u = window.__stasiunUji; const x = u.waktu(${T0 + k * 100}); return { ...x, periksa: u.periksa() }; })()`);
      maks = Math.max(maks, s.calls);
      const nama = `t${String(k).padStart(2, "0")}.jpg`;
      await foto(join(map, nama));
      bingkai.push({ t: +(k / 10).toFixed(1), calls: s.calls, blend: s.blend, periksa: s.periksa, berkas: nama });
      if (!s.blend && k > 2) break;
    }
    await js(`window.__stasiunUji.waktu(null); true`);
    hasil.pindah.push({ dari: titik[i].nama, ke, bingkai });
    // Lembar kontak: semua bingkai berlabel waktu, jarak raycast, dan draw call.
    const sel = bingkai
      .map((b) => `<figure><img src="${b.berkas}"><figcaption>${b.t.toFixed(1)} s, ${b.periksa ? `${b.periksa.benda} ${b.periksa.jarak} m` : "kosong"}, ${b.calls} dc</figcaption></figure>`)
      .join("");
    const kolom = hp ? 6 : 4;
    writeFileSync(
      join(map, "kontak.html"),
      `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;font:13px system-ui;color:#eee}h1{font-size:15px;margin:8px}main{display:grid;grid-template-columns:repeat(${kolom},1fr);gap:4px;padding:4px}figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 4px}</style><h1>${titik[i].nama} ke ${ke}</h1><main>${sel}</main>`,
    );
  }
}
hasil.maksCalls = maks;
writeFileSync(join(keluar, "ukur.json"), JSON.stringify(hasil, null, 2));

// Potret lembar kontak sebagai gambar satu halaman.
if (kontak) {
  await kirim("Emulation.setDeviceMetricsOverride", { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const p of hasil.pindah) {
    const map = join(keluar, `pindah-${String(titik.findIndex((t) => t.nama === p.dari)).padStart(2, "0")}-${p.dari}-${p.ke}`);
    await kirim("Page.navigate", { url: pathToFileURL(join(map, "kontak.html")).href });
    await tidur(800);
    const tinggi = await js(`document.documentElement.scrollHeight`);
    await kirim("Emulation.setDeviceMetricsOverride", { width: 1600, height: tinggi, deviceScaleFactor: 1, mobile: false });
    await tidur(300);
    const r = await kirim("Page.captureScreenshot", { format: "jpeg", quality: 85 });
    writeFileSync(join(keluar, `kontak-${p.dari}-${p.ke}.jpg`), Buffer.from(r.result.data, "base64"));
    await kirim("Emulation.setDeviceMetricsOverride", { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
  }
}
console.log(JSON.stringify({ maksCalls: maks, babak: hasil.babak, galat }, null, 1));
process.exit(0);
