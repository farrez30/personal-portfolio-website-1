// Audit ulang dunia toko kaset, 19 Nov 2026 (temuan Farrez gambar 1, 7, 8, 9: cincin hitam
// putus-putus di lantai). Sumber terbukti dengan bingkai yang dibekukan lewat ?uji-dunia:
// cincin hilang hanya saat grup nyala lampu disembunyikan, bukan saat bayangan dimatikan.
// pow() GLSL dengan basis negatif tidak terdefinisi (ANGLE D3D11: exp2(y * log2(x)) = NaN), dan
// NaN yang dijumlahkan additive tampil sebagai piksel hitam.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const tanpaKomentar = (s) => s.replace(/\/\/.*$/gm, "");

// Ambil argumen pertama pow(...) dengan menghitung kurung.
function argPertama(s, i) {
  let d = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "(") d++;
    else if (s[j] === ")") d--;
    else if (s[j] === "," && d === 0) return s.slice(i, j).trim();
  }
  return "";
}

const berkas = ["components/dunia", "components/imersif"].flatMap((d) => readdirSync(new URL(d, akar)).filter((f) => f.endsWith(".js")).map((f) => `${d}/${f}`));

test("setiap pow() di shader memakai basis yang pasti tidak negatif", () => {
  for (const p of berkas) {
    const s = tanpaKomentar(baca(p));
    for (const m of s.matchAll(/(?<![.\w])pow\(/g)) {
      const a = argPertama(s, m.index + 4);
      const aman =
        /^(abs|max|clamp)\(/.test(a) ||
        /^\d+(\.\d+)?$/.test(a) ||
        // Variabel yang dihitung lewat clamp/max/abs di berkas yang sama.
        (/^\w+$/.test(a) && new RegExp(`float ${a} = (abs|max|clamp)\\(`).test(s));
      assert.ok(aman, `${p}: pow(${a}, ...) bisa menerima basis negatif`);
    }
  }
});

test("kerucut berkas lampu mengikuti anchor tujuan, juga selama terbang", () => {
  const s = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(s, /nyala\.kerucut\(!a\.cerita\);/);
  assert.doesNotMatch(s, /nyala\.kerucut\(true\)/, "kerucut dinyalakan paksa di tengah perpindahan babak");
});

// Butir 8: stempel glitch saat gulir mundur. Rekaman sapuan mundur 19 Nov memperlihatkan cap
// terhapus saat stempel menempel lagi dan fase terlompati oleh langkah gulir besar.
test("stempel: dipicu sekali, dimainkan menurut waktu, gulir mundur tidak menghapus cap", async () => {
  const { pemicuSekali } = await import("../components/dunia/naskah.js");
  const p = pemicuSekali({ ambang: 0.3, ulang: 0.12, akhir: 0.75, durasi: 2 });
  assert.equal(p.langkah(0.1, 0), 0);
  assert.equal(p.langkah(0.31, 10), 0, "baru mulai saat melewati ambang");
  assert.ok(p.sibuk());
  // Gulir melompat jauh tidak melompati fase: progres hanya menurut waktu.
  assert.equal(p.langkah(0.7, 11), 0.5);
  // Gulir mundur di tengah gerak tidak membalik gerak.
  assert.equal(p.langkah(0.2, 11.5), 0.75);
  assert.equal(p.langkah(0.2, 12.1), 1);
  assert.ok(!p.sibuk());
  // Sudah dicap: mundur sampai 0,15 tetap tercap.
  assert.equal(p.langkah(0.15, 13), 1);
  // Digulir mundur sampai awal babak dengan kamera diam: cap tidak hilang di depan mata.
  assert.equal(p.langkah(0.05, 13.5), 1);
  // Kamera masuk lagi dari babak sebelumnya: disetel ulang, dan bisa mengecap lagi.
  assert.equal(p.langkah(0.05, 14, false, true), 0);
  assert.equal(p.langkah(0.4, 15), 0);
  assert.ok(p.sibuk());
});

test("stempel: masuk dari belakang atau gerak dikurangi langsung tercap", async () => {
  const { pemicuSekali } = await import("../components/dunia/naskah.js");
  const dariBelakang = pemicuSekali();
  assert.equal(dariBelakang.langkah(0.95, 0), 1);
  assert.ok(!dariBelakang.sibuk());
  const diam = pemicuSekali();
  assert.equal(diam.langkah(0.4, 0, true), 1);
});

test("props babak tujuan dipasang selama kamera terbang, dengan progres babak yang dimulai ulang", () => {
  const s = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(s, /if \(i !== indeks\) uBabak = null;/);
  assert.match(s, /terbang: !!blend/);
  assert.match(s, /if \(a\.cerita && blend && props\) props\.perbarui\(a\.id, uBabak/);
  // Props tidak lagi membaca geser kamera (yang meluncur dari ujung babak sebelumnya).
  assert.doesNotMatch(s, /const u = geser \+ 0\.5;/);
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  assert.match(p, /momen\.rencana = \(u, s = \{\}\) => poseStempel\(cap0\.langkah\(u, s\.waktu \?\? 0, s\.diam, s\.terbang\)\);/);
});

// Butir 10: di HP rak koleksi naik dari bawah, padahal adegan 10 menerbangkan CD ke kiri.
test("rak koleksi masuk dari kanan, ditahan di bawah bilah atas, tanpa melebarkan halaman", () => {
  const css = baca("components/imersif/panggung.css");
  const blok = css.slice(css.indexOf("@supports (animation-timeline: view())"), css.indexOf("@keyframes rak-masuk"));
  assert.match(blok, /prefers-reduced-motion: no-preference/);
  assert.match(blok, /view-timeline: --rak-masuk block;/);
  // Inset sama dengan top sticky panggung.
  const top = css.match(/\.panggung \{[^}]*?top: (\d+)px;/)[1];
  assert.match(blok, new RegExp(`view-timeline-inset: ${top}px 0px;`));
  assert.match(blok, /overflow-x: clip;/, "tanpa clip, HP memperkecil zoom halaman");
  assert.match(blok, /animation-range: entry 0% entry 100%;/);
  assert.match(css, new RegExp(String.raw`@keyframes rak-masuk \{\s*from \{\s*transform: translate3d\(100%, calc\(${top}px - 100dvh\), 0\);`));
});

// Butir 2: elips dan kolam sorot additive di bab bentuk terbaca sebagai benda terpisah dan
// terpotong balok rak. Diganti lampu kunci sungguhan yang pindah ke atas depan benda terangkat.
test("sorot bab bentuk memakai lampu kunci, bukan bidang additive", () => {
  const mentah = baca("components/dunia/props.js");
  const p = tanpaKomentar(mentah);
  const bentuk = tanpaKomentar(mentah.slice(mentah.indexOf("// ---- 03 bentuk"), mentah.indexOf("// ---- 04 fondasi")));
  assert.doesNotMatch(bentuk, /AdditiveBlending/);
  assert.doesNotMatch(p, /teksturSorot/);
  assert.match(bentuk, /sorot\.bentuk = \(\) =>/);
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(d, /const sasaran = props\.sorot\(a\.id\);\s*sorotKunci\(sasaran\);/);
  // Highlight = outline, bukan cahaya (masukan Farrez 19 Nov): lampu kunci hanya pindah posisi
  // untuk bayangan, sudut dan kekuatannya biasa.
  assert.match(d, /sudut: SUDUT_KUNCI, kuat: 1 \};/);
  assert.match(d, /kunciLampu\.angle = kunciKini\.sudut;/);
  // Jumlah lampu tidak bertambah (lampu baru mengompilasi ulang semua shader).
  assert.equal((d.match(/new THREE\.SpotLight\(/g) ?? []).length, 2);
});

// Butir 4: kaca vitrin terbaca seperti jeli, dimensinya tidak terbaca; kaca pintu memudarkan jalan.
test("kaca: muka hampir tak terlihat, tepi panel hijau, vitrin dari panel tipis", () => {
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  const kaca = d.slice(d.indexOf("function bahanKaca()"), d.indexOf("function bahanTepiKaca()"));
  const [, batas] = kaca.match(/diffuseColor\.a = clamp\(diffuseColor\.a \+ frKaca \* [^;]*, 0\.0, ([\d.]+)\);/);
  assert.ok(Number(batas) <= 0.25, `penutupan kaca maksimum ${batas}, kotak terbaca terisi`);
  assert.match(kaca, /opacity: 0\.04/);
  assert.match(d, /tepiKaca: bahanTepiKaca\(\),/);
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  assert.doesNotMatch(p, /kotak\(W, H, D, bahan\.kaca/, "vitrin masih satu kotak kaca pejal");
  assert.match(p, /const TEBAL = 0\.005;/);
  // Panel lebar mendapat muka kaca, sisi tipisnya tepi hijau.
  assert.match(p, /\[tepi, tepi, tepi, tepi, muka, muka\]/);
});

// Butir 2 (koreksi Farrez): benda terangkat ditandai outline menyala mengikuti siluetnya.
test("outline benda terangkat: topeng siluet di lapis sendiri, tepi dilasi di lintasan layar", () => {
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(d, /pasangGaris\(sasaran\);/);
  // Topeng digambar sesudah adegan utama dan AO, dengan bahan putih dan hanya lapis garis.
  assert.match(d, /if \(aoAktif\) ao\.render\(renderer, hasilAO\);\s*blur\.uniforms\.uGarisKuat\.value = garisKuat;\s*if \(garisKuat > 0\.001\) gambarTopeng\(\);/);
  assert.match(d, /scene\.overrideMaterial = bahanTopeng;\s*camera\.layers\.set\(LAPIS_GARIS\);/);
  assert.match(d, /camera\.layers\.mask = lapis;\s*scene\.overrideMaterial = null;/);
  assert.match(d, /tepiGaris = \(clamp\(luar - isi, 0\.0, 1\.0\)/);
  // Dicampur sesudah tone mapping supaya warnanya tetap jingga.
  assert.match(d, /g = mix\(g, uGarisWarna, clamp\(tepiGaris, 0\.0, 1\.0\) \* 0\.9\);/);
  // Dilepas selama terbang.
  assert.match(d, /pasangGaris\(null\);/);
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  assert.match(p, /benda: benda\.filter\(\(x\) => x\.t > 0\.001\)\.map\(\(x\) => x\.o\)/);
});

// Butir 3: benda bab bentuk berukuran nyata; brosur dan kotak software dibuat ulang.
test("bab bentuk: brosur leaflet DL bertumpuk, kotak software dengan punggung, tingkat atas 14 cm", () => {
  const mentah = baca("components/dunia/props.js");
  const blok = tanpaKomentar(mentah.slice(mentah.indexOf("// ---- 03 bentuk"), mentah.indexOf("// ---- 04 fondasi")));
  assert.match(blok, /kotak\(1\.2, 0\.3, 0\.14, b\.kayu, 0, 1\.01, -0\.15, g, 0\.01\);/);
  assert.match(blok, /kotak\(0\.099, 0\.21, 0\.0009, b\.kertas/);
  assert.match(blok, /const \[sampul, punggung\] = teksturKotakAplikasi\(\);/);
  assert.match(blok, /new THREE\.BoxGeometry\(0\.178, 0\.229, 0\.051\)/);
  assert.match(blok, /persegiBulat\(0\.0774, 0\.1611/);
  // Laptop terbuka tidak menembus balok tingkat atas: tepi atas tutup di depan muka balok (z -0,08).
  const zLaptop = Number(blok.match(/pasangBenda\(o, -0\.1, ([\d.]+)\);/)[1]);
  const D = 0.214;
  const engsel = zLaptop - D / 2 + 0.004;
  assert.ok(engsel - D * Math.sin(0.2) > -0.08, "tutup laptop menembus balok tingkat atas");
});

// Butir 6: kabel semrawut yang seiring gulir dirapikan dan menyatu ke panel MCB berlabel.
test("fondasi: kabel dipadukan dari kusut ke rapi lewat satu uniform, juga bayangannya", () => {
  const mentah = baca("components/dunia/props.js");
  const blok = tanpaKomentar(mentah.slice(mentah.indexOf("// ---- 04 fondasi"), mentah.indexOf("// ---- Gondola tengah")));
  assert.doesNotMatch(blok, /power_box_01/, "kotak listrik CC0 lama masih dipakai");
  assert.match(blok, /geo\.setAttribute\("posRapi", geoRapi\.attributes\.position\);/);
  assert.match(blok, /o\.customDepthMaterial = bahanKabelBayang\(THREE\.MeshDepthMaterial/);
  assert.match(blok, /o\.customDistanceMaterial = bahanKabelBayang\(THREE\.MeshDistanceMaterial/);
  assert.match(blok, /rapi\.value = halus\(\(u - 0\.12\) \/ 0\.45\);/);
  // Jalur kusut dan rapi harus berjumlah titik sama: dua TubeGeometry dengan segmen sama.
  assert.match(blok, /new THREE\.TubeGeometry\(jalurRapi, SEG, r, 6\);\s*const geo = new THREE\.TubeGeometry\(jalurKusut, SEG, r, 6\);/);
  assert.match(blok, /teksturCatatanTangan\("DAFTAR SIRKUIT"/);
  assert.match(tanpaKomentar(mentah), /mix\(vec3\(position\), posRapi, uRapi\)/);
});

test("mug keramik menggantikan silinder kopi; lonceng ulir, lampu kaca susu, jalan ruko berlapis", () => {
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  const kopi = p.slice(p.indexOf("const gelasKopi = (x, y, z, induk) =>"), p.indexOf("const gelasKopi = (x, y, z, induk) =>") + 600);
  assert.match(kopi, /new THREE\.Mesh\(geoMug, glasir\)/);
  assert.match(kopi, /new THREE\.Mesh\(geoGagang, glasir\)/);
  assert.doesNotMatch(p, /tabung\(0\.034, 0\.09, b\.keramik/);
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  // Pegas ulir lurus: tidak ada lengkung turun di titik pegas, panjang 19 cm ke dalam ruangan.
  assert.match(d, /titikPegas\.push\(new THREE\.Vector3\(Math\.sin\(sudut\) \* 0\.009, Math\.cos\(sudut\) \* 0\.009, -0\.006 - t \* 0\.19\)\);/);
  assert.doesNotMatch(d, /titikPegas\.push\(new THREE\.Vector3\(0, -0\.11/);
  assert.doesNotMatch(d, /nyala\.tambahBola\(lampuPintu\)/);
  assert.match(d, /new THREE\.SphereGeometry\(0\.09, 32, 24\)/);
  assert.match(d, /const jalan = \{ gelap: buatJalan\(false\), terang: buatJalan\(true\) \};/);
  assert.doesNotMatch(d, /teksturJalan/);
  // Lapisan jalan tidak berkabut dan bidang tegaknya menghadap ke dalam toko.
  assert.match(d, /new THREE\.MeshBasicMaterial\(\{ map, fog: false, transparent: true, \.\.\.o \}\)/);
  assert.match(d, /for \(const m of \[l1, l2, l4, l5\]\) m\.rotation\.y = Math\.PI;/);
});

// Butir 12 (pilihan Farrez, opsi C): baris judul berputar masuk, nomor seperti penghitung pita.
test("teks bab: baris judul berputar dari sumbu bawah, nomor teracak tetap terbaca pembaca layar", () => {
  const c = tanpaKomentar(baca("components/cerita/CeritaKerja.jsx"));
  assert.match(c, /SplitText\.create\(judul, \{ type: "lines", aria: "auto" \}\)/);
  assert.match(c, /rotateX: -88,\s*opacity: 0,\s*transformOrigin: "50% 100% -20px"/);
  // Hanya angka aria-hidden yang diacak; kalimat sr-only untuk pembaca layar tidak disentuh.
  assert.match(c, /bab\.querySelector\("\.bab__nomor \[aria-hidden='true'\]"\)/);
  assert.doesNotMatch(c, /salinan/);
  // Gerak dikurangi: tanpa animasi sama sekali.
  assert.match(c, /if \(!el \|\| matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches\) return;\s*gsap\.registerPlugin\(ScrollTrigger, SplitText\);\s*const pulih = \[\];/);
  // Angka acak hanya dari progres (gulir mundur memberi urutan sama), bukan Math.random.
  const pita = c.slice(c.indexOf("const pita = { t: 0 };"), c.indexOf("const isi = bab.querySelector"));
  assert.doesNotMatch(pita, /Math\.random/);
});

// Butir 11 (pilihan Farrez, opsi A): petunjuk geser di HP.
test("HP: rak koleksi tanpa panah teks, petunjuk gulir; klien menyenggol sekali dengan chip dan titik", () => {
  const p = tanpaKomentar(baca("components/imersif/Panggung.jsx"));
  assert.doesNotMatch(p, />\s*[←→]\s*</, "panah sebagai teks");
  assert.match(p, /tr\("petunjukGulir"\)/);
  const css = baca("components/imersif/panggung.css");
  assert.match(css, /@media \(max-width: 650px\) \{[\s\S]*?\.panggung__panah \{\s*display: none;/);
  const k = tanpaKomentar(baca("components/klien/Klien.jsx"));
  assert.match(k, /t\("petunjukGeser"\)/);
  assert.match(k, /if \(!sentuh\) return;/);
  assert.match(k, /if \(!tenang\) el\.animate\(/);
  assert.doesNotMatch(k, /scrollBy\(/, "senggolan scrollBy melawan scroll-snap");
  for (const lang of ["id", "en"]) {
    const m = JSON.parse(baca(`messages/${lang}.json`));
    assert.ok(m.rak.petunjukGulir && m.klien.petunjukGeser, lang);
  }
});

// Pangkas kerja tiap bingkai gulir (pengukuran HP 19 Nov): DOM nomor hanya saat berganti, kabel
// fondasi tetap disaring frustum dengan batas gabungan kedua jalurnya.
test("gulir: nomor babak ditulis saat berganti saja, kabel punya batas gabungan", () => {
  const c = tanpaKomentar(baca("components/cerita/CeritaKerja.jsx"));
  assert.match(c, /if \(nomor\.textContent !== isi\) nomor\.textContent = isi;/);
  const p = tanpaKomentar(baca("components/dunia/props.js"));
  assert.doesNotMatch(p, /o\.frustumCulled = false;\s*g\.add\(o\);/);
  assert.match(p, /\.union\(new THREE\.Box3\(\)\.setFromBufferAttribute\(geoRapi\.attributes\.position\)\)/);
});

// Butir 13: bola nyala lampu gantung menonjol 3,4 cm di bawah kap kaca model (terbukti dari
// batas mesh kaca y 2,243..2,453 lawan bola di 2,244 berjari-jari 3,5 cm).
test("bola nyala lampu gantung ada di dalam kap kaca", () => {
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  const [, naik] = d.match(/b\.position\.set\(x, y \+ ([\d.]+), z\);/);
  const SKALA = 0.72;
  const bawahKaca = 3.2 - 1.3 * SKALA - 0.021; // tepi bawah kaca model, terukur 2,243
  const pusat = 3.2 - 1.3 * SKALA + Number(naik);
  assert.ok(pusat - 0.035 >= bawahKaca, `bola menonjol ${(bawahKaca - (pusat - 0.035)).toFixed(3)} m di bawah kaca`);
});

// Butir 17: kaset model CC0 duduk di luar badan pemutar; dimasukkan ke dalam badannya.
test("kaset dimasukkan ke dalam badan pemutar saat model dimuat", () => {
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(d, /masukkanKaset\(kaset\);/);
  assert.match(d, /if \(minX\.get\(cari\(akar\[i\]\)\) >= 0\.25\) pos\.setXYZ\(i, pos\.getX\(i\) - 0\.899/);
});

// Butir 14: lonceng pintu bisa diketuk, berbunyi, berayun; gerak dikurangi hanya bunyi.
test("lonceng pintu bisa diketuk: tombol berlabel minimal 44 px, bunyi, ayunan dari ketukan", () => {
  const j = baca("components/dunia/Dunia.jsx");
  assert.match(j, /aria-label=\{t\("lonceng"\)\}/);
  assert.match(j, /duniaRef\.current\?\.ketukLonceng\(\);\s*suara\(\)\?\.mainkan\("lonceng"\);/);
  // Tidak merebut ketukan dari tautan atau kolom isian di bawahnya (HP: baris WhatsApp).
  assert.match(j, /const lonceng = posLonceng \? muatLonceng\(posLonceng\) : null;/);
  assert.match(j, /u = Math.max\(44, u - 6\)/);
  const d = tanpaKomentar(baca("components/dunia/dunia.js"));
  assert.match(d, /ukuran: Math\.round\(Math\.max\(44, r \* 1\.6\)\)/);
  assert.match(d, /ketukLonceng\(\) \{\s*if \(kurangiGerak\) return;/);
  assert.match(d, /ampAyun = Math\.min\(0\.34, sisa \+ 0\.14\);/);
  assert.match(d, /laporLonceng\(a\.id === "pintu" && !blend\);/);
  for (const lang of ["id", "en"]) assert.ok(JSON.parse(baca(`messages/${lang}.json`)).dunia.lonceng, lang);
});
