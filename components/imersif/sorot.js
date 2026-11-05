// Sorot proyektor: kerucut cahaya dari sumur pemutar ke tepi atas layar hologram.
// Volumetriknya palsu tapi murah: satu kerucut terbuka dengan shader transparan. Tepinya
// memudar menurut sudut pandang (fresnel), cahaya melemah ke atas, asap dan debu
// hanyut naik dari derau 3D, garis pindai tipis, dan pinggiran sedikit berwarna.
import * as THREE from "three";

// Kedip lampu proyektor, 0..1,1. Sebagian besar waktu nyaris tenang; tiap beberapa
// detik ada redup singkat lalu lonjakan kecil, seperti tabung yang tidak stabil.
// Deterministik terhadap t supaya bisa dites dan tidak berbeda per bingkai.
export function kedip(t) {
  const getar = 0.975 + 0.025 * Math.sin(t * 47.0) * Math.sin(t * 13.3);
  const slot = Math.floor(t / 3.7);
  const acak = hash(slot);
  const awal = slot * 3.7 + acak * 2.6;
  const u = t - awal;
  let lonjak = 1;
  if (u >= 0 && u < 0.08) lonjak = 0.62;
  else if (u >= 0.08 && u < 0.14) lonjak = 1.08;
  else if (acak > 0.6 && u >= 0.22 && u < 0.27) lonjak = 0.8;
  return getar * lonjak;
}

function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Titik ujung sorot dalam koordinat layar ternormalisasi (0..1, y ke bawah) dari kotak
// panel hologram dan kotak kanvas. Sorot sedikit melewati tepi atas panel dan sedikit
// lebih lebar darinya, supaya sisi kerucut terlihat membungkus panel lalu larut ke atas.
// Bentuknya ikut panel saat panel membesar, mengecil, atau bergoyang.
export const LEBIH = { atas: 0.14, lebar: 1.3 };
export function ujungSorot(panel, kanvas) {
  if (!panel || !kanvas || kanvas.width <= 0 || kanvas.height <= 0 || panel.width <= 0) return null;
  const x = (panel.left + panel.width / 2 - kanvas.left) / kanvas.width;
  const y = (panel.top - panel.height * LEBIH.atas - kanvas.top) / kanvas.height;
  const w = (panel.width / 2) * LEBIH.lebar / kanvas.width;
  return { x, y, w };
}

const vertex = /* glsl */ `
uniform float uBawah;
uniform float uAtas;
varying vec2 vUv;
varying vec3 vDunia;
varying vec3 vNormal;
varying vec3 vPandang;
void main() {
  vUv = uv;
  vec3 p = position;
  float r = mix(uBawah, uAtas, uv.y);
  p.xz *= r;
  vec4 dunia = modelMatrix * vec4(p, 1.0);
  vDunia = dunia.xyz;
  vNormal = normalize(mat3(modelMatrix) * vec3(normal.x, 0.0, normal.z));
  vPandang = cameraPosition - dunia.xyz;
  gl_Position = projectionMatrix * viewMatrix * dunia;
}
`;

const fragment = /* glsl */ `
uniform float uWaktu;
uniform float uKuat;
uniform float uKedip;
uniform float uSkala;
uniform vec3 uWarna;
varying vec2 vUv;
varying vec3 vDunia;
varying vec3 vNormal;
varying vec3 vPandang;

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float derau(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * derau(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}

void main() {
  float v = vUv.y;
  vec3 n = normalize(vNormal);
  vec3 pandang = normalize(vPandang);
  // Tepi lembut: makin menyamping terhadap mata, makin tipis cahayanya.
  float fres = abs(dot(n, pandang));
  float tepi = pow(fres, 1.7);
  // Terang di mulut sumur, melemah ke atas, dan larut sebelum menyentuh panel.
  float panjang = smoothstep(0.0, 0.16, v) * mix(1.0, 0.3, v) * (1.0 - smoothstep(0.7, 1.0, v));
  // Asap: derau 3D yang hanyut naik dan sedikit berputar.
  vec3 q = vDunia * uSkala * 2.2 - vec3(0.0, uWaktu * 0.18, uWaktu * 0.05);
  float asap = fbm(q);
  // Debu: bintik kecil yang naik lebih cepat dan berkelip.
  float bintik = derau(vDunia * uSkala * 34.0 - vec3(0.0, uWaktu * 0.9, 0.0));
  float debu = smoothstep(0.86, 0.95, bintik) * (0.5 + 0.5 * sin(uWaktu * 3.0 + bintik * 40.0));
  // Garis pindai yang merayap naik.
  float garis = 0.96 + 0.04 * sin(v * 140.0 - uWaktu * 5.0);
  float a = tepi * panjang * (0.35 + 0.9 * asap) * garis;
  // Pinggiran berwarna: tepi sedikit ke sian dan magenta, seperti lensa murah.
  float pinggir = 1.0 - fres;
  vec3 warna = uWarna * vec3(1.0 - 0.12 * pinggir * v, 1.0 - 0.06 * pinggir, 1.0 + 0.1 * pinggir * (1.0 - v));
  float kuat = uKuat * uKedip;
  float kabut = clamp(a * kuat * 0.95, 0.0, 1.0);
  float bintikA = clamp(debu * panjang * fres * kuat, 0.0, 1.0);
  // Kanvas transparan di atas latar CSS tidak bisa menambah cahaya (warna dipotong ke
  // alfa), jadi sorot dicampur sebagai warna terang dengan alfa yang benar.
  float alfa = clamp(kabut + bintikA * (1.0 - kabut), 0.0, 1.0);
  vec3 c = warna * kabut + vec3(1.0) * bintikA * (1.0 - kabut);
  gl_FragColor = vec4(c, alfa);
}
`;

export function buatSorot() {
  // Silinder satuan terbuka, alasnya di y = 0; jari-jari diatur di shader per ujung.
  const geo = new THREE.CylinderGeometry(1, 1, 1, 64, 24, true);
  geo.translate(0, 0.5, 0);
  const uniforms = {
    uWaktu: { value: 0 },
    uKuat: { value: 0 },
    uKedip: { value: 1 },
    uSkala: { value: 1 },
    uBawah: { value: 0.1 },
    uAtas: { value: 1 },
    // Mint pucat: lebih terang dari latar krem di kanal hijau, jadi terbaca sebagai cahaya.
    uWarna: { value: new THREE.Color(0.86, 1, 0.9) },
  };
  const bahan = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, bahan);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.renderOrder = 10;

  const atas = new THREE.Vector3();
  const sumbu = new THREE.Vector3();
  const naik = new THREE.Vector3(0, 1, 0);
  const tepiKanan = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  return {
    mesh,
    uniforms,
    // dari: titik sumur di dunia. ujung: {x,y,w} layar ternormalisasi. jariBawah: dunia.
    pasang(dari, ujung, jariBawah, camera, skalaDunia = 1) {
      // Ujung atas diletakkan di kedalaman yang sama dengan sumur, di titik layar panel.
      const z = tmp.copy(dari).project(camera).z;
      atas.set(ujung.x * 2 - 1, 1 - ujung.y * 2, z).unproject(camera);
      tepiKanan.set((ujung.x + ujung.w) * 2 - 1, 1 - ujung.y * 2, z).unproject(camera);
      sumbu.subVectors(atas, dari);
      const panjang = sumbu.length();
      if (panjang < 1e-4) return false;
      mesh.position.copy(dari);
      mesh.quaternion.setFromUnitVectors(naik, sumbu.divideScalar(panjang));
      mesh.scale.set(1, panjang, 1);
      uniforms.uBawah.value = jariBawah;
      uniforms.uAtas.value = tepiKanan.distanceTo(atas);
      uniforms.uSkala.value = 1 / skalaDunia;
      return true;
    },
    dispose() {
      geo.dispose();
      bahan.dispose();
    },
  };
}
