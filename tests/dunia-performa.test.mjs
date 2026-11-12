// Dunia toko kaset tidak boleh membekukan loader atau perpindahan kamera. Terukur di RX 6700 XT
// (Chrome headless GPU, scripts/ukur-dunia.mjs, 12 Nov 2026): peta lingkungan PMREM 462 ms,
// kaca transmission lampu CC0 293 ms, draw pertama sekaligus 386 ms, panggung cerita tanpa
// pemanasan 550 ms tepat saat kamera terbang ke dinding, dan buklet rak 370 ms saat kamera
// masih terbang ke anchor rak. Tes ini mengunci perbaikannya.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const dunia = baca("components/dunia/dunia.js");
const kode = dunia.replace(/\/\/.*$/gm, "");

test("tanpa PMREM: tidak ada peta lingkungan yang dikompilasi sinkron", () => {
  assert.doesNotMatch(kode, /PMREMGenerator|RoomEnvironment|scene\.environment\s*=/);
});

test("kaca transmission dari model CC0 diganti kaca transparan biasa", () => {
  assert.match(dunia, /m\?\.transmission > 0\) \{\s*m\.transmission = 0;/);
});

test("gambar latihan dicicil per kelompok benda, satu kelompok per bingkai, ke 1 piksel", () => {
  const siapkan = dunia.slice(dunia.indexOf("const siapkan = async"));
  assert.match(siapkan, /target\.scissor\.set\(0, 0, 1, 1\);\s*target\.scissorTest = true;/);
  assert.match(siapkan, /for \(let i = 0; i < benda\.length; i \+= 3\)[\s\S]*?await bingkaiBerikut\(\);/);
  // compileAsync memakai render target yang sama dengan gambar sesungguhnya: tone mapping dan
  // ruang warna adalah bagian dari kunci program.
  assert.match(siapkan, /setRenderTarget\(target\);\s*try \{\s*await renderer\.compileAsync\(scene, camera\);/);
});

test("dunia digambar hanya saat ada yang berubah", () => {
  assert.match(dunia, /if \(!bergerak && !kotor\) return;/);
  assert.match(dunia, /if \(!hangat \|\| !terlihat\) return;/);
});

test("penjaga kualitas mengabaikan tugas panjang di luar dunia", () => {
  assert.match(dunia, /if \(dt > 100\) return;/);
  assert.match(dunia, /buruk >= 2/);
});

test("panggung cerita dipanaskan saat dibuat, sebelum terlihat", () => {
  const cerita = baca("components/cerita/dunia.js");
  assert.match(cerita, /function panaskan\(\)[\s\S]*compileAsync\(scene, kamera\)[\s\S]*initTexture/);
  assert.match(baca("components/cerita/PanggungCerita.jsx"), /dunia\.panaskan\(\);/);
});

test("buklet rak baru disiapkan setelah kamera dunia mendarat (>= 1,5 s diam)", () => {
  const adegan = baca("components/imersif/adegan.js");
  const m = adegan.match(/k_\.diam > ([\d.]+) \?/);
  assert.ok(m, "ambang diam rak tidak ditemukan");
  assert.ok(Number(m[1]) >= 1.5, `ambang ${m[1]} s`);
});

test("aset dunia kecil: tekstur 512 px untuk perabot, meshopt untuk model", () => {
  assert.match(dunia, /setMeshoptDecoder\(MeshoptDecoder\)/);
  const prov = baca("public/assets/dunia/PROVENANCE.md");
  assert.match(prov, /512/);
  assert.match(prov, /CC0/);
});
