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

// Panel: styleframe apa adanya (tanpa tone mapping), diredupkan oleh jarak dan lampu set,
// dan untuk beat grading dibelah: kiri hangat, kanan abu-abu mentah, dipisah garis merah.
const vertPanel = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragPanel = /* glsl */ `
  uniform sampler2D peta;
  uniform float terang;
  uniform float garis;
  uniform vec3 aksen;
  varying vec2 vUv;
  void main() {
    vec4 w = texture2D(peta, vUv);
    vec3 c = w.rgb;
    if (garis >= 0.0) {
      float abu = dot(c, vec3(0.299, 0.587, 0.114));
      vec3 mentah = mix(vec3(abu), c, 0.12) * 0.82 + 0.06;
      c = vUv.x < garis ? c : mentah;
      float tepi = 1.0 - smoothstep(0.0012, 0.0026, abs(vUv.x - garis));
      if (garis > 0.002 && garis < 0.998) c = mix(c, aksen, tepi);
    }
    gl_FragColor = vec4(c * terang, 1.0);
    #include <colorspace_fragment>
  }
`;

function bahanPanel() {
  return new THREE.ShaderMaterial({
    uniforms: {
      peta: { value: null },
      terang: { value: 0 },
      garis: { value: -1 },
      aksen: { value: new THREE.Color(AKSEN) },
    },
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

// Kain beludru merah: lipatan tegak dari gradien berulang, cukup untuk dibaca sebagai tirai.
function teksturTirai() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 64;
  const g = c.getContext("2d");
  const lipat = g.createLinearGradient(0, 0, 512, 0);
  for (let i = 0; i <= 8; i++) {
    lipat.addColorStop(i / 8, i % 2 ? "#5e0c0d" : "#a3191a");
  }
  g.fillStyle = lipat;
  g.fillRect(0, 0, 512, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
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

  // Panel styleframe: gambar, bingkai flat set yang gelap, dan genangan lampu di depannya.
  const pemuat = new THREE.TextureLoader();
  const geoPanel = new THREE.PlaneGeometry(PANEL.w, PANEL.h);
  const geoBingkai = new THREE.BoxGeometry(PANEL.w + 0.5, PANEL.h + 0.5, 0.3);
  const bahanBingkai = new THREE.MeshStandardMaterial({ color: 0x1b1916, roughness: 0.9 });
  const genangan = teksturGenangan();
  const panel = STASIUN.map((st, i) => {
    const grup = new THREE.Group();
    grup.position.set(st.x, st.y, st.z);
    const bingkai = new THREE.Mesh(geoBingkai, bahanBingkai);
    bingkai.position.z = -0.17;
    const bahan = bahanPanel();
    pemuat.load(`/assets/cerita/${BABAK[i + 1].gambar}.webp`, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      bahan.uniforms.peta.value = t;
      ubah();
    });
    const gambar = new THREE.Mesh(geoPanel, bahan);
    grup.add(bingkai, gambar);
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
  const bahanTirai = new THREE.MeshStandardMaterial({ map: kain, roughness: 0.95, color: 0xffffff });
  const tirai = [-1, 1].map((sisi) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(lebarCelah / 2, tinggiCelah), bahanTirai);
    m.position.set(celah.x + (sisi * lebarCelah) / 4, celah.y, celah.z + 0.1);
    scene.add(m);
    return { m, sisi };
  });
  // Cahaya beige di balik tirai: warna panggung rak, yang nanti mengisi layar.
  const cahayaRak = new THREE.Mesh(
    new THREE.PlaneGeometry(lebarCelah, tinggiCelah),
    new THREE.MeshBasicMaterial({ color: 0xe9e1d3, transparent: true, opacity: 0, toneMapped: false }),
  );
  cahayaRak.position.set(celah.x, celah.y, celah.z + 0.05);
  scene.add(cahayaRak);

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
      pn.bahan.uniforms.garis.value = i === iRapi ? s.sibak : -1;
      pn.cahaya.material.opacity = redupJauh * (i === iFondasi ? s.terang : 1);
    });

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

    renderer.render(scene, kamera);
  }

  return {
    gambar,
    ukur,
    hapus() {
      renderer.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const bahan = Array.isArray(o.material) ? o.material : [o.material];
        for (const b of bahan) {
          if (!b) continue;
          for (const v of Object.values(b)) if (v?.isTexture) v.dispose();
          if (b.uniforms?.peta?.value) b.uniforms.peta.value.dispose();
          b.dispose();
        }
      });
      renderer.domElement.remove();
    },
  };
}
