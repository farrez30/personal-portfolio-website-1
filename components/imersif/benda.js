// Benda 3D: kotak CD, cakram, pemutar top-loader, proyektor, dan lingkungan
// pantulnya. Satu unit = 100 mm. Ditulis sendiri; teknik material dipelajari
// dari catatan desain Discography (pita softbox, plastik yang terlihat lewat
// pantulan, difraksi sisi data cakram) dan rumus spektrum Zucconi.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { gambarSampul, gambarCakram, gambarSisipan, gambarHalaman, gambarAus } from "./gambar";
import { petaCetak, petaBintik, petaPiring, geserJudul } from "./prosedural";

const mm = (x) => x / 100;

export const KOTAK = { w: mm(142), h: mm(125), d: mm(10.4) };
// Proporsi cakram asli (pecahan jari-jari): lubang 0,127, hub bening 0,31, pita cermin
// 0,345, cetak 0,978, lalu hampir hitam sampai 0,995 (tanpa bibir).
export const CAKRAM = { r: mm(60), lubang: mm(7.6), hub: mm(18.6), cermin: mm(20.7), cetak: mm(58.7), tepi: mm(59.7) };
export const BUKLET = mm(120);
export const PEMUTAR = { sisi: mm(146), tinggi: mm(18), sumur: mm(62) };

export function tekstur(canvas, renderer) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

// --- lingkungan ------------------------------------------------------------
// Studio gelap dengan empat pita putih lembut: plastik dan logam baru terlihat
// "nyata" karena memantulkan pita-pita ini, bukan karena warnanya sendiri.
export function buatLingkungan(renderer) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const latar = g.createLinearGradient(0, 0, 0, 512);
  latar.addColorStop(0, "#25282f");
  latar.addColorStop(0.5, "#0e0f13");
  latar.addColorStop(1, "#020203");
  g.fillStyle = latar;
  g.fillRect(0, 0, 1024, 512);
  for (const [y, t, kuat] of [[0.14, 0.07, 1], [0.4, 0.049, 0.6], [0.26, 0.077, 0.85], [0.62, 0.035, 0.35]]) {
    const pita = g.createLinearGradient(0, (y - t) * 512, 0, (y + t) * 512);
    pita.addColorStop(0, "rgba(255,255,255,0)");
    pita.addColorStop(0.5, `rgba(255,255,255,${kuat})`);
    pita.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = pita;
    g.fillRect(0, (y - t) * 512, 1024, 2 * t * 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(t).texture;
  t.dispose();
  pmrem.dispose();
  return env;
}

// --- pita softbox ----------------------------------------------------------
// Satu pantulan panjang tanpa ujung, sama untuk semua bagian mengilap.
// Bidang pita memuat sumbu X dunia dan arah (0, 0.75, 0.66); pita = exp(-(asin(r·n)/0.1)^2).
const NORMAL_PITA = new THREE.Vector3(1, 0, 0).cross(new THREE.Vector3(0, 0.75, 0.66)).normalize();
const vek = (v) => `vec3(${v.toArray().map((x) => x.toFixed(4)).join(", ")})`;

// Membuang sorotan langsung lalu menyisakan `pita` (0 sampai 1) untuk dipakai pemanggil.
const GLSL_PITA = `
        #ifdef USE_CLEARCOAT
        outgoingLight -= reflectedLight.directSpecular * (1.0 - material.clearcoat * Fcc) + clearcoatSpecularDirect * material.clearcoat;
        #else
        outgoingLight -= reflectedLight.directSpecular;
        #endif
        // Membuang sorotan langsung bisa di bawah nol di sudut miring (bintik hitam).
        outgoingLight = max(outgoingLight, vec3(0.0));
        vec3 bidangPita = normalize((viewMatrix * vec4(${vek(NORMAL_PITA)}, 0.0)).xyz);
        float sp = asin(clamp(dot(reflect(-geometryViewDir, normal), bidangPita), -1.0, 1.0)) / 0.1;
        float pita = exp(-sp * sp);`;

// `redup`: objek { value } yang boleh dibagi beberapa bahan, supaya satu setRedup
// meredupkan semuanya. `cincin`: [jari, lebar, tambahan alfa] cincin cetakan samar,
// diukur dari posisi xz geometri (bubutan).
function pasangSheen(material, { kuat = 0.12, alfa = 0, fresnel = 0, kilau = false, redup = null, cincin = [] } = {}) {
  const f = (x) => x.toFixed(4);
  const alfaCincin = cincin.map(([r, w, a]) => `alfaPlastik += ${f(a)} * exp(-pow((jariPlastik - ${f(r)}) / ${f(w)}, 2.0));`).join("\n");
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uRedup = redup ?? { value: 1 };
    material.userData.shader = sh;
    if (cincin.length) {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vBidang;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBidang = position.xz;");
    }
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uRedup;${cincin.length ? "\nvarying vec2 vBidang;" : ""}`)
      .replace(
        "#include <opaque_fragment>",
        `${GLSL_PITA}
        float fr = pow(1.0 - abs(dot(normal, geometryViewDir)), 3.0);
        // Logam memantulkan dengan warnanya sendiri.
        float sheen = pita * ${f(kuat)};
        outgoingLight += mix(vec3(1.0), diffuseColor.rgb, metalnessFactor) * sheen;
        float kilauLingkungan = ${kilau ? "dot(reflectedLight.indirectSpecular, vec3(0.3333)) + sheen" : "0.0"};
        float alfaPlastik = diffuseColor.a + ${f(alfa)} * pita + ${f(fresnel)} * fr + kilauLingkungan;
        ${cincin.length ? "float jariPlastik = length(vBidang);" : ""}
        ${alfaCincin}
        diffuseColor.a = clamp(alfaPlastik, 0.0, 1.0);
        outgoingLight *= uRedup;
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `sheen-${kuat}-${alfa}-${fresnel}-${kilau}-${JSON.stringify(cincin)}`;
  return material;
}

// --- peta prosedural bersama ---------------------------------------------------
// Dibuat sekali untuk semua cakram dan pemutar, sedikit demi sedikit di waktu senggang
// (peta 1024 px makan ratusan milidetik di ponsel). Sampai selesai, peta berisi nilai
// rata-ratanya, jadi tampilan awal sudah mendekati.
let petaBersama = null;

function jalankanBertahap(gen, selesai) {
  const jadwal = () =>
    typeof requestIdleCallback === "function" ? requestIdleCallback(langkah, { timeout: 400 }) : setTimeout(langkah, 16);
  const langkah = () => {
    const akhir = performance.now() + 8;
    while (performance.now() < akhir) {
      if (gen.next().done) return selesai();
    }
    jadwal();
  };
  jadwal();
}

function petaData(ukuran, isiAwal, anisotropi) {
  const data = new Uint8Array(ukuran * ukuran * 4);
  for (let i = 0; i < data.length; i += 4) data.set(isiAwal, i);
  const t = new THREE.DataTexture(data, ukuran, ukuran);
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = anisotropi;
  t.needsUpdate = true;
  return t;
}

function peta(renderer) {
  if (petaBersama) return petaBersama;
  const an = renderer.capabilities.getMaxAnisotropy();
  const datar = [128, 128, 255, 255];
  const kasarCetak = petaData(1024, [43, 43, 43, 255], an);
  const normalCetak = petaData(1024, datar, an);
  // Bintik nampan dan piringan berbagi data (satu unggahan), ulangannya beda.
  const bintik = petaData(512, datar, an);
  const kasarNampan = petaData(512, [128, 128, 128, 255], an);
  const piring = petaData(256, [219, 219, 219, 255], an);
  piring.colorSpace = THREE.SRGBColorSpace;
  const bintikNampan = bintik.clone();
  for (const t of [bintik, bintikNampan, kasarNampan, piring]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  bintik.repeat.set(14, 14 / 3);
  bintikNampan.repeat.set(3, 3);
  kasarNampan.repeat.set(3, 3);
  piring.repeat.set(4, 1);
  const aus = new THREE.CanvasTexture(gambarAus(512));
  aus.wrapS = aus.wrapT = THREE.RepeatWrapping;
  aus.anisotropy = an;
  petaBersama = { kasarCetak, normalCetak, bintik, bintikNampan, kasarNampan, piring, aus };
  const tandai = (...ts) => () => ts.forEach((t) => (t.needsUpdate = true));
  jalankanBertahap(petaCetak(1024, kasarCetak.image.data, normalCetak.image.data), tandai(kasarCetak, normalCetak));
  jalankanBertahap(petaBintik(512, bintik.image.data, { kasar: kasarNampan.image.data }), tandai(bintik, kasarNampan));
  jalankanBertahap(petaPiring(256, piring.image.data), tandai(piring));
  return petaBersama;
}

// Blur putar untuk cetakan cakram: tanpa ini cetakan berkedip (strobo) di 120 rpm.
// uBlur = sudut yang ditempuh selama eksposur (radian), diisi tiap bingkai oleh adegan.
function blurPutar(material) {
  const asal = material.onBeforeCompile;
  material.onBeforeCompile = (sh, r) => {
    asal(sh, r);
    sh.uniforms.uBlur = { value: 0 };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uBlur;")
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
        vec4 tekstil;
        if (uBlur < 0.002) {
          tekstil = texture2D(map, vMapUv);
        } else {
          vec2 d = vMapUv - 0.5;
          // Geser acak per piksel supaya 24 sampel tidak terlihat sebagai salinan.
          float acak = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          tekstil = vec4(0.0);
          for (int i = 0; i < 24; i++) {
            float a = ((float(i) + acak) / 24.0 - 0.5) * uBlur;
            float c = cos(a), s = sin(a);
            tekstil += texture2D(map, vec2(c * d.x - s * d.y, s * d.x + c * d.y) + 0.5);
          }
          tekstil /= 24.0;
        }
        diffuseColor *= tekstil;
        #endif`,
      );
  };
  const kunci = material.customProgramCacheKey;
  material.customProgramCacheKey = () => `${kunci()}-blur-putar`;
  return material;
}

export function setBlurPutar(material, sudut) {
  const sh = material.userData.shader;
  if (sh?.uniforms.uBlur) sh.uniforms.uBlur.value = sudut;
}

// Peredup untuk cakram di kotak tertutup (tanpa bayangan, jadi diredupkan manual).
export function setRedup(material, nilai) {
  for (const m of [].concat(material)) {
    if (m.userData.shader) m.userData.shader.uniforms.uRedup.value = nilai;
  }
}

// --- geometri dalam milimeter ------------------------------------------------
const kotakMm = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);

// Menandai bagian plastik bening: muka yang memotong lembaran (normalnya melintang
// sumbu tipisnya, 0/1/2 untuk x/y/z) mendapat tepi 1. Tanpa sumbu, tidak ada yang ditandai.
function lembaran(geo, sumbuTipis = -1) {
  const n = geo.attributes.normal;
  const tepi = new Float32Array(n.count);
  if (sumbuTipis >= 0) for (let i = 0; i < n.count; i++) tepi[i] = Math.abs(n.getComponent(i, sumbuTipis)) < 0.5 ? 1 : 0;
  geo.setAttribute("tepiPlastik", new THREE.BufferAttribute(tepi, 1));
  return geo;
}

function gabungMm(bagian) {
  const geo = mergeGeometries(bagian);
  bagian.forEach((b) => b.dispose());
  return geo.scale(mm(1), mm(1), mm(1));
}

// Segi empat datar dari empat sudut (berlawanan jarum jam dilihat dari muka cetaknya) dan UV-nya.
function segiEmpat(sudut, uv) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(sudut.flat(), 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv.flat(), 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  return geo;
}

// Setengah cakram datar, sisi lurusnya di y = 0, menggembung ke -y (arah -1) atau +y (1).
// Diputar, bukan dicerminkan: skala negatif membalik mukanya.
function setengahCakram(r, tebal, arah) {
  const geo = new THREE.CylinderGeometry(r, r, tebal, 24, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2);
  return arah > 0 ? geo.rotateZ(Math.PI) : geo;
}

// Polistiren bening kotak, satu bahan per kotak supaya ausnya beda. Tidak mencerminkan
// lampu langsung, hanya pita softbox; muka potongan sedikit lebih buram (tepiPlastik)
// supaya terbaca sebagai plastik tebal; aus dari peta bersama yang digeser per kotak:
// goresan dan pusaran lap (merah) yang muncul terutama di pita, noda (hijau) yang
// membuat pitanya belang.
function plastikKotak(petaAus, seed) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xb9bcc0,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
    forceSinglePass: true,
    envMapIntensity: 1,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPetaAus = { value: petaAus };
    sh.uniforms.uBenihAus = { value: new THREE.Vector2(seed, (seed * 7.13) % 1) };
    sh.uniforms.uRedup = { value: 1 };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float tepiPlastik;\nvarying float vTepi;\nvarying vec2 vUvKotak;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTepi = tepiPlastik;\nvUvKotak = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D uPetaAus;\nuniform vec2 uBenihAus;\nvarying float vTepi;\nvarying vec2 vUvKotak;",
      )
      .replace(
        "#include <opaque_fragment>",
        `${GLSL_PITA}
        vec2 aus = texture2D(uPetaAus, vUvKotak + uBenihAus).rg;
        float kilap = pita * 0.12 * (1.0 + (aus.g - 0.5) * 0.8);
        float gores = aus.r * 0.32 * (0.01 + pita) * (1.0 - vTepi);
        outgoingLight += vec3(kilap + gores);
        float fr = pow(1.0 - abs(dot(normal, geometryViewDir)), 3.0);
        float kilau = dot(reflectedLight.indirectSpecular, vec3(0.3333));
        diffuseColor.a = clamp(diffuseColor.a + fr * 0.45 + kilau + kilap + gores + vTepi * 0.15, 0.0, 1.0);
        #include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "plastik-kotak";
  return m;
}

// --- cakram -----------------------------------------------------------------
// Benih 0 sampai 1 yang tetap per album (FNV-1a), untuk variasi kecil antar cakram.
function benih(teks) {
  let h = 2166136261;
  for (const ch of String(teks)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

// Sisi data: alur melingkar bekerja sebagai kisi difraksi. Persamaan kisi pada
// (L + V) terhadap arah alur, orde 1 dan 2 saja, dikaburkan dan dipastelkan, dua
// cahaya untuk pola X, di atas perak terang. Spektrum memakai pendekatan enam
// tonjolan dari Alan Zucconi. Pita 0,31 sampai 0,345 adalah cermin polos di bawah
// plastik bening: perak, tanpa pelangi, bercincin halus, sedikit tembus.
// Sengaja tanpa goresan, tanpa sorot tepi, dan tanpa zona luar yang lebih gelap.
function bahanSisiData(redup, seed) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0x83888f,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.2,
    transparent: true,
  });
  const f = (x) => x.toFixed(5);
  const hub = CAKRAM.hub / CAKRAM.r;
  const pita = 0.035;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRedup = redup;
    sh.uniforms.uCahayaA = { value: new THREE.Vector3(-0.3, 0.75, 0.6).normalize() };
    sh.uniforms.uCahayaB = { value: new THREE.Vector3(0.7, -0.2, 0.7).normalize() };
    sh.uniforms.uBenih = { value: seed };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLokal;\nvarying vec3 vDunia;\nvarying vec3 vTangen;\nvarying vec3 vRadial;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vLokal = position;
        vDunia = (modelMatrix * vec4(position, 1.0)).xyz;
        vTangen = (modelMatrix * vec4(-position.y, position.x, 0.0, 0.0)).xyz;
        vRadial = (modelMatrix * vec4(position.xy, 0.0, 0.0)).xyz;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vLokal;
        varying vec3 vDunia;
        varying vec3 vTangen;
        varying vec3 vRadial;
        uniform vec3 uCahayaA;
        uniform vec3 uCahayaB;
        uniform float uRedup;
        uniform float uBenih;
        vec3 tonjol(vec3 x, vec3 geser) { return clamp(vec3(1.0) - x * x - geser, 0.0, 1.0); }
        vec3 spektrum(float w) {
          if (w < 400.0 || w > 700.0) return vec3(0.0);
          float x = (w - 400.0) / 300.0;
          return tonjol(vec3(3.54585104, 2.93225262, 2.41593945) * (x - vec3(0.69549072, 0.49228336, 0.27699880)), vec3(0.02312639, 0.15225084, 0.52607955))
               + tonjol(vec3(3.90307140, 3.21182957, 3.96587128) * (x - vec3(0.11748627, 0.86755042, 0.66077860)), vec3(0.84897130, 0.88445281, 0.73949448));
        }
        // Orde n menampilkan panjang gelombang |(L + V)·T| * 1600 / n, dikaburkan tipis.
        // Suku radial menahan warna di arah yang sejajar cahaya, jadi irisan pelangi
        // berbaris melewati pusat. garis = coretan putih orde nol.
        vec3 kisi(vec3 L, vec3 V, vec3 T, vec3 R, out float garis) {
          vec3 h = L + V;
          float u = abs(dot(h, T));
          float lintang = dot(h, R);
          float fokus = exp(-lintang * lintang * 1.5);
          vec3 c = vec3(0.0);
          for (int n = 1; n <= 2; n++) {
            for (int k = -1; k <= 1; k++) {
              c += spektrum((u + float(k) * 0.03) * 1600.0 / float(n)) / (3.0 * float(n));
            }
          }
          garis = exp(-u * u * 14.0) * fokus;
          return c * fokus;
        }`,
      )
      .replace(
        "#include <opaque_fragment>",
        `
        vec3 T = normalize(vTangen);
        vec3 R = normalize(vRadial);
        vec3 V = normalize(cameraPosition - vDunia);
        float gA; float gB;
        vec3 pelangi = kisi(uCahayaA, V, T, R, gA) + 0.6 * kisi(uCahayaB, V, T, R, gB);
        float garis = gA + 0.6 * gB;
        // Cakram asli melunturkan warnanya dengan perak di sekitarnya.
        pelangi = mix(vec3(dot(pelangi, vec3(0.3333))), pelangi, 0.8);
        float jari = length(vLokal.xy) / ${f(CAKRAM.r)};
        float diPita = smoothstep(${f(hub)}, ${f(hub + 0.004)}, jari) * (1.0 - smoothstep(${f(hub + pita - 0.004)}, ${f(hub + pita)}, jari));
        // Cincin halus memudar saat lebih kecil dari satu piksel, supaya tidak berkelip.
        float faseAlur = jari * 520.0;
        float alur = sin(faseAlur) * clamp(1.0 - fwidth(faseAlur) * 1.5, 0.0, 1.0);
        float faseCetak = jari * 1100.0;
        float cetakan = sin(faseCetak) * clamp(1.0 - fwidth(faseCetak) * 1.5, 0.0, 1.0);
        float nada = 1.0 + 0.025 * (0.6 * sin(jari * 91.0 + uBenih * 11.0) + alur);
        vec3 perak = (outgoingLight * 0.75 + vec3(0.3)) * nada;
        vec3 data = perak + garis * 0.45 + pelangi * 1.1;
        vec3 cermin = (perak * 0.92 + garis * 0.15) * (1.0 + 0.06 * cetakan);
        outgoingLight = mix(data, cermin, diPita) * uRedup;
        diffuseColor.a = mix(1.0, 0.88, diPita);
        #include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "sisi-data";
  return m;
}

// Hub bening: satu cincin plastik tertutup setebal cakram, dari lubang sampai cetakan.
// Tiap sisi dibubut sendiri supaya sudutnya tegas; normal bawaan bubutan dipertahankan
// (computeVertexNormals memecah sambungannya jadi garis).
function geoHub() {
  const t = mm(0.61);
  const dalam = CAKRAM.lubang;
  const luar = CAKRAM.hub + mm(0.48);
  const sisi = [
    [[dalam, -t], [luar, -t]],
    [[luar, -t], [luar, t]],
    [[luar, t], [dalam, t]],
    [[dalam, t], [dalam, -t]],
  ].map((ps) => new THREE.LatheGeometry(ps.map(([x, y]) => new THREE.Vector2(x, y)), 160));
  const geo = mergeGeometries(sisi);
  sisi.forEach((g) => g.dispose());
  return geo;
}

export function buatCakram(p, renderer) {
  const grup = new THREE.Group();
  const pt = peta(renderer);
  // Satu peredup untuk semua bahan cakram: di kotak tertutup seluruhnya gelap.
  const redup = { value: 1 };
  const muka = tekstur(gambarCakram(p), renderer);
  const cincin = (dalam, luar, seg = 220) => {
    const geo = new THREE.RingGeometry(dalam, luar, seg, 1);
    // UV dari xy supaya cetakan persegi menempel benar pada cincin.
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / (2 * CAKRAM.r) + 0.5, pos.getY(i) / (2 * CAKRAM.r) + 0.5);
    }
    return geo;
  };
  // Muka cetak: kekasaran berbutir dengan pita kilap dan normal tinta, jadi pantulan
  // pita softbox pecah halus seperti tinta sablon, bukan cermin rata.
  const cetak = blurPutar(
    pasangSheen(
      new THREE.MeshPhysicalMaterial({
        map: muka,
        roughness: 0.42,
        roughnessMap: pt.kasarCetak,
        metalness: 0.48,
        clearcoat: 0.8,
        clearcoatRoughness: 0,
        normalMap: pt.normalCetak,
        normalScale: new THREE.Vector2(0.3, 0.3),
        envMapIntensity: 0.85,
      }),
      { kuat: 0.18, redup },
    ),
  );
  const depan = new THREE.Mesh(cincin(CAKRAM.hub, CAKRAM.tepi), cetak);
  depan.position.z = mm(0.64);
  // Plastik hub: 8% buram, dua cincin cetakan samar (cincin tumpuk dan bibir lubang),
  // hanya muka yang menghadap penonton digambar (dua muka bercampur terbaca seperti goresan).
  const plastikHub = pasangSheen(
    new THREE.MeshPhysicalMaterial({
      color: 0xb9bcc0,
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1,
      side: THREE.FrontSide,
      forceSinglePass: true,
    }),
    {
      kuat: 0.12,
      fresnel: 0.45,
      kilau: true,
      redup,
      cincin: [
        [0.2 * CAKRAM.r, 0.0035 * CAKRAM.r, 0.1],
        [0.14 * CAKRAM.r, 0.004 * CAKRAM.r, 0.12],
      ],
    },
  );
  const hub = new THREE.Mesh(geoHub(), plastikHub);
  hub.rotation.x = Math.PI / 2;
  const data = bahanSisiData(redup, benih(p.slug ?? p.katalog));
  const belakang = new THREE.Mesh(cincin(CAKRAM.hub, CAKRAM.tepi), data);
  belakang.rotation.y = Math.PI;
  belakang.position.z = -mm(0.64);
  grup.add(depan, hub, belakang);
  // Pita cermin dan tepi gelap kini bagian dari cetakan; kuncinya tetap untuk pemanggil lama.
  grup.userData.bahan = { cetak, data, hub: plastikHub, cermin: cetak, tepi: cetak };
  // Pemukul tak terlihat untuk klik.
  const sasaran = new THREE.Mesh(new THREE.CylinderGeometry(CAKRAM.r, CAKRAM.r, mm(4), 32), new THREE.MeshBasicMaterial({ visible: false }));
  sasaran.rotation.x = Math.PI / 2;
  sasaran.userData.bagian = "cakram";
  grup.add(sasaran);
  grup.traverse((o) => (o.userData.bagian = "cakram"));
  return grup;
}

// Shader sisi data membaca arah alur dari matriks modelnya sendiri, jadi tidak ada
// yang perlu disinkronkan lagi. Tetap diekspor untuk pemanggil yang sudah ada.
export function sinkronCakram() {}

// Kotak dalam milimeter dari pusatnya. Lapisan z (tebal 10,4 mm): pelat dasar -5,2
// sampai -4,2, sisipan -4,15, nampan sampai 0, panggung rosette 0 sampai 0,8, cakram
// 0,8 sampai 2,0, tumpukan buklet 2,0 sampai 3,2, sampul 3,3, lembar tutup 3,45
// sampai 4,95 (garis engsel di z 4,2).
const KT = {
  lebar: 142, tinggi: 125, belakang: -5.2, pelatDasar: 1, dinding: 1, sisip: -4.15,
  nampanLebar: 136, nampanTinggi: 121, nampanDepan: 0, nampanBelakang: -4.1,
  tutupDalam: 3.45, tutupDepan: 4.95, engselZ: 4.2, sayap: 8,
  sisipLebar: 138, sisipTinggi: 118, punggung: 6.5,
  buklet: 120, bukletX: 6, bukletBelakang: 1.95, cakramX: 6,
  stripLebar: 14, rusuk: 18, tab: 16, jariTab: 5, penahan: [16, 40], klipJarak: 37, klipJari: 4.5,
};
KT.engselX = -KT.lebar / 2 + 1;

// Sisipan belakang terlipat seperti di kotak: panel belakang menghadap keluar lewat
// dasar, kedua ujungnya terlipat ke depan jadi punggung. Teksturnya datar
// (punggung, panel, punggung), jadi tulisannya terbaca benar dari luar.
function geoSisipan() {
  const x = KT.sisipLebar / 2;
  const y = KT.sisipTinggi / 2;
  const z = KT.sisip;
  const lipat = z + KT.punggung;
  const s = KT.punggung / (KT.sisipLebar + KT.punggung * 2);
  return gabungMm([
    segiEmpat([[x, -y, z], [-x, -y, z], [-x, y, z], [x, y, z]], [[s, 0], [1 - s, 0], [1 - s, 1], [s, 1]]),
    segiEmpat([[x, -y, lipat], [x, -y, z], [x, y, z], [x, y, lipat]], [[0, 0], [s, 0], [s, 1], [0, 1]]),
    segiEmpat([[-x, -y, z], [-x, -y, lipat], [-x, y, lipat], [-x, y, z]], [[1 - s, 0], [1, 0], [1, 1], [1 - s, 1]]),
  ]);
}

// Dasar bening: pelat belakang, dinding samping setinggi nampan di atas punggung,
// dan di sudut atas-bawah sisi engsel sebuah knuckle dengan pinnya, tempat sayap
// tutup berputar. Knuckle menutup celah antara ujung nampan dan tutup.
function geoDasar() {
  const dalamDinding = KT.nampanDepan + 1.5 - KT.belakang;
  const xDinding = KT.lebar / 2 - 1;
  const tinggiKnuckle = KT.tinggi / 2 - KT.nampanTinggi / 2 - KT.dinding;
  const yKnuckle = KT.nampanTinggi / 2 + tinggiKnuckle / 2;
  const zDinding = KT.belakang + dalamDinding / 2;
  const knuckle = [-1, 1].flatMap((arah) => [
    lembaran(kotakMm(4, tinggiKnuckle, dalamDinding, KT.engselX + 2, arah * yKnuckle, zDinding), 1),
    lembaran(new THREE.CylinderGeometry(1.6, 1.6, tinggiKnuckle + KT.dinding, 16).translate(KT.engselX, arah * (yKnuckle + KT.dinding / 2), 0)),
  ]);
  return gabungMm([
    lembaran(kotakMm(KT.lebar - 2, KT.tinggi - 2, KT.pelatDasar, 0, 0, KT.belakang + KT.pelatDasar / 2), 2),
    lembaran(kotakMm(KT.dinding, KT.nampanTinggi, dalamDinding, -xDinding, 0, zDinding), 0),
    lembaran(kotakMm(KT.dinding, KT.nampanTinggi, dalamDinding, xDinding, 0, zDinding), 0),
    ...knuckle,
  ]);
}

// Tutup bening: pelat depan, sayap atas dan bawah, tab setengah bulat yang menjepit
// tepi atas-bawah buklet tepat di belakangnya, dan rusuk penahan di tepi bebas.
// Dibangun di sekitar garis engsel supaya grup tutup berputar di titik asalnya.
function geoTutup() {
  const yS = KT.tinggi / 2 - KT.dinding / 2;
  const dalamSayap = KT.tinggi / 2 - KT.dinding;
  const tebalPelat = KT.tutupDepan - KT.tutupDalam;
  const xTab = [-1, 1].map((a) => KT.bukletX + a * (KT.buklet / 2 - KT.tab));
  // Tab sedikit di belakang buklet (muka yang berimpit saling berebut kedalaman).
  const tab = xTab.flatMap((x) => [-1, 1].map((a) => lembaran(setengahCakram(KT.jariTab, 0.6, -a).translate(x, a * dalamSayap, KT.bukletBelakang - 0.4), 2)));
  const [dekat, jauh] = KT.penahan;
  const xPenahan = (KT.bukletX + KT.buklet / 2 + KT.lebar / 2) / 2;
  const penahan = [-1, 1].map((a) => lembaran(kotakMm(0.8, jauh - dekat, 1.6, xPenahan, (a * (dekat + jauh)) / 2, KT.tutupDalam - 0.8), 0));
  return gabungMm(
    [
      lembaran(kotakMm(KT.lebar, KT.tinggi, tebalPelat, 0, 0, KT.tutupDepan - tebalPelat / 2), 2),
      lembaran(kotakMm(KT.lebar, KT.dinding, KT.sayap, 0, yS, KT.tutupDepan - KT.sayap / 2), 1),
      lembaran(kotakMm(KT.lebar, KT.dinding, KT.sayap, 0, -yS, KT.tutupDepan - KT.sayap / 2), 1),
      ...tab,
      ...penahan,
    ].map((g) => g.translate(0, 0, -KT.engselZ)),
  );
}

// Nampan hitam dan rosettenya: panggung tempat cakram bersandar dan cincin gigi yang
// mencengkeram lubang. Di sisi engsel nampan naik jadi strip berusuk halus setinggi
// penuh, tepat di bawah tutup. Cincin rendah menandai sumur cakram dan terpotong tepi
// atas-bawah nampan, seperti nampan asli. Klip setengah cincin berdiri di tepi atas-bawah.
function geoNampan() {
  const depan = KT.nampanDepan;
  const tegak = (g) => g.rotateX(Math.PI / 2);
  const gigi = Array.from({ length: 12 }, (_, n) =>
    new THREE.BoxGeometry(4.2, 1.1, 1).translate(5.2, 0, 0).rotateZ((n / 12) * Math.PI * 2).translate(KT.cakramX, 0, depan + 1.3),
  );
  const kiriStrip = -KT.lebar / 2 + 1.5;
  const belakangStrip = KT.sisip + 0.05;
  const depanStrip = KT.tutupDalam - 0.4;
  const jarakRusuk = (KT.stripLebar - 2) / KT.rusuk;
  const rusuk = Array.from({ length: KT.rusuk }, (_, n) =>
    kotakMm(jarakRusuk * 0.45, KT.nampanTinggi - 2, 0.2, kiriStrip + 1 + jarakRusuk * (n + 0.5), 0, depanStrip + 0.1),
  );
  // Dibubut di sekitar y lalu ditegakkan, jadi sudut 0 menunjuk ke bawah nampan; busur dijaga di dalam tingginya.
  const luarSumur = 62.4;
  const celah = Math.acos((KT.nampanTinggi / 2 - 1) / luarSumur);
  const profilSumur = [[60.8, 0], [luarSumur, 0], [luarSumur, 0.5], [60.8, 0.5], [60.8, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const sumur = [celah, Math.PI + celah].map((awal) =>
    tegak(new THREE.LatheGeometry(profilSumur, 48, awal, Math.PI - celah * 2)).translate(KT.cakramX, 0, depan),
  );
  const r = KT.klipJari;
  const profilKlip = [[r - 0.7, 0], [r, 0], [r, 1.2], [r - 0.7, 1.2], [r - 0.7, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  // Busur tiap klip terbuka ke tepi nampan dan menggembung ke arah cakram.
  const klip = [-1, 1].flatMap((sx) =>
    [-1, 1].map((a) =>
      tegak(new THREE.LatheGeometry(profilKlip, 24, a > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI)).translate(
        KT.cakramX + sx * KT.klipJarak,
        (a * KT.nampanTinggi) / 2,
        depan,
      ),
    ),
  );
  const tebal = depan - KT.nampanBelakang;
  return gabungMm([
    kotakMm(KT.nampanLebar, KT.nampanTinggi, tebal, 0, 0, depan - tebal / 2),
    kotakMm(KT.stripLebar, KT.nampanTinggi, depanStrip - belakangStrip, kiriStrip + KT.stripLebar / 2, 0, (depanStrip + belakangStrip) / 2),
    ...rusuk,
    ...sumur,
    ...klip,
    tegak(new THREE.CylinderGeometry(17, 17, 0.8, 64)).translate(KT.cakramX, 0, depan + 0.4),
    tegak(new THREE.CylinderGeometry(2.6, 2.6, 1, 24)).translate(KT.cakramX, 0, depan + 1.3),
    ...gigi,
  ]);
}

// Geometri kotak sama untuk semua album, dibuat sekali.
let geoKotak = null;
const geometriKotak = () => (geoKotak ??= { sisipan: geoSisipan(), dasar: geoDasar(), tutup: geoTutup(), nampan: geoNampan() });

// --- kotak CD ----------------------------------------------------------------
export function buatKotak(p, locale, renderer, i) {
  const grup = new THREE.Group();
  const badan = new THREE.Group();
  grup.add(badan);
  const pt = peta(renderer);
  const geo = geometriKotak();
  const plastik = plastikKotak(pt.aus, benih(p.slug ?? i));

  const sisipan = new THREE.Mesh(
    geo.sisipan,
    new THREE.MeshStandardMaterial({ map: tekstur(gambarSisipan(p, locale), renderer), roughness: 0.5 }),
  );
  badan.add(sisipan);
  badan.add(new THREE.Mesh(geo.dasar, plastik));

  // Nampan polistiren hitam satin dengan bintik halus.
  const nampan = new THREE.Mesh(
    geo.nampan,
    new THREE.MeshPhysicalMaterial({
      color: 0x151518,
      roughness: 1,
      roughnessMap: pt.kasarNampan,
      normalMap: pt.bintikNampan,
      metalness: 0,
      envMapIntensity: 1.8,
      clearcoat: 0.15,
      clearcoatRoughness: 0.35,
    }),
  );
  badan.add(nampan);

  // Cakram duduk 6 mm ke kanan, berputar acak sampai ±25 derajat per album.
  const cakram = buatCakram(p, renderer);
  cakram.position.set(mm(KT.cakramX), 0, mm(1.4));
  cakram.rotation.z = (((i * 7919) % 100) / 100 - 0.5) * ((50 * Math.PI) / 180);
  badan.add(cakram);

  const engsel = new THREE.Group();
  engsel.position.set(-KOTAK.w / 2, 0, KOTAK.d / 2 - mm(1));
  const tutup = new THREE.Group();
  tutup.position.x = KOTAK.w / 2;
  let petaSampul;
  const sampul = new THREE.Mesh(
    new THREE.PlaneGeometry(BUKLET, BUKLET),
    pasangSheen(
      new THREE.MeshPhysicalMaterial({ map: (petaSampul = tekstur(gambarSampul(p, locale), renderer)), roughness: 0.5 }),
      { kuat: 0.05 },
    ),
  );
  // Ilustrasi sampul dimuat terpisah; begitu siap, kanvasnya digambar ulang dan diunggah lagi.
  petaSampul.image.siap?.then(() => (petaSampul.needsUpdate = true));
  sampul.position.set(mm(6), 0, -mm(0.9));
  const belakangBuklet = new THREE.Mesh(
    new THREE.PlaneGeometry(BUKLET, BUKLET),
    new THREE.MeshStandardMaterial({
      map: tekstur(gambarHalaman({ label: p.katalog, catatan: `${p.judul[locale]}  ${p.periode}` }, 1024), renderer),
      roughness: 0.75,
    }),
  );
  belakangBuklet.rotation.y = Math.PI;
  belakangBuklet.position.set(mm(6), 0, -mm(2.25));
  // Tumpukan kertas buklet 1,2 mm di antara sampul depan dan belakang.
  const tumpukan = new THREE.Mesh(
    new THREE.BoxGeometry(BUKLET, BUKLET, mm(1.2)),
    new THREE.MeshStandardMaterial({ color: 0xebe4d6, roughness: 0.9 }),
  );
  // Muka depan tumpukan sedikit di belakang sampul supaya tidak berebut kedalaman.
  tumpukan.position.z = -mm(0.7);
  sampul.add(tumpukan);
  // Cangkang tutup bening: pelat, sayap, tab, dan rusuk penahan dalam satu geometri.
  tutup.add(sampul, belakangBuklet, new THREE.Mesh(geo.tutup, plastik));
  engsel.add(tutup);
  grup.add(engsel);

  // Sasaran klik tak terlihat seukuran kotak.
  const sasaran = new THREE.Mesh(new THREE.BoxGeometry(KOTAK.w, KOTAK.h, KOTAK.d), new THREE.MeshBasicMaterial({ visible: false }));
  grup.add(sasaran);
  grup.traverse((o) => {
    if (o.isMesh) o.userData.slug = p.slug;
  });
  cakram.traverse((o) => (o.userData.bagian = "cakram"));
  for (const m of [nampan, sisipan]) m.receiveShadow = true;
  cakram.traverse((o) => o.isMesh && (o.receiveShadow = true));
  // Bagian dalam tutup: buklet yang bisa diklik untuk dibaca.
  for (const m of [sampul, belakangBuklet]) m.userData.bagian = "buklet";
  return { grup, badan, engsel, cakram, sampul, belakangBuklet, sasaran };
}

// --- pemutar -----------------------------------------------------------------
// Top-loader tanpa tutup, ramping, sedikit lebih besar dari cakram. Dibangun dalam
// milimeter (badan berpusat, y ke atas, depan +z) lalu diskalakan ke satuan adegan.
const PM = { sisi: 146, tinggi: 18, sudut: 7, bevel: 1, bingkai: 1.4, cincin: 2.2, sumur: 62, dalam: 10, turun: 4 };
PM.setengah = PM.sisi / 2;
PM.atas = PM.tinggi / 2;
PM.kursi = PM.atas - PM.turun; // bidang tengah cakram di atas piringan
PM.lantai = PM.atas - PM.dalam;
PM.datar = PM.setengah - PM.sudut; // ujung bagian datar tiap sisi

const WARNA = {
  badan: 0x3a3c41,
  atasDepan: "#2c2e32",
  atasBelakang: "#5a5d64",
  krom: 0xe2e4e8,
  bingkai: 0x141517,
  sumur: 0x18191c,
  lubang: 0x101113,
  logam: 0x1c1d20,
  tombol: 0x45474d,
  cetak: 0xebe3d4,
};
// Pemutar mengambil sedikit lebih banyak cahaya ruangan supaya lapisannya terbaca.
const LINGKUNGAN = 1.4;

// Persegi membulat berpusat (cx, cy), digambar ke `jalur` (Path untuk lubang).
function persegiBulat(w, h, r, cx = 0, cy = 0, jalur = new THREE.Shape()) {
  const [ki, ka, bw, at] = [cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2];
  jalur.moveTo(ki + r, bw);
  jalur.lineTo(ka - r, bw);
  jalur.quadraticCurveTo(ka, bw, ka, bw + r);
  jalur.lineTo(ka, at - r);
  jalur.quadraticCurveTo(ka, at, ka - r, at);
  jalur.lineTo(ki + r, at);
  jalur.quadraticCurveTo(ki, at, ki, at - r);
  jalur.lineTo(ki, bw + r);
  jalur.quadraticCurveTo(ki, bw, ki + r, bw);
  return jalur;
}

function lubangSumur(tambah = 0) {
  const p = new THREE.Path();
  p.absarc(0, 0, PM.sumur + tambah, 0, Math.PI * 2, true);
  return p;
}

const bubut = (titik, seg) => new THREE.LatheGeometry(titik.map(([x, y]) => new THREE.Vector2(x, y)), seg);

// Aus pada plastik mengilap: goresan halus dan bekas lap dari peta aus (merah) yang
// menangkap cahaya di tempat permukaan memantulkan ruangan. Dipetakan dari milimeter
// model sendiri per muka, berulang tiap 90 mm. Dengan `sheen`, pantulan pita softbox
// ikut ditambahkan dan goresannya juga muncul di pita itu.
function pasangAus(material, petaAus, sheen = 0) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uPetaAus = { value: petaAus };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAusPos;\nvarying vec3 vAusNormal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvAusPos = position;\nvAusNormal = normal;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uPetaAus;\nvarying vec3 vAusPos;\nvarying vec3 vAusNormal;")
      .replace(
        "#include <opaque_fragment>",
        `${sheen ? GLSL_PITA : "float pita = 0.0;"}
        outgoingLight += vec3(pita * ${sheen.toFixed(4)});
        vec3 hadap = abs(vAusNormal);
        vec2 uvAus = hadap.y > 0.5 ? vAusPos.xz : hadap.x > hadap.z ? vAusPos.zy : vAusPos.xy;
        float gores = texture2D(uPetaAus, uvAus / 90.0).r;
        float tangkap = dot(reflectedLight.indirectSpecular, vec3(0.3333)) + pita;
        outgoingLight += vec3(gores * 2.5 * (0.04 + tangkap));
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `aus-${sheen}`;
  return material;
}

// Simbol tombol sebagai bentuk vektor (sekitar 3 mm), bukan glif Unicode yang bisa
// tampil sebagai emoji atau kotak kosong.
function simbolTombol(nama) {
  const segi = (...ps) => new THREE.Shape(ps.map(([x, y]) => new THREE.Vector2(x, y)));
  const batang = (x, w = 0.55) => persegiBulat(w, 2.3, 0.12, x, 0);
  if (nama === "play") return [segi([-0.85, -1.2], [1.2, 0], [-0.85, 1.2])];
  if (nama === "pause") return [batang(-0.6, 0.65), batang(0.6, 0.65)];
  if (nama === "next") return [segi([-1.2, -1.1], [0.55, 0], [-1.2, 1.1]), batang(0.95)];
  return [segi([1.2, -1.1], [-0.55, 0], [1.2, 1.1]), batang(-0.95)];
}

// Layar dot-matrix: teks warna halaman dilihat lewat kisi titik 0,3 mm, titik mati
// tetap samar (6%). Judul yang terlalu panjang diam 1,5 detik, bergulir lewat sekali,
// lalu diam lagi, dengan ujung yang memudar.
function layarPemutar(renderer, kolom, baris, sel) {
  const W = kolom * sel;
  const H = baris * sel;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const t = tekstur(c, renderer);
  const pola = (gaya) => {
    const ubin = document.createElement("canvas");
    ubin.width = ubin.height = sel;
    const gu = ubin.getContext("2d");
    gu.fillStyle = gaya;
    gu.beginPath();
    gu.arc(sel / 2, sel / 2, sel * 0.48, 0, Math.PI * 2);
    gu.fill();
    return g.createPattern(ubin, "repeat");
  };
  const titik = pola("#fff");
  const mati = pola("rgba(235, 227, 212, 0.06)");
  const satuan = H / 10;
  const tepi = satuan * 4;
  const font = () => `500 ${satuan * 4.6}px ${getComputedStyle(document.body).fontFamily || "sans-serif"}`;
  let teks = "";
  let mulai = 0;
  let lalu = 0;
  let kotor = true;
  let bergulir = false;
  let nyalaLalu = null;
  const pudar = (dari, ke, kuat) => {
    if (kuat <= 0) return;
    const gr = g.createLinearGradient(dari, 0, ke, 0);
    gr.addColorStop(0, `rgba(0,0,0,${kuat})`);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = gr;
    g.fillRect(Math.min(dari, ke), 0, Math.abs(ke - dari), H);
    g.globalCompositeOperation = "source-over";
  };
  return {
    tekstur: t,
    setel(s, now) {
      teks = s;
      mulai = now;
      kotor = true;
    },
    gambar(now, nyala) {
      if (nyala !== nyalaLalu) kotor = true;
      nyalaLalu = nyala;
      if (!kotor && !(nyala && bergulir)) return;
      if (now - lalu < 33 && !kotor) return;
      lalu = now;
      kotor = false;
      g.globalCompositeOperation = "source-over";
      g.clearRect(0, 0, W, H);
      bergulir = false;
      if (nyala && teks) {
        g.font = font();
        g.fillStyle = "#ebe3d4";
        g.textBaseline = "middle";
        const lebar = g.measureText(teks).width;
        const ruang = W - tepi * 2;
        const tengah = H * 0.52;
        bergulir = lebar > ruang;
        g.save();
        g.beginPath();
        g.rect(tepi, 0, ruang, H);
        g.clip();
        if (bergulir) {
          const jarak = satuan * 14;
          const geser = geserJudul((now - mulai) / 1000, { lebar, jarak, laju: 9 * satuan, tahan: 1.5 });
          g.fillText(teks, tepi - geser, tengah);
          g.fillText(teks, tepi - geser + lebar + jarak, tengah);
          // Ujung kanan selalu memotong judul; ujung kiri hanya memudar saat judul lewat.
          const ujung = satuan * 3;
          pudar(tepi, tepi + ujung, Math.min(1, geser / ujung, (lebar + jarak - geser) / ujung));
          pudar(tepi + ruang, tepi + ruang - ujung, 1);
        } else {
          g.fillText(teks, tepi, tengah);
        }
        g.restore();
        g.globalCompositeOperation = "destination-in";
        g.fillStyle = titik;
        g.fillRect(0, 0, W, H);
      }
      g.globalCompositeOperation = "destination-over";
      g.fillStyle = mati;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";
      t.needsUpdate = true;
    },
  };
}

// Bayangan kontak: dua tapak, lebar dan lembut di luar, rapat dan gelap di tepi
// dasar. Diburamkan sebagai bayangan kanvas dari bentuknya yang digambar di luar
// kanvas (filter blur kanvas tidak ada di Safari).
function petaBayangan(renderer, ukuran, skala) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.round(ukuran * skala);
  const g = c.getContext("2d");
  g.setTransform(skala, 0, 0, -skala, c.width / 2, c.height / 2);
  const jauh = ukuran * 2;
  const tapak = (tumbuh, blur, alfa) => {
    g.shadowColor = "#000";
    g.shadowBlur = blur * skala * 2;
    g.shadowOffsetX = -jauh * skala;
    g.shadowOffsetY = 0;
    g.globalAlpha = alfa;
    g.fillStyle = "#000";
    g.beginPath();
    g.roundRect(jauh - PM.setengah - tumbuh, -PM.setengah - tumbuh, PM.sisi + tumbuh * 2, PM.sisi + tumbuh * 2, PM.sudut + tumbuh);
    g.fill();
  };
  tapak(PM.sisi * 0.06, PM.sisi * 0.09, 0.55);
  tapak(0, PM.sisi * 0.015, 1);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

export function buatPemutar(renderer) {
  const pt = peta(renderer);
  const grup = new THREE.Group();
  const isi = new THREE.Group();
  isi.scale.setScalar(mm(1));
  isi.position.y = mm(PM.atas);
  grup.add(isi);
  const { sisi, setengah, atas, bevel, lantai, kursi } = PM;

  // Badan: grafit mengilap, logam 0, sedikit clearcoat, dengan aus.
  const bahanBadan = pasangAus(
    new THREE.MeshPhysicalMaterial({ color: WARNA.badan, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: LINGKUNGAN }),
    pt.aus,
  );
  const bentukBadan = persegiBulat(sisi - bevel * 2, sisi - bevel * 2, PM.sudut - bevel);
  bentukBadan.holes.push(lubangSumur(bevel));
  const geoBadan = new THREE.ExtrudeGeometry(bentukBadan, {
    depth: PM.tinggi - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 96,
  });
  geoBadan.rotateX(-Math.PI / 2).translate(0, -atas + bevel, 0);
  isi.add(new THREE.Mesh(geoBadan, bahanBadan));

  // Panel atas: lembar grafit mengilap sedikit menonjol, 1,4 mm di dalam tepi badan,
  // dengan tepi hitam doff. Panel mengilap yang dilihat dari depan atas memantulkan
  // ruangan terang ke belakang dan lantai ke depan, jadi warna verteksnya bergradasi.
  const bahanAtas = pasangAus(
    new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: LINGKUNGAN }),
    pt.aus,
    0.12,
  );
  const bahanBingkai = new THREE.MeshStandardMaterial({ color: WARNA.bingkai, roughness: 0.8, metalness: 0, envMapIntensity: LINGKUNGAN });
  const bentukAtas = persegiBulat(sisi - PM.bingkai * 2, sisi - PM.bingkai * 2, Math.max(1, PM.sudut - PM.bingkai));
  bentukAtas.holes.push(lubangSumur(PM.cincin));
  // Tepi persegi: tepi membulat terlihat sebagai garis putus-putus di belakang.
  const geoAtas = new THREE.ExtrudeGeometry(bentukAtas, { depth: 1.15, bevelEnabled: false, curveSegments: 96 });
  geoAtas.rotateX(-Math.PI / 2).translate(0, atas - 0.4, 0);
  const pos = geoAtas.attributes.position;
  const warna = new Float32Array(pos.count * 3);
  const belakang = new THREE.Color(WARNA.atasBelakang);
  const depan = new THREE.Color(WARNA.atasDepan);
  const w = new THREE.Color();
  for (let n = 0; n < pos.count; n++) {
    const u = Math.min(1, Math.max(0, (pos.getZ(n) + setengah) / sisi));
    w.copy(belakang).lerp(depan, u * u * (3 - 2 * u)).toArray(warna, n * 3);
  }
  geoAtas.setAttribute("color", new THREE.BufferAttribute(warna, 3));
  isi.add(new THREE.Mesh(geoAtas, [bahanAtas, bahanBingkai]));

  // Cincin logam gelap di bibir sumur, dikusamkan supaya tidak silau di ponsel:
  // dari tepi panel membulat lalu melandai masuk ke sumur.
  const logamGelap = new THREE.MeshPhysicalMaterial({
    color: WARNA.logam,
    roughness: 0.32,
    metalness: 1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: LINGKUNGAN * 0.6,
    side: THREE.DoubleSide,
  });
  const r = PM.sumur;
  const lebarCincin = PM.cincin;
  isi.add(
    new THREE.Mesh(
      bubut(
        [
          [r + lebarCincin + 0.8, atas + 0.76],
          [r + lebarCincin, atas + 1.05],
          [r + lebarCincin - 1, atas + 0.95],
          [r + 0.9, atas - 0.4],
          [r - 0.1, atas - 2.2],
          [r - 0.5, atas - 3.4],
        ],
        128,
      ),
      logamGelap,
    ),
  );

  // Sumur: lantai hitam doff dengan satu bukaan ke belakang, tempat lensa pickup di
  // atas kereta hitamnya terlihat.
  const [lebarCelah, celahDari, celahKe] = [13, 21, 50];
  const doff = new THREE.MeshStandardMaterial({ color: WARNA.sumur, roughness: 0.85, envMapIntensity: LINGKUNGAN });
  const bentukLantai = new THREE.Shape();
  bentukLantai.absarc(0, 0, r + bevel, 0, Math.PI * 2, false);
  bentukLantai.holes.push(persegiBulat(lebarCelah, celahKe - celahDari, 2, 0, (celahDari + celahKe) / 2, new THREE.Path()));
  const lantaiSumur = new THREE.Mesh(new THREE.ShapeGeometry(bentukLantai, 96), doff);
  lantaiSumur.rotation.x = -Math.PI / 2;
  lantaiSumur.position.y = lantai;
  // Dinding sumur dibubut supaya bayangannya membulat (sisi potongan badan bersegi).
  const dinding = new THREE.Mesh(
    bubut([[r - 0.4, atas - 3.2], [r - 0.4, lantai]], 192),
    new THREE.MeshStandardMaterial({ color: WARNA.sumur, roughness: 0.85, envMapIntensity: LINGKUNGAN, side: THREE.DoubleSide }),
  );
  const zCelah = -(celahDari + celahKe) / 2;
  const rongga = new THREE.Mesh(
    new THREE.BoxGeometry(lebarCelah, 4, celahKe - celahDari),
    new THREE.MeshStandardMaterial({ color: WARNA.lubang, roughness: 0.9, side: THREE.BackSide }),
  );
  rongga.position.set(0, lantai - 2, zCelah);
  const zKereta = -33;
  const kereta = new THREE.Mesh(new THREE.BoxGeometry(10, 1.6, 8), new THREE.MeshStandardMaterial({ color: WARNA.sumur, roughness: 0.7 }));
  kereta.position.set(0, lantai - 1.4, zKereta);
  const cincinLensa = new THREE.Mesh(new THREE.TorusGeometry(2, 0.35, 8, 32).rotateX(Math.PI / 2), logamGelap);
  cincinLensa.position.set(0, lantai - 0.5, zKereta);
  // Lensa objektif: kubah kecil mengilap dengan kilau ungu lapisannya.
  const lensa = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1),
    new THREE.MeshPhysicalMaterial({ color: 0x191530, roughness: 0.05, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 500] }),
  );
  lensa.position.set(0, lantai - 0.6, zKereta);
  isi.add(lantaiSumur, dinding, rongga, kereta, cincinLensa, lensa);

  // Piringan dan pin pemusat, dibubut bertingkat. Grafit doff tanpa aus karena terlihat
  // lewat hub bening (mengilap, ia silau di sana): butir halus di warnanya dan bintik
  // cetakan sebagai tonjolan saja. Tiga bola pegas baja di sekitar pin menahan cakram.
  const dudukan = kursi - 0.6;
  const pin = CAKRAM.lubang * 100 - 0.2;
  const piring = new THREE.Mesh(
    bubut(
      [
        [8, lantai],
        [8, dudukan - 2.4],
        [16, dudukan - 2.2],
        [16.4, dudukan - 1.6],
        [16.4, dudukan - 0.4],
        [16, dudukan],
        [pin + 1.2, dudukan],
        [pin, dudukan + 0.2],
        [pin, dudukan + 1.4],
        [pin * 0.8, dudukan + 2.4],
        [pin * 0.4, dudukan + 2.9],
        [0, dudukan + 3],
      ],
      64,
    ),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(WARNA.badan).multiplyScalar(1.15),
      map: pt.piring,
      roughness: 0.8,
      metalness: 0,
      envMapIntensity: LINGKUNGAN,
      normalMap: pt.bintik,
      normalScale: new THREE.Vector2(1.5, 1.5),
    }),
  );
  isi.add(piring);
  const krom = new THREE.MeshPhysicalMaterial({ color: WARNA.krom, roughness: 0.12, metalness: 1 });
  const geoBola = new THREE.SphereGeometry(0.8, 16, 8);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const bola = new THREE.Mesh(geoBola, krom);
    bola.position.set(Math.cos(a) * (pin - 0.3), kursi + 1.4, Math.sin(a) * (pin - 0.3));
    isi.add(bola);
  }

  const bayangan = new THREE.Mesh(
    new THREE.PlaneGeometry(sisi * 1.8, sisi * 1.8),
    new THREE.MeshBasicMaterial({ map: petaBayangan(renderer, sisi * 1.8, 3), transparent: true, opacity: 0.3, depthWrite: false, fog: false }),
  );
  bayangan.rotation.x = -Math.PI / 2;
  bayangan.position.y = -atas - 0.3;
  bayangan.renderOrder = -1;
  bayangan.raycast = () => {};
  isi.add(bayangan);

  // Lubang, celah, dan cetakan sedikit di depan mukanya dengan polygon offset.
  const stiker = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const bahanLubang = new THREE.MeshStandardMaterial({ color: WARNA.lubang, roughness: 0.8, ...stiker });
  // Cetakan sedikit berpendar supaya terbaca krem, bukan abu-abu, di cahaya ruangan.
  const bahanCetak = new THREE.MeshStandardMaterial({
    color: WARNA.cetak,
    emissive: WARNA.cetak,
    emissiveIntensity: 0.45,
    roughness: 0.55,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    ...stiker,
  });

  // Muka depan (+z): dari sudut, layar (panel hitam mengilap berbevel halus) lalu
  // empat tombol sampai 3 mm dari ujung kanan.
  const muka = new THREE.Group();
  muka.position.z = setengah;
  isi.add(muka);
  const [lebarTombol, tinggiTombol, jarakTombol] = [9, 7, 2.6];
  const tepiLayar = 3;
  const deretTombol = 4 * lebarTombol + 3 * jarakTombol;
  const layarDari = -PM.datar + tepiLayar;
  const layarKe = PM.datar - tepiLayar - deretTombol - 5;
  const [lebarLayar, tinggiLayar, xLayar] = [layarKe - layarDari, PM.tinggi - bevel * 2 - tepiLayar * 2, (layarDari + layarKe) / 2];
  const jarakTitik = 0.3;
  const [kolom, baris] = [Math.floor((lebarLayar - 1.6) / jarakTitik), Math.floor((tinggiLayar - 1.6) / jarakTitik)];
  const layar = layarPemutar(renderer, kolom, baris, Math.max(2, Math.round(jarakTitik * 14)));
  const panel = new THREE.Mesh(
    new THREE.ExtrudeGeometry(persegiBulat(lebarLayar, tinggiLayar, 1.2), {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.15,
      bevelSegments: 2,
      curveSegments: 6,
    }),
    new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }),
  );
  panel.position.x = xLayar;
  const titikLayar = new THREE.Mesh(
    new THREE.PlaneGeometry(kolom * jarakTitik, baris * jarakTitik),
    new THREE.MeshBasicMaterial({ map: layar.tekstur, transparent: true, toneMapped: false, depthWrite: false }),
  );
  titikLayar.position.set(xLayar, 0, 0.4);
  muka.add(panel, titikLayar);

  // Lampu status kecil di celah antara layar dan tombol.
  const lampu = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), new THREE.MeshBasicMaterial({ color: 0xe0574b, toneMapped: false, ...stiker }));
  lampu.position.set(layarKe + 2.5, 0, 0.05);
  muka.add(lampu);

  // Tombol: tutup grafit membulat menonjol dari celah gelap, simbolnya tercetak. Tiap
  // tombol hidup di ruang satuan adegan (bukan milimeter) karena adegan menekannya
  // 0,004 satuan = 0,4 mm.
  const bentukCelah = persegiBulat(lebarTombol + 1.2, tinggiTombol + 1.2, 2);
  bentukCelah.holes.push(persegiBulat(lebarTombol, tinggiTombol, 1.5, 0, 0, new THREE.Path()));
  const geoCelah = new THREE.ShapeGeometry(bentukCelah, 6);
  const geoTutup = new THREE.ExtrudeGeometry(persegiBulat(lebarTombol - 0.6, tinggiTombol - 0.6, 1.3), {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.3,
    bevelSegments: 3,
    curveSegments: 8,
  });
  const bahanTutup = new THREE.MeshPhysicalMaterial({
    color: WARNA.tombol,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    envMapIntensity: LINGKUNGAN,
  });
  const tombolKe = PM.datar - tepiLayar;
  const tombol = ["prev", "play", "pause", "next"].map((nama, k) => {
    const x = tombolKe - lebarTombol / 2 - (3 - k) * (lebarTombol + jarakTombol);
    const celah = new THREE.Mesh(geoCelah, bahanLubang);
    celah.position.set(x, 0, 0.02);
    muka.add(celah);
    const b = new THREE.Group();
    b.scale.setScalar(mm(1));
    b.position.set(mm(x), mm(atas), mm(setengah));
    const tutup = new THREE.Mesh(geoTutup, bahanTutup);
    // Tiap simbol punya salinan bahan sendiri supaya bisa menyala sendiri saat disorot.
    const label = new THREE.Mesh(new THREE.ShapeGeometry(simbolTombol(nama), 4), bahanCetak.clone());
    label.position.z = 0.82;
    tutup.userData.tombol = label.userData.tombol = b.userData.tombol = nama;
    b.add(tutup, label);
    b.userData.label = label;
    b.userData.dasarZ = b.position.z;
    grup.add(b);
    return b;
  });

  // Sisi kiri (-x), dalam bidangnya sendiri: x ke depan, y ke atas, z keluar dari sisi.
  // Dari belakang: colokan headphone, lalu pita lubang pengeras suara.
  const kiri = new THREE.Group();
  kiri.position.x = -setengah;
  kiri.rotation.y = -Math.PI / 2;
  isi.add(kiri);
  const [dari, ke, jarak, jumlahBaris] = [-50, 62, 2.4, 4];
  const jumlahKolom = Math.floor((ke - dari) / jarak) + 1;
  const kisi = new THREE.InstancedMesh(new THREE.CircleGeometry(0.7, 16), bahanLubang, jumlahKolom * jumlahBaris);
  const mtx = new THREE.Matrix4();
  for (let n = 0; n < jumlahKolom * jumlahBaris; n++) {
    const sepanjang = (dari + ke) / 2 + ((n % jumlahKolom) - (jumlahKolom - 1) / 2) * jarak;
    const naik = (Math.floor(n / jumlahKolom) - (jumlahBaris - 1) / 2) * jarak;
    kisi.setMatrixAt(n, mtx.makeTranslation(sepanjang, naik, 0.2));
  }
  kiri.add(kisi);
  // Kerah logam gelap 0,4 mm menonjol di sekitar soket 3,5 mm.
  const kerah = new THREE.Mesh(
    bubut([[3.1, 0], [3, 0.25], [2.7, 0.4], [2.15, 0.4], [1.9, 0.2], [1.75, 0]], 48).rotateX(Math.PI / 2),
    logamGelap,
  );
  const soket = new THREE.Mesh(new THREE.CircleGeometry(1.75, 32), bahanLubang);
  soket.position.z = 0.02;
  kerah.position.x = soket.position.x = -61;
  kiri.add(kerah, soket);

  // puncakY: sedikit di atas bibir sumur, pangkal sinar hologram. kursiY: pusat cakram di piringan.
  return { grup, layar, tombol, lampu, puncakY: mm(PM.tinggi + 2), kursiY: mm(atas + kursi) };
}

export { gambarHalaman };
