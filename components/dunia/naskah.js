// Naskah kamera dunia toko kaset (ADR 0014). Satu ruangan, lima tempat plus sepuluh babak cerita; tiap tempat terikat ke
// satu seksi halaman. Gulir hanya memilih tempat tujuan; perpindahannya diputar dalam waktu
// seperti camera blend di menu game: cepat, ease in-out, dan buram sebanding kecepatannya.
// Dipisah dari three.js supaya bisa dites di Node.
//
// Satuan meter. Ruangan x -5..5, z -4..4, tinggi 3,2. Pintu di dinding depan (z = 4).

export const ANCHOR = [
  {
    id: "bilik",
    // Bilik dengar di pojok belakang kiri; headphone di kanan bingkai, teks hero di kiri.
    posisi: [-2.15, 1.36, -1.55],
    lihat: [-4.6, 1.1, -3.6],
    fov: 38,
    seksi: [{ sel: ".gerbang", di: 0 }],
  },
  {
    id: "dinding",
    // Pembuka cerita: gambar lebar toko dari depan, semua props cerita terlihat sekaligus.
    posisi: [-0.6, 1.95, 2.5],
    lihat: [0.6, 1.0, -2.6],
    fov: 52,
    seksi: [{ sel: "#cerita", di: 0 }],
  },
  // Tur props cerita gulir (10 babak): satu benda per babak, kamera berhenti di depannya.
  // `cerita` menandai anchor babak; `hp` menimpa pose di layar tegak, tempat teks ada di bawah,
  // jadi bendanya dinaikkan ke separuh atas bingkai.
  {
    id: "ide",
    // Papan titipan pelanggan di dinding catatan, laptop dengan rapat Meet di meja kecil.
    posisi: [1.3, 1.25, -2.2],
    lihat: [2.15, 0.95, -3.7],
    benda: [2.5, 1.0, -3.6],
    fov: 40,
    cerita: true,
    seksi: [{ sel: ".bab--ide", di: 0 }],
  },
  {
    id: "rencana",
    // Meja tulis di dinding kiri: daftar kebutuhan di papan jepit, distempel setuju.
    posisi: [-3.55, 1.35, -0.75],
    lihat: [-4.3, 0.72, -1.15],
    benda: [-4.5, 0.74, -1.4],
    fov: 38,
    cerita: true,
    seksi: [{ sel: ".bab--rencana", di: 0 }],
  },
  {
    id: "bentuk",
    // Satu album dalam empat format (piringan, CD, kaset, ponsel): bentuk dipilih sesuai pendengarnya.
    posisi: [-2.95, 1.4, 0.45],
    lihat: [-4.4, 1.0, 0.52],
    benda: [-4.4, 1.05, 0.28],
    fov: 40,
    // Rak pajang di sudut yang jauh dari lampu gantung: diafragma dibuka sedikit.
    paparan: 1.55,
    cerita: true,
    seksi: [{ sel: ".bab--bentuk", di: 0 }],
  },
  {
    id: "fondasi",
    // Rak hi-fi dilihat dari belakang: kabel rapi, lampu menyala satu per satu.
    posisi: [-2.75, 1.05, 1.55],
    lihat: [-3.92, 0.62, 2.38],
    benda: [-4.05, 0.5, 1.95],
    fov: 40,
    cerita: true,
    seksi: [{ sel: ".bab--fondasi", di: 0 }],
  },
  {
    id: "bangun",
    // Turntable di gondola tengah: test pressing diputar sebelum dicetak, layar rancangan.
    posisi: [-1.6, 1.35, 1.75],
    lihat: [-0.64, 0.95, 0.2],
    benda: [-0.3, 1.0, 0.5],
    fov: 40,
    cerita: true,
    seksi: [{ sel: ".bab--bangun", di: 0 }],
  },
  {
    id: "progres",
    // Papan pre-order di pojok belakang kanan: kartu pesanan bergeser dari dipesan ke sudah tiba.
    posisi: [3.0, 1.45, -2.25],
    lihat: [3.85, 1.2, -3.9],
    benda: [4.2, 1.2, -3.85],
    fov: 42,
    cerita: true,
    seksi: [{ sel: ".bab--progres", di: 0 }],
  },
  {
    id: "rapi",
    // Stasiun dengar coba di ujung gondola: layar kasir sebelum dan sesudah dirapikan.
    posisi: [0.55, 1.35, 1.45],
    lihat: [0.61, 1.0, 0.52],
    benda: [0.85, 1.05, 0.6],
    fov: 36,
    cerita: true,
    seksi: [{ sel: ".bab--rapi", di: 0 }],
  },
  {
    id: "andal",
    // Listrik toko padam: pemutar kaset baterai, ponsel, dan lampu darurat tetap menyala.
    posisi: [2.75, 1.0, -0.7],
    lihat: [3.27, 0.5, -1.85],
    benda: [3.55, 0.55, -1.6],
    fov: 36,
    cerita: true,
    seksi: [{ sel: ".bab--andal", di: 0 }],
  },
  {
    id: "aman",
    // Lemari arsip berlaci yang dikunci palang dan gembok, papan kunci per bagian, di belakang gondola.
    posisi: [0.85, 1.35, -0.95],
    lihat: [0.3, 1.0, 0.25],
    benda: [0.0, 1.02, 0.2],
    fov: 40,
    cerita: true,
    seksi: [{ sel: ".bab--aman", di: 0 }],
  },
  {
    id: "rilis",
    // Tiga kotak CD masuk ke celah rak, lalu kamera mundur ke rak.
    posisi: [3.5, 1.3, 0.6],
    lihat: [4.58, 1.15, -0.59],
    benda: [4.8, 1.55, -0.33],
    fov: 40,
    cerita: true,
    seksi: [{ sel: ".bab--rilis", di: 0 }],
  },
  {
    id: "rak",
    // Rak CD sepanjang dinding kanan; rak 3D yang sudah ada tampil di depannya.
    posisi: [2.1, 1.45, 0.3],
    lihat: [5, 1.3, 0.1],
    fov: 46,
    seksi: [{ sel: "#rak", di: 0 }],
  },
  {
    id: "kasir",
    // Meja kasir dekat pintu, stiker label di atasnya. Selama seksi klien belum ada,
    // tempat ini dipicu awal seksi kontak.
    posisi: [0.4, 1.8, 0.9],
    lihat: [1.9, 0.95, 3],
    fov: 42,
    // Paparan relatif per tempat, seperti diafragma yang dibuka untuk shot yang lebih gelap
    // (lembar look-dev: kasir dan pintu jauh dari lampu gantung). Bawaan 1.
    paparan: 1.5,
    seksi: [
      { sel: "[data-dunia=kasir]", di: 0 },
      { sel: "#kontak", di: 0 },
    ],
  },
  {
    id: "pintu",
    // Pintu kaca dan lonceng di dinding depan.
    posisi: [-1.3, 1.55, 1.1],
    lihat: [-1.7, 1.6, 4],
    fov: 46,
    paparan: 1.4,
    seksi: [{ sel: "#kontak", di: 0 }],
  },
];

// Pose di layar tegak. Di desktop teks babak di kiri, jadi `lihat` digeser supaya benda duduk
// di kanan bingkai. Di HP teks ada di separuh bawah: kamera membidik benda di tengah, mundur
// sedikit, dan menunduk supaya benda naik ke separuh atas.
export function anchorTegak(a) {
  if (!a.benda) return a;
  const mundur = 1.15;
  return {
    ...a,
    posisi: a.posisi.map((v, i) => a.benda[i] + (v - a.benda[i]) * mundur),
    lihat: [a.benda[0], a.benda[1] - 0.42, a.benda[2]],
  };
}

const jepit = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// Kubik in-out: kecepatan nol di kedua ujung, jadi kamera tidak tersentak saat lepas dan mendarat.
export function easeInOut(u) {
  const x = jepit(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const lerp = (a, b, u) => a + (b - a) * u;
const jarak = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Pose kamera di u (0..1, sudah di-ease) antara dua anchor. Jalurnya sedikit naik di tengah,
// seperti kamera yang diangkat saat dipindah, supaya tidak terasa menggeser lurus.
export function poseAntara(a, b, u) {
  const naik = Math.sin(Math.PI * u) * Math.min(0.22, 0.04 + jarak(a.posisi, b.posisi) * 0.03);
  return {
    posisi: a.posisi.map((v, i) => lerp(v, b.posisi[i], u) + (i === 1 ? naik : 0)),
    lihat: a.lihat.map((v, i) => lerp(v, b.lihat[i], u)),
    fov: lerp(a.fov, b.fov, u),
    paparan: lerp(a.paparan ?? 1, b.paparan ?? 1, u),
  };
}

// Lama perpindahan dalam detik: 0,7 s untuk tempat bersebelahan, sampai 1,3 s untuk yang jauh
// atau yang membuat kamera berputar banyak.
export function durasiBlend(a, b) {
  const arah = (x) => {
    const d = [x.lihat[0] - x.posisi[0], x.lihat[2] - x.posisi[2]];
    return Math.atan2(d[1], d[0]);
  };
  let putar = Math.abs(arah(a) - arah(b));
  if (putar > Math.PI) putar = 2 * Math.PI - putar;
  return jepit(0.7 + jarak(a.posisi, b.posisi) * 0.06 + putar * 0.12, 0.7, 1.3);
}

// Posisi gulir (y halaman) tiap anchor dari seksinya. `ukur(sel)` mengembalikan
// { atas, tinggi } seksi itu atau null bila belum ada di halaman. Dua anchor yang jatuh di
// titik sama (kasir dan pintu di awal kontak) dipisah setengah tinggi seksinya.
export function pemicuAnchor(ukur) {
  const hasil = [];
  for (const a of ANCHOR) {
    let y = null;
    let tinggi = 0;
    for (const s of a.seksi) {
      const u = ukur(s.sel);
      if (!u) continue;
      y = u.atas + u.tinggi * s.di;
      tinggi = u.tinggi;
      break;
    }
    const lalu = hasil[hasil.length - 1];
    if (y == null) y = lalu ? lalu.y : 0;
    if (lalu && y <= lalu.y) y = lalu.y + tinggi * 0.5;
    hasil.push({ id: a.id, y });
  }
  return hasil;
}

// Anchor yang aktif: yang seksinya sudah melewati garis tengah layar.
export function anchorAktif(y, tinggiLayar, titik) {
  const garis = y + tinggiLayar / 2;
  let i = 0;
  for (let j = 0; j < titik.length; j++) if (titik[j].y <= garis) i = j;
  return i;
}

// Kekuatan motion blur 0..1 dari kecepatan kamera (meter per detik). Di bawah 0,15 m/s nol,
// supaya kamera yang hanya bergoyang pelan oleh gulir tetap tajam. Gerak dikurangi: tanpa blur.
export function kekuatanBlur(kecepatan, kurangiGerak = false) {
  if (kurangiGerak || !(kecepatan > 0.15)) return 0;
  return jepit(kecepatan / 6);
}

// Bunyi tur cerita: peristiwa yang dibunyikan saat gulir maju dari a ke b, masing-masing
// { id, u } (anchor dan progres di dalamnya). Mundur dan lompatan jauh (tautan bab, muat ulang)
// tidak berbunyi, supaya tidak ada rentetan bunyi sekaligus. Nama bunyi dari RESEP suara.js.
const BUNYI_MASUK = { ide: "kertas", rencana: "kertas", bentuk: "halaman", progres: "halaman", rapi: "tombol" };
const BUNYI_TITIK = {
  rencana: [[0.5, "rapat"]],
  andal: [
    [0.42, "relay"],
    [0.72, "relay"],
  ],
  aman: [[0.45, "segel"]],
  // Tiga kotak CD mendarat di rak (props.js, babak rilis).
  rilis: [
    [0.32, "rapat"],
    [0.44, "rapat"],
    [0.56, "rapat"],
  ],
};
// Jumlah lampu status rak hi-fi yang menyala di babak fondasi (0..3). Dipakai dunia.js untuk
// lampunya dan bunyiCerita untuk relay-nya, supaya bunyi jatuh tepat saat lampu menyala.
export function nyalaFondasi(u) {
  const x = jepit((u - 0.08) / 0.55);
  return Math.min(3, Math.floor(x * x * (3 - 2 * x) * 3.999));
}

export function bunyiCerita(a, b) {
  if (!a || !b) return [];
  const ia = ANCHOR.findIndex((x) => x.id === a.id);
  const ib = ANCHOR.findIndex((x) => x.id === b.id);
  if (ib < ia || ib - ia > 1) return [];
  const bunyi = [];
  if (ib === ia + 1) {
    if (BUNYI_MASUK[b.id]) bunyi.push(BUNYI_MASUK[b.id]);
    return bunyi;
  }
  if (!(b.u > a.u) || b.u - a.u > 0.6) return bunyi;
  for (const [x, nama] of BUNYI_TITIK[b.id] ?? []) if (a.u < x && b.u >= x) bunyi.push(nama);
  if (b.id === "fondasi") for (let i = nyalaFondasi(a.u); i < nyalaFondasi(b.u); i++) bunyi.push("relay");
  return bunyi;
}
