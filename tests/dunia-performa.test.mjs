// Dunia toko kaset tidak boleh membekukan loader atau perpindahan kamera. Terukur di RX 6700 XT
// (Chrome headless GPU, scripts/ukur-dunia.mjs, 12 Nov 2026): peta lingkungan PMREM 462 ms,
// kaca transmission lampu CC0 293 ms, draw pertama sekaligus 386 ms, dan buklet rak 370 ms saat
// kamera masih terbang ke anchor rak. Tes ini mengunci perbaikannya, termasuk props cerita v4
// yang dimuat sesudah hero.
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
  const latih = dunia.slice(dunia.indexOf("const latih = (kelompok) => {"));
  assert.match(latih.slice(0, 900), /target\.scissor\.set\(0, 0, 1, 1\);\s*target\.scissorTest = true;/);
  // Benda di luar pandangan dan yang tersembunyi ikut tergambar, lalu keadaannya dipulihkan.
  // Tanpa ini program benda jauh baru diselesaikan ANGLE saat pertama terlihat (778 ms di dekat rak).
  assert.match(latih.slice(0, 900), /o\.visible = true;\s*o\.frustumCulled = false;/);
  assert.match(latih.slice(0, 900), /o\.visible = v;\s*o\.frustumCulled = f;/);
  const siapkan = dunia.slice(dunia.indexOf("const siapkan = async"));
  assert.match(siapkan, /scene\.traverse\(\(o\) => o\.isMesh && benda\.push\(o\)\);/);
  assert.match(siapkan, /for \(let i = 0; i < benda\.length; i \+= 3\) \{\s*latih\(benda\.slice\(i, i \+ 3\)\);[\s\S]*?await bingkaiBerikut\(\);/);
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

test("props cerita dimuat sesudah hero, dipanaskan dicicil, tanpa lampu baru", () => {
  // Props dibuat di muatCerita, bukan di buatDunia: loader tidak menunggu aset sepuluh babak.
  const pembuat = kode.slice(0, kode.indexOf("const muatCerita = async"));
  assert.doesNotMatch(pembuat, /buatPropsCerita\(/);
  const muat = kode.slice(kode.indexOf("const muatCerita = async"), kode.indexOf("// Pemanasan sebelum gambar pertama"));
  assert.match(muat, /compileAsync\(calon\.grup, camera, scene\)/);
  assert.match(muat, /renderer\.initTexture\(t\);\s*await bingkaiBerikut\(\);/);
  assert.match(muat, /latih\(benda\.slice\(i, i \+ 3\)\);\s*await bingkaiBerikut\(\);/);
  // Lampu baru di tengah jalan memaksa semua shader dikompilasi ulang: props tidak membuat lampu.
  const props = baca("components/dunia/props.js").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(props, /new THREE\.(Point|Spot|Directional|Hemisphere)Light/);
  // Dunia.jsx memanggilnya saat peramban senggang, sesudah dunia siap.
  const komponen = baca("components/dunia/Dunia.jsx");
  const siap = komponen.indexOf("keadaan.siap = true;");
  const panggil = komponen.indexOf("requestIdleCallback(muatCerita");
  assert.ok(siap > 0 && panggil > siap, "muatCerita tidak menunggu dunia siap");
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
