// Pertukaran beranda ADR 0026 (24 Nov 2026): beranda = cerita v5, versi rak CD utuh di /arsip/cd
// (noindex, ditautkan dari beranda), alamat lama /v5 dialihkan ke beranda beserta parameternya.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { AWAL } from "../components/stasiun/kendaliLab.js";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const urut = (src, daftar) => daftar.map((s) => src.indexOf(s)).every((v, i, a) => v >= 0 && (i === 0 || v > a[i - 1]));

test("beranda: hero, cerita v5, modul lab, klien, kontak, lalu tautan ke versi CD", () => {
  const src = baca("app/[locale]/page.jsx");
  assert.ok(urut(src, ["<DuniaV5", "<Gerbang", "<CeritaV5", "<ModulLab", "<Klien", "<Contact", 'href="/arsip/cd"']));
  // tombol "Lihat proyek" menuju modul lab, CV tetap ikut
  assert.match(src, /<Gerbang cv=\{situs\.cv\} proyek="#modul-lab"/);
  assert.doesNotMatch(src, /components\/dunia\/|RakSesuaiMode/);
  assert.doesNotMatch(src, /robots/);
});

test("arsip: versi rak CD utuh di /arsip/cd dan tidak diindeks", () => {
  const src = baca("app/[locale]/arsip/cd/page.jsx");
  assert.ok(urut(src, ["<Dunia", "<Gerbang", "<CeritaKerja", "<RakSesuaiMode", "<Klien", "<Contact"]));
  assert.match(src, /robots: \{ index: false/);
  assert.equal(existsSync(new URL("../app/[locale]/cd/page.jsx", import.meta.url)), false);
});

test("/v5 dialihkan permanen ke beranda dengan parameter (?proyek=) utuh", () => {
  const src = baca("app/[locale]/v5/page.jsx");
  assert.match(src, /permanentRedirect\(`\/\$\{locale\}\$\{q \? `\?\$\{q\}` : ""\}`\)/);
});

test("tautan ke seksi proyek dari halaman lain menuju modul lab, bukan #rak yang hanya ada di arsip", () => {
  for (const p of ["app/[locale]/proyek/[slug]/page.jsx", "components/lab/HubLab.jsx"]) {
    const src = baca(p);
    assert.match(src, /href="\/#modul-lab"/, p);
    assert.doesNotMatch(src, /\/#rak/, p);
  }
});

test("tombol jeda gerak: hanya saat dunia v5 terpasang, keadaan lewat aria-pressed, label tetap", () => {
  assert.equal(AWAL.dunia, false);
  assert.equal(AWAL.jeda, false);
  const src = baca("components/bilah/TombolJeda.jsx");
  assert.match(src, /if \(mode !== "imersif" \|\| !s\.dunia\) return null;/);
  assert.match(src, /aria-pressed=\{s\.jeda\}/);
  assert.match(baca("components/bilah/Bilah.jsx"), /<TombolJeda \/>/);
});

test("arah dua: daftar modul lab menaut ke /arsip/cd, bilah arsip menaut ke versi terbaru", () => {
  const daftar = baca("components/stasiun/ModulLab.jsx");
  assert.match(daftar, /<Link href="\/arsip\/cd"[^>]*\{\.\.\.ikat\(n - 2\)\}>/);
  const bilah = baca("components/bilah/Bilah.jsx");
  assert.match(bilah, /pathname\.startsWith\("\/arsip\/"\) && \(\s*<Link href="\/" className="bilah__terbaru">/);
});
