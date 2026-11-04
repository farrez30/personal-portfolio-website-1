// Benda 3D: kotak CD, cakram, pemutar top-loader, proyektor, dan lingkungan
// pantulnya. Satu unit = 100 mm. Ditulis sendiri; teknik material dipelajari
// dari catatan desain Discography (pita softbox, plastik yang terlihat lewat
// pantulan, difraksi sisi data cakram) dan rumus spektrum Zucconi.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { gambarSampul, gambarCakram, gambarSisipan, gambarHalaman } from "./gambar";

const mm = (x) => x / 100;

export const KOTAK = { w: mm(142), h: mm(125), d: mm(10.4) };
export const CAKRAM = { r: mm(60), lubang: mm(7.6), hub: mm(18.6), cermin: mm(20.7), cetak: mm(58.7) };
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

function pasangSheen(material, { kuat = 0.12, alfa = 0, fresnel = 0, kilau = false } = {}) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uNormalPita = { value: NORMAL_PITA };
    sh.uniforms.uRedup = { value: 1 };
    material.userData.shader = sh;
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uNormalPita;\nuniform float uRedup;",
      )
      .replace(
        "#include <opaque_fragment>",
        `
        #ifdef USE_CLEARCOAT
        outgoingLight -= reflectedLight.directSpecular * (1.0 - material.clearcoat * Fcc) + clearcoatSpecularDirect * material.clearcoat;
        #else
        outgoingLight -= reflectedLight.directSpecular;
        #endif
        // Membuang sorotan langsung bisa di bawah nol di sudut miring (bintik hitam).
        outgoingLight = max(outgoingLight, vec3(0.0));
        vec3 bidangPita = normalize((viewMatrix * vec4(uNormalPita, 0.0)).xyz);
        float sp = asin(clamp(dot(reflect(-geometryViewDir, normal), bidangPita), -1.0, 1.0)) / 0.1;
        float pita = exp(-sp * sp);
        float fr = pow(1.0 - abs(dot(normal, geometryViewDir)), 3.0);
        // Logam memantulkan dengan warnanya sendiri.
        float sheen = pita * ${kuat.toFixed(3)};
        outgoingLight += mix(vec3(1.0), diffuseColor.rgb, metalnessFactor) * sheen;
        float kilauLingkungan = ${kilau ? "dot(reflectedLight.indirectSpecular, vec3(0.3333)) + sheen" : "0.0"};
        diffuseColor.a = clamp(diffuseColor.a + ${alfa.toFixed(3)} * pita + ${fresnel.toFixed(3)} * fr + kilauLingkungan, 0.0, 1.0);
        outgoingLight *= uRedup;
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `sheen-${kuat}-${alfa}-${fresnel}-${kilau}`;
  return material;
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
        vec4 tekstil = vec4(0.0);
        vec2 d = vMapUv - 0.5;
        for (int i = 0; i < 24; i++) {
          float a = (float(i) / 23.0 - 0.5) * uBlur;
          float c = cos(a), s = sin(a);
          tekstil += texture2D(map, vec2(c * d.x - s * d.y, s * d.x + c * d.y) + 0.5);
        }
        diffuseColor *= tekstil / 24.0;
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

// Tepi potongan plastik: garis tipis yang sedikit lebih buram dari permukaannya.
function tepiPlastik(geo, opasitas = 0.15) {
  const garis = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 30),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: opasitas, depthWrite: false }),
  );
  // Garis tidak ikut diklik: ambang raycast garis bawaan three (1 unit) lebih besar dari kotaknya.
  garis.raycast = () => {};
  return garis;
}

const plastik = () =>
  pasangSheen(
    new THREE.MeshPhysicalMaterial({
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
    }),
    { kuat: 0.12, fresnel: 0.45, kilau: true },
  );

// --- cakram -----------------------------------------------------------------
// Sisi data: persamaan kisi pada (L + V) terhadap arah alur, orde 1 dan 2,
// dikaburkan dan dipastelkan, dua cahaya untuk pola X, di atas perak terang.
function bahanSisiData() {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0x83888f,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 0.5,
    envMapIntensity: 1.2,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPusat = { value: new THREE.Vector3() };
    sh.uniforms.uSumbu = { value: new THREE.Vector3(0, 0, 1) };
    sh.uniforms.uRedup = { value: 1 };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vDunia;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvDunia = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vDunia;
        uniform vec3 uPusat;
        uniform vec3 uSumbu;
        uniform float uRedup;
        vec3 bump3(vec3 x) { vec3 y = 1.0 - x * x; return max(y, vec3(0.0)); }
        vec3 spektrum(float w) {
          float x = clamp((w - 400.0) / 300.0, 0.0, 1.0);
          return bump3(vec3(4.0 * (x - 0.75), 4.0 * (x - 0.5), 4.0 * (x - 0.25)));
        }
        vec3 kisi(vec3 L, vec3 V, vec3 T, vec3 R, out float garis) {
          vec3 h = L + V;
          float u = abs(dot(h, T));
          float fokus = exp(-1.5 * pow(dot(h, R), 2.0));
          garis = exp(-14.0 * u * u) * fokus;
          vec3 c = vec3(0.0);
          for (int n = 1; n <= 2; n++) {
            float fn = float(n);
            for (int k = -1; k <= 1; k++) {
              float w = (u + float(k) * 0.03) * 1600.0 / fn;
              c += spektrum(w) / (3.0 * fn);
            }
          }
          return c * fokus;
        }`,
      )
      .replace(
        "#include <opaque_fragment>",
        `
        outgoingLight -= reflectedLight.directSpecular;
        outgoingLight = max(outgoingLight, vec3(0.0));
        vec3 V = normalize(cameraPosition - vDunia);
        vec3 rad = vDunia - uPusat;
        rad -= uSumbu * dot(rad, uSumbu);
        float jari = length(rad);
        vec3 R = rad / max(jari, 1e-5);
        vec3 T = normalize(cross(uSumbu, R));
        float g1; float g2;
        vec3 pelangi = kisi(normalize(vec3(-0.3, 0.75, 0.6)), V, T, R, g1)
                     + 0.6 * kisi(normalize(vec3(0.7, -0.2, 0.7)), V, T, R, g2);
        float abu = dot(pelangi, vec3(0.299, 0.587, 0.114));
        pelangi = mix(vec3(abu), pelangi, 0.8);
        float riak = 1.0 + 0.025 * sin(jari * 520.0 / ${CAKRAM.r.toFixed(3)}) * (1.0 - clamp(fwidth(jari * 520.0) , 0.0, 1.0));
        outgoingLight = (outgoingLight * 0.75 + 0.09) * riak + 0.2 * (g1 + 0.6 * g2) + 0.5 * pelangi;
        outgoingLight *= uRedup;
        #include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "sisi-data";
  return m;
}

export function buatCakram(p, renderer) {
  const grup = new THREE.Group();
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
  const cetak = blurPutar(
    pasangSheen(new THREE.MeshPhysicalMaterial({ map: muka, roughness: 0.42, metalness: 0.48, clearcoat: 0.8 }), { kuat: 0.18 }),
  );
  const depan = new THREE.Mesh(cincin(CAKRAM.cermin, CAKRAM.cetak), cetak);
  depan.position.z = mm(0.6);
  const tepi = new THREE.Mesh(
    cincin(CAKRAM.cetak, CAKRAM.r * 0.995),
    new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.4, metalness: 0.3 }),
  );
  tepi.position.z = mm(0.6);
  const cermin = new THREE.Mesh(
    cincin(CAKRAM.hub, CAKRAM.cermin, 96),
    pasangSheen(new THREE.MeshPhysicalMaterial({ color: 0xd9dade, metalness: 1, roughness: 0.15 }), { kuat: 0.18 }),
  );
  cermin.position.z = mm(0.6);
  const hub = new THREE.Mesh(
    cincin(CAKRAM.lubang, CAKRAM.hub, 96),
    pasangSheen(
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.1, depthWrite: false }),
      { kuat: 0.18, alfa: 0.3 },
    ),
  );
  hub.position.z = mm(0.6);
  const data = bahanSisiData();
  const belakang = new THREE.Mesh(cincin(CAKRAM.hub, CAKRAM.r * 0.995), data);
  belakang.rotation.y = Math.PI;
  belakang.position.z = -mm(0.6);
  grup.add(depan, tepi, cermin, hub, belakang);
  grup.userData.bahan = { cetak, data, cermin: cermin.material, tepi: tepi.material };
  // Pemukul tak terlihat untuk klik.
  const sasaran = new THREE.Mesh(new THREE.CylinderGeometry(CAKRAM.r, CAKRAM.r, mm(4), 32), new THREE.MeshBasicMaterial({ visible: false }));
  sasaran.rotation.x = Math.PI / 2;
  sasaran.userData.bagian = "cakram";
  grup.add(sasaran);
  grup.traverse((o) => (o.userData.bagian = "cakram"));
  return grup;
}

// Sumbu dan pusat cakram untuk shader difraksi, diperbarui tiap bingkai.
export function sinkronCakram(cakram) {
  const sh = cakram.userData.bahan.data.userData.shader;
  if (!sh) return;
  cakram.getWorldPosition(sh.uniforms.uPusat.value);
  sh.uniforms.uSumbu.value.set(0, 0, 1).applyQuaternion(cakram.getWorldQuaternion(new THREE.Quaternion()));
}

// --- kotak CD ----------------------------------------------------------------
export function buatKotak(p, locale, renderer, i) {
  const grup = new THREE.Group();
  const badan = new THREE.Group();
  grup.add(badan);

  const sisipan = new THREE.Mesh(
    new THREE.PlaneGeometry(mm(138), mm(118)),
    new THREE.MeshStandardMaterial({ map: tekstur(gambarSisipan(p, locale), renderer), roughness: 0.6 }),
  );
  sisipan.rotation.y = Math.PI;
  sisipan.position.z = -KOTAK.d / 2 + mm(0.6);
  badan.add(sisipan);

  const dasar = new THREE.Mesh(new RoundedBoxGeometry(KOTAK.w, KOTAK.h, mm(5), 2, mm(1)), plastik());
  dasar.position.z = -KOTAK.d / 2 + mm(2.5);
  badan.add(dasar);
  const tepiDasar = tepiPlastik(dasar.geometry);
  tepiDasar.position.copy(dasar.position);
  badan.add(tepiDasar);

  const bahanNampan = pasangSheen(
    new THREE.MeshPhysicalMaterial({ color: 0x151518, roughness: 0.75, clearcoat: 0.15, clearcoatRoughness: 0.35, envMapIntensity: 1.8 }),
    { kuat: 0.06 },
  );
  const nampan = new THREE.Mesh(new RoundedBoxGeometry(mm(136), mm(121), mm(5), 2, mm(1.2)), bahanNampan);
  nampan.position.set(mm(3), 0, -KOTAK.d / 2 + mm(3.5));
  badan.add(nampan);

  // Strip engsel berusuk penuh tinggi, 14 mm, 18 rusuk.
  const engselStrip = new THREE.Group();
  const pelat = new THREE.Mesh(new RoundedBoxGeometry(mm(14), mm(121), mm(6), 2, mm(1)), bahanNampan);
  pelat.position.set(-KOTAK.w / 2 + mm(8), 0, -KOTAK.d / 2 + mm(3.5));
  engselStrip.add(pelat);
  const usukGeo = new THREE.BoxGeometry(mm(10), mm(1.2), mm(0.6));
  const bahanUsuk = new THREE.MeshStandardMaterial({ color: 0x1d1d21, roughness: 0.6 });
  for (let k = 0; k < 18; k++) {
    const u = new THREE.Mesh(usukGeo, bahanUsuk);
    u.position.set(-KOTAK.w / 2 + mm(8), -mm(56) + k * mm(6.6), -KOTAK.d / 2 + mm(6.6));
    engselStrip.add(u);
  }
  // Knuckle di kedua ujung strip engsel.
  for (const arah of [-1, 1]) {
    const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(mm(2.4), mm(2.4), mm(6), 16), bahanNampan);
    knuckle.position.set(-KOTAK.w / 2 + mm(1.5), arah * (KOTAK.h / 2 - mm(4)), KOTAK.d / 2 - mm(3));
    engselStrip.add(knuckle);
  }
  badan.add(engselStrip);

  // Rosette: cincin gigi di tengah nampan yang mencengkeram lubang cakram.
  const rosette = new THREE.Group();
  const gigi = new THREE.BoxGeometry(mm(1.6), mm(2.4), mm(2.4));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const g = new THREE.Mesh(gigi, bahanNampan);
    g.position.set(Math.cos(a) * mm(6), Math.sin(a) * mm(6), 0);
    g.rotation.z = a + Math.PI / 2;
    rosette.add(g);
  }
  const cincinRosette = new THREE.Mesh(new THREE.TorusGeometry(mm(15), mm(0.8), 8, 64), bahanNampan);
  rosette.add(cincinRosette);
  // Lapisan z (kotak 10,4 mm): nampan sampai 0,8 mm, cakram 0,8 sampai 2,0, tumpukan buklet
  // 2,0 sampai 3,2, sampul 3,3, lembar tutup 3,45 sampai 4,95. Gigi rosette berhenti di muka cakram.
  rosette.position.set(mm(6), 0, -KOTAK.d / 2 + mm(6));
  badan.add(rosette);

  // Klip setengah cincin di tepi atas dan bawah nampan.
  for (const arah of [-1, 1]) {
    const klip = new THREE.Mesh(new THREE.TorusGeometry(mm(4.5), mm(0.9), 8, 24, Math.PI), bahanNampan);
    klip.position.set(mm(6), arah * mm(57), -KOTAK.d / 2 + mm(6.2));
    klip.rotation.z = arah > 0 ? Math.PI : 0;
    badan.add(klip);
  }

  // Cakram duduk 6 mm ke kanan, berputar acak sampai ±25 derajat per album.
  const cakram = buatCakram(p, renderer);
  cakram.position.set(mm(6), 0, -KOTAK.d / 2 + mm(6.6));
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
  const lembar = new THREE.Mesh(new RoundedBoxGeometry(KOTAK.w, KOTAK.h, mm(1.5), 2, mm(0.6)), plastik());
  const tepiLembar = tepiPlastik(lembar.geometry, 0.18);
  // Empat tab setengah lingkaran (radius 5 mm, 16 mm dari tiap sisi) dan dua rusuk
  // penahan di sisi dalam tutup: yang menjepit buklet di tempatnya.
  const tabGeo = new THREE.CylinderGeometry(mm(5), mm(5), mm(1), 24);
  const bahanTab = plastik();
  const tab = [];
  for (const [x, y, rot] of [
    [-BUKLET / 2 + mm(16), BUKLET / 2, 0],
    [BUKLET / 2 - mm(16), BUKLET / 2, 0],
    [-BUKLET / 2 + mm(16), -BUKLET / 2, Math.PI],
    [BUKLET / 2 - mm(16), -BUKLET / 2, Math.PI],
  ]) {
    const t = new THREE.Mesh(tabGeo, bahanTab);
    t.rotation.set(Math.PI / 2, 0, rot);
    t.position.set(mm(6) + x, y, -mm(2.7));
    const tepi = tepiPlastik(tabGeo, 0.25);
    tepi.position.copy(t.position);
    tepi.rotation.copy(t.rotation);
    tab.push(t, tepi);
  }
  for (const arah of [-1, 1]) {
    const rusuk = new THREE.Mesh(new THREE.BoxGeometry(mm(1.2), mm(24), mm(2)), bahanTab);
    rusuk.position.set(mm(6) + BUKLET / 2 + mm(1), arah * mm(28), -mm(1.6));
    tab.push(rusuk);
  }
  tutup.add(sampul, belakangBuklet, lembar, tepiLembar, ...tab);
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
function layarPemutar(renderer) {
  const W = 640;
  const H = 120;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const t = tekstur(c, renderer);
  // Pola titik dot-matrix, dipakai sebagai topeng "destination-in".
  const pola = document.createElement("canvas");
  pola.width = pola.height = 4;
  const gp = pola.getContext("2d");
  gp.fillStyle = "#fff";
  gp.beginPath();
  gp.arc(2, 2, 1.35, 0, Math.PI * 2);
  gp.fill();
  const lapisan = document.createElement("canvas");
  lapisan.width = W;
  lapisan.height = H;
  const gl = lapisan.getContext("2d");
  let teks = "";
  let mulai = 0;
  let lalu = 0;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
  return {
    tekstur: t,
    setel(s, now) {
      teks = s;
      mulai = now;
    },
    gambar(now, nyala) {
      if (now - lalu < 33) return;
      lalu = now;
      g.fillStyle = "#06070a";
      g.fillRect(0, 0, W, H);
      // titik mati 6%
      g.globalAlpha = 0.06;
      g.fillStyle = g.createPattern(pola, "repeat");
      g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;
      if (nyala && teks) {
        gl.clearRect(0, 0, W, H);
        gl.font = `500 56px ${mono}`;
        gl.fillStyle = "#ece3d4";
        const lebar = gl.measureText(teks).width;
        let x = 24;
        if (lebar > W - 48) {
          const jalan = (lebar - (W - 48)) / 90; // 9 mm/s kira-kira
          const siklus = 1.5 + jalan + 1.5;
          const d = ((now - mulai) / 1000) % siklus;
          x = 24 - Math.max(0, Math.min(jalan, d - 1.5)) * 90;
        }
        gl.fillText(teks, x, 80);
        gl.globalCompositeOperation = "destination-in";
        gl.fillStyle = gl.createPattern(pola, "repeat");
        gl.fillRect(0, 0, W, H);
        gl.globalCompositeOperation = "source-over";
        g.drawImage(lapisan, 0, 0);
      }
      t.needsUpdate = true;
    },
  };
}

export function buatPemutar(renderer) {
  const grup = new THREE.Group();
  const s = PEMUTAR.sisi;
  // Badan: persegi membulat yang diekstrusi, sumur bundar menembus.
  const bentuk = new THREE.Shape();
  const r = mm(7);
  const h = s / 2;
  bentuk.moveTo(-h + r, -h);
  bentuk.lineTo(h - r, -h);
  bentuk.quadraticCurveTo(h, -h, h, -h + r);
  bentuk.lineTo(h, h - r);
  bentuk.quadraticCurveTo(h, h, h - r, h);
  bentuk.lineTo(-h + r, h);
  bentuk.quadraticCurveTo(-h, h, -h, h - r);
  bentuk.lineTo(-h, -h + r);
  bentuk.quadraticCurveTo(-h, -h, -h + r, -h);
  const lubang = new THREE.Path();
  lubang.absarc(0, 0, PEMUTAR.sumur, 0, Math.PI * 2, true);
  bentuk.holes.push(lubang);
  const geo = new THREE.ExtrudeGeometry(bentuk, {
    depth: PEMUTAR.tinggi - mm(2),
    bevelEnabled: true,
    bevelThickness: mm(1),
    bevelSize: mm(1),
    bevelSegments: 3,
    curveSegments: 48,
  });
  geo.rotateX(-Math.PI / 2);
  const grafit = pasangSheen(
    new THREE.MeshPhysicalMaterial({ color: 0x3a3c41, roughness: 0.38, metalness: 0.2, clearcoat: 0.5, envMapIntensity: 1.4 }),
    { kuat: 0.1 },
  );
  const badan = new THREE.Mesh(geo, grafit);
  grup.add(badan);
  const puncak = PEMUTAR.tinggi - mm(1);

  const lantai = new THREE.Mesh(
    new THREE.CircleGeometry(PEMUTAR.sumur, 96),
    new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.85 }),
  );
  lantai.rotation.x = -Math.PI / 2;
  lantai.position.y = mm(4);
  const cincin = new THREE.Mesh(
    new THREE.TorusGeometry(PEMUTAR.sumur + mm(1), mm(1.1), 12, 160),
    pasangSheen(new THREE.MeshPhysicalMaterial({ color: 0x2c2e33, metalness: 1, roughness: 0.32, clearcoat: 0.5, envMapIntensity: 0.6 }), { kuat: 0.1 }),
  );
  cincin.rotation.x = Math.PI / 2;
  cincin.position.y = puncak;
  const piring = new THREE.Mesh(
    new THREE.CylinderGeometry(mm(17), mm(17), mm(2), 48),
    new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.7 }),
  );
  // Puncak piringan 4,6 mm di bawah bibir; cakram (tebal 1,2 mm) duduk di atasnya.
  piring.position.y = puncak - mm(5.6);
  for (let k = 0; k < 3; k++) {
    const bola = new THREE.Mesh(
      new THREE.SphereGeometry(mm(1.4), 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 1, roughness: 0.1 }),
    );
    const a = (k / 3) * Math.PI * 2;
    bola.position.set(Math.cos(a) * mm(6.2), puncak - mm(4), Math.sin(a) * mm(6.2));
    grup.add(bola);
  }
  const lensa = new THREE.Mesh(
    new THREE.SphereGeometry(mm(3), 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0x223, metalness: 0.2, roughness: 0.1, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 500] }),
  );
  lensa.position.set(mm(32), mm(4), 0);
  grup.add(lantai, cincin, piring, lensa);

  // Layar dot-matrix dan empat tombol di sisi depan.
  const layar = layarPemutar(renderer);
  const muka = new THREE.Mesh(new THREE.PlaneGeometry(mm(58), mm(11)), new THREE.MeshBasicMaterial({ map: layar.tekstur, toneMapped: false }));
  muka.position.set(-mm(22), puncak / 2, h + mm(1.05));
  const kaca = new THREE.Mesh(
    new THREE.PlaneGeometry(mm(62), mm(13)),
    pasangSheen(new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.25, roughness: 0.05, clearcoat: 1 }), { kuat: 0.15, alfa: 0.4 }),
  );
  kaca.position.set(-mm(22), puncak / 2, h + mm(1.2));
  grup.add(muka, kaca);

  const simbol = { prev: "⏮", play: "▶", pause: "⏸", next: "⏭" };
  const tombol = ["prev", "play", "pause", "next"].map((nama, k) => {
    const b = new THREE.Mesh(
      new RoundedBoxGeometry(mm(9), mm(7), mm(2), 2, mm(1)),
      new THREE.MeshPhysicalMaterial({ color: 0x2a2b2f, roughness: 0.4, clearcoat: 0.4 }),
    );
    b.position.set(mm(16) + k * mm(11.6), puncak / 2, h + mm(1));
    b.userData.tombol = nama;
    b.userData.dasarZ = b.position.z;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#ece3d4";
    g.font = "36px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(simbol[nama], 32, 34);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(mm(6), mm(6)),
      new THREE.MeshBasicMaterial({ map: tekstur(c, renderer), transparent: true, opacity: 0.5, toneMapped: false }),
    );
    label.position.z = mm(1.05);
    label.userData.tombol = nama;
    b.add(label);
    b.userData.label = label;
    grup.add(b);
    return b;
  });

  // Lubang pengeras suara di sisi kiri: 4 baris, jarak 2,4 mm.
  const lubangGeo = new THREE.CircleGeometry(mm(0.7), 10);
  const lubangBahan = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const jumlah = 4 * 14;
  const speaker = new THREE.InstancedMesh(lubangGeo, lubangBahan, jumlah);
  const mtx = new THREE.Matrix4();
  let n = 0;
  for (let b = 0; b < 4; b++) {
    for (let k = 0; k < 14; k++) {
      mtx.makeRotationY(-Math.PI / 2).setPosition(-h - mm(1.05), mm(4) + b * mm(2.4), -mm(16) + k * mm(2.4));
      speaker.setMatrixAt(n++, mtx);
    }
  }
  grup.add(speaker);

  const lampu = new THREE.Mesh(new THREE.CircleGeometry(mm(1), 16), new THREE.MeshBasicMaterial({ color: 0xe0574b, toneMapped: false }));
  lampu.position.set(h - mm(6), puncak / 2, h + mm(1.1));
  grup.add(lampu);

  // Bayangan kontak: kanvas dengan shadowBlur, digambar di luar kanvas lalu digeser masuk.
  const cb = document.createElement("canvas");
  cb.width = cb.height = 256;
  const gb = cb.getContext("2d");
  for (const [blur, alpha] of [[40, 0.35], [12, 0.6]]) {
    gb.save();
    gb.shadowColor = `rgba(0,0,0,${alpha})`;
    gb.shadowBlur = blur;
    gb.shadowOffsetX = 1000;
    gb.beginPath();
    gb.roundRect(64 - 1000, 64, 128, 128, 14);
    gb.fill();
    gb.restore();
  }
  const bayangan = new THREE.Mesh(
    new THREE.PlaneGeometry(s * 2, s * 2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cb), transparent: true, opacity: 0.3, depthWrite: false }),
  );
  bayangan.rotation.x = -Math.PI / 2;
  bayangan.position.y = -mm(1.5);
  grup.add(bayangan);

  return { grup, layar, tombol, lampu, puncakY: puncak + mm(3), kursiY: puncak - mm(4) };
}

export { gambarHalaman };
