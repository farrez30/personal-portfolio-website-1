// Naskah kamera cerita v5 arah G (ADR 0019, 0023, 0024): lantai kantor, keluar jendela ke kota, peta,
// globe malam, lalu masuk ke modul lab satelit. Satu anchor satu seksi halaman, seperti naskah toko
// kaset (components/dunia/naskah.js); bedanya tiap anchor menyebut jenis perpindahan keluarnya.
// Pose kamera lantai kantor datang dari components/stasiun/lantai.js (F2). Dipisah dari three.js
// supaya aturan urutan dan variasi bisa dites di Node. Peta babak: desain/cerita-v5/storyboard-build.md §2.

import { pemicuAnchor as pemicuDasar, easeInOut } from "../dunia/naskah.js";
import { BABAK_V5 } from "../../content/cerita-v5.js";
import { POSE, TABLET, PILAR_LEWAT, notaTerbang } from "./lantai.js";
import { POSE_KOTA } from "./kota.js";

// Jenis perpindahan. `makro` = serah terima antarskala (gedung ke kota ke peta ke globe ke modul),
// boleh lebih lama dari batas perpindahan di dalam gedung.
export const JENIS = {
  blend: { makro: false },
  ikut: { makro: false }, // kamera mengikuti benda yang terbang (nota merah)
  whip: { makro: false }, // whip pan ke meja berikutnya
  layar: { makro: false }, // masuk lewat layar yang sama di dua meja
  orbit: { makro: false }, // kamera memutari benda
  pilar: { makro: false }, // lewat di balik pilar struktur
  crane: { makro: false }, // naik, plafon dibuka seperti rumah boneka
  jendela: { makro: true }, // keluar lewat celah jendela lalu naik ke atas kota
  "serah-peta": { makro: true },
  "serah-globe": { makro: true },
  "zoom-satelit": { makro: true },
  rel: { makro: false }, // gulir di rel lorong modul lab
};

// Batas perpindahan di dalam gedung (riset-modul-lab.md, pelajaran lift Mass Effect).
export const BATAS_DALAM = 1.8;

const KELUAR = {
  dorongan: ["ikut", 1.4, "nota merah terbang ke meja 2"],
  "harga-diam": ["whip", 0.6, "HP berdering di meja 3"],
  tarikan: ["layar", 1.2, "tablet berlayar sama di meja 3 dan 4"],
  biaya: ["orbit", 1.1, "timbangan diputari"],
  kelangsungan: ["pilar", 0.8, "pilar struktur di lorong"],
  data: ["crane", 1.8, "plafon dibuka"],
  kebiasaan: ["jendela", 2.8, "celah jendela tanpa tiang"],
  ramai: ["serah-peta", 0.9, "gedung klien jadi titik merah"],
  "langkah-kecil": ["serah-globe", 0.3, "Jakarta jadi titik di globe"],
  penutup: ["zoom-satelit", 5.5, "satelit melayang masuk dari atas"],
};

// `pose` diisi untuk anchor di lantai kantor (F2, components/stasiun/lantai.js) dan babak ramai di
// atas kota (F4, kota.js); peta, globe, dan modul lab menyusul di F5 dan F6. Anchor tanpa pose:
// dunia memudar dan seksinya tampil sebagai halaman biasa.
const POSE_BABAK = { ...POSE, ramai: POSE_KOTA };
export const ANCHOR_V5 = [
  { id: "gerbang", seksi: [{ sel: ".gerbang", di: 0 }], tempat: "lantai kantor, meja 1 dari jauh", keluar: "blend", durasi: 0.9, pose: POSE.gerbang },
  ...BABAK_V5.map((b) => {
    const [keluar, durasi, pemicu] = KELUAR[b.id];
    return { id: b.id, seksi: [{ sel: `.bab--${b.id}`, di: 0 }], keluar, durasi, pemicu, pose: POSE_BABAK[b.id] ?? null };
  }),
  // modul lab: gulir menggerakkan kamera di rel lorong, bukan perpindahan berwaktu
  { id: "modul-lab", seksi: [{ sel: "#modul-lab", di: 0 }], tempat: "modul lab, lorong rak", keluar: "rel", durasi: 0, pose: null },
];

// Pose kamera anchor ke-i untuk layar lebar atau tegak (lebar/tinggi di bawah 0,8), atau null.
export function poseAnchor(i, tegak = false) {
  const p = ANCHOR_V5[i]?.pose;
  if (!p) return null;
  const t = tegak && p.tegak ? p.tegak : p;
  return { posisi: [...t.posisi], lihat: [...t.lihat], fov: t.fov };
}

// Perpindahan antara anchor `dari` dan `ke` melewati serah terima antarskala (gedung ke kota dan
// seterusnya): ada anchor di antaranya yang keluar dengan jenis makro.
export function lintasTahap(dari, ke) {
  for (let k = Math.min(dari, ke); k < Math.max(dari, ke); k++) if (JENIS[ANCHOR_V5[k]?.keluar]?.makro) return true;
  return false;
}

// Lama perpindahan dari anchor `dari` ke `ke` dalam detik. Maju satu langkah memakai durasi
// keluar anchor asalnya; mundur satu langkah memakai durasi yang sama (jalur yang sama dibalik);
// di dalam gedung paling lama BATAS_DALAM, serah terima makro boleh lebih lama. Lompatan jauh
// (tautan, muat ulang di tengah) dibatasi supaya kamera tidak terbang lama; lompatan yang
// melewati serah terima antarskala jadi potongan, karena blend lurus dari dalam gedung ke atas
// kota menembus dinding. Gerak dikurangi: potongan. Ke anchor tanpa pose juga potongan.
export function durasiAntara(dari, ke, kurangiGerak = false) {
  if (kurangiGerak || dari === ke || dari < 0 || !ANCHOR_V5[ke]?.pose || !ANCHOR_V5[dari]?.pose) return 0;
  if (Math.abs(ke - dari) === 1) {
    const a = ANCHOR_V5[Math.min(dari, ke)];
    return JENIS[a.keluar].makro ? a.durasi : Math.min(a.durasi, BATAS_DALAM);
  }
  return lintasTahap(dari, ke) ? 0 : 1.2;
}

// Dorongan pelan selama satu babak dibaca: kamera mulai 5% lebih jauh dan mendekat ke posenya
// sejalan progres gulir k (0..1), supaya bingkai tidak diam tapi benda tetap di tempat.
export const DORONG = 0.05;
export function poseDalam(pose, k) {
  const x = Math.min(1, Math.max(0, k));
  const f = 1 + DORONG * (1 - x * x * (3 - 2 * x));
  return { ...pose, posisi: pose.posisi.map((v, i) => pose.lihat[i] + (v - pose.lihat[i]) * f) };
}

// Pose di u (0..1, sudah di-ease) antara dua pose. Yang diinterpolasi arah pandangnya (yaw dan
// pitch) dan jarak ke sasaran, bukan titik lihatnya: meja berselang menghadap berlawanan, dan titik
// lihat yang digeser lurus dari meja belakang ke meja depan lewat tepat di bawah kamera, jadi
// kamera sempat menatap lantai kosong (lembar kontak F2). Putaran hampir 180 derajat dipilih ke
// sisi arah perjalanan, sehingga di tengah perpindahan kamera memandang sepanjang lorong. Jalurnya
// sedikit naik di tengah seperti kamera yang diangkat.
const arahPandang = (p) => {
  const d = p.lihat.map((v, i) => v - p.posisi[i]);
  const j = Math.hypot(...d);
  return { yaw: Math.atan2(d[0], d[2]), pitch: Math.asin(d[1] / j), jarak: j };
};
const arahDari = (yaw, pitch) => [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
// Selisih yaw dari yA ke yB untuk kamera yang berjalan dari a ke b. Putaran hampir 180 derajat
// dipilih ke sisi arah perjalanan, bukan sisi terpendek, supaya di tengah putaran kamera memandang
// ke tempat yang dituju, bukan ke dinding samping.
function selisihYaw(yA, yB, a, b) {
  let dy = Math.atan2(Math.sin(yB - yA), Math.cos(yB - yA));
  if (Math.abs(dy) > (150 * Math.PI) / 180) {
    const jalan = [b.posisi[0] - a.posisi[0], b.posisi[2] - a.posisi[2]];
    const tengah = (d) => Math.sin(yA + d / 2) * jalan[0] + Math.cos(yA + d / 2) * jalan[1];
    const lain = dy - Math.sign(dy) * 2 * Math.PI;
    if (tengah(lain) > tengah(dy)) dy = lain;
  }
  return dy;
}
export function poseBlend(a, b, u) {
  const A = arahPandang(a);
  const B = arahPandang(b);
  const yaw = A.yaw + selisihYaw(A.yaw, B.yaw, a, b) * u;
  // Pitch di tengah perpindahan setinggi ujung yang lebih datar: ke dan dari meja biaya (tampak
  // atas) kamera baru menunduk di akhir, tidak menatap lantai sepanjang jalan.
  const lurus = A.pitch + (B.pitch - A.pitch) * u;
  const pitch = lurus + (Math.max(A.pitch, B.pitch) - lurus) * Math.sin(Math.PI * u);
  const jarak = A.jarak + (B.jarak - A.jarak) * u;
  const pindah = Math.hypot(...a.posisi.map((v, i) => v - b.posisi[i]));
  const naik = Math.sin(Math.PI * u) * Math.min(0.45, 0.08 + pindah * 0.06);
  const posisi = a.posisi.map((v, i) => v + (b.posisi[i] - v) * u + (i === 1 ? naik : 0));
  const arah = arahDari(yaw, pitch);
  return { posisi, lihat: posisi.map((v, i) => v + arah[i] * jarak), fov: a.fov + (b.fov - a.fov) * u };
}

// ---- Perpindahan bertipe (F3, ADR 0023) --------------------------------------------------------
// Rumus dari previs (desain/cerita-v5/previs/previs.html, pindah()), diubah ke data lantai.js.
// Satu jalur didefinisikan dari anchor ke-i ke ke-(i+1); gulir mundur memutar jalur yang sama
// dengan e dibalik, jadi bingkainya persis sama dalam urutan terbalik.

// Bingkai digeser dari kolom teks: ke kanan 17% lebar di layar lebar, ke atas 14% tinggi di layar
// tegak (adegan.js memakai angka yang sama untuk setViewOffset).
export const GESER = { lebar: 0.17, tegak: 0.14 };
// Tinggi crane di atas lantai: denah utuh masuk bingkai, plafon tidak ada (rumah boneka).
export const TINGGI_CRANE = 15;

const klamp = (x) => Math.min(1, Math.max(0, x));
const halus = (x) => x * x * (3 - 2 * x);
const seg = (e, a, b) => halus(klamp((e - a) / (b - a)));
const lerp = (p, q, u) => p.map((v, i) => v + (q[i] - v) * u);
const bezier = (p, c, q, t) => p.map((v, i) => (1 - t) * (1 - t) * v + 2 * (1 - t) * t * c[i] + t * t * q[i]);
const satuan = (v) => {
  const j = Math.hypot(...v) || 1;
  return v.map((x) => x / j);
};

// Posisi kamera di depan layar tablet sehingga layarnya memenuhi seluruh bingkai, termasuk bagian
// yang digeser dari kolom teks; sedikit ke arah bawah gambar supaya arah atas kamera sama dengan
// arah atas gambar di kedua tablet (potongan di tengah tersembunyi).
const LAYAR = [0.24, 0.16];
function depanLayar(T, fov, { aspek = 16 / 9, tegak = false } = {}) {
  const n = satuan(T.m.slice(8, 11));
  const atas = satuan(T.m.slice(4, 7));
  const tanH = Math.tan((fov * Math.PI) / 360);
  const [gx, gy] = tegak ? [0, GESER.tegak] : [GESER.lebar, 0];
  const d = 0.9 * Math.min(LAYAR[0] / 2 / (tanH * aspek * (1 + 2 * gx)), LAYAR[1] / 2 / (tanH * (1 + 2 * gy)));
  return T.c.map((v, i) => v + n[i] * d - atas[i] * 0.02 * d);
}

// Catmull-Rom centripetal, rumus yang sama dengan THREE.CatmullRomCurve3 (getPoint, tidak tertutup),
// supaya naskah tetap tanpa three.js. u 0..1 dibagi rata per ruas, bukan per panjang busur: ruas
// pendek di dalam gedung berjalan pelan, ruas panjang di atas kota cepat.
function catmullRom(titik, u) {
  const n = titik.length;
  const p = (n - 1) * u;
  let i = Math.floor(p);
  let w = p - i;
  if (i >= n - 1) [i, w] = [n - 2, 1];
  const ambil = (k) => (k < 0 ? titik[0].map((v, j) => 2 * v - titik[1][j]) : k > n - 1 ? titik[n - 1].map((v, j) => 2 * v - titik[n - 2][j]) : titik[k]);
  const [p0, p1, p2, p3] = [ambil(i - 1), ambil(i), ambil(i + 1), ambil(i + 2)];
  const jarak = (a, b) => Math.pow(a.reduce((s, v, j) => s + (v - b[j]) ** 2, 0), 0.25);
  let [d0, d1, d2] = [jarak(p0, p1), jarak(p1, p2), jarak(p2, p3)];
  if (d1 < 1e-4) d1 = 1;
  if (d0 < 1e-4) d0 = d1;
  if (d2 < 1e-4) d2 = d1;
  return p1.map((x1, j) => {
    const [x0, x2, x3] = [p0[j], p2[j], p3[j]];
    const t1 = ((x1 - x0) / d0 - (x2 - x0) / (d0 + d1) + (x2 - x1) / d1) * d1;
    const t2 = ((x2 - x1) / d1 - (x3 - x1) / (d1 + d2) + (x3 - x2) / d2) * d1;
    return x1 + t1 * w + (-3 * x1 + 3 * x2 - 2 * t1 - t2) * w * w + (2 * x1 - 2 * x2 + t1 + t2) * w * w * w;
  });
}

// Titik antara jalur keluar jendela (previs jalanKeluar dengan TX=campur), di koordinat lantai:
// ke celah jendela tanpa tiang di x = 8, datar setinggi 2,4 m sampai di luar fasad (z = 4,16),
// naik tegak di atas jalan depan (garis tengah z = 15), lalu menjauh ke bidikan kota.
export const TITIK_JENDELA = [[8.6, 2.4, 0.6], [8, 2.4, 2.6], [8, 2.4, 5.5], [8, 2.6, 11], [8, 8, 15], [8.4, 34, 15.5], [10, 90, 17], [45, 210, 95], [185, 300, 300]];

const JALUR = {
  // Nota merah lepas dari timbangan meja 1, terbang melengkung ke timbangan meja 2; kamera mundur
  // ke belakangnya dan mengikuti, lalu turun ke pose meja 2.
  ikut(a, b, e) {
    const N = notaTerbang();
    const p = lerp(N.dari.posisi, N.ke.posisi, halus(e));
    // melengkung naik lalu menyelip hampir mendatar ke piring meja 2, di bawah lengan timbangan
    // yang menggantung piringnya (jatuh tegak dari atas menyerempet ujung lengan)
    p[1] += 0.6 * Math.sin(Math.PI * e) * Math.sqrt(1 - e);
    const d = satuan([b.lihat[0] - a.lihat[0], 0, b.lihat[2] - a.lihat[2]]);
    const ikut = [p[0] - d[0] * 0.9, p[1] + 0.3, p[2] - d[2] * 0.9];
    const dy = Math.atan2(Math.sin(N.ke.ry - N.dari.ry), Math.cos(N.ke.ry - N.dari.ry)) + 2 * Math.PI;
    return {
      posisi: lerp(lerp(a.posisi, ikut, seg(e, 0, 0.25)), b.posisi, seg(e, 0.7, 1)),
      lihat: lerp(lerp(a.lihat, p, seg(e, 0, 0.2)), b.lihat, seg(e, 0.75, 1)),
      nota: { posisi: p, rot: [-0.6 * Math.sin(Math.PI * e), N.dari.ry + dy * halus(e), 0], s: N.dari.s + (N.ke.s - N.dari.s) * e },
    };
  },
  // Diam, menoleh cepat ke meja berikutnya dengan sedikit lewat lalu balik, baru maju ke sana.
  whip(a, b, e) {
    const A = arahPandang(a);
    const B = arahPandang({ posisi: a.posisi, lihat: b.lihat });
    // ease-out-back dari awal yang pelan: lewat sekitar 5% dari sasaran lalu balik. Rumus previs
    // (pangkat halus kali benjolan sinus) hanya lewat 0,1%, tidak terlihat sebagai whip.
    const x = Math.pow(klamp(e / 0.4), 1.4) - 1;
    const s = 1 + 2.2 * x * x * x + 1.2 * x * x;
    const arah = arahDari(A.yaw + selisihYaw(A.yaw, B.yaw, a, b) * s, A.pitch + (B.pitch - A.pitch) * s);
    const jarak = A.jarak + (B.jarak - A.jarak) * s;
    const posisi = lerp(a.posisi, b.posisi, seg(e, 0.4, 1));
    // sesudah menoleh (s = 1) titik lihatnya tepat b.lihat
    return { posisi, lihat: e < 0.4 ? a.posisi.map((v, i) => v + arah[i] * jarak) : b.lihat };
  },
  // Masuk ke layar tablet meja ini sampai layarnya memenuhi bingkai, potong di tengah ke tablet
  // berlayar sama di meja berikutnya, lalu keluar darinya.
  layar(a, b, e, bingkai, ida, idb) {
    const P = TABLET[ida];
    const Q = TABLET[idb];
    if (e < 0.5) {
      const u = e / 0.5;
      return { posisi: lerp(a.posisi, depanLayar(P, a.fov, bingkai), Math.pow(u, 1.8)), lihat: lerp(a.lihat, P.c, seg(u, 0, 0.45)) };
    }
    const u = (e - 0.5) / 0.5;
    return { posisi: lerp(depanLayar(Q, b.fov, bingkai), b.posisi, 1 - Math.pow(1 - u, 1.8)), lihat: lerp(Q.c, b.lihat, seg(u, 0.5, 1)) };
  },
  // Memutari meja ini sekitar 100 derajat ke sisi meja berikutnya sambil sedikit naik, lalu pindah.
  orbit(a, b, e) {
    const r = a.posisi.map((v, i) => v - a.lihat[i]);
    const keB = b.lihat.map((v, i) => v - a.lihat[i]);
    const tanda = Math.sign(r[0] * keB[2] - r[2] * keB[0]) || 1;
    const th = -tanda * 1.75 * seg(e, 0, 0.65);
    const [c, s] = [Math.cos(th), Math.sin(th)];
    const p = [r[0] * c + r[2] * s + a.lihat[0], r[1] + a.lihat[1] + 0.25 * Math.sin(Math.PI * klamp(e / 0.65)), -r[0] * s + r[2] * c + a.lihat[2]];
    return { posisi: lerp(p, b.posisi, seg(e, 0.55, 1)), lihat: lerp(a.lihat, b.lihat, seg(e, 0.3, 0.7)) };
  },
  // Lewat di depan pilar struktur: pilarnya menyapu bingkai seperti tirai, meja berikutnya muncul.
  pilar(a, b, e) {
    const c = [PILAR_LEWAT[0], a.posisi[1] + 0.1, PILAR_LEWAT[1] + 0.55];
    return { posisi: bezier(a.posisi, c, b.posisi, halus(e)), lihat: lerp(a.lihat, b.lihat, seg(e, 0.15, 0.85)) };
  },
  // Naik tegak sampai denah lantai terlihat utuh (tanpa plafon, seperti rumah boneka), bergeser dan
  // berputar di atas ke meja berikutnya, lalu turun. Di atas kamera menunduk hampir tegak lurus;
  // arah atas gambarnya diputar dari arah pandang meja asal ke arah pandang meja tujuan, jadi gambar
  // tidak terbalik mendadak saat turun.
  crane(a, b, e) {
    const yA = arahPandang(a).yaw;
    const yaw = yA + selisihYaw(yA, arahPandang(b).yaw, a, b) * seg(e, 0.35, 0.65);
    const mundur = [-Math.sin(yaw) * 0.05, 0, -Math.cos(yaw) * 0.05];
    const atas = (p) => [p[0] + mundur[0], TINGGI_CRANE, p[2] + mundur[2]];
    const lantai = (p) => [p[0], 0, p[2]];
    return {
      posisi: lerp(lerp(lerp(a.posisi, atas(a.lihat), seg(e, 0, 0.38)), atas(b.lihat), seg(e, 0.35, 0.65)), b.posisi, seg(e, 0.62, 1)),
      lihat: lerp(lerp(lerp(a.lihat, lantai(a.lihat), seg(e, 0, 0.3)), lantai(b.lihat), seg(e, 0.35, 0.65)), b.lihat, seg(e, 0.68, 1)),
    };
  },
  // Keluar lewat celah jendela, naik di atas jalan, menjauh ke atas kota (serah terima gedung ke
  // kota). Posisi di spline TITIK_JENDELA; arah pandang diinterpolasi sebagai yaw, pitch, dan jarak
  // (seperti poseBlend), bukan titik lihat yang digeser: titik lihat previs bergeser dari depan
  // kamera ke pusat kota di belakangnya dan sempat lewat di bawah kamera. Selama keluar kamera
  // memandang lurus ke luar jendela, saat naik menunduk ke menara seberang, lalu berputar ke
  // gedung klien di tengah kota. Jarak pandang membesar bertahap supaya bidang dekat (near) kecil
  // selama kamera masih dekat kusen dan dinding.
  jendela(a, b, e) {
    const s = halus(e);
    const posisi = catmullRom([a.posisi, ...TITIK_JENDELA, b.posisi], s);
    const A = arahPandang(a);
    const B = arahPandang(b);
    const keluar = 0;
    const dyB = Math.atan2(Math.sin(B.yaw - keluar), Math.cos(B.yaw - keluar));
    const yaw = A.yaw + (keluar - A.yaw) * seg(s, 0, 0.3) + dyB * seg(s, 0.62, 0.95);
    const pitch = A.pitch + (-0.14 - A.pitch) * seg(s, 0, 0.3) + (-0.42 + 0.14) * seg(s, 0.35, 0.62) + (B.pitch + 0.42) * seg(s, 0.62, 1);
    const log = (x, y, u) => Math.exp(Math.log(x) + (Math.log(y) - Math.log(x)) * u);
    const jarak = log(log(log(A.jarak, 8, seg(s, 0, 0.3)), 60, seg(s, 0.35, 0.65)), B.jarak, seg(s, 0.65, 1));
    const arah = arahDari(yaw, pitch);
    return { posisi, lihat: posisi.map((v, i) => v + arah[i] * jarak) };
  },
};

// Pose kamera di e (0..1, waktu linear) pada perpindahan dari anchor ke-i ke ke-(i+1), dengan pose
// ujung a dan b. Jenis tanpa rumus khusus (blend dari hero) memakai poseBlend dengan ease. `nota`
// diisi selama nota merah terbang. `bingkai` = { aspek, tegak } untuk jenis yang mengisi layar.
export function poseJalur(i, a, b, e, bingkai) {
  const f = JALUR[ANCHOR_V5[i]?.keluar];
  const x = klamp(e);
  if (!f) return { ...poseBlend(a, b, easeInOut(x)), nota: null };
  const q = f(a, b, x, bingkai, ANCHOR_V5[i].id, ANCHOR_V5[i + 1].id);
  return { posisi: q.posisi, lihat: q.lihat, fov: a.fov + (b.fov - a.fov) * x, nota: q.nota ?? null };
}

export const pemicuAnchorV5 = (ukur) => pemicuDasar(ukur, ANCHOR_V5);

// Lama perpindahan keluar dari anchor ke-i. Gerak dikurangi: semua jadi potongan (0 detik).
export function durasiPindah(i, kurangiGerak = false) {
  const a = ANCHOR_V5[i];
  if (!a || kurangiGerak) return 0;
  return a.durasi;
}

// Pelanggaran aturan naskah, kosong bila sehat. Dipakai tes dan bisa dipanggil saat dev.
export function periksaNaskah(daftar = ANCHOR_V5) {
  const salah = [];
  daftar.forEach((a, i) => {
    if (!JENIS[a.keluar]) salah.push(`${a.id}: jenis "${a.keluar}" tidak dikenal`);
    else if (!JENIS[a.keluar].makro && a.durasi > BATAS_DALAM) salah.push(`${a.id}: ${a.durasi} s melewati ${BATAS_DALAM} s`);
    const lalu = daftar[i - 1];
    if (lalu && lalu.keluar === a.keluar) salah.push(`${lalu.id} dan ${a.id}: jenis sama berturut-turut (${a.keluar})`);
  });
  const id = daftar.map((a) => a.id);
  if (new Set(id).size !== id.length) salah.push("id anchor ganda");
  return salah;
}

// Pose kamera selama perpindahan dari anchor `dari` ke `ke`. Satu langkah maju memakai jalur
// bertipe anchor asalnya; satu langkah mundur memutar jalur yang sama dengan waktu dibalik.
// Lompatan jauh, atau perpindahan yang dimulai di tengah perpindahan lain (dari = -1), memakai
// blend arah pandang.
export function poseAntara(dari, ke, a, b, e, bingkai) {
  if (dari >= 0 && ke === dari + 1) return poseJalur(dari, a, b, e, bingkai);
  if (ke >= 0 && ke === dari - 1) return poseJalur(ke, b, a, 1 - e, bingkai);
  return { ...poseBlend(a, b, easeInOut(Math.min(1, Math.max(0, e)))), nota: null };
}
