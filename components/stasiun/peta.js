// Peta Nusantara (babak langkah-kecil) dan globe malam (babak penutup) cerita v5, fase F5, sebagai
// data tanpa three.js supaya pose, jalur serah terima, dan orbit satelit bisa dites di Node
// (tests/stasiun-peta.test.mjs). peta3d.js mengubahnya jadi dua adegan three.js.
//
// Tiap tahap punya satuan lokalnya sendiri (storyboard-build.md §3): bilangan float32 dan depth
// buffer tidak cukup untuk meja 1 m sampai bumi dalam satu koordinat, dan logarithmicDepthBuffer
// tidak dipakai. Tahap gedung dan kota memakai meter di koordinat lantai kantor (lantai.js, kota.js).
// Peta: 6 satuan per derajat, pusat 118 BT 2 LS di titik asal, utara ke -z, bidang di y = 0
// (previs ADEGAN["langkah-kecil"]). Globe: jari-jari bumi 100 di titik asal (previs ADEGAN.penutup).
// Tekstur keduanya dipanggang jadi WebP oleh scripts/panggang-peta.mjs.

import { KLIEN } from "../../content/klien.js";

// ---- Peta Nusantara ----------------------------------------------------------------------------
// Kotak bujur dan lintang bidang peta [bujur barat, bujur timur, lintang selatan, lintang utara]:
// cukup lebar supaya tepinya tidak masuk bingkai saat kamera menjauh (di HP tepi bawah bingkai
// sampai sekitar 69 LS, dan saat mundur ke globe sampai 85 LS).
export const KOTAK_PETA = [20, 220, -90, 75];
export const SKALA_PETA = 6;
const PUSAT_PETA = [118, -2];
export const keLokal = (lon, lat, y = 0) => [(lon - PUSAT_PETA[0]) * SKALA_PETA, y, -(lat - PUSAT_PETA[1]) * SKALA_PETA];
const [b0, b1, s0, s1] = KOTAK_PETA;
export const BIDANG_PETA = {
  lebar: (b1 - b0) * SKALA_PETA,
  dalam: (s1 - s0) * SKALA_PETA,
  pusat: keLokal((b0 + b1) / 2, (s0 + s1) / 2),
};
// Kota besar di peta (desain/cerita-v5/peta.mjs). Jakarta titik merah, rute satu cabang ke Surabaya.
export const KOTA_PETA = {
  jakarta: [106.8, -6.2],
  surabaya: [112.7, -7.3],
  medan: [98.7, 3.6],
  makassar: [119.4, -5.1],
  balikpapan: [116.8, -1.2],
  denpasar: [115.2, -8.6],
  jayapura: [140.7, -2.5],
  pontianak: [109.3, 0],
};
export const RUTE_PETA = ["jakarta", "surabaya"];
// Penanda di atas bidang: titik Jakarta (jari-jari 3) dan cincinnya (5 sampai 6), cabang (2,4),
// kota lain abu-abu (2). Pusat titik di y = 2.
export const TITIK_PETA = { y: 2, jakarta: 3, cincin: [5, 6], cabang: 2.4, kota: 2 };
export const JAKARTA_PETA = keLokal(...KOTA_PETA.jakarta, TITIK_PETA.y);

// Rute melengkung naik di tengah, seperti previs: kurva kuadrat setinggi 10 + 12% panjangnya.
export function kurvaRute(dari = RUTE_PETA[0], ke = RUTE_PETA[1]) {
  const a = keLokal(...KOTA_PETA[dari], TITIK_PETA.y);
  const b = keLokal(...KOTA_PETA[ke], TITIK_PETA.y);
  const j = Math.hypot(...a.map((v, i) => v - b[i]));
  const c = [(a[0] + b[0]) / 2, 10 + j * 0.12, (a[2] + b[2]) / 2];
  return { a, c, b };
}

// Pose babak langkah-kecil (previs, fov sama dengan babak lain): Nusantara utuh, utara di atas.
export const POSE_PETA = {
  tahap: "peta",
  // titik bidik 3 derajat di timur previs supaya Papua tidak terpotong di tepi kanan
  posisi: [25, 370, 200],
  lihat: [20, 0, 5],
  fov: 38,
  tegak: { posisi: [0, 640, 90], lihat: [0, 0, 10], fov: 52 },
};

// ---- Globe malam -------------------------------------------------------------------------------
export const R_BUMI = 100;
// Bujur dan lintang ke titik di bola, sama dengan UV SphereGeometry three.js (tekstur equirectangular,
// bujur -180 di u = 0).
export function keBola(lon, lat, r = R_BUMI) {
  const fi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(fi) * Math.cos(th), r * Math.cos(fi), r * Math.sin(fi) * Math.sin(th)];
}
export const JAKARTA_BOLA = keBola(...KOTA_PETA.jakarta);
export const TITIK_BOLA = { jakarta: 1.8, cabang: 1.2 };

// Pose babak penutup (previs ADEGAN.penutup): kamera di atas Jakarta dan sedikit ke utara, bumi
// dan orbit satelit masuk bingkai.
const arahJkt = JAKARTA_BOLA.map((v) => v / R_BUMI);
const pos = (jarak, naik) => arahJkt.map((v, i) => v * jarak + (i === 1 ? naik : 0));
export const POSE_GLOBE = {
  tahap: "globe",
  posisi: pos(470, 90),
  lihat: [arahJkt[0] * 10 - 40, 10, arahJkt[2] * 10],
  fov: 38,
  // HP: lebih dekat dari previs (560) supaya bumi mengisi bagian di atas teks, bukan sepertiganya
  tegak: { posisi: pos(440, 70), lihat: [0, -30, 0], fov: 52 },
};

// Satelit: semua klien (content/klien.js), satu bidang orbit tipis per kelompok seperti previs
// portoStasiun (storyboard-build.md §4a). Jumlahnya dihitung dari data, tanpa satelit pengisi.
// Stasiun (modul lab, babak sesudahnya) mengorbit di bidangnya sendiri, lebih dekat ke bumi.
const KELOMPOK_ORBIT = [
  { kelompok: "coderoach", warna: 0xb9dcb0, r: 150, miring: 0.35 },
  { kelompok: "mitraplus", warna: 0xa9c4ec, r: 168, miring: -0.25 },
  { kelompok: "pribadi", warna: 0xf2d27a, r: 186, miring: 0.8 },
];
export const ORBIT_KLIEN = KELOMPOK_ORBIT.map((o) => ({ ...o, klien: KLIEN.filter((k) => k.kelompok === o.kelompok).map((k) => k.slug) }));
export const ORBIT_STASIUN = { r: 132, miring: 0.5, sudut: 0.9 };
const MIRING_Z = 0.25;
// Laju sudut (rad/s) mengikuti hukum Kepler: orbit dalam lebih cepat. Satu putaran orbit klien
// terdalam sekitar 2 menit, cukup pelan untuk dibaca sambil menggulir.
export const lajuOrbit = (r) => 0.05 * Math.pow(150 / r, 1.5);
// Titik di lingkaran orbit (bidang xz) diputar Rz lalu Rx, sama dengan Euler(miring, 0, z) three.js.
function diOrbit(r, miring, a) {
  const [x0, z0] = [Math.cos(a) * r, Math.sin(a) * r];
  const [cz, sz] = [Math.cos(MIRING_Z), Math.sin(MIRING_Z)];
  const [x, y] = [x0 * cz, x0 * sz];
  const [cx, sx] = [Math.cos(miring), Math.sin(miring)];
  return [x, y * cx - z0 * sx, y * sx + z0 * cx];
}
export function posisiSatelit(o, i, t) {
  const n = o.klien.length;
  return diOrbit(o.r, o.miring, (i / n) * Math.PI * 2 + o.r + lajuOrbit(o.r) * t);
}
export const posisiStasiun = (t) => diOrbit(ORBIT_STASIUN.r, ORBIT_STASIUN.miring, ORBIT_STASIUN.sudut + lajuOrbit(ORBIT_STASIUN.r) * t);
export const SATELIT = { badan: 4, panel: [12, 0.3, 3.2] };

// Sikap stasiun seperti ISS (LVLH): sumbu modul searah gerak orbit, sisi jendela (+z lokal)
// menghadap menjauhi bumi, jadi zoom-satelit selalu mendekat dari luar dan bumi malam ada di
// belakang stasiun. Satu putaran sikap per satu putaran orbit. Kembalian: pusat dan tiga sumbu
// lokal di koordinat globe.
const ternormal = (v) => {
  const j = Math.hypot(...v) || 1;
  return v.map((x) => x / j);
};
const silangV = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// Normal bidang orbit stasiun: sumbu y diputar Rz lalu Rx, sama dengan diOrbit.
const NORMAL_ORBIT = (() => {
  const [cz, sz] = [Math.cos(MIRING_Z), Math.sin(MIRING_Z)];
  const [cx, sx] = [Math.cos(ORBIT_STASIUN.miring), Math.sin(ORBIT_STASIUN.miring)];
  const [x, y] = [-sz, cz];
  return [x, y * cx, y * sx];
})();
export function rangkaStasiun(t) {
  const pusat = posisiStasiun(t);
  const z = ternormal(pusat);
  const x = ternormal(silangV(NORMAL_ORBIT, z));
  const y = silangV(z, x);
  return { pusat, x, y, z };
}
export const SKALA_STASIUN = 1.4;
// Jendela modul lab A (lambung merah di x -5,2) di sisi +z, segaris dengan JENDELA_LAB di dalam.
export const JENDELA_STASIUN = { lokal: [-6.74, 0, 2.17], r: 0.43 };
export const keRangka = (R, lokal) => R.pusat.map((p, i) => p + SKALA_STASIUN * (lokal[0] * R.x[i] + lokal[1] * R.y[i] + lokal[2] * R.z[i]));
export const titikJendela = (R) => keRangka(R, JENDELA_STASIUN.lokal);
