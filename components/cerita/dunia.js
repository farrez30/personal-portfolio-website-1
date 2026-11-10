// Dunia 3D cerita gulir: satu kotak CD (dari benda.js, sama dengan rak) di satu kanvas yang
// menempel di belakang delapan bab. Tidak tahu soal gulir: pemanggil mengirim keadaan dari
// naskah.js lewat `gambar(s)`. Perangkat (laptop, HP, kamera aksi), tumpukan cakram, dan segel
// dibangun di sini dari bentuk dasar; layar memutar rekaman yang sudah ada di public/assets/demo.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { KOTAK, CAKRAM, buatKotak, buatLingkungan } from "@/components/imersif/benda";

const mm = (v) => v / 100;
const LAYAR = {
  laptop: "/assets/demo/coderoach-os-desktop.mp4",
  hp: "/assets/demo/coderoach-os-hp.mp4",
};

function video(src) {
  const v = document.createElement("video");
  Object.assign(v, { src, muted: true, loop: true, playsInline: true, preload: "none", crossOrigin: "anonymous" });
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  const t = new THREE.VideoTexture(v);
  t.colorSpace = THREE.SRGBColorSpace;
  return { v, t };
}

// Coretan spidol "demo" di atas cakram: kanvas yang dibuka dari kiri ke kanan.
function buatCoret(locale) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  let terakhir = -1;
  const gambar = (k) => {
    const q = Math.round(k * 40) / 40;
    if (q === terakhir) return;
    terakhir = q;
    const g = c.getContext("2d");
    g.clearRect(0, 0, 512, 512);
    if (q <= 0) return (t.needsUpdate = true);
    g.save();
    g.beginPath();
    g.rect(0, 0, 512 * q, 512);
    g.clip();
    g.translate(256, 300);
    g.rotate(-0.14);
    g.fillStyle = "#1b1a19";
    g.font = "italic 700 112px 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
    g.textAlign = "center";
    g.fillText(locale === "id" ? "demo" : "demo", 0, 0);
    g.lineWidth = 9;
    g.lineCap = "round";
    g.strokeStyle = "#e0574b";
    g.beginPath();
    g.moveTo(-150, 34);
    g.bezierCurveTo(-60, 52, 70, 22, 160, 40);
    g.stroke();
    g.restore();
    t.needsUpdate = true;
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CAKRAM.r * 1.7, CAKRAM.r * 1.7),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }),
  );
  mesh.position.z = mm(0.9);
  return { mesh, gambar };
}

function buatPerangkat() {
  const grup = new THREE.Group();
  const logam = new THREE.MeshStandardMaterial({ color: 0xc9c3ba, metalness: 0.75, roughness: 0.32 });
  const gelap = new THREE.MeshStandardMaterial({ color: 0x1b1a19, metalness: 0.3, roughness: 0.45 });
  const lap = video(LAYAR.laptop);
  const hp = video(LAYAR.hp);

  // Laptop 14 inci kira-kira 31 x 22 cm; skala dunia diperkecil setengah supaya muat bersama HP.
  const laptop = new THREE.Group();
  const alas = new THREE.Mesh(new RoundedBoxGeometry(3.1, 0.12, 2.1, 4, 0.05), logam);
  const papan = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.8 }),
  );
  papan.rotation.x = -Math.PI / 2;
  papan.position.set(0, 0.061, -0.25);
  const engsel = new THREE.Group();
  engsel.position.set(0, 0.06, -1.03);
  const tutup = new THREE.Mesh(new RoundedBoxGeometry(3.1, 2.05, 0.08, 4, 0.04), gelap);
  tutup.position.y = 1.02;
  const layarLaptop = new THREE.Mesh(
    new THREE.PlaneGeometry(2.86, 1.79),
    new THREE.MeshBasicMaterial({ map: lap.t, toneMapped: false }),
  );
  layarLaptop.position.set(0, 1.04, 0.042);
  engsel.add(tutup, layarLaptop);
  laptop.add(alas, papan, engsel);
  laptop.scale.setScalar(0.62);
  laptop.position.set(-0.55, -0.55, 0);
  laptop.rotation.set(0.12, 0.32, 0);

  // HP kira-kira 7 x 15 cm.
  const ponsel = new THREE.Group();
  const badanHp = new THREE.Mesh(new RoundedBoxGeometry(0.72, 1.5, 0.07, 5, 0.09), gelap);
  const layarHp = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 1.38),
    new THREE.MeshBasicMaterial({ map: hp.t, toneMapped: false }),
  );
  layarHp.position.z = 0.037;
  ponsel.add(badanHp, layarHp);
  ponsel.position.set(1.05, -0.32, 0.55);
  ponsel.rotation.set(-0.08, -0.38, 0.04);

  // Kamera aksi hitam dengan lensa bulat dan lampu rekam.
  const kamera = new THREE.Group();
  const kotakKam = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.44, 0.3, 4, 0.05), gelap);
  const lensa = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.13, 0.12, 40),
    new THREE.MeshPhysicalMaterial({ color: 0x0d1015, metalness: 0.2, roughness: 0.05, clearcoat: 1 }),
  );
  lensa.rotation.x = Math.PI / 2;
  lensa.position.set(-0.12, 0, 0.18);
  const lampu = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), new THREE.MeshBasicMaterial({ color: 0xe0574b }));
  lampu.position.set(0.2, 0.13, 0.152);
  kamera.add(kotakKam, lensa, lampu);
  kamera.position.set(1.55, 0.72, -0.2);
  kamera.rotation.set(0.1, -0.5, 0);

  // Garis sambungan kamera ke HP, digambar bertahap.
  const titik = [];
  const a = new THREE.Vector3(1.5, 0.48, -0.1);
  const b = new THREE.Vector3(1.12, 0.45, 0.55);
  const kurva = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3(1.75, 0.2, 0.3), b);
  for (let i = 0; i <= 40; i++) titik.push(kurva.getPoint(i / 40));
  const garisGeo = new THREE.BufferGeometry().setFromPoints(titik);
  const garis = new THREE.Line(garisGeo, new THREE.LineDashedMaterial({ color: 0xe0574b, dashSize: 0.05, gapSize: 0.035 }));
  garis.computeLineDistances();

  grup.add(laptop, ponsel, kamera, garis);
  grup.visible = false;
  return { grup, laptopEngsel: engsel, layarLaptop, ponsel, kamera, garis, videos: [lap, hp], lampu };
}

// Tumpukan cakram untuk "press run": satu InstancedMesh, muncul satu per satu dari tengah.
function buatTumpukan(n, peta) {
  const geo = new THREE.CylinderGeometry(CAKRAM.r, CAKRAM.r, mm(1.2), 48);
  geo.rotateX(Math.PI / 2);
  const bahan = new THREE.MeshPhysicalMaterial({
    // Cetakan cakram yang sama dengan kotak, jadi tiap salinan memang album itu.
    map: peta ?? null,
    color: 0xffffff,
    metalness: 0.35,
    roughness: 0.3,
    envMapIntensity: 1.2,
    iridescence: 1,
    iridescenceIOR: 1.7,
    iridescenceThicknessRange: [200, 700],
  });
  const mesh = new THREE.InstancedMesh(geo, bahan, n);
  const asal = [];
  for (let i = 0; i < n; i++) {
    // Spiral emas: urutan muncul dari dalam ke luar.
    const r = 0.95 * Math.sqrt(i + 1);
    const a = i * 2.39996;
    asal.push({ x: Math.cos(a) * r * 1.15, y: Math.sin(a) * r * 0.75, z: -1.2 - ((i * 37) % 11) * 0.12, rz: (i * 0.7) % 6.28 });
  }
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sk = new THREE.Vector3();
  const atur = (k, waktu) => {
    const tampil = k * n;
    for (let i = 0; i < n; i++) {
      const s = THREE.MathUtils.clamp(tampil - i, 0, 1);
      const p = asal[i];
      e.set(0.5, 0.2, p.rz + waktu * 0.6);
      q.setFromEuler(e);
      v.set(p.x * (0.4 + 0.6 * s), p.y * (0.4 + 0.6 * s), p.z);
      sk.setScalar(s * s * (3 - 2 * s) + 1e-4);
      mesh.setMatrixAt(i, m.compose(v, q, sk));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = k > 0.001;
  };
  atur(0, 0);
  return { mesh, atur };
}

export function buatDunia(wadah, { proyek, locale }) {
  RectAreaLightUniformsLib.init();
  const sentuh = matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !sentuh || devicePixelRatio < 2, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  wadah.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = buatLingkungan(renderer);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const kunci = new THREE.DirectionalLight(0xfff4e2, 1.1);
  kunci.position.set(3, 4, 5);
  const tepi = new THREE.DirectionalLight(0x9fc4ff, 0.8);
  tepi.position.set(-4, 2, -5);
  const strip = new THREE.RectAreaLight(0xffffff, 2.2, 6, 0.4);
  strip.position.set(0, 3, 3);
  strip.lookAt(0, 0, 0);
  // Senter UV: lampu sorot ungu yang menyapu kotak di bab Sealed.
  const uv = new THREE.SpotLight(0x7d5cff, 0, 9, 0.32, 0.6, 1);
  uv.position.set(0, 0.4, 3.2);
  scene.add(kunci, tepi, strip, uv, uv.target);

  const k = buatKotak(proyek, locale, renderer, 0);
  scene.add(k.grup);
  const dasar = {
    engselZ: k.engsel.position.z,
    sampul: k.sampul.position.clone(),
    sampulRot: k.sampul.rotation.clone(),
    cakram: k.cakram.position.clone(),
  };
  const coret = buatCoret(locale);
  k.cakram.add(coret.mesh);

  // Segel plastik: kulit bening sedikit lebih besar dari kotak, disapu dari kiri.
  const segel = new THREE.Mesh(
    new RoundedBoxGeometry(KOTAK.w + 0.04, KOTAK.h + 0.04, KOTAK.d + 0.04, 3, 0.02),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.2,
      depthWrite: false,
    }),
  );
  segel.visible = false;
  k.grup.add(segel);

  const perangkat = buatPerangkat();
  scene.add(perangkat.grup);
  const tumpukan = buatTumpukan(sentuh ? 120 : 220, k.cakram.userData.bahan?.cetak?.map);
  scene.add(tumpukan.mesh);

  const ukuran = { w: 1, h: 1 };
  const ukur = () => {
    const w = wadah.clientWidth || 1;
    const h = wadah.clientHeight || 1;
    ukuran.w = w;
    ukuran.h = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, sentuh ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  ukur();
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);

  const sasaran = new THREE.Vector3();
  const geser = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const pLayar = new THREE.Vector3();
  const nLayar = new THREE.Vector3();
  let videoJalan = false;
  let waktuLalu = 0;

  // Titik jangkar untuk label DOM di bab The plant (dalam koordinat kotak).
  const jangkar = {
    tutup: () => k.engsel.localToWorld(tmp.set(KOTAK.w * 0.9, KOTAK.h * 0.42, 0)).clone(),
    buklet: () => k.sampul.localToWorld(tmp.set(-0.45, -0.4, 0)).clone(),
    cakram: () => k.cakram.localToWorld(tmp.set(CAKRAM.r * 0.7, -CAKRAM.r * 0.5, 0)).clone(),
    nampan: () => k.badan.localToWorld(tmp.set(-KOTAK.w * 0.42, -KOTAK.h * 0.4, 0)).clone(),
  };

  function proyeksi(v) {
    v.project(camera);
    return { x: (v.x * 0.5 + 0.5) * ukuran.w, y: (-v.y * 0.5 + 0.5) * ukuran.h, depan: v.z < 1 };
  }

  function gambar(s, waktu = 0, penunjuk = null) {
    // Komposisi: benda di separuh layar yang tidak dipakai teks. Di layar sempit benda naik.
    const lebar = ukuran.w / ukuran.h > 1.05;
    // Layar tegak (HP): kamera mundur supaya benda selebar layar tidak terpotong.
    const mundur = lebar ? 1 : THREE.MathUtils.clamp(0.95 / camera.aspect, 1, 2);
    const d = Math.max(1, s.cam[2] * mundur);
    const tinggiPandang = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (lebar) geser.set(-s.sisi * tinggiPandang * camera.aspect * 0.21, 0, 0);
    else geser.set(0, -tinggiPandang * 0.17, 0);
    camera.position.set(s.cam[0], s.cam[1], s.cam[2] * mundur).add(geser);
    sasaran.set(s.arah[0], s.arah[1], s.arah[2]).add(geser);

    // Layar laptop memenuhi layar: kamera ditarik ke depan layar laptop.
    if (s.layarPenuh > 0.001) {
      perangkat.layarLaptop.getWorldPosition(pLayar);
      perangkat.layarLaptop.getWorldDirection(nLayar);
      const jarak = (1.79 * 0.62) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / 0.92;
      tmp.copy(pLayar).addScaledVector(nLayar, jarak);
      camera.position.lerp(tmp, s.layarPenuh);
      sasaran.lerp(pLayar, s.layarPenuh);
    }
    camera.lookAt(sasaran);

    // Kotak.
    k.grup.position.set(s.kotak[0], s.kotak[1], s.kotak[2]);
    k.grup.rotation.set(s.putar[0], s.putar[1] + (penunjuk ? penunjuk.x * 0.08 : 0), s.putar[2]);
    k.grup.scale.setScalar(s.skala);
    k.grup.visible = s.perangkat < 0.5 && s.hilang < 0.999;
    k.engsel.rotation.y = -s.tutup * 1.9;
    k.engsel.position.z = dasar.engselZ + s.urai * 1.25;
    k.sampul.position.set(dasar.sampul.x, dasar.sampul.y, dasar.sampul.z + s.urai * 0.55 + s.buklet * 0.3);
    k.cakram.position.set(dasar.cakram.x, dasar.cakram.y, dasar.cakram.z + s.cakramNaik * 0.55 + s.urai * 0.6);
    // 120 rpm (DESIGN.md), ditakar waktu supaya tidak tergantung laju bingkai.
    const dt = waktuLalu ? Math.min(0.05, (waktu - waktuLalu) / 1000) : 0;
    waktuLalu = waktu;
    k.cakram.rotation.z += s.putaran * dt * 4 * Math.PI;
    coret.gambar(s.coret);

    segel.visible = s.segel > 0.002;
    segel.scale.x = Math.max(0.002, s.segel);
    segel.position.x = -(KOTAK.w / 2) * (1 - s.segel);

    // UV menyapu dari kiri ke kanan, atau mengikuti penunjuk bila ada.
    uv.intensity = s.uv * 90;
    const sapu = penunjuk ? penunjuk.x : Math.sin(waktu * 0.0012);
    uv.target.position.set(s.kotak[0] + sapu * 0.9, s.kotak[1] + (penunjuk ? -penunjuk.y * 0.5 : 0), 0);

    // Perangkat.
    perangkat.grup.visible = s.perangkat > 0.01;
    perangkat.grup.scale.setScalar(0.72 + 0.08 * s.perangkat);
    perangkat.laptopEngsel.rotation.x = -(1 - s.laptop) * 1.5 + 0.14;
    perangkat.ponsel.rotation.y = -0.38 - (1 - s.perangkat) * 0.9;
    perangkat.kamera.position.y = 0.72 + (1 - s.perangkat) * 0.8;
    perangkat.lampu.visible = Math.sin(waktu * 0.006) > 0;
    perangkat.garis.geometry.setDrawRange(0, Math.floor(41 * THREE.MathUtils.clamp((s.perangkat - 0.5) * 2, 0, 1)));
    const perluVideo = s.perangkat > 0.3;
    if (perluVideo !== videoJalan) {
      videoJalan = perluVideo;
      for (const { v } of perangkat.videos) {
        if (perluVideo) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      }
    }

    tumpukan.atur(s.tumpuk, waktu * 0.001);

    renderer.render(scene, camera);

    const label = {};
    if (s.urai > 0.05) for (const [nama, f] of Object.entries(jangkar)) label[nama] = proyeksi(f());
    return label;
  }

  function hapus() {
    ro.disconnect();
    for (const { v, t } of perangkat.videos) {
      v.pause();
      v.removeAttribute("src");
      v.load();
      t.dispose();
    }
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      for (const b of Array.isArray(m) ? m : m ? [m] : []) {
        for (const kunci of Object.keys(b)) b[kunci]?.isTexture && b[kunci].dispose();
        b.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  return { gambar, hapus, ukur };
}
