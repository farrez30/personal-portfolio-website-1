// Dunia cerita gulir v3 (ADR 0013): soundstage gelap berisi sepuluh panel styleframe yang berdiri
// di lantai, benang merah 3D yang menyambungkan semuanya, dan di ujungnya kotak CD sungguhan yang
// masuk ke rak sebelum tirai terbuka. Semua gerak dibaca dari keadaanPada() di naskah.js; berkas
// ini hanya menerjemahkan keadaan itu ke adegan.
import * as THREE from "three";
import { STASIUN, PANEL, FOV, BABAK } from "./naskah";
import { buatKotak, buatLingkungan } from "@/components/imersif/benda";
import { gambarAus } from "@/components/imersif/gambar";

const GELAP = 0x0b0a09;
const AKSEN = 0xe0574b;
// Celah tirai di styleframe rilis (koordinat gambar 0 sampai 1).
const CELAH = { x: [0.41, 0.59], y: [0.19, 0.63] };

// Layar produk asli di monitor styleframe (piksel gambar 1376 x 768). `sudut` berurutan kiri
// atas, kanan atas, kanan bawah, kiri bawah; `tutup` kotak benda di depan layar (ponsel di gimbal,
// kamera kecil) dan `potong` garis tepi kepala editor: piksel di kanan garis tetap styleframe.
// `jenis` menentukan cara tempelnya: layar menyala (bawaan), sorot proyektor, atau kertas, yang
// tintanya dikalikan ke warna kertas di bawahnya (daftar kebutuhan bab 2, sketsa layar bab 3), atau
// bersih: layar menutup penuh tanpa pantulan isi lama.
// Satu panel memakai satu jenis. Asal tangkapan di public/assets/cerita/PROVENANCE.md.
const UKURAN = [1376, 768];
const LAYAR = {
  "01-ide": [
    {
      // Rapat Google Meet di laptop meja: keluhan diceritakan lewat panggilan.
      src: "layar-01",
      sudut: [[490, 367], [714, 359], [730, 504], [505, 525]],
      // Tepi bawah kap lampu yang menutupi pojok kiri atas layar.
      potong: [[490, 378], [575, 360]],
    },
  ],
  "02-naskah": [
    {
      src: "kertas-02",
      jenis: "kertas",
      sudut: [[293, 252], [549, 215], [592, 375], [310, 412]],
      // Batang penjepit kertas di depan halaman: yang di bawah garis ini tetap mesin tik.
      potong: [[603, 346], [300, 395]],
    },
  ],
  "03-storyboard": [
    { src: "sketsa-03a", jenis: "kertas", sudut: [[190, 215], [264, 218], [263, 266], [191, 267]] },
    { src: "sketsa-03b", jenis: "kertas", sudut: [[405, 243], [435, 245], [440, 320], [412, 322]] },
  ],
  "05-syuting": [
    {
      src: "layar-05",
      sudut: [[621, 311], [875, 311], [875, 475], [621, 475]],
      tutup: [[817, 296, 990, 379], [600, 343, 632, 428]],
    },
  ],
  "06-editing": [
    // Kedua layar bertema terang, jadi tangkapannya sudah diredupkan (PROVENANCE) supaya senada
    // dengan monitor gelap di styleframe. Sudut ditarik masuk 2 px dari bingkai.
    { src: "layar-06a", jenis: "bersih", sudut: [[363, 318], [603, 325], [603, 478], [365, 510]] },
    // Layar kanan menerus sampai tepi monitor; kepala editor yang menutupinya diambil dari peta
    // kedalaman (batasDalam), bukan garis lurus, jadi tidak tersisa pita timeline lama di sela
    // layar dan kepala.
    { src: "layar-06b", jenis: "bersih", batasDalam: 0.55, sudut: [[619, 326], [841, 329], [843, 462], [622, 475]] },
  ],
  // Monitor grading bab 7 menampilkan layar yang sama dalam dua versi: rancangan rapi (kiri garis,
  // berwarna) dan versi buruk ala AI slop (kanan garis, setengah pudar). Garis sibak menggeser
  // keduanya; sumber HTML-nya di desain/cerita-v3/layar-07/. Mode Ringan memakai versi terbelah.
  "07-grading": [
    { src: "layar-07a", jenis: "bersih", belah: true, ringan: "layar-07-belah", sudut: [[588, 214], [1112, 206], [1108, 500], [588, 486]] },
    { src: "layar-07b", jenis: "bersih", sudut: [[588, 214], [1112, 206], [1108, 500], [588, 486]] },
  ],
  "08-screening": [{ src: "layar-08", jenis: "proyektor", sudut: [[558, 265], [843, 265], [843, 430], [558, 430]] }],
};

// Homografi dari piksel gambar ke koordinat tekstur layar (0 sampai 1, v ke atas), dari empat
// sudut. Sistem 8 persamaan diselesaikan dengan eliminasi Gauss; hasilnya Matrix3.
function homografi(sudut) {
  const tujuan = [[0, 1], [1, 1], [1, 0], [0, 0]];
  const A = [];
  sudut.forEach(([x, y], i) => {
    const [u, v] = tujuan[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  });
  for (let k = 0; k < 8; k++) {
    let m = k;
    for (let r = k + 1; r < 8; r++) if (Math.abs(A[r][k]) > Math.abs(A[m][k])) m = r;
    [A[k], A[m]] = [A[m], A[k]];
    for (let r = 0; r < 8; r++) {
      if (r === k) continue;
      const f = A[r][k] / A[k][k];
      for (let c = k; c < 9; c++) A[r][c] -= f * A[k][c];
    }
  }
  const h = A.map((r, i) => r[8] / r[i]);
  return new THREE.Matrix3().set(h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1);
}

// Panel: styleframe apa adanya (tanpa tone mapping), diredupkan oleh jarak dan lampu set.
// Di beat grading hanya layar monitornya yang dibelah garis merah: kiri layar rapi, kanan layar
// buruk yang setengah pudar.
// Tepinya memudar ke gelap studio supaya panel terbaca sebagai bagian ruangan, bukan foto
// berbingkai, dan panel yang jauh dari kamera diburamkan lewat mipmap (kedalaman ruang murah).
// Paralaks 2.5D: jaring panel didorong maju menurut peta kedalaman styleframe (Depth Anything V2
// Small, public/assets/cerita/PROVENANCE.md), jadi orang dan meja di depan bergeser terhadap latar
// saat kamera bergerak. Terang di peta berarti dekat.
const vertPanel = /* glsl */ `
  uniform sampler2D dalam;
  uniform float tebal;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(dalam, uv).r * tebal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragPanel = /* glsl */ `
  uniform sampler2D peta;
  uniform float terang;
  uniform float garis;
  uniform float kabur;
  uniform vec3 aksen;
  uniform vec2 ukuran;
  uniform int jumlahLayar;
  uniform sampler2D layar0;
  uniform sampler2D layar1;
  uniform mat3 h0;
  uniform mat3 h1;
  uniform vec4 tutup0[2];
  uniform vec4 tutup1[2];
  uniform vec4 potong0;
  uniform vec4 potong1;
  uniform float jenis;
  uniform sampler2D dalam;
  uniform float batasDalam;
  varying vec2 vUv;

  // 0 di luar layar, 1 di dalamnya, dengan tepi halus satu dua piksel.
  float tertutup(vec2 px, vec4 t) {
    return px.x > t.x && px.x < t.z && px.y > t.y && px.y < t.w ? 1.0 : 0.0;
  }

  float dalamLayar(mat3 h, vec2 px, vec4 t0, vec4 t1, vec4 potong, out vec2 suv) {
    vec3 q = h * vec3(px, 1.0);
    suv = q.xy / q.z;
    vec2 jarak = min(suv, 1.0 - suv);
    float m = smoothstep(0.0, 0.006, min(jarak.x, jarak.y));
    m *= (1.0 - tertutup(px, t0)) * (1.0 - tertutup(px, t1));
    // Benda yang lebih dekat dari monitor (kepala di depan layar) menutup layar menurut siluetnya.
    if (batasDalam > 0.0) m *= 1.0 - smoothstep(batasDalam - 0.03, batasDalam + 0.03, texture2D(dalam, vUv).r);
    // Garis potong dari (x0, y0) ke (x1, y1): sisi kanannya milik benda di depan layar.
    // Tanpa garis potong, garisnya diletakkan jauh di kanan gambar (nilai awal uniform). Jangan
    // pakai Vector4() kosong: w-nya 1, jadi garisnya jatuh di tepi kiri dan seluruh layar hilang.
    vec2 a = potong.xy;
    vec2 b = potong.zw;
    float sisi = (b.x - a.x) * (px.y - a.y) - (b.y - a.y) * (px.x - a.x);
    m *= smoothstep(-150.0, 150.0, sisi);
    return m;
  }

  // Layar ikut grade styleframe: sedikit pudar dan hangat, dengan pantulan gambar aslinya.
  // Kertas: tinta dikalikan ke warna kertas yang diburamkan, jadi coretan lama di bawahnya hilang
  // tetapi serat dan bayangan kertasnya tetap.
  vec3 tempel(vec3 c, sampler2D layarPeta, vec2 suv, float m) {
    vec3 l = texture2D(layarPeta, suv, kabur + 0.6).rgb;
    // Bersih: layar menutup penuh tanpa pantulan gambar asli, supaya isi lama styleframe (timeline,
    // foto laptop) tidak membayang di balik layar baru.
    if (jenis > 2.5) return mix(c, l * vec3(0.86, 0.83, 0.8), m);
    if (jenis > 1.5) {
      vec3 kertas = texture2D(peta, vUv, 4.0).rgb;
      return mix(c, kertas * l, m);
    }
    float abu = dot(l, vec3(0.299, 0.587, 0.114));
    vec3 hangat = mix(l, vec3(abu) * vec3(1.04, 0.95, 0.82), jenis > 0.5 ? 0.55 : 0.28);
    vec3 layar = hangat * (jenis > 0.5 ? vec3(0.86, 0.74, 0.58) : vec3(0.6)) + c * 0.18;
    return mix(c, layar, m);
  }

  void main() {
    vec4 w = texture2D(peta, vUv, kabur);
    vec3 c = w.rgb;
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * ukuran;
    vec2 suv;
    if (garis >= 0.0 && jumlahLayar > 1) {
      // Satu layar, dua versi: garis di koordinat layar (0 kiri, 1 kanan).
      float m = dalamLayar(h0, px, tutup0[0], tutup0[1], potong0, suv);
      if (m > 0.0) {
        vec3 rapi = tempel(c, layar0, suv, m);
        vec3 buruk = tempel(c, layar1, suv, m);
        float abu = dot(buruk, vec3(0.299, 0.587, 0.114));
        buruk = mix(vec3(abu), buruk, 0.35) * 0.9;
        c = suv.x < garis ? rapi : buruk;
        float tepi = 1.0 - smoothstep(0.003, 0.006, abs(suv.x - garis));
        if (garis > 0.002 && garis < 0.998) c = mix(c, aksen, tepi * m);
      }
    } else {
      if (jumlahLayar > 0) {
        float m = dalamLayar(h0, px, tutup0[0], tutup0[1], potong0, suv);
        if (m > 0.0) c = tempel(c, layar0, suv, m);
      }
      if (jumlahLayar > 1) {
        float m = dalamLayar(h1, px, tutup1[0], tutup1[1], potong1, suv);
        if (m > 0.0) c = tempel(c, layar1, suv, m);
      }
    }
    float tepi = smoothstep(0.0, 0.1, vUv.x) * smoothstep(0.0, 0.1, 1.0 - vUv.x)
      * smoothstep(0.0, 0.16, vUv.y) * smoothstep(0.0, 0.12, 1.0 - vUv.y);
    gl_FragColor = vec4(c * terang, tepi);
    #include <colorspace_fragment>
  }
`;

function bahanPanel() {
  return new THREE.ShaderMaterial({
    uniforms: {
      peta: { value: null },
      terang: { value: 0 },
      garis: { value: -1 },
      kabur: { value: 0 },
      aksen: { value: new THREE.Color(AKSEN) },
      ukuran: { value: new THREE.Vector2(...UKURAN) },
      jumlahLayar: { value: 0 },
      layar0: { value: null },
      layar1: { value: null },
      h0: { value: new THREE.Matrix3() },
      h1: { value: new THREE.Matrix3() },
      tutup0: { value: [new THREE.Vector4(), new THREE.Vector4()] },
      tutup1: { value: [new THREE.Vector4(), new THREE.Vector4()] },
      potong0: { value: new THREE.Vector4(1e4, 0, 1e4, 1e4) },
      potong1: { value: new THREE.Vector4(1e4, 0, 1e4, 1e4) },
      jenis: { value: 0 },
      batasDalam: { value: 0 },
      dalam: { value: null },
      tebal: { value: 0 },
    },
    transparent: true,
    vertexShader: vertPanel,
    fragmentShader: fragPanel,
  });
}

// Genangan cahaya lampu di lantai depan tiap panel: gradien radial hangat, digambar sekali.
function teksturGenangan() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(255,196,128,0.55)");
  r.addColorStop(0.45, "rgba(255,170,100,0.18)");
  r.addColorStop(1, "rgba(255,160,90,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Kain beludru merah: warna dasar dengan kilap tipis di punggung lipatan dan bayangan yang
// menggelap ke atas dan ke bawah. Lipatannya sendiri ada di geometri (lihat tirai di bawah),
// jadi cahaya kunci yang ikut kamera membentuknya.
function teksturTirai() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const lipat = g.createLinearGradient(0, 0, 256, 0);
  for (let i = 0; i <= 12; i++) lipat.addColorStop(i / 12, i % 2 ? "#6d1011" : "#9c1a1b");
  g.fillStyle = lipat;
  g.fillRect(0, 0, 256, 256);
  const naik = g.createLinearGradient(0, 0, 0, 256);
  naik.addColorStop(0, "rgba(20,4,4,0.7)");
  naik.addColorStop(0.25, "rgba(20,4,4,0)");
  naik.addColorStop(0.8, "rgba(20,4,4,0)");
  naik.addColorStop(1, "rgba(20,4,4,0.55)");
  g.fillStyle = naik;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Sorot lampu gantung: trapesium terang di puncak yang melebar dan memudar ke lantai.
function teksturSorot() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d");
  const data = g.createImageData(128, 256);
  for (let y = 0; y < 256; y++) {
    const v = y / 255;
    const lebar = 0.08 + v * 0.42;
    for (let x = 0; x < 128; x++) {
      const u = Math.abs(x / 127 - 0.5);
      const sisi = Math.max(0, 1 - u / lebar);
      const a = Math.pow(sisi, 1.6) * Math.pow(1 - v, 1.3) * 0.5;
      const i = (y * 128 + x) * 4;
      data.data[i] = 255;
      data.data[i + 1] = 206;
      data.data[i + 2] = 150;
      data.data[i + 3] = a * 255;
    }
  }
  g.putImageData(data, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Satu bintik debu: bulatan lembut.
function teksturBintik() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, "rgba(255,230,200,1)");
  r.addColorStop(0.4, "rgba(255,220,180,0.35)");
  r.addColorStop(1, "rgba(255,220,180,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

// Cahaya panggung rak di balik tirai: beige yang lebih terang di tengah, bukan bidang rata.
function teksturRak() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 54, 4, 64, 64, 92);
  r.addColorStop(0, "#fff8ec");
  r.addColorStop(0.55, "#efe7d9");
  r.addColorStop(1, "#d9cdb9");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Acak berbenih: letak debu sama di setiap kunjungan.
function acakBenih(benih) {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Jalur benang di lantai: lewat depan tiap panel, sedikit melengkung di celah antarpanel.
function jalurBenang() {
  const titik = [];
  STASIUN.forEach((st, i) => {
    titik.push(new THREE.Vector3(st.x - PANEL.w * 0.35, 0.04, st.z + 2.4));
    titik.push(new THREE.Vector3(st.x + PANEL.w * 0.35, 0.04, st.z + 2.4));
    const next = STASIUN[i + 1];
    if (next) titik.push(new THREE.Vector3((st.x + next.x) / 2, 0.04, Math.max(st.z, next.z) + 5));
  });
  return new THREE.CatmullRomCurve3(titik, false, "catmullrom", 0.4);
}

function titikPanel(i, x, y, maju = 0) {
  const st = STASIUN[i];
  return new THREE.Vector3(st.x + (x - 0.5) * PANEL.w, st.y + (0.5 - y) * PANEL.h, st.z + maju);
}

export function buatDunia(wadah, { locale, kotak: proyekKotak = [], hp = false, ubah = () => {} }) {
  const renderer = new THREE.WebGLRenderer({ antialias: !hp, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, hp ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.1;
  wadah.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(GELAP);
  scene.fog = new THREE.Fog(GELAP, 26, 80);
  scene.environment = buatLingkungan(renderer);
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);

  // Cahaya: dasar redup, satu lampu kunci hangat yang ikut kamera dari kiri atas.
  scene.add(new THREE.HemisphereLight(0x4a4038, 0x0b0a09, 0.6));
  const kunci = new THREE.PointLight(0xffd2a1, 60, 30, 1.6);
  scene.add(kunci);

  // Lantai studio: beton setengah mengilap. Peta aus (noda di kanal hijau) jadi peta kekasaran,
  // jadi genangan lampu dipantulkan tidak rata seperti lantai soundstage sungguhan.
  const aus = new THREE.CanvasTexture(gambarAus(512, 23));
  aus.wrapS = aus.wrapT = THREE.RepeatWrapping;
  aus.repeat.set(36, 9);
  const lantai = new THREE.Mesh(
    new THREE.PlaneGeometry(STASIUN.at(-1).x + 120, 90),
    new THREE.MeshStandardMaterial({ color: 0x15130f, roughness: 1, roughnessMap: aus, metalness: 0 }),
  );
  lantai.rotation.x = -Math.PI / 2;
  lantai.position.set(STASIUN.at(-1).x / 2, 0, 0);
  scene.add(lantai);

  // Panel styleframe dan genangan lampu di depannya. Tanpa bingkai: tepi gambar sudah memudar.
  const pemuat = new THREE.TextureLoader();
  const geoPanel = new THREE.PlaneGeometry(PANEL.w, PANEL.h, hp ? 96 : 176, hp ? 54 : 99);
  // Seberapa jauh bagian terdekat maju dari bidang panel. Panel rilis tetap datar: kamera
  // mendorong sampai sekitar 3,6 satuan dari celah tirainya.
  const TEBAL = 1.3;
  const genangan = teksturGenangan();
  const panel = STASIUN.map((st, i) => {
    const grup = new THREE.Group();
    grup.position.set(st.x, st.y, st.z);
    const bahan = bahanPanel();
    pemuat.load(`/assets/cerita/${BABAK[i + 1].gambar}.webp`, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      bahan.uniforms.peta.value = t;
      ubah();
    });
    // Layar produk dipasang begitu semua tangkapannya termuat, supaya tidak berganti setengah.
    const daftar = LAYAR[BABAK[i + 1].gambar] ?? [];
    const termuat = [];
    daftar.forEach((l, j) => {
      const u = bahan.uniforms;
      u[`h${j}`].value = homografi(l.sudut);
      (l.tutup ?? []).forEach((t, k) => u[`tutup${j}`].value[k].set(...t));
      if (l.potong) u[`potong${j}`].value.set(...l.potong[0], ...l.potong[1]);
      u.jenis.value = { proyektor: 1, kertas: 2, bersih: 3 }[l.jenis] ?? 0;
      if (l.batasDalam) u.batasDalam.value = l.batasDalam;
      pemuat.load(`/assets/cerita/${l.src}.webp`, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        u[`layar${j}`].value = t;
        termuat.push(j);
        if (termuat.length === daftar.length) {
          u.jumlahLayar.value = daftar.length;
          ubah();
        }
      });
    });
    if (i < STASIUN.length - 1)
      pemuat.load(`/assets/cerita/dalam-${BABAK[i + 1].gambar}.webp`, (t) => {
        bahan.uniforms.dalam.value = t;
        bahan.uniforms.tebal.value = TEBAL;
        ubah();
      });
    const gambar = new THREE.Mesh(geoPanel, bahan);
    grup.add(gambar);
    scene.add(grup);
    const cahaya = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL.w * 1.1, 7),
      new THREE.MeshBasicMaterial({ map: genangan, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    cahaya.rotation.x = -Math.PI / 2;
    cahaya.position.set(st.x, 0.02, st.z + 3.2);
    scene.add(cahaya);
    return { grup, bahan, cahaya };
  });

  // Debu di udara studio, di antara kamera dan tiap panel. Diam di tempatnya; yang membuatnya
  // hidup adalah paralaks saat kamera bergerak, jadi tidak perlu menggambar ulang tiap bingkai.
  const acak = acakBenih(11);
  const perPanel = hp ? 70 : 160;
  const letakDebu = new Float32Array(STASIUN.length * perPanel * 3);
  STASIUN.forEach((st, i) => {
    for (let j = 0; j < perPanel; j++) {
      const k = (i * perPanel + j) * 3;
      letakDebu[k] = st.x + (acak() - 0.5) * PANEL.w * 1.3;
      letakDebu[k + 1] = 0.4 + acak() * 9.5;
      letakDebu[k + 2] = st.z + 0.8 + acak() * 10;
    }
  });
  const geoDebu = new THREE.BufferGeometry();
  geoDebu.setAttribute("position", new THREE.BufferAttribute(letakDebu, 3));
  scene.add(
    new THREE.Points(
      geoDebu,
      new THREE.PointsMaterial({
        map: teksturBintik(),
        color: 0xffd9b0,
        size: hp ? 0.11 : 0.09,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );

  // Lampu gantung di celah antarpanel: kap gelap, bohlam, sorot cahaya, dan genangan di lantai.
  // Yang terlihat saat kamera terbang dari satu set ke set berikutnya.
  const sorot = teksturSorot();
  const geoKap = new THREE.CylinderGeometry(0.35, 0.9, 0.7, 20, 1, true);
  const bahanKap = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.6, metalness: 0.5, side: THREE.DoubleSide });
  const bahanBohlam = new THREE.MeshBasicMaterial({ color: 0xffe2b8, toneMapped: false });
  const lampu = STASIUN.slice(0, -1).map((st, i) => {
    const x = (st.x + STASIUN[i + 1].x) / 2;
    const z = Math.max(st.z, STASIUN[i + 1].z) + 1.5;
    const kap = new THREE.Mesh(geoKap, bahanKap);
    kap.position.set(x, 10.6, z);
    const bohlam = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), bahanBohlam);
    bohlam.rotation.x = Math.PI / 2;
    bohlam.position.set(x, 10.3, z);
    const tali = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 8, 4), bahanKap);
    tali.position.set(x, 14.9, z);
    const berkas = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 10.4),
      new THREE.MeshBasicMaterial({ map: sorot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }),
    );
    berkas.position.set(x, 5.2, z);
    const kolam = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6),
      new THREE.MeshBasicMaterial({ map: genangan, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }),
    );
    kolam.rotation.x = -Math.PI / 2;
    kolam.position.set(x, 0.02, z);
    scene.add(kap, bohlam, tali, berkas, kolam);
    return berkas;
  });

  // Benang merah: tabung tipis bercahaya, panjangnya tumbuh mengikuti cerita.
  const jalur = jalurBenang();
  const geoBenang = new THREE.TubeGeometry(jalur, 900, 0.045, 8, false);
  const benang = new THREE.Mesh(
    geoBenang,
    new THREE.MeshStandardMaterial({ color: AKSEN, emissive: AKSEN, emissiveIntensity: 2.2, roughness: 0.4 }),
  );
  scene.add(benang);
  const jumlahIndeks = geoBenang.index.count;

  // Ujung cerita: kotak CD yang masuk satu per satu ke celah rak, lalu tirai membuka.
  const iRilis = STASIUN.length - 1;
  const celah = titikPanel(iRilis, (CELAH.x[0] + CELAH.x[1]) / 2, (CELAH.y[0] + CELAH.y[1]) / 2, 0.3);
  const kotak = proyekKotak.map((p, j) => {
    const k = buatKotak(p, locale, renderer, j);
    k.grup.visible = false;
    scene.add(k.grup);
    const awal = new THREE.Vector3(STASIUN[iRilis].x + (j - 1) * 2.2, 1.6, STASIUN[iRilis].z + 9);
    return { ...k, awal };
  });
  const lebarCelah = (CELAH.x[1] - CELAH.x[0]) * PANEL.w;
  const tinggiCelah = (CELAH.y[1] - CELAH.y[0]) * PANEL.h;
  const kain = teksturTirai();
  const bahanTirai = new THREE.MeshStandardMaterial({ map: kain, roughness: 0.75, color: 0xffffff, side: THREE.DoubleSide });
  // Tiap daun tirai punya lipatan sungguhan (gelombang di z), jadi saat dibuka dan dirapatkan
  // ke samping lipatannya ikut menumpuk seperti kain.
  const geoTirai = new THREE.PlaneGeometry(lebarCelah / 2, tinggiCelah, 64, 1);
  const pos = geoTirai.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 9) * 0.06);
  geoTirai.computeVertexNormals();
  const tirai = [-1, 1].map((sisi) => {
    const m = new THREE.Mesh(geoTirai, bahanTirai);
    m.position.set(celah.x + (sisi * lebarCelah) / 4, celah.y, celah.z + 0.1);
    scene.add(m);
    return { m, sisi };
  });
  // Cahaya panggung rak di balik tirai, yang nanti mengisi layar, dan tumpahannya ke sekitar celah.
  const cahayaRak = new THREE.Mesh(
    new THREE.PlaneGeometry(lebarCelah, tinggiCelah),
    new THREE.MeshBasicMaterial({ map: teksturRak(), transparent: true, opacity: 0, toneMapped: false }),
  );
  cahayaRak.position.set(celah.x, celah.y, celah.z + 0.05);
  const tumpahan = new THREE.Mesh(
    new THREE.PlaneGeometry(lebarCelah * 3, tinggiCelah * 1.8),
    new THREE.MeshBasicMaterial({ map: genangan, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  tumpahan.position.set(celah.x, celah.y, celah.z + 0.2);
  scene.add(cahayaRak, tumpahan);

  let lebar = 1;
  let tinggi = 1;
  function ukur() {
    const r = wadah.getBoundingClientRect();
    lebar = Math.max(1, r.width);
    tinggi = Math.max(1, r.height);
    renderer.setSize(lebar, tinggi, false);
    kamera.aspect = lebar / tinggi;
    // Layar tegak: panel tetap setinggi layar, sisi kiri kanan terpotong seperti cover.
    kamera.fov = FOV;
    kamera.updateProjectionMatrix();
  }
  ukur();

  const sasaran = new THREE.Vector3();
  const sementara = new THREE.Vector3();
  const iFondasi = BABAK.findIndex((b) => b.id === "fondasi") - 1;
  const iRapi = BABAK.findIndex((b) => b.id === "rapi") - 1;
  const iAndal = BABAK.findIndex((b) => b.id === "andal") - 1;

  function gambar(s, waktu) {
    kamera.position.fromArray(s.posisi);
    sasaran.fromArray(s.sasaran);
    if (s.getar > 0) {
      // Kamera tangan: goyang kecil yang tidak berulang pendek.
      const t = waktu / 1000;
      const g = s.getar * 0.06;
      kamera.position.x += Math.sin(t * 1.7) * g + Math.sin(t * 3.1) * g * 0.4;
      kamera.position.y += Math.sin(t * 2.3) * g * 0.7;
    }
    kamera.lookAt(sasaran);
    kunci.position.set(kamera.position.x - 4, kamera.position.y + 4, kamera.position.z - 2);

    panel.forEach((pn, i) => {
      const jarak = sementara.copy(pn.grup.position).distanceTo(kamera.position);
      const redupJauh = 1 - THREE.MathUtils.smoothstep(jarak, 24, 75) * 0.85;
      let terang = redupJauh;
      if (i === iFondasi) terang *= s.terang;
      if (i === iAndal && s.sendat) terang *= 0.25;
      pn.bahan.uniforms.terang.value = terang;
      pn.bahan.uniforms.garis.value = i === iRapi ? 0.15 + 0.85 * s.sibak : -1;
      // Fokus di panel yang sedang didekati (jarak D0 / s, sekitar 9 sampai 14); makin jauh makin
      // buram. Bias mipmap di atas 1,6 mulai terlihat kotak-kotak di gambar pembuka.
      pn.bahan.uniforms.kabur.value = THREE.MathUtils.smoothstep(jarak, 18, 44) * 1.6;
      pn.cahaya.material.opacity = redupJauh * (i === iFondasi ? s.terang : 1);
    });

    // Sorot lampu menghadap kamera di sumbu tegak, jadi selalu terbaca sebagai berkas cahaya.
    for (const b of lampu) b.rotation.y = Math.atan2(kamera.position.x - b.position.x, kamera.position.z - b.position.z);

    geoBenang.setDrawRange(0, Math.floor(jumlahIndeks * s.benang / 3) * 3);

    kotak.forEach((k, j) => {
      const t = s.kotak[j] ?? 0;
      k.grup.visible = t > 0 && t < 1;
      if (!k.grup.visible) return;
      const e = t * t * (3 - 2 * t);
      k.grup.position.lerpVectors(k.awal, celah, e);
      k.grup.position.y += Math.sin(Math.PI * e) * 1.2;
      const skala = THREE.MathUtils.lerp(1.6, 0.35, e);
      k.grup.scale.setScalar(skala);
      k.grup.rotation.set(-0.15 * (1 - e), (j - 1) * 0.5 * (1 - e), 0);
    });

    for (const { m, sisi } of tirai) {
      m.scale.x = 1 - s.tirai * 0.92;
      m.position.x = celah.x + sisi * (lebarCelah / 4 + (s.tirai * lebarCelah) / 4 * 0.92);
    }
    cahayaRak.material.opacity = s.tirai;
    tumpahan.material.opacity = s.tirai * 0.7;

    renderer.render(scene, kamera);
  }

  // Pemanasan selagi seksi masih di bawah layar (pola siapkan() rak, PR #54): shader semua benda,
  // termasuk kotak yang masih tersembunyi, dikompilasi paralel, lalu tekstur diunggah satu per
  // bingkai. Tanpa ini gambar pertama membeku sekitar 550 ms tepat saat kamera dunia toko
  // kaset terbang ke dinding catatan sampul.
  let panas = null;
  function panaskan() {
    panas ??= (async () => {
      const tersembunyi = [];
      scene.traverse((o) => {
        if (!o.visible) {
          tersembunyi.push(o);
          o.visible = true;
        }
      });
      try {
        await renderer.compileAsync(scene, kamera);
      } catch {}
      for (const o of tersembunyi) o.visible = false;
      const tx = new Set();
      scene.traverse((o) =>
        [].concat(o.material ?? []).forEach((b) => {
          for (const v of Object.values(b)) if (v?.isTexture) tx.add(v);
          for (const u of Object.values(b.uniforms ?? {})) if (u?.value?.isTexture) tx.add(u.value);
        }),
      );
      for (const t of tx) {
        if (t.image) renderer.initTexture(t);
        await new Promise((r) => requestAnimationFrame(r));
      }
    })();
    return panas;
  }

  return {
    gambar,
    ukur,
    panaskan,
    hapus() {
      renderer.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const bahan = Array.isArray(o.material) ? o.material : [o.material];
        for (const b of bahan) {
          if (!b) continue;
          for (const v of Object.values(b)) if (v?.isTexture) v.dispose();
          for (const k of ["peta", "layar0", "layar1", "dalam"]) b.uniforms?.[k]?.value?.dispose?.();
          b.dispose();
        }
      });
      renderer.domElement.remove();
    },
  };
}
