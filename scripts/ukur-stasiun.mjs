// Ukur dan potret dunia cerita v5 (components/stasiun) di Chrome headless lewat CDP:
// - tiap babak di lantai kantor: draw call, segitiga, foto kanvas;
// - tiap perpindahan antarbabak dengan jam dibekukan: bingkai per 0,1 detik, raycast tengah layar,
//   draw call terbanyak, lalu lembar kontak berlabel waktu.
// - dengan --sela: tiap perpindahan disela di tengah lalu digulir balik; lompatan posisi kamera
//   antarbingkai 0,1 s dicatat (jalur yang sama diputar mundur dari titik sela, tanpa loncat).
// - dengan --lab (F6): rel lorong modul lab di sebelas titik gulir, buka dan tutup loker dengan jam
//   beku per 0,1 detik, lalu uji keyboard: Tab ke daftar, fokus menyalakan loker dan menggulir
//   kamera, Enter membuka panel, Escape menutupnya dan fokus kembali ke item daftar.
//   node scripts/ukur-stasiun.mjs <url /v5> <lebarxtinggi> --keluar <folder> [--dpr 2] [--cpu 4] [--gpu] [--kontak] [--sela] [--lab]
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
const sela = arg.includes("--sela");
const lab = arg.includes("--lab");
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
  hasil.babak.push({ anchor: aktif, calls: info.calls, segitiga: info.segitiga, programs: info.programs, pertama: info.pertama, panas: info.panas });
  await foto(join(keluar, `babak-${String(i).padStart(2, "0")}-${aktif}.jpg`));
  await foto(join(keluar, `halaman-${String(i).padStart(2, "0")}-${aktif}.jpg`), false);
  // Ujung babak (dorongan selesai, lalu lintas babak ramai paling padat), sebelum pemicu berikutnya.
  if (titik[i + 1]) {
    await js(`(() => { scrollTo(0, Math.max(0, ${titik[i + 1].y} - innerHeight / 2 - 80)); dispatchEvent(new Event("scroll")); return true; })()`);
    await tidur(1500);
    if ((await js(`document.querySelector(".stasiun").dataset.anchor`)) === aktif) await foto(join(keluar, `akhir-${String(i).padStart(2, "0")}-${aktif}.jpg`));
  }
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
    for (let k = 0; k <= 70; k++) {
      const s = await js(`(() => { const u = window.__stasiunUji; const x = u.waktu(${T0 + k * 100}); return { ...x, periksa: u.periksa() }; })()`);
      maks = Math.max(maks, s.calls);
      const nama = `t${String(k).padStart(2, "0")}.jpg`;
      await foto(join(map, nama));
      bingkai.push({ t: +(k / 10).toFixed(1), calls: s.calls, blend: s.blend, tahap: s.tahap, silang: s.silang, periksa: s.periksa, berkas: nama });
      if (!s.blend && k > 2) break;
    }
    await js(`window.__stasiunUji.waktu(null); true`);
    hasil.pindah.push({ dari: titik[i].nama, ke, bingkai });
    // Lembar kontak: semua bingkai berlabel waktu, jarak raycast, dan draw call.
    const sel = bingkai
      .map((b) => `<figure><img src="${b.berkas}"><figcaption>${b.t.toFixed(1)} s, ${b.periksa ? `${b.periksa.benda} ${b.periksa.jarak} m` : "kosong"}, ${b.calls} dc${b.silang ? `, silang ${b.silang}` : ""}</figcaption></figure>`)
      .join("");
    const kolom = hp ? 6 : 4;
    writeFileSync(
      join(map, "kontak.html"),
      `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;font:13px system-ui;color:#eee}h1{font-size:15px;margin:8px}main{display:grid;grid-template-columns:repeat(${kolom},1fr);gap:4px;padding:4px}figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 4px}</style><h1>${titik[i].nama} ke ${ke}</h1><main>${sel}</main>`,
    );
  }
}
// 3. Disela di tengah lalu digulir balik
if (sela) {
  hasil.sela = [];
  for (let i = 0; i + 1 < titik.length; i++) {
    await keAnchor(i);
    await tidur(1500);
    if (await js(`document.querySelector(".stasiun").hasAttribute("data-kosong")`)) continue;
    const T0 = 3e7 + i * 1e5;
    await js(`window.__stasiunUji.waktu(${T0}); true`);
    const ke = await keAnchor(i + 1);
    if (await js(`document.querySelector(".stasiun").hasAttribute("data-kosong")`)) {
      await js(`window.__stasiunUji.waktu(null); true`);
      continue;
    }
    const pos = [];
    const langkah = async (k) => (await js(`window.__stasiunUji.waktu(${T0 + k * 100})`));
    let k = 0;
    let s;
    // maju 0,7 s (separuh perpindahan terpanjang di dalam gedung), lalu digulir balik
    for (; k <= 7; k++) {
      s = await langkah(k);
      pos.push([s.posisi, s.tahap]);
      if (!s.blend) break;
    }
    const sebelum = s.rinci;
    const balik = await keAnchor(i);
    const rinci = [sebelum];
    // k sudah 8 sesudah loop maju: bingkai pertama sesudah balik di 0,8 s
    for (let n = 0; n < 40; n++, k++) {
      s = await langkah(k);
      if (n < 2) rinci.push(s.rinci);
      pos.push([s.posisi, s.tahap]);
      if (!s.blend) break;
    }
    await js(`window.__stasiunUji.waktu(null); true`);
    // loncatan hanya dihitung di dalam satu tahap: antartahap satuannya berbeda (silang, bukan gerak)
    const loncat = pos.slice(1).map(([p, t], j) => (t === pos[j][1] ? Math.hypot(...p.map((v, d) => v - pos[j][0][d])) : 0));
    hasil.sela.push({ dari: titik[i].nama, ke, balik, bingkai: pos.length, loncatMaks: +Math.max(...loncat).toFixed(3), loncatDiSela: +loncat[7]?.toFixed(3), loncat: loncat.map((x) => +x.toFixed(3)), rinci, akhir: s.posisi, tahap: pos.map((x) => x[1]).join(" "), blendSelesai: !s.blend });
  }
}
// 4. Modul lab: rel, buka loker, keyboard
const kontakLab = [];
if (lab) {
  const iLab = titik.findIndex((t) => t.nama === "modul-lab");
  await keAnchor(iLab);
  await tidur(7000);
  const seksi = await js(`(() => { const r = document.querySelector("#modul-lab").getBoundingClientRect(); return { atas: r.top + scrollY, tinggi: r.height }; })()`);
  const gulirK = (k) => js(`(() => { scrollTo(0, ${seksi.atas} - innerHeight / 2 + ${k} * (${seksi.tinggi} - innerHeight)); dispatchEvent(new Event("scroll")); return true; })()`);
  const map = join(keluar, "lab");
  mkdirSync(map, { recursive: true });
  hasil.lab = { rel: [], buka: [], tutup: [] };
  for (let s = 0; s <= 10; s++) {
    await gulirK(s / 10);
    await tidur(1400);
    const x = await js(`(() => { const u = window.__stasiunUji; const x = u.waktu(performance.now()); const p = u.periksa(); u.waktu(null); return { ...x, periksa: p, nyala: u.info().lab.nyala, daftar: [...document.querySelectorAll(".modul-lab__daftar > li")].findIndex((li) => li.hasAttribute("data-nyala")) }; })()`);
    maks = Math.max(maks, x.calls);
    const nama = `rel-${String(s).padStart(2, "0")}.jpg`;
    await foto(join(map, nama));
    if (s % 5 === 0) await foto(join(map, `halaman-rel-${String(s).padStart(2, "0")}.jpg`), false);
    hasil.lab.rel.push({ k: s / 10, calls: x.calls, posisi: x.posisi.map((v) => +v.toFixed(2)), periksa: x.periksa, nyala: x.nyala, daftar: x.daftar, berkas: nama });
    kontakLab.push({ judul: "rel", t: `k ${(s / 10).toFixed(1)}`, b: x, berkas: `lab/${nama}` });
  }
  // buka loker ke-2 (L-03) dari daftar dengan jam beku, per 0,1 s
  await gulirK(0.15);
  await tidur(1400);
  const T0 = 5e7;
  await js(`window.__stasiunUji.waktu(${T0}); document.querySelectorAll(".modul-lab__daftar .modul-lab__item")[2].click(); true`);
  for (const [jenis, mulai] of [["buka", 0], ["tutup", 20]]) {
    // jam dimajukan ke awal lembar dulu, baru Tutup diklik, supaya bingkai 0,0 s = saat klik
    if (jenis === "tutup") await js(`window.__stasiunUji.waktu(${T0} + ${mulai * 100}); document.querySelector(".modul-lab__panel .modul-lab__tutup").click(); true`);
    for (let k = 0; k <= 13; k++) {
      const x = await js(`(() => { const u = window.__stasiunUji; const x = u.waktu(${T0} + ${(mulai + k) * 100}); return { ...x, lab: u.info().lab }; })()`);
      maks = Math.max(maks, x.calls);
      const nama = `${jenis}-${String(k).padStart(2, "0")}.jpg`;
      await foto(join(map, nama));
      hasil.lab[jenis].push({ t: +(k / 10).toFixed(1), calls: x.calls, lab: x.lab, berkas: nama });
      kontakLab.push({ judul: jenis, t: `${(k / 10).toFixed(1)} s`, b: x, berkas: `lab/${nama}` });
    }
    if (jenis === "buka") await foto(join(map, "halaman-panel.jpg"), false);
  }
  await js(`window.__stasiunUji.waktu(null); true`);
  await tidur(800);
  // keyboard: Tab sampai item daftar pertama, Tab lagi ke item berikutnya, Enter, Escape
  const tekan = async (key, code, kc) => {
    await kirim("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: kc, ...(key === "Enter" ? { text: String.fromCharCode(13) } : {}) });
    await kirim("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: kc });
  };
  const aktif = () => js(`(() => { const a = document.activeElement; const i = [...document.querySelectorAll(".modul-lab__daftar .modul-lab__item")].indexOf(a); return { i, kelas: a?.className ?? "", dialog: !!document.querySelector(".modul-lab__panel[open]"), dalamDialog: !!a?.closest(".modul-lab__panel"), nyala: window.__stasiunUji.info().lab.nyala, buka: window.__stasiunUji.info().lab.buka, y: Math.round(scrollY), live: document.querySelector("#modul-lab [aria-live]")?.textContent ?? "" }; })()`);
  await gulirK(0);
  await tidur(1200);
  await js(`(() => { const h = document.getElementById("modul-lab-judul"); h.tabIndex = -1; h.focus(); h.removeAttribute("tabindex"); return true; })()`);
  // gaya "sembunyi" foto kanvas membuat isi halaman tidak bisa difokus: lepas dulu
  await js(`document.getElementById("sembunyi")?.remove(); true`);
  await kirim("Emulation.setFocusEmulationEnabled", { enabled: true });
  await kirim("Page.bringToFront");
  const ky = (hasil.lab.keyboard = []);
  await tekan("Tab", "Tab", 9);
  await tidur(1500);
  ky.push({ langkah: "Tab ke item pertama", ...(await aktif()) }); console.log(JSON.stringify(ky.at(-1)));
  for (let n = 0; n < 4; n++) await tekan("Tab", "Tab", 9);
  await tidur(1800);
  ky.push({ langkah: "Tab empat kali (item ke-5)", ...(await aktif()) }); console.log(JSON.stringify(ky.at(-1)));
  await foto(join(map, "keyboard-item5.jpg"), false);
  await tekan("Enter", "Enter", 13);
  await tidur(1800);
  ky.push({ langkah: "Enter", ...(await aktif()) }); console.log(JSON.stringify(ky.at(-1)));
  await tekan("Escape", "Escape", 27);
  await tidur(1500);
  ky.push({ langkah: "Escape", ...(await aktif()) }); console.log(JSON.stringify(ky.at(-1)));
  await tekan("Enter", "Enter", 13);
  await tidur(1500);
  if ((await aktif()).dialog) await kirim("Runtime.evaluate", { expression: "history.back()" });
  await tidur(1500);
  ky.push({ langkah: "Enter lalu Back browser", ...(await aktif()) }); console.log(JSON.stringify(ky.at(-1)));
  const jamAwal = await js(`window.__stasiunUji.info().lab.jamLab`);
  await tidur(600);
  const jeda = { jalanSebelum: +((await js(`window.__stasiunUji.info().lab.jamLab`)) - jamAwal).toFixed(2) };
  await js(`document.querySelector(".modul-lab__jeda").click(); true`);
  await tidur(300);
  jeda.tekan = await js(`document.querySelector(".modul-lab__jeda").getAttribute("aria-pressed")`);
  jeda.jam = await js(`window.__stasiunUji.info().lab.jamLab`);
  await tidur(1200);
  jeda.jamSesudah = (await js(`window.__stasiunUji.info().lab.jamLab`));
  await js(`document.querySelector(".modul-lab__jeda").click(); true`);
  ky.push({ langkah: "tombol jeda gerak", ...jeda }); console.log(JSON.stringify(ky.at(-1)));
  // sesudah seksi lewat: dunia memudar
  await js(`(() => { scrollTo(0, ${seksi.atas + seksi.tinggi}); dispatchEvent(new Event("scroll")); return true; })()`);
  await tidur(800);
  hasil.lab.lewat = await js(`document.querySelector(".stasiun").hasAttribute("data-lewat")`);
  hasil.lab.pertama = await js(`window.__stasiunUji.info().pertama`);
  hasil.lab.panas = await js(`window.__stasiunUji.info().panas.lab`);
  const sel = kontakLab.map((x) => `<figure><img src="${x.berkas}"><figcaption>${x.judul} ${x.t}, ${x.b.calls} dc${x.b.silang ? `, silang ${x.b.silang}` : ""}</figcaption></figure>`).join("");
  writeFileSync(join(keluar, "kontak-lab.html"), `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;font:13px system-ui;color:#eee}main{display:grid;grid-template-columns:repeat(${hp ? 6 : 4},1fr);gap:4px;padding:4px}figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 4px}</style><main>${sel}</main>`);
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
if (lab) {
  await kirim("Page.navigate", { url: pathToFileURL(join(keluar, "kontak-lab.html")).href });
  await tidur(1000);
  const tinggi = await js(`document.documentElement.scrollHeight`);
  await kirim("Emulation.setDeviceMetricsOverride", { width: 1600, height: tinggi, deviceScaleFactor: 1, mobile: false });
  await tidur(400);
  const r = await kirim("Page.captureScreenshot", { format: "jpeg", quality: 85 });
  writeFileSync(join(keluar, "kontak-lab.jpg"), Buffer.from(r.result.data, "base64"));
}
console.log(JSON.stringify({ lab: hasil.lab && { pertama: hasil.lab.pertama, panas: hasil.lab.panas, keyboard: hasil.lab.keyboard, lewat: hasil.lab.lewat, rel: hasil.lab.rel.map((x) => `${x.k} ${x.calls}dc nyala ${x.nyala}/${x.daftar} ${x.periksa?.benda}`) }, maksCalls: maks, babak: hasil.babak.map((b) => `${b.anchor} ${b.calls} dc ${JSON.stringify(b.pertama)} ${JSON.stringify(b.panas)}`), sela: hasil.sela?.map((x) => `${x.dari} ke ${x.ke} balik ${x.balik}: loncat maks ${x.loncatMaks} m, di sela ${x.loncatDiSela} m, selesai ${x.blendSelesai}`), galat }, null, 1));
process.exit(0);
