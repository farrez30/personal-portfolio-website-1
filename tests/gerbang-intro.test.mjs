// Intro portofolio adalah hero itu sendiri (keputusan 12 Nov 2026, tanpa loader layar penuh).
// Tes ini menjaga tiga hal yang mudah rusak: judul tidak pernah mulai dari opacity 0 (Chrome
// tidak menghitungnya sebagai LCP), gerak dikurangi tidak mendapat intro, dan intronya singkat.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../components/gerbang/gerbang.css", import.meta.url), "utf8");
const intro = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference)"));

const keyframes = (nama) => {
  const m = css.match(new RegExp(`@keyframes ${nama} \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(m, `@keyframes ${nama} tidak ada`);
  return m[1];
};

test("intro hanya jalan bila pengguna tidak meminta gerak dikurangi", () => {
  assert.ok(intro.length < css.length, "blok prefers-reduced-motion: no-preference tidak ada");
  const blok = intro.slice(0, intro.indexOf("@keyframes"));
  assert.match(blok, /\.gerbang \.hg[\s\S]*animation/);
  // Animasi di luar blok itu akan ikut diputar untuk pengguna gerak dikurangi.
  const luar = css.slice(0, css.indexOf("@media (prefers-reduced-motion: no-preference)"));
  assert.doesNotMatch(luar, /animation:/);
});

test("tidak ada keyframe intro yang memulai dari opacity 0", () => {
  for (const nama of ["gerbang-masuk", "gerbang-judul", "gerbang-bilah"]) {
    const isi = keyframes(nama);
    const op = isi.match(/opacity:\s*([\d.]+)/);
    assert.ok(op, `${nama} tanpa opacity awal`);
    assert.ok(Number(op[1]) >= 0.1, `${nama} mulai dari opacity ${op[1]}`);
  }
});

test("seluruh intro selesai dalam 1,5 detik", () => {
  const blok = intro.slice(0, intro.indexOf("@keyframes"));
  const aturan = [...blok.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);
  let durasiDasar = 0;
  let terlama = 0;
  for (const a of aturan) {
    const d = a.match(/animation(?:-duration)?:[^;]*?([\d.]+)s/);
    const t = a.match(/animation-delay:\s*([\d.]+)s/);
    if (/animation:/.test(a)) durasiDasar = Number(d[1]);
    const durasi = /animation-duration/.test(a) ? Number(a.match(/animation-duration:\s*([\d.]+)s/)[1]) : durasiDasar;
    terlama = Math.max(terlama, (t ? Number(t[1]) : 0) + durasi);
  }
  assert.ok(terlama > 0 && terlama <= 1.5, `intro ${terlama} s`);
});
