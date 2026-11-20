// Logo asli klien (desain/klien/logo, asalnya di PROVENANCE.md di folder itu) per slug content/klien.js.
// lockup = logo dengan nama (sertifikat, HUD), ikon = tanda saja (patch). Saksama belum punya logo.
const D = new URL("../../klien/logo/", import.meta.url).href;
const f = (n) => D + n;

export const LOGO = {
  uruzin: { lockup: f("uruzin.png") },
  "masaya-food": { lockup: f("masaya-food.png") },
  "rpn-agro": { lockup: f("rpn-agro.jpg"), latarPutih: true },
  tgr: { lockup: f("tgr.png") },
  "raja-roti": { lockup: f("raja-roti.png") },
  saychick: { lockup: f("saychick.png") },
  "success-career": { lockup: f("success-career.png") },
  studentchanges: { lockup: f("studentchanges.png") },
  terasol: { lockup: f("terasol-lockup.png"), ikon: f("terasol.png") },
  viralytics: { lockup: f("viralytics.png") },
  tumtim: { lockup: f("tumtim.png") },
  sanden: { lockup: f("sanden.jpg"), latarPutih: true },
  jasindo: { lockup: f("jasindo.png") },
  bni: { lockup: f("bni.png") },
  pbt: { lockup: f("pbt.png") },
  fifofun: { lockup: f("lockup-fifofun.png"), ikon: f("ikon-fifofun.png") },
  "nds-etl": { lockup: f("lockup-nds-etl.png"), ikon: f("ikon-nds-etl.png") },
  akarkita: { lockup: f("lockup-akarkita.png"), ikon: f("ikon-akarkita.png") },
  jeda: { lockup: f("lockup-jeda.png"), ikon: f("ikon-jeda.png") },
  yiheecam: { lockup: f("lockup-yiheecam.png"), ikon: f("ikon-yiheecam.png") },
  "d-day": { lockup: f("lockup-d-day.png"), ikon: f("ikon-d-day.png") },
};

const cache = new Map();
export const muatLogo = (url) => {
  if (!cache.has(url)) cache.set(url, new Promise((ok) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => ok(null); img.src = url; }));
  return cache.get(url);
};

// gambar logo pas di dalam kotak (x, y, w, h), rasio dijaga
export function gambarLogo(g, img, x, y, w, h) {
  if (!img) return false;
  const s = Math.min(w / img.width, h / img.height), lw = img.width * s, lh = img.height * s;
  g.drawImage(img, x + (w - lw) / 2, y + (h - lh) / 2, lw, lh);
  return true;
}
