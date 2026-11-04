// Jalur gulung buklet: cara buklet ditarik keluar dari tutup kotak CD.
//
// Kertas tidak bergerak kaku. Setiap titik kertas meluncur sepanjang satu jalur yang
// panjangnya terjaga: tepi diangkat dulu (busur pendek sampai sudut masuk), terus
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
//
// Sisi 1 (layar lebar, tutup terbuka 180 derajat): punggung keluar duluan, lewat engsel.
// Sisi -1 (HP, tutup terbuka 110 derajat): bayangan cerminnya, tepi depan keluar duluan
// lewat sisi tutup yang terbuka, dengan tekukan awal lebih tajam dan silinder lebih lebar.

const MM = 0.01;
export const UKURAN = 120 * MM;
export const TEBAL = 1.2 * MM;
export const JALUR = {
  1: { bentang: 25 * MM, lari: 69 * MM, belok: 1 / (400 * MM), jari: 100 * MM },
  [-1]: { bentang: 14 * MM, lari: 110 * MM, belok: 1 / (200 * MM), jari: 150 * MM },
};
// Tepi kertas di bawah penahan: tab 16 mm dari tepi, jari-jari 5 mm, sisa 1 mm.
export const SISIP = (16 - 5 - 1) * MM;

export const kuintik = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const jepit = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const p3o = (t) => 1 - Math.pow(1 - jepit(t), 3);

/** Sudut masuk (radian): lewat engsel ditambah kemiringan tutup, lewat sisi terbuka tetap 40. */
export function sudutMasuk(sisi = 1, sudutTutup = 180) {
  return ((sisi > 0 ? 28 + 180 - sudutTutup : 40) * Math.PI) / 180;
}

/** Panjang jalur sampai garis silinder yang paling dekat ke kamera. */
export function busurDepan(g) {
  const j = JALUR[g.s];
  const naik = g.w + j.lari * j.belok;
  return j.bentang + j.lari + (Math.PI - naik) * j.jari;
}

/**
 * Isi g dari kemajuan 0..1: x titik masuk, y panjang yang sudah ditarik, w sudut masuk,
 * s sisi (1 atau -1).
 */
export function aturGulung(kemajuan, g, sisi = 1, sudutTutup = 180) {
  g.s = sisi;
  g.w = sudutMasuk(sisi, sudutTutup);
  const tarik = (busurDepan(g) + UKURAN) * kemajuan;
  g.y = tarik;
  g.x = -UKURAN / 2 + SISIP * p3o(tarik / SISIP);
  return g;
}

/** Sudut arah jalur setelah f sepanjang jalur. */
export function sudutDi(f, g) {
  const j = JALUR[g.s];
  const lari = j.bentang + j.lari;
  if (f <= 0) return 0;
  if (f < j.bentang) return (g.w * f) / j.bentang;
  if (f < lari) return g.w + (f - j.bentang) * j.belok;
  return Math.min(Math.PI, g.w + j.lari * j.belok + (f - lari) / j.jari);
}

// Integral arah jalur dari 0 sampai f, dengan sudut dikurangi `tengah` lalu dikali k.
// Tepat untuk tiap potong, karena di busur sudutnya bertambah rata dan di garis lurus tetap.
export function sepanjang(f, g, k = 1, tengah = 0) {
  if (f <= 0) return [f * Math.cos(-k * tengah), f * Math.sin(-k * tengah)];
  const j = JALUR[g.s];
  const lari = j.bentang + j.lari;
  const naik = g.w + j.lari * j.belok;
  const putar = lari + (Math.PI - naik) * j.jari;
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
  potong(0, Math.min(f, j.bentang), 0, g.w / j.bentang);
  potong(j.bentang, Math.min(f, lari), g.w, j.belok);
  potong(lari, Math.min(f, putar), naik, 1 / j.jari);
  potong(putar, f, Math.PI, 0);
  return [x, y];
}

/** Letak tengah buklet di kerangka diam: [melintang, dalam, sudut putar]. */
export function letakTengah(g) {
  const f = g.x + g.y;
  const [ax, ay] = sepanjang(f, g);
  return [g.s * (g.x - ax), -ay, -g.s * sudutDi(f, g)];
}

/** Titik kertas di x (relatif tengah) setelah ditekuk, relatif tengah dan garis singgungnya. */
export function tekuk(x, g, datar = 0) {
  const k = 1 - datar;
  const fTengah = g.x + g.y;
  const f = fTengah - g.s * x;
  const tengah = sudutDi(fTengah, g);
  const [ax, ay] = sepanjang(f, g, k, tengah);
  const [bx, by] = sepanjang(fTengah, g, k, tengah);
  return [-g.s * (ax - bx), -(ay - by), -g.s * k * (sudutDi(f, g) - tengah)];
}

/** Kemajuan gulung dari kemajuan baca: berhenti dengan tengah di depan silinder. */
export function gulungDari(baca, sisi = 1, sudutTutup = 180) {
  const g = { s: sisi, w: sudutMasuk(sisi, sudutTutup) };
  const total = busurDepan(g) + UKURAN;
  const ditahan = (UKURAN - SISIP) / total;
  const depan = (busurDepan(g) + UKURAN / 2 - SISIP) / total;
  const r = kuintik(jepit(baca));
  if (r <= ditahan) return r;
  const u = (r - ditahan) / (1 - ditahan);
  return ditahan + (1 - ditahan) * u * (1 - u) * (1 - u) + (depan - ditahan) * u * u * (3 - 2 * u);
}

/** Kemajuan baca saat tengah buklet mulai mengitari silinder: dari sini pose mulai berubah. */
export function mulaiBelok(sisi = 1, sudutTutup = 180) {
  const g = { s: sisi, w: sudutMasuk(sisi, sudutTutup) };
  const j = JALUR[sisi];
  const total = busurDepan(g) + UKURAN;
  const tarik = j.bentang + j.lari + UKURAN / 2 - SISIP;
  let lo = 0;
  let hi = 1;
  for (let n = 0; n < 24; n++) {
    const m = (lo + hi) / 2;
    if (kuintik(m) < tarik / total) lo = m;
    else hi = m;
  }
  return hi;
}

/** Jarak tarik saat tengah buklet mulai mengitari silinder (satuan kotak). */
export function tarikBelok(sisi = 1) {
  const j = JALUR[sisi];
  return j.bentang + j.lari + UKURAN / 2 - SISIP;
}

const f6 = (n) => n.toFixed(6);
const pilih = (nama) => `(s > 0.0 ? ${f6(JALUR[1][nama])} : ${f6(JALUR[-1][nama])})`;

// GLSL yang sama dengan tekuk() di atas, untuk hook deform LeafThrough. p dalam satuan
// halaman (sampul tertutup x 0..1 dari punggung), diubah ke satuan kotak, ditekuk, lalu kembali.
// uGulung: x titik masuk, y panjang ditarik, z sisi (1, -1, atau 0 = tidak ditekuk), w sudut masuk.
export const GULUNG_GLSL = `
uniform vec4 uGulung;
uniform float uDatar;
uniform float uSelip;
float gulungSudut(float f, float s) {
  float bentang = ${pilih("bentang")};
  float lari = bentang + ${pilih("lari")};
  float belok = ${pilih("belok")};
  if (f <= 0.0) return 0.0;
  if (f < bentang) return uGulung.w * f / bentang;
  if (f < lari) return uGulung.w + (f - bentang) * belok;
  return min(PI, uGulung.w + (lari - bentang) * belok + (f - lari) / ${pilih("jari")});
}
vec2 gulungPotong(float awal, float akhir, float sudut, float laju, float k, float tengah) {
  if (akhir <= awal) return vec2(0.0);
  float a = k * (sudut - tengah);
  float b = k * (sudut + laju * (akhir - awal) - tengah);
  float l = akhir - awal;
  if (abs(b - a) < 1e-4) return l * vec2(cos((a + b) / 2.0), sin((a + b) / 2.0));
  return l / (b - a) * vec2(sin(b) - sin(a), cos(a) - cos(b));
}
vec2 gulungSepanjang(float f, float k, float tengah, float s) {
  if (f <= 0.0) return f * vec2(cos(-k * tengah), sin(-k * tengah));
  float bentang = ${pilih("bentang")};
  float lari = bentang + ${pilih("lari")};
  float belok = ${pilih("belok")};
  float jari = ${pilih("jari")};
  float naik = uGulung.w + (lari - bentang) * belok;
  float putar = lari + (PI - naik) * jari;
  vec2 sum = gulungPotong(0.0, min(f, bentang), 0.0, uGulung.w / bentang, k, tengah);
  sum += gulungPotong(bentang, min(f, lari), uGulung.w, belok, k, tengah);
  sum += gulungPotong(lari, min(f, putar), naik, 1.0 / jari, k, tengah);
  return sum + gulungPotong(putar, f, PI, 0.0, k, tengah);
}
vec3 deformSheet(vec3 p, vec2 uv) {
  // Lembar di bawah lembar terluar ditarik masuk dari tepi luarnya selagi di tutup,
  // supaya tepinya tidak mengintip sebagai garis putih; punggung tetap.
  p.xy *= 1.0 - uSelip * vec2(${f6(1.5 / 120)}, ${f6(3 / 120)});
  float s = uGulung.z;
  if (abs(s) < 0.5) return p;
  float S = ${f6(UKURAN)};
  float setengahTebal = ${f6(TEBAL / 2)};
  vec3 kertas = vec3((p.x - 0.5) * S, p.y * S, p.z * S - setengahTebal);
  float k = 1.0 - uDatar;
  float fTengah = uGulung.x + uGulung.y;
  float f = fTengah - s * kertas.x;
  float tengah = gulungSudut(fTengah, s);
  vec2 d = gulungSepanjang(f, k, tengah, s) - gulungSepanjang(fTengah, k, tengah, s);
  vec3 t = vec3(-s * d.x, -d.y, -s * k * (gulungSudut(f, s) - tengah));
  kertas = vec3(t.x + sin(t.z) * kertas.z, kertas.y, t.y + cos(t.z) * kertas.z);
  return vec3(kertas.x / S + 0.5, kertas.y / S, (kertas.z + setengahTebal) / S);
}`;
