// node --test desain/cerita-v5/previs/matahari.test.mjs
// Harapan dihitung dari sumber luar, bukan dari kode yang dites.
import { test } from "node:test";
import assert from "node:assert/strict";
import { keadaanMatahari, arahMatahari, orbit, diBayangan, BUMI } from "./matahari.js";

const dekat = (a, b, tol, pesan) => assert.ok(Math.abs(a - b) <= tol, `${pesan}: ${a} vs ${b} (tol ${tol})`);

test("fixture Meeus 1992-10-13 00:00 UTC (contoh Sun, Astronomical Algorithms lewat PyMeeus)", () => {
  const m = keadaanMatahari(Date.UTC(1992, 9, 13, 0, 0));
  dekat(m.dek, -7.785, 0.02, "deklinasi");
  dekat(m.eot, 13.71, 0.2, "equation of time");
  dekat(m.ra, 198.38, 0.05, "asensio rekta");
});

test("ekuinoks dan solstis: deklinasi mendekati 0 dan ±23,44°", () => {
  // waktu ekuinoks Maret 2026 (20 Mar 14:46 UTC) dan solstis Juni 2026 (21 Jun 08:24 UTC), USNO Earth's Seasons
  dekat(keadaanMatahari(Date.UTC(2026, 2, 20, 14, 46)).dek, 0, 0.05, "ekuinoks Maret");
  dekat(keadaanMatahari(Date.UTC(2026, 5, 21, 8, 24)).dek, 23.44, 0.02, "solstis Juni");
  dekat(keadaanMatahari(Date.UTC(2026, 11, 21, 20, 50)).dek, -23.44, 0.02, "solstis Desember");
});

test("deklinasi tidak pernah melewati kemiringan sumbu, 1900 sampai 2300", () => {
  for (let k = 0; k < 2000; k++) {
    const ms = Date.UTC(1900, 0, 1) + ((k * 7919) % 400) * 365.25 * 86400000 + k * 3600000;
    assert.ok(Math.abs(keadaanMatahari(ms).dek) <= 23.46, `tahun ${new Date(ms).getUTCFullYear()}`);
  }
});

test("titik subsolar bergeser sekitar 15° ke barat tiap jam", () => {
  const a = keadaanMatahari(Date.UTC(2026, 10, 20, 0)), b = keadaanMatahari(Date.UTC(2026, 10, 20, 1));
  const geser = ((a.bujurSubsolar - b.bujurSubsolar + 540) % 360) - 180;
  dekat(geser, 15.0, 0.05, "pergeseran bujur per jam");
});

// EoT positif: tengah hari matahari di Greenwich datang lebih awal (11.44 UTC untuk +16 menit),
// jadi pada 12.00 UTC matahari sudah EoT/4 derajat di barat bujur 0.
test("tengah hari di Greenwich: titik subsolar dekat bujur 0 dikoreksi equation of time", () => {
  const m = keadaanMatahari(Date.UTC(2026, 10, 3, 12, 0)); // awal November, EoT sekitar +16 menit
  dekat(m.bujurSubsolar, -m.eot / 4, 0.1, "bujur = -EoT/4");
  dekat(m.eot, 16.4, 0.4, "EoT awal November");
});

test("arah matahari satuan dan sejalan dengan deklinasi", () => {
  const ms = Date.UTC(2026, 5, 21, 8, 24), s = arahMatahari(ms);
  dekat(Math.hypot(...s), 1, 1e-12, "panjang vektor");
  dekat((Math.asin(s[1]) * 180) / Math.PI, keadaanMatahari(ms).dek, 1e-9, "sudut ke kutub");
});

test("orbit tipe ISS: periode sekitar 92,9 menit di 420 km, GEO satu hari sidereal", () => {
  dekat(orbit({ tinggi: 420 }).periodeMenit, 92.9, 0.3, "ISS (TLE CelesTrak 15,4949 per hari = 92,93 menit)");
  dekat(orbit({ tinggi: 35786 }).periodeMenit, 1436.07, 1, "GEO = 23 jam 56 menit");
});

test("posisi orbit selalu di ketinggian yang sama dan kembali setelah satu periode", () => {
  const o = orbit({ tinggi: 420, raan0: 0 }), t0 = Date.UTC(2026, 10, 19, 17, 18);
  for (let k = 0; k < 20; k++) dekat(Math.hypot(...o.posisi(t0 + k * 300000)), BUMI.R + 420, 1e-6, "jari-jari");
  const p0 = o.posisi(t0), p1 = o.posisi(t0 + o.periodeMenit * 60000);
  assert.ok(Math.hypot(p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]) < 40, "kembali dekat titik awal (beda karena presesi node)");
});

test("bayangan bumi: sisi malam gelap, sisi siang terang", () => {
  const s = [1, 0, 0], r = BUMI.R + 420;
  assert.equal(diBayangan([-r, 0, 0], s), true);
  assert.equal(diBayangan([r, 0, 0], s), false);
  assert.equal(diBayangan([0, r, 0], s), false);
});
