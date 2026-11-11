// Naskah cerita gulir v3 (desain/cerita-v3, ADR 0013): satu kamera menyusuri soundstage gelap.
// Tiap beat punya satu panel styleframe yang berdiri di lantai studio; kamera mendekati panel itu,
// lalu terbang di kegelapan ke panel berikutnya tanpa potongan. Murni, tanpa three.js, supaya
// bisa dites di Node (tests/naskah.test.mjs).
//
// Progres p berjalan dari 0 sampai BABAK.length; babak c memakai u = p - c (0 sampai 1).
// Kamera per beat ditulis seperti di animatic: titik fokus x, y (0 sampai 1 dari gambar) dan
// skala s, dari `dari` ke `ke`. `hp` adalah titik fokus x di layar tegak. `ringan` adalah gambar
// mode Ringan bila berbeda: styleframe yang layar monitornya sudah diganti layar produk asli
// (scripts/layar-ringan.mjs), sama dengan yang ditempel shader di panggung Imersif.

export const PANEL = { w: 16, h: 9 };
// Jarak kamera saat panel pas setinggi layar (fov 35 derajat): (h / 2) / tan(17,5 derajat).
export const FOV = 35;
const D0 = PANEL.h / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
// Porsi akhir tiap beat untuk terbang ke panel berikutnya.
const TERBANG = 0.24;

export const BABAK = [
  { id: "pembuka", bobot: 0.9 },
  { id: "ide", bobot: 1.2, gambar: "01-ide", kamera: { dari: { x: 0.45, y: 0.6, s: 1 }, ke: { x: 0.42, y: 0.72, s: 1.35 } }, hp: 0.62 },
  { id: "rencana", bobot: 1, gambar: "02-naskah", ringan: "02-naskah-layar", kamera: { dari: { x: 0.4, y: 0.55, s: 1.25 }, ke: { x: 0.45, y: 0.4, s: 1.05 } }, hp: 0.4 },
  { id: "bentuk", bobot: 1.4, gambar: "03-storyboard", ringan: "03-storyboard-layar", kamera: { dari: { x: 0.12, y: 0.45, s: 1.4 }, ke: { x: 0.62, y: 0.45, s: 1.15 } }, hp: 0.3 },
  { id: "fondasi", bobot: 1.2, gambar: "04-set", kamera: { dari: { x: 0.5, y: 0.3, s: 1.3 }, ke: { x: 0.45, y: 0.55, s: 1.6 } }, hp: 0.46 },
  { id: "bangun", bobot: 1.2, gambar: "05-syuting", ringan: "05-syuting-layar", kamera: { dari: { x: 0.55, y: 0.5, s: 1.15 }, ke: { x: 0.6, y: 0.45, s: 1.3 } }, hp: 0.55 },
  { id: "progres", bobot: 1.2, gambar: "06-editing", ringan: "06-editing-layar", kamera: { dari: { x: 0.5, y: 0.5, s: 1 }, ke: { x: 0.42, y: 0.38, s: 1.55 } }, hp: 0.5 },
  { id: "rapi", bobot: 1, gambar: "07-grading", kamera: { dari: { x: 0.55, y: 0.4, s: 1.35 }, ke: { x: 0.55, y: 0.45, s: 1.1 } }, hp: 0.55 },
  { id: "andal", bobot: 1.2, gambar: "08-screening", ringan: "08-screening-layar", kamera: { dari: { x: 0.5, y: 0.6, s: 1 }, ke: { x: 0.55, y: 0.4, s: 1.45 } }, hp: 0.55 },
  { id: "aman", bobot: 1.2, gambar: "09-segel", kamera: { dari: { x: 0.62, y: 0.55, s: 1.5 }, ke: { x: 0.5, y: 0.5, s: 1 } }, hp: 0.72 },
  { id: "rilis", bobot: 2.4, gambar: "10-rilis", kamera: { dari: { x: 0.5, y: 0.8, s: 1.3 }, ke: { x: 0.5, y: 0.42, s: 1.2 } }, hp: 0.5 },
];

// Panel berdiri berjajar di lantai studio, selang-seling maju mundur supaya terasa satu ruang
// yang dalam, bukan dinding galeri. Semua menghadap +z; kamera selalu di depan.
export const STASIUN = BABAK.slice(1).map((_, i) => ({ x: i * 20, y: PANEL.h / 2, z: i % 2 ? -4 : 0 }));

// Kotak CD di beat rilis: masuk bergiliran, lalu tirai rak terbuka dan sempat dinikmati, baru
// halaman memutih ke rak di ujung sekali.
const KOTAK = { jumlah: 3, mulai: 0.04, lama: 0.15 };
const TIRAI = [0.52, 0.72];
const PUTIH = [0.94, 1];
const DORONG = [0.76, 1];

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const halus = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
// Nol di 0 dan 1, puncak 1 di tengah, datar di puncak supaya momennya sempat ditahan.
export const bukit = (u, naik = 0.3, turun = 0.3) => halus(u / naik) * halus((1 - u) / turun);
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

// Titik pada panel stasiun i dari koordinat gambar (0 sampai 1, y ke bawah).
function titikPanel(i, x, y) {
  const st = STASIUN[i];
  return [st.x + (x - 0.5) * PANEL.w, st.y + (0.5 - y) * PANEL.h, st.z];
}

// Kamera menatap titik fokus dari depan, sejauh skala s.
function pose(i, f, hp) {
  const sasaran = titikPanel(i, hp ? BABAK[i + 1].hp : f.x, f.y);
  return { posisi: [sasaran[0], sasaran[1], sasaran[2] + D0 / f.s], sasaran };
}

// Gambar utuh seluruh soundstage dari tinggi, sebelum turun ke meja sutradara.
function poseBuka() {
  const tengah = (STASIUN[0].x + STASIUN.at(-1).x) / 2;
  return { posisi: [tengah * 0.35, 13, 46], sasaran: [tengah * 0.35, 3, -2] };
}

function campur(a, b, t, angkat = 0) {
  const posisi = lerp3(a.posisi, b.posisi, t);
  // Kamera naik dan mundur sedikit di tengah perjalanan, seperti crane di antara set.
  const busur = Math.sin(Math.PI * t) * angkat;
  posisi[1] += busur * 0.35;
  posisi[2] += busur;
  return { posisi, sasaran: lerp3(a.sasaran, b.sasaran, t) };
}

function kameraPada(c, u, hp) {
  if (c === 0) return campur(poseBuka(), pose(0, BABAK[1].kamera.dari, hp), halus(u));
  const i = c - 1;
  const { dari, ke } = BABAK[c].kamera;
  const akhir = c === BABAK.length - 1;
  // Beat terakhir: gerak awal harus tiba di `ke` tepat saat dorongan ke tirai mulai.
  const tinggal = akhir ? DORONG[0] : 1 - TERBANG;
  let k = pose(i, { x: lerp(dari.x, ke.x, halus(u / tinggal)), y: lerp(dari.y, ke.y, halus(u / tinggal)), s: lerp(dari.s, ke.s, halus(u / tinggal)) }, hp);
  if (akhir) {
    // Ujung cerita: kamera mendorong masuk ke celah tirai rak.
    const d = halus((u - DORONG[0]) / (DORONG[1] - DORONG[0]));
    if (d > 0) k = pose(i, { x: ke.x, y: ke.y, s: lerp(ke.s, 4, d) }, hp);
    return k;
  }
  if (u <= tinggal) return k;
  const t = halus((u - tinggal) / TERBANG);
  return campur(pose(i, ke, hp), pose(i + 1, BABAK[c + 1].kamera.dari, hp), t, 7);
}

// Keadaan dunia pada progres p. Hanya bergantung pada p (tanpa ingatan), jadi gulir mundur
// memberi gambar yang sama persis.
export function keadaanPada(p, { hp = false } = {}) {
  const n = BABAK.length;
  const pp = clamp(p, 0, n);
  const c = Math.min(n - 1, Math.floor(pp));
  const u = pp - c;
  const id = BABAK[c].id;
  const { posisi, sasaran } = kameraPada(c, u, hp);
  const iFondasi = BABAK.findIndex((b) => b.id === "fondasi");
  const iRapi = BABAK.findIndex((b) => b.id === "rapi");
  const iRilis = n - 1;

  // Lampu set fondasi: redup sampai beat-nya, lalu tiga lampu menyala satu per satu.
  const nyala = c < iFondasi ? 0 : c > iFondasi ? 3 : Math.min(3, Math.floor(halus((u - 0.08) / 0.55) * 3.999));
  const rilis = c === iRilis ? u : c > iRilis ? 1 : -1;

  return {
    babak: c,
    u,
    posisi,
    sasaran,
    benang: clamp((pp - 1) / (n - 2)),
    terang: 0.35 + (0.65 * nyala) / 3,
    sibak: c < iRapi ? 0 : c > iRapi ? 1 : halus((u - 0.1) / 0.7),
    getar: id === "bangun" ? bukit(u, 0.15, 0.15) : 0,
    sendat: id === "andal" && Math.abs(u - 0.5) < 0.012 ? 1 : 0,
    kotak: Array.from({ length: KOTAK.jumlah }, (_, j) =>
      rilis < 0 ? 0 : clamp((rilis - KOTAK.mulai - j * KOTAK.lama) / KOTAK.lama),
    ),
    tirai: rilis < 0 ? 0 : halus((rilis - TIRAI[0]) / (TIRAI[1] - TIRAI[0])),
    putih: rilis < 0 ? 0 : halus((rilis - PUTIH[0]) / (PUTIH[1] - PUTIH[0])),
  };
}

// Progres dari posisi gulir: babak yang memuat garis tengah layar, ditambah posisi garis itu
// di dalamnya. `blok` berisi { atas, tinggi } tiap babak dalam piksel dokumen.
export function progresDari(tengah, blok) {
  if (!blok.length) return 0;
  if (tengah <= blok[0].atas) return 0;
  for (let i = 0; i < blok.length; i++) {
    const b = blok[i];
    if (tengah < b.atas + b.tinggi) return i + clamp((tengah - b.atas) / b.tinggi);
  }
  return blok.length;
}

// Suara ruangan: peristiwa yang dibunyikan saat gulir maju dari keadaan a ke b (keduanya hasil
// keadaanPada). Mundur tidak berbunyi, dan lompatan jauh (tautan ke bab, muat ulang di tengah)
// juga tidak, supaya tidak ada rentetan bunyi sekaligus.
const BUNYI_MASUK = { ide: "kertas", rencana: "ketik", bentuk: "halaman", progres: "papan", rapi: "tombol" };
export function bunyiAntara(a, b) {
  const pa = a.babak + a.u;
  const pb = b.babak + b.u;
  if (!(pb > pa) || pb - pa > 0.6) return [];
  const id = BABAK[b.babak].id;
  const lewat = (x) => a.babak === b.babak && a.u < x && b.u >= x;
  const bunyi = [];
  if (b.babak > a.babak && BUNYI_MASUK[id]) bunyi.push(BUNYI_MASUK[id]);
  if (id === "rencana" && lewat(0.55)) bunyi.push("lonceng");
  if (id === "fondasi" && b.terang > a.terang) bunyi.push("relay");
  if (id === "aman" && lewat(0.45)) bunyi.push("segel");
  b.kotak.forEach((k, j) => {
    if (k === 1 && a.kotak[j] < 1) bunyi.push("rapat");
  });
  if (b.tirai > 0 && a.tirai === 0) bunyi.push("tirai");
  return bunyi;
}
