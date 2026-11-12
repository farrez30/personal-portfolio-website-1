// Rak CD tidak boleh membekukan halaman. Terukur di RX 6700 XT (Chrome, 1440x900): gambar rak
// pertama mengompilasi semua shader di main thread (2.598 ms), dan membuka album mengunggah
// sepuluh halaman 2048 px plus pipeline baru dalam satu bingkai (746 ms). Tes ini mengunci
// pemanasan yang memindahkan pekerjaan itu ke balik cincin memuat dan ke waktu senggang.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const adegan = baca("components/imersif/adegan.js");
const panggung = baca("components/imersif/Panggung.jsx");

test("rak baru dibuat saat dekat layar, dan cincin memuat tetap tampil sampai pemanasan selesai", () => {
  // Sepuluh layar di depan dan menunggu senggang: dibuat saat pengunjung membaca babak akhir cerita,
  // bukan saat kamera dunia terbang ke rak (tugas panjang 66 sampai 198 ms di penerbangan itu).
  assert.match(panggung, /new IntersectionObserver\([\s\S]*rootMargin: "1000% 0px"/);
  assert.match(panggung, /Promise\.all\(\[dekat, document\.fonts\.ready\]\)\.then\(async \(\) => \{[\s\S]{0,140}await new Promise\(\(ok\) => \("requestIdleCallback" in window/);
  const tunggu = panggung.indexOf("await a.siapkan()");
  assert.ok(tunggu > 0, "Panggung tidak menunggu siapkan()");
  assert.ok(panggung.indexOf("setSiap(true)", tunggu) > tunggu, "setSiap(true) sebelum pemanasan selesai");
});

test("bingkai tidak menggambar apa pun sebelum rak hangat", () => {
  const awal = adegan.slice(adegan.indexOf("const bingkai = (now) => {"));
  assert.match(awal.slice(0, 600), /if \(!hangat\) \{\s*lalu = now;\s*return;\s*\}/);
  assert.match(adegan, /hangat = true;/);
});

test("pemanasan: shader dikompilasi paralel, tekstur diunggah per bingkai, lalu satu gambar latihan", () => {
  const siapkan = adegan.slice(adegan.indexOf("const siapkan = async () => {"));
  const isi = siapkan.slice(0, siapkan.indexOf("hangat = true;"));
  assert.match(isi, /await renderer\.compileAsync\(scene, camera\)/);
  assert.match(isi, /renderer\.initTexture\(t\);\s*await bingkaiBerikut\(\);/);
  assert.match(isi, /renderLatihan\(scene\)/);
});

test("gambar latihan ke kanvas sendiri lewat scissor, bukan ke render target", () => {
  const latihan = adegan.slice(adegan.indexOf("const renderLatihan = (akar) => {"));
  const isi = latihan.slice(0, latihan.indexOf("};"));
  // Render target mematikan tone mapping dan ruang warna layar: shadernya versi lain (2,4 s).
  assert.doesNotMatch(isi, /setRenderTarget|WebGLRenderTarget/);
  assert.match(isi, /setScissorTest\(true\)[\s\S]*setScissor\(0, 0, 1, 1\)[\s\S]*setScissorTest\(false\)/);
  // Benda tersembunyi dan di luar pandangan ikut, lalu keadaannya dipulihkan.
  assert.match(isi, /o\.visible = true;\s*o\.frustumCulled = false;/);
  assert.match(isi, /o\.visible = v;\s*o\.frustumCulled = f;/);
});

test("buklet album di tengah disiapkan saat senggang dan dipakai ulang saat dibuka", () => {
  assert.match(adegan, /window\.requestIdleCallback/);
  assert.match(adegan, /if \(perluBuklet && !k_\.buklet\) k_\.buklet = pakaiBuklet\(aktifK\.p\);/);
  assert.match(adegan, /if \(!k_\.buklet\) k_\.buklet = pakaiBuklet\(p\);/);
  assert.doesNotMatch(adegan, /k_\.buklet = buatBuklet\(/);
  // Dikompilasi sebagai bagian scene (kunci shader ikut lampu dan bayangan), termasuk lantai
  // bayangan yang baru tampil saat dibaca.
  const siap = adegan.slice(adegan.indexOf("const siapkanBuklet = (p) => {"));
  assert.match(siap.slice(0, 2500), /scene\.add\(ini\.b\);\s*const kompilasi = renderer\.compileAsync\(scene, camera\)/);
  assert.match(siap.slice(0, 2500), /renderLatihan\(ini\.b\)/);
});

test("halaman teks buklet 1536 px, bukan 2048", () => {
  assert.match(adegan, /export const UKURAN_HALAMAN = 1536;/);
  assert.doesNotMatch(adegan, /gambarHalaman\([^)]*\}, 2048\)/);
});

test("buklet pertama dipanaskan bersama rak, bukan 1,5 s setelah rak dilihat", () => {
  // Trace 13 Nov 2026: GetProgramiv 524 ms saat buklet pertama dikompilasi di depan pengunjung.
  const siapkan = adegan.slice(adegan.indexOf("const siapkan = async"), adegan.indexOf("hangat = true;", adegan.indexOf("const siapkan = async")));
  assert.match(siapkan, /const bAwal = awal \? buatBuklet\(awal\) : null;\s*if \(bAwal\) scene\.add\(bAwal\);/);
  assert.match(siapkan, /cadangan = \{ slug: awal\.slug, b: bAwal \};/);
});

test("kanvas yang dibaca pikselnya tinggal di CPU, tanpa membaca kanvas halaman di GPU", () => {
  // Trace 13 Nov 2026: getImageData pada kanvas 2D di GPU menunggu 143 ms piksel dikirim balik.
  const gambar = baca("components/imersif/gambar.js");
  assert.match(gambar, /c\.getContext\("2d", baca \? \{ willReadFrequently: true \} : undefined\)/);
  // Setiap getImageData memakai kanvas yang dibuat dengan baca = true.
  const buat = [...gambar.matchAll(/const \[[^\]]*\] = kanvas\(([^)]*)\);[\s\S]{0,160}?getImageData/g)].map((m) => m[1]);
  assert.ok(buat.length >= 4, `pemakaian getImageData terhitung ${buat.length}`);
  for (const arg of buat) assert.match(arg, /, true$/, `kanvas(${arg}) dibaca tanpa willReadFrequently`);
  assert.doesNotMatch(gambar, /terangArea\(g,/);
});
