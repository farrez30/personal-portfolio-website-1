// Naskah animatic cerita v3: satu jalur kamera di atas styleframe, untuk menguji ritme sebelum
// build 3D. Durasi dari desain/cerita-v3/storyboard/papan.md (vh desktop).
// Kamera: titik fokus x,y (0..1 dari gambar) dan skala s, dari `dari` ke `ke` sepanjang beat.
// Sambungan ke beat berikutnya:
//   zoom   : beat keluar memperbesar ke titik `ke` lalu memudar, beat masuk mulai sedikit besar.
//   portal : beat masuk tumbuh dari kotak `kotak` (x, y, lebar, tinggi, 0..1) di beat keluar.
//   mundur : beat keluar mengecil ke gelap, beat masuk mulai besar lalu mundur.
//   naik   : kamera mendongak, beat keluar turun, beat masuk datang dari atas.

export const BEAT = [
  { no: 1, gambar: "01-ide", judul: "Ide", vh: 120,
    teks: "Ceritakan dulu masalahnya.",
    nadaB: "Berawal dari keluhan sehari-hari.",
    kamera: { dari: { x: 0.45, y: 0.6, s: 1.0 }, ke: { x: 0.42, y: 0.72, s: 1.35 } },
    hp: 0.62, sambung: { jenis: "zoom", ke: { x: 0.38, y: 0.78, s: 2.4 } } },
  { no: 2, gambar: "02-naskah", judul: "Naskah", vh: 100,
    teks: "Semua dimulai dari rencana yang Anda setujui.",
    kamera: { dari: { x: 0.4, y: 0.55, s: 1.25 }, ke: { x: 0.45, y: 0.4, s: 1.05 } },
    hp: 0.4, sambung: { jenis: "naik" } },
  { no: 3, gambar: "03-storyboard", judul: "Storyboard", vh: 140,
    teks: "Bentuknya dipilih sesuai masalahnya.",
    kamera: { dari: { x: 0.12, y: 0.45, s: 1.4 }, ke: { x: 0.62, y: 0.45, s: 1.15 } },
    hp: 0.3, sambung: { jenis: "portal", kotak: [0.7, 0.36, 0.06, 0.16] } },
  { no: 4, gambar: "04-set", judul: "Set dan lighting", vh: 120,
    teks: "Rapi sampai ke bagian yang tidak kelihatan.",
    kamera: { dari: { x: 0.5, y: 0.3, s: 1.3 }, ke: { x: 0.45, y: 0.55, s: 1.6 } },
    hp: 0.46, lampu: true, sambung: { jenis: "naik" } },
  { no: 5, gambar: "05-syuting", judul: "Syuting", vh: 120,
    teks: "Lalu saya bangun, sedikit demi sedikit.",
    nadaB: "Dibangun bertahap, bisa dicoba sejak awal.",
    kamera: { dari: { x: 0.55, y: 0.5, s: 1.15 }, ke: { x: 0.6, y: 0.45, s: 1.3 } },
    hp: 0.55, getar: true, sambung: { jenis: "portal", kotak: [0.56, 0.67, 0.18, 0.16] } },
  { no: 6, gambar: "06-editing", judul: "Editing", vh: 120,
    teks: "Progresnya selalu bisa Anda cek.",
    nadaB: "Progresnya jelas, kabarnya tidak putus.",
    kamera: { dari: { x: 0.5, y: 0.5, s: 1.0 }, ke: { x: 0.42, y: 0.38, s: 1.55 } },
    hp: 0.5, sambung: { jenis: "zoom", ke: { x: 0.42, y: 0.36, s: 3 } } },
  { no: 7, gambar: "07-grading", judul: "Color grading", vh: 100,
    teks: "Enak dipakai, bukan cuma bisa dipakai.",
    kamera: { dari: { x: 0.55, y: 0.4, s: 1.35 }, ke: { x: 0.55, y: 0.45, s: 1.1 } },
    hp: 0.55, sibak: true, sambung: { jenis: "mundur" } },
  { no: 8, gambar: "08-screening", judul: "Test screening", vh: 120,
    teks: "Sistem yang dipakai tiap hari tidak boleh rewel.",
    nadaB: "Tetap bisa diandalkan saat paling dibutuhkan.",
    kamera: { dari: { x: 0.5, y: 0.6, s: 1.0 }, ke: { x: 0.55, y: 0.4, s: 1.45 } },
    hp: 0.55, tersendat: 0.5, sambung: { jenis: "zoom", ke: { x: 0.56, y: 0.36, s: 3.2 } } },
  { no: 9, gambar: "09-segel", judul: "Segel dan duplikasi", vh: 120,
    teks: "Data penting tetap di tangan yang berhak. Usaha tumbuh, sistemnya sanggup mengikuti.",
    kamera: { dari: { x: 0.62, y: 0.55, s: 1.9 }, ke: { x: 0.5, y: 0.5, s: 1.0 } },
    hp: 0.72, sambung: { jenis: "mundur" } },
  { no: 10, gambar: "10-rilis", judul: "Rilis", vh: 180,
    teks: "Dan akhirnya, dipakai tiap hari. Sepuluh di antaranya ada di rak ini. Ambil satu, lihat ceritanya.",
    kamera: { dari: { x: 0.5, y: 0.8, s: 1.3 }, ke: { x: 0.5, y: 0.42, s: 1.2 } },
    hp: 0.5, sambung: { jenis: "tirai", ke: { x: 0.5, y: 0.42, s: 4 } } },
];

// nadaB: judul beat 1, 5, 6, 8 dengan nada pilihan B Farrez (11 Nov 2026), dibuka lewat ?nada=b
// untuk dibandingkan dengan versi utama.

// Porsi akhir tiap beat yang dipakai untuk sambungan (dan porsi awal beat berikutnya).
export const SAMBUNG = 0.18;
export const TOTAL_VH = BEAT.reduce((n, b) => n + b.vh, 0);

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const halus = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPose = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) });

// Posisi gulir global g (0..1) ke beat i dan progres u di dalamnya.
export function cari(g) {
  let vh = clamp(g) * TOTAL_VH;
  for (let i = 0; i < BEAT.length; i++) {
    if (vh <= BEAT[i].vh || i === BEAT.length - 1) return { i, u: clamp(vh / BEAT[i].vh) };
    vh -= BEAT[i].vh;
  }
}

// Keadaan lapisan untuk satu beat pada progres u: pose kamera, opasitas, dan klip portal.
export function lapisan(i, u) {
  const b = BEAT[i];
  const pose = lerpPose(b.kamera.dari, b.kamera.ke, halus(u));
  let alfa = 1, klip = null;
  // Keluar: bagian akhir beat.
  const k = clamp((u - (1 - SAMBUNG)) / SAMBUNG);
  if (k > 0 && i < BEAT.length) {
    const s = b.sambung, t = halus(k);
    if (s.jenis === "zoom" || s.jenis === "tirai") Object.assign(pose, lerpPose(pose, s.ke, t));
    if (s.jenis === "mundur") pose.s = lerp(pose.s, pose.s * 0.7, t);
    if (s.jenis === "naik") pose.y = lerp(pose.y, pose.y - 0.25, t);
  }
  return { pose, alfa, klip, k };
}

// Keadaan beat masuk (i + 1) selama sambungan beat i berjalan, k = 0..1. `keluar` adalah pose
// beat i saat itu, dipakai untuk menaruh kotak portal di tempatnya di layar.
export function masuk(i, k, keluar) {
  const s = BEAT[i].sambung, n = BEAT[i + 1];
  if (!n) return null;
  const t = halus(k);
  const pose = { ...n.kamera.dari };
  let alfa = t, klip = null;
  if (s.jenis === "zoom") { pose.s = n.kamera.dari.s * lerp(1.25, 1, t); }
  if (s.jenis === "mundur") { pose.s = n.kamera.dari.s * lerp(1.4, 1, t); }
  if (s.jenis === "naik") { pose.y = n.kamera.dari.y + lerp(0.25, 0, t); }
  if (s.jenis === "portal") {
    // Titik gambar p tampil di f + (p - f) * s karena transform-origin ada di titik fokus.
    const ke = (p, f) => f + (p - f) * keluar.s;
    const x0 = ke(s.kotak[0], keluar.x), y0 = ke(s.kotak[1], keluar.y);
    const x1 = ke(s.kotak[0] + s.kotak[2], keluar.x), y1 = ke(s.kotak[1] + s.kotak[3], keluar.y);
    klip = [lerp(y0, 0, t), lerp(1 - x1, 0, t), lerp(1 - y1, 0, t), lerp(x0, 0, t)];
    alfa = Math.min(1, k * 4);
  }
  return { pose, alfa, klip };
}
