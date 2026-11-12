// Kedip lampu, kabut terang, dan PMREM rak yang dipanggang (masukan Farrez 13 Nov 2026).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const tanpaKomentar = (s) => s.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const dunia = tanpaKomentar(baca("components/dunia/dunia.js"));
const css = tanpaKomentar(baca("components/dunia/dunia.css"));

test("padam babak andal mengikuti gulir, bukan waktu, dan lampu memudar", () => {
  assert.doesNotMatch(dunia, /Math\.sin\(now/);
  assert.match(dunia, /redup\(padam \? \(u < 0\.435 \? 0\.45 : u < 0\.445 \? 0\.8 : 0\.05\) : 1\);/);
  // redup() hanya menyetel tujuan; intensitas lampu berubah di langkahRedup per bingkai.
  assert.match(dunia, /const redup = \(f\) => \{\s*tujuanRedup = f;\s*nyala\.redup\(f\);\s*\};/);
  assert.match(dunia, /if \(langkahRedup\(dt\)\) bergerak = true;/);
});

test("halo dan kerucut lampu memudar, tidak pernah berganti visible seketika", () => {
  assert.doesNotMatch(dunia, /nyala\.grup\.visible =/);
  assert.match(dunia, /if \(nyala\.langkah\(dt\)\) bergerak = true;/);
  // Kerucut hanya disembunyikan setelah opasitasnya benar-benar hampir nol.
  assert.match(dunia, /kerucut\.visible = kerucut\.opacity > 0\.0005;/);
});

test("kabut dan selubung tema terang tipis", () => {
  const terang = dunia.slice(dunia.indexOf("terang: {"));
  const [dekat, jauh] = terang.match(/kabut: \[(\d+), (\d+)\]/).slice(1).map(Number);
  assert.ok(dekat >= 18 && jauh >= 48, `kabut terang ${dekat} sampai ${jauh}`);
  const selubung = css.match(/html\[data-theme="light"\] \.dunia::after \{([\s\S]*?)\}/)[1];
  const persen = [...selubung.matchAll(/var\(--bg\) (\d+)%/g)].map((m) => Number(m[1]));
  assert.ok(persen.length >= 3 && Math.max(...persen) <= 70, `selubung terang ${persen}`);
});

test("rak memakai PMREM yang dipanggang, PMREMGenerator hanya cadangan", async () => {
  const lingkungan = baca("components/imersif/lingkungan.js");
  const adegan = baca("components/imersif/adegan.js");
  const panggung = baca("components/imersif/Panggung.jsx");
  assert.match(adegan, /scene\.environment = lingkungan \?\? buatLingkungan\(renderer\);/);
  assert.match(panggung, /const lingkungan = await muatLingkungan\(\)\.catch\(\(\) => null\);/);
  assert.match(lingkungan, /t\.isPMREMTexture = true;/);
  // Berkas ada dan ukurannya wajar (WebP lossless, sekitar 126 KB).
  const ukuran = statSync(new URL("../public/assets/rak/lingkungan.webp", import.meta.url)).size;
  assert.ok(ukuran > 50_000 && ukuran < 300_000, `lingkungan.webp ${ukuran} B`);
  // Letak atlas: enam muka 256 px, enam tingkat 256 sampai 8, tingkat bertumpuk ke bawah.
  const { letakAtlas, UKURAN_ATLAS } = await import("../components/imersif/lingkungan.js");
  assert.deepEqual(UKURAN_ATLAS, { w: 1536, h: 504 });
  assert.deepEqual(letakAtlas(5, 0), { x: 1280, y: 0, s: 256 });
  assert.deepEqual(letakAtlas(2, 5), { x: 16, y: 496, s: 8 });
});
