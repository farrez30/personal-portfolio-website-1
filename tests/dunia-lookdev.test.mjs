// Lembar look-dev dunia toko kaset (docs/look-dev.md, gaya realistis sinematik malam). Tes ini
// mengunci keputusan yang mudah hilang saat dunia disunting: kurva warna, palet bayangan, lampu
// yang benar-benar menjangkau tempatnya, grade layar dalam satu lintasan, dan tekstur yang tidak
// dibuat di peramban (versi kanvas terukur sekitar 150 ms sinkron dan ular loader tersendat).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const dunia = baca("components/dunia/dunia.js");
const kode = dunia.replace(/\/\/.*$/gm, "");
const lembar = baca("docs/look-dev.md");

test("tone mapping AgX, bukan ACES", () => {
  assert.match(kode, /renderer\.toneMapping = THREE\.AgXToneMapping;/);
  assert.doesNotMatch(kode, /ACESFilmicToneMapping/);
  assert.match(lembar, /Tone mapping: \*\*AgX\*\*/);
});

test("bayangan dan kabut malam memakai cokelat lembar, bukan hitam", () => {
  const gelap = kode.slice(kode.indexOf("gelap: {"), kode.indexOf("terang: {"));
  assert.match(gelap, /latar: 0x1a1410,/);
  assert.match(lembar, /`#1a1410`/);
  assert.match(kode, /scene\.fog = new THREE\.Fog\(SUASANA\.gelap\.latar, \.\.\.SUASANA\.gelap\.kabut\);/);
  assert.match(kode, /scene\.fog\.color\.setHex\(s\.latar\);/);
});

test("lampu gantung tanpa batas jangkauan, satu di atas meja kasir", () => {
  // distance 7 membuat meja kasir hampir tak tersentuh (terang rata-rata 6 dari 255).
  assert.match(kode, /new THREE\.PointLight\(0xffffff, 1, 0, 2\);/);
  assert.doesNotMatch(kode, /PointLight\([^)]*, 7, 2\)/);
  assert.match(kode, /\[2\.1, yLampu, 2\.95\]/);
});

test("nyala lampu additive tanpa pass tambahan dan tanpa menulis kedalaman", () => {
  const nyala = kode.slice(kode.indexOf("function buatNyala"), kode.indexOf("function teksturRadial"));
  assert.match(nyala, /depthWrite: false, fog: false, blending: THREE\.AdditiveBlending/);
  assert.match(nyala, /new THREE\.Sprite\(halo\)/);
  assert.doesNotMatch(kode, /EffectComposer|UnrealBloomPass|BloomEffect/);
});

test("grade layar ada di lintasan motion blur yang sama, sesudah tone mapping", () => {
  const frag = kode.slice(kode.indexOf("fragmentShader: `"), kode.indexOf("depthTest: false"));
  const tm = frag.indexOf("#include <colorspace_fragment>");
  for (const u of ["uAngkat", "uVignette", "uButir"]) assert.ok(frag.lastIndexOf(u) > tm, `${u} sesudah tone mapping`);
  // Butir diam saat dunia diam dan saat pengguna meminta gerak dikurangi.
  assert.match(kode, /if \(!kurangiGerak\) blur\.uniforms\.uBenih\.value =/);
});

test("tekstur beton dari berkas, bukan dibuat di peramban", () => {
  assert.doesNotMatch(kode, /getImageData|createImageData|teksturBeton/);
  assert.match(kode, /tekstur\("beton\.webp", \[3, 2\.4\]\)/);
  assert.match(kode, /betonKasar\.colorSpace = THREE\.NoColorSpace;/);
  for (const f of ["beton.webp", "beton-kasar.webp"]) {
    const b = statSync(new URL(`../public/assets/dunia/${f}`, import.meta.url)).size;
    assert.ok(b < 100_000, `${f} ${b} byte`);
  }
  assert.match(baca("public/assets/dunia/PROVENANCE.md"), /beton\.webp[\s\S]*scripts\/beton\.py/);
});

test("lembar look-dev mencatat cara mengukur nilai", () => {
  assert.match(lembar, /--tanpa-teks/);
  assert.match(baca("scripts/ukur-dunia.mjs"), /const tanpaTeks = arg\.includes\("--tanpa-teks"\);/);
});

test("dinding depan terisi benda, isinya InstancedMesh tanpa tekstur", () => {
  const depan = kode.slice(kode.indexOf("function buatDindingDepan"), kode.indexOf("function teksturPoster"));
  assert.match(kode, /scene\.add\(buatDindingDepan\(bahan\)\);/);
  // Rak kaset, peti piringan, dan rak sampul: tiga isi instance, bukan ratusan mesh.
  assert.equal((depan.match(/isi\(new THREE\.BoxGeometry/g) ?? []).length, 3);
  assert.match(depan, /new THREE\.InstancedMesh\(/);
  // Poster tanpa tulisan: tidak ada fillText di teksturnya.
  const poster = kode.slice(kode.indexOf("function teksturPoster"), kode.indexOf("function buatStiker"));
  assert.doesNotMatch(poster, /fillText|strokeText/);
});

test("satu lampu gantung untuk tiap tempat, plus dinding kiri dan gondola cerita", () => {
  const daftar = kode.slice(kode.indexOf("const lampu = ["), kode.indexOf("].map((p) => {"));
  assert.equal((daftar.match(/yLampu/g) ?? []).length, 7);
});

// Masukan Farrez 13 Nov 2026: benda yang disinari harus berbayang dan punya kedalaman, bukan
// "3D polosan". Yang dikunci: setiap lampu gantung membuat bayangan, jadwalnya per lampu supaya
// lampu yang diam tidak dihitung ulang tiap bingkai, dan bidang ruangan tidak ikut membuat bayangan.
test("setiap lampu gantung, lampu jalan, dan lampu kunci membuat bayangan dengan jadwal sendiri", () => {
  const lampu = kode.slice(kode.indexOf("].map((p) => {"), kode.indexOf("const nyala = buatNyala(lampu);"));
  assert.match(lampu, /l\.castShadow = !hp;/);
  assert.match(lampu, /l\.shadow\.autoUpdate = false;/);
  assert.match(kode, /cahayaJalan\.castShadow = true;\s*cahayaJalan\.shadow\.autoUpdate = false;/);
  assert.match(kode, /kunciLampu\.castShadow = true;/);
  assert.match(kode, /kunciLampu\.shadow\.autoUpdate = false;/);
  // Tanpa PCFSoftShadowMap: dihapus di three 0.187.
  assert.match(kode, /renderer\.shadowMap\.type = THREE\.PCFShadowMap;/);
  // Lampu diam dicicil satu per bingkai, bukan sekaligus.
  assert.match(kode, /for \(const l of lampuBerbayang\(\)\) \{\s*l\.shadow\.needsUpdate = true;[\s\S]*?await bingkaiBerikut\(\);/);
});

test("lantai, dinding, dan plafon menerima bayangan tapi tidak membuatnya", () => {
  assert.match(kode, /const bidangRuang = new Set\(\[bahan\.dinding, bahan\.plafon, bahan\.lantai\]\);/);
  assert.match(kode, /o\.castShadow = !bidangRuang\.has\(m\);/);
});

test("lintasan layar memberi ambient occlusion dan depth of field, AO hanya di desktop", () => {
  assert.match(kode, /uAo: \{ value: hp \? 0 : 1 \}/);
  assert.match(kode, /if \(uDof > 0\.001 && uKuat <= 0\.001\)/);
  assert.match(kode, /if \(uAo > 0\.5 && zKini < 15\.0\)/);
  // Fokus hanya di babak cerita dan saat kamera sudah mendarat; gerak dikurangi tanpa kabur.
  assert.match(kode, /const dofTujuan = a\.cerita && !blend && !kurangiGerak \? 1 : 0;/);
});

test("model CC0 memakai AO dari peta ARM, dinding bertekstur plester", () => {
  assert.match(kode, /m\.roughnessMap === m\.metalnessMap && !m\.aoMap\) m\.aoMap = m\.roughnessMap;/);
  assert.match(kode, /tekstur\("bahan\/plester-normal\.webp"/);
  for (const b of ["plester-warna", "plester-normal", "plester-kasar"]) statSync(new URL(`../public/assets/dunia/bahan/${b}.webp`, import.meta.url));
});
