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

test("ambient occlusion N8AO memakai gambar adegan yang sama, depth of field di lintasan layar", () => {
  // ADR 0017: benda harus menapak (masukan Farrez 13 Nov 2026). Adegan digambar sekali; N8AO
  // membaca target yang sama, dan hasilnya linear supaya tone mapping tetap di lintasan layar.
  assert.match(kode, /import \{ N8AOPass \} from "n8ao";/);
  assert.match(kode, /ao\.beautyRenderTarget = target;/);
  assert.match(kode, /autoRenderBeauty: false,\s*gammaCorrection: false,/);
  assert.match(kode, /renderer\.render\(scene, camera\);\s*if \(aoAktif\) ao\.render\(renderer, hasilAO\);/);
  assert.match(kode, /tWarna: \{ value: hasilAO\.texture \}/);
  // HP: sampel lebih sedikit. Jalur halfRes N8AO melempar galat dengan target pinjaman, jadi
  // tidak pernah dinyalakan; penjaga kualitas menurunkan sampel lalu mematikan AO.
  assert.match(kode, /aoSamples: hp \? 8 : 16,/);
  assert.doesNotMatch(kode, /halfRes/);
  assert.match(kode, /aoAktif = false;\s*blur\.uniforms\.tWarna\.value = target\.texture;/);
  assert.match(kode, /if \(uDof > 0\.001 && uKuat <= 0\.001\)/);
  assert.match(kode, /const dofTujuan = a\.cerita && !blend && !kurangiGerak \? 1 : 0;/);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.dependencies.n8ao, "2.0.1", "versi n8ao harus dikunci tepat");
});

test("model CC0 memakai AO dari peta ARM, dinding bertekstur plester", () => {
  assert.match(kode, /m\.roughnessMap === m\.metalnessMap && !m\.aoMap\) m\.aoMap = m\.roughnessMap;/);
  assert.match(kode, /tekstur\("bahan\/plester-normal\.webp"/);
  for (const b of ["plester-warna", "plester-normal", "plester-kasar"]) statSync(new URL(`../public/assets/dunia/bahan/${b}.webp`, import.meta.url));
});

// Masukan Farrez 13 Nov 2026: cahaya tiba-tiba berubah saat pindah babak, dan kabut putih mode
// terang terlalu tebal.
test("lampu kunci terbang bersama kamera, tidak melompat atau menyala mendadak", () => {
  assert.match(kode, /pose = poseAntara\(blend\.dari, blend\.ke, easeInOut\(u\)\);\s*pasangKunci\(easeInOut\(u\)\);/);
  // Nyala ikut diinterpolasi, bukan saklar.
  assert.match(kode, /nyala: kunciDari\.nyala \+ \(kunciKe\.nyala - kunciDari\.nyala\) \* e/);
  // Bayangannya digambar ulang hanya saat benda bergerak, bukan tiap bingkai.
  assert.match(kode, /if \(Math\.abs\(geserTujuan - geser\) > 1e-4 \|\| kotor\) kunciLampu\.shadow\.needsUpdate = true;/);
});

test("mode terang: kabut tipis, dan selubung teks dilepas di babak cerita", () => {
  const terang = kode.slice(kode.indexOf("terang: {"), kode.indexOf("};", kode.indexOf("terang: {")));
  const [dekat] = terang.match(/kabut: \[(\d+), (\d+)\]/).slice(1).map(Number);
  assert.ok(dekat >= 10, `kabut mulai ${dekat} m, menutup toko`);
  const css = readFileSync(new URL("../components/dunia/dunia.css", import.meta.url), "utf8");
  assert.match(css, /\.dunia\[data-tur="1"\]::after \{\s*opacity: 0\.2;/);
});

test("tidak ada variabel bingkai yang menutupi objek nyala lampu", () => {
  // Regresi 13 Nov 2026: `const nyala` (jumlah lampu status) di dalam bingkai menutupi objek
  // nyala lampu, dan nyala.kerucut() melempar galat di setiap bingkai babak cerita.
  const bingkai = kode.slice(kode.indexOf("const bingkai = (now) =>"), kode.indexOf("// ---- Muat dan pemanasan"));
  assert.doesNotMatch(bingkai, /\b(const|let) nyala\b/);
  assert.match(bingkai, /nyala\.kerucut\(a\.id === "dinding"\)/);
});
