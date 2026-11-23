// Modul lab satelit (cerita v5 fase F6, ADR 0024), sebagai data tanpa three.js supaya susunan
// loker, rel kamera di lorong, dan pemetaan gulir bisa dites di Node (tests/stasiun-lab.test.mjs).
// lab3d.js mengubahnya jadi satu adegan three.js.
//
// Tahap keempat dengan satuannya sendiri (storyboard-build.md §3): meter, sumbu lorong +x, lantai
// dek di y = -1,2, dinding rak di z = -1,2, dinding jendela di z = +1,2. Modul A di x -4,1..4,1,
// node 4,1..6,9, modul B 6,9..15,1, mengikuti ukuran modul Destiny ISS (previs portoLab).
// Satu modul empat rak, satu rak dua loker; jumlah rak dan modul dihitung dari jumlah proyek plus
// satu loker kontak, tanpa loker pengisi (keputusan Farrez 20 Nov, storyboard §4).

export const RUANG = { y: [-1.2, 1.2], z: [-1.2, 1.2] };
export const MODUL = { panjang: 8.2, jarak: 11 }; // pusat modul ke-m di x = m * 11
export const NODE = [4.1, 6.9];
export const PALKA = { r: 0.62 }; // lubang palka di sekat antarmodul, pusat di y = 0, z = 0
export const RAK_PER_MODUL = 4;
export const LOKER_PER_RAK = 2;
const LETAK_RAK = [-1.8, -0.6, 0.6, 1.8];
export const RAK = { lebar: 1.05, tinggi: 2.0, dalam: 0.45, z: -1.0 };
export const MUKA_RAK = RAK.z + RAK.dalam / 2; // -0,775
export const PINTU = { lebar: 0.9, tinggi: 0.82, tebal: 0.06, y: [0.5, -0.5] };
// Loker yang dibuka meluncur keluar sejauh ini (previs tarikLoker).
export const TARIK = 0.42;
// Rak peralatan dangkal di dinding jendela, menjauh dari jendela dan rel kamera.
export const PERALATAN = { lebar: 1.05, tinggi: 2.0, dalam: 0.25, letak: [-3.3, -0.3, 0.9, 2.1] };
// Jendela modul A, tepat di seberang rak pertama: dari luar, kusennya yang memenuhi layar saat
// zoom; dari dalam, rak L-01 yang pertama terlihat.
export const JENDELA_LAB = { pusat: [-1.8, 0.2, 1.2], r: 0.43 };

export const pusatModul = (m) => m * MODUL.jarak;
const klamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const halus = (x) => x * x * (3 - 2 * x);

// Susunan loker dari daftar proyek (urutan daftar HTML = urutan loker). Tiap loker:
// { i, slug, kontak, rak, baris, modul, pusat (tengah muka pintu), label }.
export function susunLab(daftar) {
  const n = daftar.length + 1;
  const jumlahRak = Math.ceil(n / LOKER_PER_RAK);
  const modul = Math.ceil(jumlahRak / RAK_PER_MODUL);
  const rak = Array.from({ length: jumlahRak }, (_, r) => {
    const m = Math.floor(r / RAK_PER_MODUL);
    return { r, modul: m, x: pusatModul(m) + LETAK_RAK[r % RAK_PER_MODUL] };
  });
  const loker = Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / LOKER_PER_RAK);
    const baris = i % LOKER_PER_RAK;
    const p = daftar[i];
    return {
      i,
      slug: p?.slug ?? null,
      kontak: !p,
      rak: r,
      baris,
      modul: rak[r].modul,
      pusat: [rak[r].x, PINTU.y[baris], MUKA_RAK + 0.01 + PINTU.tebal / 2],
      label: `L-${String(i + 1).padStart(2, "0")}`,
    };
  });
  return { loker, rak, modul };
}

// ---- Rel kamera di lorong ------------------------------------------------------------------------
// Satu titik henti per rak: kamera di sisi dinding jendela, menyerong ke rak. Di antara dua modul
// kamera turun ke tengah lorong supaya lewat lubang palka, lalu naik lagi.
const BENTUK = {
  lebar: { mundur: 1.1, y: 0.3, z: 0.55, yLihat: 0.1, fov: 74 },
  tegak: { mundur: 0.55, y: 0.25, z: 0.7, yLihat: 0.02, fov: 88 },
};
const lerp = (p, q, u) => p.map((v, i) => v + (q[i] - v) * u);

// Catmull-Rom centripetal (rumus THREE.CatmullRomCurve3, seperti naskah.js), u dibagi rata per ruas.
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

// Rel untuk satu susunan dan satu bentuk layar: titik kendali posisi dan titik lihat, lalu tabel
// panjang busur supaya gulir dibagi menurut jarak tempuh (lewat node lebih panjang dari antarrak).
const cache = new Map();
export function buatRel(jumlahRak, tegak = false) {
  const kunci = `${jumlahRak}|${tegak}`;
  if (cache.has(kunci)) return cache.get(kunci);
  const b = BENTUK[tegak ? "tegak" : "lebar"];
  const pos = [];
  const lihat = [];
  const henti = [];
  for (let r = 0; r < jumlahRak; r++) {
    const m = Math.floor(r / RAK_PER_MODUL);
    const x = pusatModul(m) + LETAK_RAK[r % RAK_PER_MODUL];
    if (r > 0 && r % RAK_PER_MODUL === 0) {
      // lewat palka: dari ujung modul sebelumnya, tengah lorong, ke awal modul ini
      const a = pusatModul(m - 1) + MODUL.panjang / 2;
      const c = pusatModul(m) - MODUL.panjang / 2;
      for (const [px, py, pz] of [[a - 0.9, 0.12, 0.18], [a, 0.06, 0.04], [c, 0.06, 0.04], [c + 0.9, 0.12, 0.18]]) {
        pos.push([px, py, pz]);
        lihat.push([px + 3, 0.04, 0]);
      }
    }
    henti.push(pos.length);
    pos.push([x - b.mundur, b.y, b.z]);
    lihat.push([x, b.yLihat, MUKA_RAK]);
  }
  // Satu rak saja: rel dua titik yang sama supaya fungsi tetap terdefinisi.
  if (pos.length === 1) {
    pos.push([...pos[0]]);
    lihat.push([...lihat[0]]);
  }
  const N = 64 * (pos.length - 1);
  const u = [0];
  const busur = [0];
  let lalu = pos[0];
  for (let s = 1; s <= N; s++) {
    const q = catmullRom(pos, s / N);
    u.push(s / N);
    busur.push(busur[s - 1] + Math.hypot(...q.map((v, k) => v - lalu[k])));
    lalu = q;
  }
  const total = busur[N] || 1;
  const kHenti = henti.map((h) => busur[Math.round((h / (pos.length - 1)) * N)] / total);
  const rel = { pos, lihat, henti, kHenti, busur, u, total, fov: b.fov, tegak };
  cache.set(kunci, rel);
  return rel;
}

// u spline dari panjang busur (bagian 0..1 dari total).
function uDariBusur(rel, f) {
  const s = klamp(f) * rel.total;
  const { busur, u } = rel;
  let lo = 0;
  let hi = busur.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (busur[mid] <= s) lo = mid;
    else hi = mid;
  }
  const w = busur[hi] > busur[lo] ? (s - busur[lo]) / (busur[hi] - busur[lo]) : 0;
  return u[lo] + (u[hi] - u[lo]) * w;
}

// Progres gulir k (0..1) ke bagian panjang rel. `henti` (desktop): kamera melambat sampai diam
// sesaat di depan tiap rak, laju gulir tidak diubah (riset-modul-lab.md §4, NN/g). `potong`
// (gerak dikurangi): kamera langsung di rak terdekat, tanpa gerak di antaranya.
export function bagianRel(rel, k, { henti = false, potong = false } = {}) {
  const kh = rel.kHenti;
  const x = klamp(k);
  if (kh.length < 2) return 0;
  if (potong) {
    let terdekat = 0;
    kh.forEach((v, j) => {
      if (Math.abs(v - x) < Math.abs(kh[terdekat] - x)) terdekat = j;
    });
    return kh[terdekat];
  }
  if (!henti) return x;
  let j = 0;
  while (j < kh.length - 2 && x > kh[j + 1]) j++;
  const w = klamp((x - kh[j]) / (kh[j + 1] - kh[j]));
  const g = w - Math.sin(2 * Math.PI * w) / (2 * Math.PI);
  return kh[j] + (kh[j + 1] - kh[j]) * g;
}

// Pose kamera di rel pada progres gulir k.
export function poseRel(rel, k, opsi = {}) {
  const u = uDariBusur(rel, bagianRel(rel, k, opsi));
  return { posisi: catmullRom(rel.pos, u), lihat: catmullRom(rel.lihat, u), fov: rel.fov, tahap: "lab" };
}

// Titik gulir tiap loker: loker atas sedikit sebelum henti raknya, loker bawah sedikit sesudahnya,
// jadi menyusuri daftar satu per satu menggerakkan kamera rak demi rak. Loker yang menyala karena
// gulir = loker dengan titik terdekat.
export function titikLoker(rel, jumlahLoker) {
  const kh = rel.kHenti;
  const sela = kh.length > 1 ? Math.min(...kh.slice(1).map((v, j) => v - kh[j])) * 0.22 : 0.1;
  return Array.from({ length: jumlahLoker }, (_, i) => {
    const r = Math.floor(i / LOKER_PER_RAK);
    const k = kh[r] + (i % LOKER_PER_RAK === 0 ? -sela : sela);
    return klamp(k);
  });
}
export function lokerGulir(titik, k) {
  let terdekat = 0;
  titik.forEach((v, j) => {
    if (Math.abs(v - k) < Math.abs(titik[terdekat] - k)) terdekat = j;
  });
  return terdekat;
}

// Gulir halaman ke k dan sebaliknya. k = 0 saat atas seksi di tengah layar (anchor modul-lab
// terpicu), k = 1 saat bawah seksi masih satu setengah layar di bawah atas layar, jadi daftar
// yang menempel tetap terlihat sepanjang rel.
export function kDariGulir(y, tinggiLayar, atas, tinggi) {
  return klamp((y + tinggiLayar / 2 - atas) / Math.max(1, tinggi - tinggiLayar));
}
export function gulirDariK(k, tinggiLayar, atas, tinggi) {
  return atas - tinggiLayar / 2 + klamp(k) * Math.max(1, tinggi - tinggiLayar);
}

// Pose dekat loker ke-i (kamera mendekat sebelum loker meluncur): di depan pintu, sedikit dari
// sisi lorong supaya pintu yang keluar tidak memenuhi bingkai.
export function poseLoker(loker, tegak = false) {
  const [x, y, z] = loker.pusat;
  // layar tegak sempit: lebih jauh dan tepat di depan, supaya seluruh lebar pintu masuk bingkai
  const jauh = tegak ? 1.6 : 1.3;
  return { posisi: [x - (tegak ? 0 : 0.12), y + 0.06, z + jauh], lihat: [x, y - 0.02, z + 0.2], fov: tegak ? 88 : 60, tahap: "lab" };
}
// Waktu buka loker dalam detik (riset-modul-lab.md §4): kamera mendekat 0,7 s, loker meluncur
// 0,4 s mulai 0,5 s, kartu HTML tumbuh dari loker mulai 0,8 s. Tutup memutar yang sama mundur.
export const BUKA = { kamera: [0, 0.7], tarik: [0.5, 0.9], kartu: 0.8, total: 1.1 };
export function tahapBuka(detik) {
  const s = (a, b) => halus(klamp((detik - a) / (b - a)));
  return { kamera: s(...BUKA.kamera), tarik: s(...BUKA.tarik) };
}

// Pose awal di dalam modul untuk zoom-satelit: tepat di balik kaca jendela, menatap rak pertama.
export function poseMasuk(tegak = false) {
  const [x, y, z] = JENDELA_LAB.pusat;
  return { posisi: [x, y, z - 0.14], lihat: [x, y - 0.06, MUKA_RAK], fov: BENTUK[tegak ? "tegak" : "lebar"].fov, tahap: "lab" };
}

// ---- Sorotan dari daftar HTML ---------------------------------------------------------------------
// Satu sumber state untuk daftar dan loker (storyboard §4): fokus keyboard menang atas hover,
// hover menang atas gulir. Loker yang sedang dibuka selalu menyala.
export function lokerNyala({ buka = -1, fokus = -1, hover = -1, gulir = 0 } = {}) {
  if (buka >= 0) return buka;
  if (fokus >= 0) return fokus;
  if (hover >= 0) return hover;
  return gulir;
}

// Benda padat di dalam modul untuk tes tembus dan raycast: rak, rak peralatan, sekat bersama
// lubang palkanya (sebagai empat kotak di sekeliling lubang), dinding.
export function bendaLab(susunan) {
  const kotak = [];
  for (const r of susunan.rak) kotak.push({ nama: `rak ${r.r + 1}`, min: [r.x - RAK.lebar / 2, -RAK.tinggi / 2, RAK.z - RAK.dalam / 2], max: [r.x + RAK.lebar / 2, RAK.tinggi / 2, MUKA_RAK + 0.01 + PINTU.tebal] });
  for (let m = 0; m < susunan.modul; m++)
    for (const dx of PERALATAN.letak) {
      const x = pusatModul(m) + dx;
      if (m === 0 && Math.abs(x - JENDELA_LAB.pusat[0]) < 0.9) continue;
      kotak.push({ nama: "peralatan", min: [x - PERALATAN.lebar / 2, -PERALATAN.tinggi / 2, RUANG.z[1] - PERALATAN.dalam], max: [x + PERALATAN.lebar / 2, PERALATAN.tinggi / 2, RUANG.z[1]] });
    }
  const sekat = [];
  for (let m = 0; m < susunan.modul; m++) sekat.push(pusatModul(m) - MODUL.panjang / 2, pusatModul(m) + MODUL.panjang / 2);
  const s = PALKA.r / Math.SQRT2; // kotak terbesar di dalam lubang palka
  for (const x of [...new Set(sekat.map((v) => +v.toFixed(3)))]) {
    const t = [x - 0.04, x + 0.04];
    kotak.push({ nama: "sekat", min: [t[0], RUANG.y[0], RUANG.z[0]], max: [t[1], -s, RUANG.z[1]] });
    kotak.push({ nama: "sekat", min: [t[0], s, RUANG.z[0]], max: [t[1], RUANG.y[1], RUANG.z[1]] });
    kotak.push({ nama: "sekat", min: [t[0], -s, RUANG.z[0]], max: [t[1], s, -s] });
    kotak.push({ nama: "sekat", min: [t[0], -s, s], max: [t[1], s, RUANG.z[1]] });
  }
  return kotak;
}
