// Jalur gulung buklet: cara buklet ditarik keluar dari tutup kotak CD.
//
// Kertas tidak bergerak kaku. Setiap titik kertas meluncur sepanjang satu jalur yang
// panjangnya terjaga: tepi diangkat dulu (busur pendek sampai SUDUT_MASUK), terus
// keluar dengan busur landai, lalu membelok mengitari satu silinder yang sumbunya
// sejajar punggung buklet sampai menghadap kamera. Tengah buklet ikut jalur yang sama,
// jadi buklet berputar mengitari sumbu silinder, bukan di tengahnya sendiri.
// Sambil mendarat, lengkungnya dilemaskan (datar) tanpa mengubah panjang kertas.
//
// Ukuran dan pembagian waktu mengikuti studi rekaman Discography (dmtrbrl) yang ditulis
// ulang di sini dari deskripsinya; satuan di sini satuan kotak (1 = 100 mm).
//
// Kerangka diam: kerangka buklet di dalam tutup. x melintang halaman (punggung di -x),
// z keluar dari muka sampul depan. Hasil "dalam" negatif = ke arah -z, yaitu menjauh
// dari sampul depan, ke arah kamera saat kotak terbuka.

const MM = 0.01;
export const UKURAN = 120 * MM;
export const TEBAL = 1.2 * MM;
export const JALUR = {
  bentang: 25 * MM, // busur pertama: tepi naik
  sudut: (28 * Math.PI) / 180, // sampai sudut ini (tutup terbuka 180 derajat)
  lari: 69 * MM, // busur kedua, landai
  belok: 1 / (400 * MM), // kelengkungan busur kedua
  jari: 100 * MM, // silinder
  sisip: (16 - 5 - 1) * MM, // tepi kertas di bawah penahan
};

export const kuintik = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const jepit = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const p3o = (t) => 1 - Math.pow(1 - jepit(t), 3);

/** Sudut sudut masuk menurut sudut buka tutup (derajat): 180 berarti 28 derajat. */
export function sudutMasuk(sudutTutup = 180) {
  return ((28 + 180 - sudutTutup) * Math.PI) / 180;
}

/** Panjang jalur sampai garis silinder yang paling dekat ke kamera. */
export function busurDepan(g) {
  const naik = g.w + JALUR.lari * JALUR.belok;
  return JALUR.bentang + JALUR.lari + (Math.PI - naik) * JALUR.jari;
}

/** Isi g (x: titik masuk, y: panjang yang sudah ditarik, w: sudut masuk) dari kemajuan 0..1. */
export function aturGulung(kemajuan, g, sudutTutup = 180) {
  g.w = sudutMasuk(sudutTutup);
  const tarik = (busurDepan(g) + UKURAN) * kemajuan;
  g.y = tarik;
  g.x = -UKURAN / 2 + JALUR.sisip * p3o(tarik / JALUR.sisip);
  return g;
}

/** Sudut arah jalur setelah f sepanjang jalur. */
export function sudutDi(f, g) {
  const lari = JALUR.bentang + JALUR.lari;
  if (f <= 0) return 0;
  if (f < JALUR.bentang) return (g.w * f) / JALUR.bentang;
  if (f < lari) return g.w + (f - JALUR.bentang) * JALUR.belok;
  return Math.min(Math.PI, g.w + JALUR.lari * JALUR.belok + (f - lari) / JALUR.jari);
}

// Integral arah jalur dari 0 sampai f, dengan sudut dikurangi `tengah` lalu dikali k.
// Tepat untuk tiap potong, karena di busur sudutnya bertambah rata dan di garis lurus tetap.
export function sepanjang(f, g, k = 1, tengah = 0) {
  if (f <= 0) return [f * Math.cos(-k * tengah), f * Math.sin(-k * tengah)];
  const lari = JALUR.bentang + JALUR.lari;
  const naik = g.w + JALUR.lari * JALUR.belok;
  const putar = lari + (Math.PI - naik) * JALUR.jari;
  let x = 0;
  let y = 0;
  const potong = (awal, akhir, sudut, laju) => {
    if (akhir <= awal) return;
    const a = k * (sudut - tengah);
    const b = k * (sudut + laju * (akhir - awal) - tengah);
    const l = akhir - awal;
    if (Math.abs(b - a) < 1e-4) {
      x += l * Math.cos((a + b) / 2);
      y += l * Math.sin((a + b) / 2);
    } else {
      x += (l / (b - a)) * (Math.sin(b) - Math.sin(a));
      y += (l / (b - a)) * (Math.cos(a) - Math.cos(b));
    }
  };
  potong(0, Math.min(f, JALUR.bentang), 0, g.w / JALUR.bentang);
  potong(JALUR.bentang, Math.min(f, lari), g.w, JALUR.belok);
  potong(lari, Math.min(f, putar), naik, 1 / JALUR.jari);
  potong(putar, f, Math.PI, 0);
  return [x, y];
}

/** Letak tengah buklet di kerangka diam: [melintang, dalam, sudut putar]. */
export function letakTengah(g) {
  const f = g.x + g.y;
  const [ax, ay] = sepanjang(f, g);
  return [g.x - ax, -ay, -sudutDi(f, g)];
}

/** Titik kertas di x (relatif tengah) setelah ditekuk, relatif tengah dan garis singgungnya. */
export function tekuk(x, g, datar = 0) {
  const k = 1 - datar;
  const fTengah = g.x + g.y;
  const f = fTengah - x;
  const tengah = sudutDi(fTengah, g);
  const [ax, ay] = sepanjang(f, g, k, tengah);
  const [bx, by] = sepanjang(fTengah, g, k, tengah);
  return [-(ax - bx), -(ay - by), -k * (sudutDi(f, g) - tengah)];
}

/** Kemajuan gulung dari kemajuan baca: berhenti dengan tengah di depan silinder. */
export function gulungDari(baca, sudutTutup = 180) {
  const g = { w: sudutMasuk(sudutTutup) };
  const total = busurDepan(g) + UKURAN;
  const ditahan = (UKURAN - JALUR.sisip) / total;
  const depan = (busurDepan(g) + UKURAN / 2 - JALUR.sisip) / total;
  const r = kuintik(jepit(baca));
  if (r <= ditahan) return r;
  const u = (r - ditahan) / (1 - ditahan);
  return ditahan + (1 - ditahan) * u * (1 - u) * (1 - u) + (depan - ditahan) * u * u * (3 - 2 * u);
}

/** Kemajuan baca saat tengah buklet mulai mengitari silinder: dari sini pose mulai berubah. */
export function mulaiBelok(sudutTutup = 180) {
  const g = { w: sudutMasuk(sudutTutup) };
  const total = busurDepan(g) + UKURAN;
  const tarik = JALUR.bentang + JALUR.lari + UKURAN / 2 - JALUR.sisip;
  let lo = 0;
  let hi = 1;
  for (let n = 0; n < 24; n++) {
    const m = (lo + hi) / 2;
    if (kuintik(m) < tarik / total) lo = m;
    else hi = m;
  }
  return hi;
}

const f6 = (n) => n.toFixed(6);

// GLSL yang sama dengan tekuk() di atas, untuk hook deform LeafThrough. p dalam satuan
// halaman (sampul tertutup x 0..1 dari punggung), diubah ke satuan kotak, ditekuk, lalu kembali.
export const GULUNG_GLSL = `
uniform vec4 uGulung;
uniform float uDatar;
float gulungSudut(float f) {
  float lari = ${f6(JALUR.bentang + JALUR.lari)};
  if (f <= 0.0) return 0.0;
  if (f < ${f6(JALUR.bentang)}) return uGulung.w * f / ${f6(JALUR.bentang)};
  if (f < lari) return uGulung.w + (f - ${f6(JALUR.bentang)}) * ${f6(JALUR.belok)};
  return min(PI, uGulung.w + ${f6(JALUR.lari * JALUR.belok)} + (f - lari) / ${f6(JALUR.jari)});
}
vec2 gulungPotong(float awal, float akhir, float sudut, float laju, float k, float tengah) {
  if (akhir <= awal) return vec2(0.0);
  float a = k * (sudut - tengah);
  float b = k * (sudut + laju * (akhir - awal) - tengah);
  float l = akhir - awal;
  if (abs(b - a) < 1e-4) return l * vec2(cos((a + b) / 2.0), sin((a + b) / 2.0));
  return l / (b - a) * vec2(sin(b) - sin(a), cos(a) - cos(b));
}
vec2 gulungSepanjang(float f, float k, float tengah) {
  if (f <= 0.0) return f * vec2(cos(-k * tengah), sin(-k * tengah));
  float lari = ${f6(JALUR.bentang + JALUR.lari)};
  float naik = uGulung.w + ${f6(JALUR.lari * JALUR.belok)};
  float putar = lari + (PI - naik) * ${f6(JALUR.jari)};
  vec2 s = gulungPotong(0.0, min(f, ${f6(JALUR.bentang)}), 0.0, uGulung.w / ${f6(JALUR.bentang)}, k, tengah);
  s += gulungPotong(${f6(JALUR.bentang)}, min(f, lari), uGulung.w, ${f6(JALUR.belok)}, k, tengah);
  s += gulungPotong(lari, min(f, putar), naik, ${f6(1 / JALUR.jari)}, k, tengah);
  return s + gulungPotong(putar, f, PI, 0.0, k, tengah);
}
vec3 deformSheet(vec3 p, vec2 uv) {
  if (uGulung.z < 0.5) return p;
  float S = ${f6(UKURAN)};
  float setengahTebal = ${f6(TEBAL / 2)};
  vec3 kertas = vec3((p.x - 0.5) * S, p.y * S, p.z * S - setengahTebal);
  float k = 1.0 - uDatar;
  float fTengah = uGulung.x + uGulung.y;
  float f = fTengah - kertas.x;
  float tengah = gulungSudut(fTengah);
  vec2 d = gulungSepanjang(f, k, tengah) - gulungSepanjang(fTengah, k, tengah);
  vec3 t = vec3(-d.x, -d.y, -k * (gulungSudut(f) - tengah));
  kertas = vec3(t.x + sin(t.z) * kertas.z, kertas.y, t.y + cos(t.z) * kertas.z);
  return vec3(kertas.x / S + 0.5, kertas.y / S, (kertas.z + setengahTebal) / S);
}`;
