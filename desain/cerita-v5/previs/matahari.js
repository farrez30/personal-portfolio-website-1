// Posisi matahari dan rotasi bumi dari waktu UTC, tanpa API.
// Rumus: USNO "Approximate Solar Coordinates" (akurasi sekitar 1 menit busur dalam dua abad dari
// 2000) dan GMST ringkas USNO (hilang 0,1 detik per abad). Sumber di ../riset-jendela-orbit.md.

const RAD = Math.PI / 180;
const mod = (x, m) => ((x % m) + m) % m;

// ms = milidetik UTC (Date.now()). Sudut dalam derajat.
export function keadaanMatahari(ms) {
  const D = ms / 86400000 + 2440587.5 - 2451545.0;
  const g = mod(357.529 + 0.98560028 * D, 360) * RAD;
  const q = mod(280.459 + 0.98564736 * D, 360);
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * D) * RAD;
  const ra = mod(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD, 360);
  const dek = Math.asin(Math.sin(e) * Math.sin(L)) / RAD;
  const gmst = mod(18.697375 + 24.065709824279 * D, 24) * 15;
  return {
    ra,
    dek,
    gmst,
    // titik di bumi yang matahari tepat di atasnya
    lintangSubsolar: dek,
    bujurSubsolar: mod(ra - gmst + 180, 360) - 180,
    // equation of time, menit: jam matahari lebih cepat dari jam rata-rata bila positif
    eot: (mod(q - ra + 180, 360) - 180) * 4,
  };
}

// Arah matahari di kerangka inersia, dengan sumbu three.js: Y ke kutub utara, X ke titik musim
// semi (vernal equinox), Z = -y inersia. Bumi diputar `gmst` derajat di sumbu Y.
export function arahMatahari(ms) {
  const { ra, dek } = keadaanMatahari(ms);
  const cd = Math.cos(dek * RAD);
  return [cd * Math.cos(ra * RAD), Math.sin(dek * RAD), -cd * Math.sin(ra * RAD)];
}

// Batas siang-malam dalam cos(zenit) = dot(normal permukaan, arah matahari) (USNO RST_defs).
export const BATAS = { terbit: Math.cos(90.8333 * RAD), sipil: Math.cos(96 * RAD), nautikal: Math.cos(102 * RAD), astronomis: Math.cos(108 * RAD) };

// Orbit melingkar tipe ISS (bukan posisi ISS sungguhan). Ketinggian km, inklinasi derajat.
export const BUMI = { R: 6378.137, MU: 398600.4418, J2: 1.08263e-3 };
export function orbit({ tinggi = 420, inklinasi = 51.64, raan0 = 250.41, u0 = 0, epoch = Date.UTC(2026, 10, 19, 17, 18) } = {}) {
  const a = BUMI.R + tinggi;
  const n = Math.sqrt(BUMI.MU / a ** 3); // rad/s
  const i = inklinasi * RAD;
  const lajuRaan = -1.5 * BUMI.J2 * (BUMI.R / a) ** 2 * n * Math.cos(i); // rad/s
  return {
    a,
    periodeMenit: (2 * Math.PI) / n / 60,
    posisi(ms) {
      const t = (ms - epoch) / 1000;
      const u = u0 * RAD + n * t, O = raan0 * RAD + lajuRaan * t;
      const x = Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(i);
      const y = Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(i);
      const z = Math.sin(u) * Math.sin(i);
      return [x * a, z * a, -y * a]; // kerangka three.js, km
    },
  };
}

// Apakah titik (km, kerangka three.js) ada di bayangan bumi (silinder)?
export function diBayangan(p, s) {
  const d = p[0] * s[0] + p[1] * s[1] + p[2] * s[2];
  if (d >= 0) return false;
  const tegak = Math.hypot(p[0] - d * s[0], p[1] - d * s[1], p[2] - d * s[2]);
  return tegak < BUMI.R;
}
