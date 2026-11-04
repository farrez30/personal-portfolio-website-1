// Adegan 3D rak CD: satu renderer three.js untuk rak, kotak, cakram, pemutar,
// hologram, dan buklet (LeafThroughObject, MIT). Ditulis sendiri; idenya
// terinspirasi Discography karya dmtrbrl (repo tanpa lisensi, kodenya tidak dipakai).
import * as THREE from "three";
import { LeafThroughObject } from "leafthrough";
import { gambarSampul, gambarCakram, gambarHalaman, gambarArsitektur } from "./gambar";
import { HALAMAN } from "@/content/proyek";

const KOTAK = { w: 1.42, h: 1.25, d: 0.1 };
const CAKRAM_R = 0.58;
const LABEL = {
  overview: "Overview",
  challenge: "Challenge",
  decisions: "Key decisions",
  solution: "Solution",
  delivery: "Delivery & role",
  outcome: "Outcome",
  architecture: "Architecture",
};

function tekstur(canvas, renderer) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return t;
}

function putarTekstur(t) {
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
}

function buatKotak(p, locale, renderer) {
  const grup = new THREE.Group();
  const plastik = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const nampan = new THREE.Mesh(
    new THREE.BoxGeometry(KOTAK.w, KOTAK.h, KOTAK.d * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6 }),
  );
  nampan.position.z = -KOTAK.d * 0.25;
  grup.add(nampan);

  const cakram = new THREE.Mesh(
    new THREE.CylinderGeometry(CAKRAM_R, CAKRAM_R, 0.012, 96),
    [
      new THREE.MeshStandardMaterial({ color: 0xbfbab2, metalness: 0.9, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ map: putarTekstur(tekstur(gambarCakram(p), renderer)), metalness: 0.35, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 1, roughness: 0.18 }),
    ],
  );
  cakram.rotation.x = Math.PI / 2;
  cakram.position.set(0.06, 0, 0.012);
  grup.add(cakram);

  // Tutup berengsel di tepi kiri; sampul tercetak di bawah plastiknya.
  const engsel = new THREE.Group();
  engsel.position.x = -KOTAK.w / 2;
  const tutup = new THREE.Group();
  tutup.position.set(KOTAK.w / 2, 0, KOTAK.d * 0.25);
  const sampul = new THREE.Mesh(
    new THREE.PlaneGeometry(KOTAK.w * 0.94, KOTAK.h * 0.96),
    new THREE.MeshStandardMaterial({ map: tekstur(gambarSampul(p, locale), renderer), roughness: 0.55 }),
  );
  sampul.position.set(0.035, 0, 0.004);
  const lembar = new THREE.Mesh(new THREE.BoxGeometry(KOTAK.w, KOTAK.h, 0.016), plastik);
  lembar.position.z = 0.012;
  tutup.add(sampul, lembar);
  engsel.add(tutup);
  grup.add(engsel);

  const punggung = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, KOTAK.h, KOTAK.d),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(p.warna).multiplyScalar(0.6), roughness: 0.5 }),
  );
  punggung.position.x = -KOTAK.w / 2 - 0.02;
  grup.add(punggung);

  grup.traverse((o) => {
    if (o.isMesh) o.userData.slug = p.slug;
  });
  return { grup, engsel, cakram, sampul };
}

function buatPemutar() {
  const grup = new THREE.Group();
  const badan = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.28, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.45, metalness: 0.3 }),
  );
  const piring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.02, 64),
    new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.8 }),
  );
  piring.position.y = 0.15;
  const lampu = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0574b }),
  );
  lampu.position.set(0.68, 0.06, 0.76);
  grup.add(badan, piring, lampu);
  return { grup, lampu };
}

function buatHologram() {
  const bahan = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { peta: { value: null }, waktu: { value: 0 }, kuat: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D peta;
      uniform float waktu;
      uniform float kuat;
      varying vec2 vUv;
      void main() {
        vec4 t = texture2D(peta, vUv);
        float garis = 0.75 + 0.25 * sin(vUv.y * 420.0 - waktu * 6.0);
        float tepi = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
                   * smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
        float kedip = 0.92 + 0.08 * sin(waktu * 23.0) * sin(waktu * 7.0);
        vec3 warna = mix(vec3(0.95, 0.9, 0.82), t.rgb, 0.85);
        float a = (t.a * 0.95 + 0.06) * garis * tepi * kedip * kuat;
        gl_FragColor = vec4(warna * a, a);
      }`,
  });
  const layar = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.625), bahan);
  const sorot = new THREE.Mesh(
    new THREE.ConeGeometry(1.25, 1.2, 48, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf2e6d6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  sorot.rotation.x = Math.PI;
  return { layar, sorot, bahan };
}

function halamanBuklet(p, locale) {
  const hal = [];
  hal.push({ src: gambarSampul(p, locale), alt: `${p.katalog} ${p.judul[locale]}` });
  hal.push({
    src: gambarHalaman({ label: LABEL.overview, judul: p.judul[locale], isi: p.ringkas[locale], catatan: `${p.katalog}  ${p.periode}` }),
    alt: LABEL.overview,
    text: p.ringkas[locale],
  });
  for (const h of HALAMAN) {
    const b = p.buklet[h];
    if (!b) continue;
    hal.push({
      src: gambarHalaman({ label: LABEL[h], judul: b.judul[locale], isi: b.isi[locale] }),
      alt: LABEL[h],
      text: `${b.judul[locale]}\n\n${b.isi[locale]}`,
    });
  }
  if (p.arsitektur) {
    const c = gambarHalaman({ label: LABEL.architecture });
    const d = gambarArsitektur(p.arsitektur, { latar: null, garis: "#6f695f", kotak: "#f7f2ea", teks: "#1d1b19", aksen: "#b3322a" }, 864, 640);
    c.getContext("2d").drawImage(d, 80, 220, 864, 640);
    hal.push({ src: c, alt: LABEL.architecture, text: p.arsitektur.simpul.map((s) => s.label).join(", ") });
  }
  // Buklet perlu jumlah halaman genap supaya sampul belakang menutup.
  if (hal.length % 2 === 1) hal.push({ src: gambarHalaman({ label: p.katalog }), alt: p.katalog });
  return hal;
}

export function buatAdegan(wadah, { proyek, locale, kurangiGerak, onBuka, onFokus }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  wadah.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1a1816, 1.1));
  const matahari = new THREE.DirectionalLight(0xffffff, 1.6);
  matahari.position.set(2, 4, 5);
  scene.add(matahari);
  const kilau = new THREE.PointLight(0xe0574b, 0.6, 12);
  kilau.position.set(-3, -1, 3);
  scene.add(kilau);

  const kotak = proyek.map((p, i) => {
    const k = buatKotak(p, locale, renderer);
    k.indeks = i;
    k.p = p;
    k.goyang = Math.random() * Math.PI * 2;
    scene.add(k.grup);
    return k;
  });

  const pemutar = buatPemutar();
  pemutar.grup.position.set(2.6, -1.35, 0.4);
  pemutar.grup.rotation.set(0.35, -0.5, 0);
  pemutar.grup.visible = false;
  scene.add(pemutar.grup);

  const holo = buatHologram();
  scene.add(holo.layar, holo.sorot);
  holo.layar.visible = holo.sorot.visible = false;

  const keadaan = { fokus: 0, aktif: null, putar: false, buklet: null, sudutCakram: 0 };
  let tampil = true;

  const ukur = () => {
    const w = wadah.clientWidth;
    const h = wadah.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 0.15, 5.4 / Math.min(1, camera.aspect / 1.35));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  ukur();
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);

  // Sasaran tiap benda; tiap bingkai benda mendekat ke sasarannya (redaman eksponensial).
  const sasaranKotak = (k, t) => {
    const d = k.indeks - keadaan.fokus;
    const aktif = keadaan.aktif === k.p.slug;
    const lainAktif = keadaan.aktif && !aktif;
    if (aktif) {
      return { x: keadaan.buklet ? -3.2 : -1.35, y: keadaan.buklet ? -1.4 : 0.15, z: keadaan.buklet ? -1 : 0.1, ry: 0.4, rx: -0.05, tutup: keadaan.putar ? -1.9 : -2.3, s: 1 };
    }
    const sisi = Math.sign(d);
    const x = d === 0 ? 0 : sisi * (1.3 + (Math.abs(d) - 1) * 0.3);
    return {
      x,
      y: (lainAktif ? -3.4 : 0) + Math.sin(t * 0.0008 + k.goyang) * 0.015,
      z: d === 0 ? 1.1 : -0.2 - Math.abs(d) * 0.18,
      ry: d === 0 ? Math.sin(t * 0.0005) * 0.06 : -sisi * 1.32,
      rx: 0,
      tutup: 0,
      s: 1,
    };
  };

  const dekat = (a, b, k) => a + (b - a) * k;
  let waktuLalu = performance.now();

  const bingkai = (t) => {
    const dt = Math.min(0.05, (t - waktuLalu) / 1000);
    waktuLalu = t;
    const k = kurangiGerak ? 1 : 1 - Math.exp(-dt * 7);

    for (const kt of kotak) {
      const s = sasaranKotak(kt, kurangiGerak ? 0 : t);
      const g = kt.grup;
      g.position.set(dekat(g.position.x, s.x, k), dekat(g.position.y, s.y, k), dekat(g.position.z, s.z, k));
      g.rotation.y = dekat(g.rotation.y, s.ry, k);
      g.rotation.x = dekat(g.rotation.x, s.rx, k);
      kt.engsel.rotation.y = dekat(kt.engsel.rotation.y, s.tutup, k);

      // Cakram album aktif yang sedang diputar pindah ke pemutar.
      const cakramDiputar = keadaan.putar && keadaan.aktif === kt.p.slug;
      if (cakramDiputar) {
        const tujuan = pemutar.grup.localToWorld(new THREE.Vector3(0, 0.17, 0));
        kt.grup.worldToLocal(tujuan);
        kt.cakram.position.lerp(tujuan, k);
        kt.cakram.rotation.x = dekat(kt.cakram.rotation.x, Math.PI / 2 - 0.9, k);
        keadaan.sudutCakram += kurangiGerak ? 0 : dt * 9;
        kt.cakram.rotation.y = keadaan.sudutCakram;
      } else {
        kt.cakram.position.lerp(new THREE.Vector3(0.06, 0, 0.012), k);
        kt.cakram.rotation.y = dekat(kt.cakram.rotation.y, 0, k);
        kt.cakram.rotation.x = dekat(kt.cakram.rotation.x, Math.PI / 2, k);
      }
    }

    pemutar.grup.visible = !!keadaan.aktif && !keadaan.buklet;
    const kuat = keadaan.putar && !keadaan.buklet ? 1 : 0;
    holo.bahan.uniforms.kuat.value = dekat(holo.bahan.uniforms.kuat.value, kuat, k);
    holo.bahan.uniforms.waktu.value = kurangiGerak ? 0 : t / 1000;
    holo.layar.visible = holo.sorot.visible = holo.bahan.uniforms.kuat.value > 0.01;
    const naik = holo.bahan.uniforms.kuat.value;
    holo.layar.position.set(2.15, dekat(-1.0, 0.45, naik), 0.7);
    holo.layar.scale.setScalar(0.6 + 0.4 * naik);
    holo.layar.lookAt(camera.position);
    holo.sorot.position.set(2.45, -0.62, 0.55);
    holo.sorot.material.opacity = 0.07 * naik;
    pemutar.lampu.material.color.set(keadaan.putar ? 0x9be27a : 0xe0574b);

    if (keadaan.buklet) keadaan.buklet.tick(t);
    renderer.render(scene, camera);
  };

  const jalan = () => renderer.setAnimationLoop(tampil && !document.hidden ? bingkai : null);
  const io = new IntersectionObserver(([e]) => {
    tampil = e.isIntersecting;
    jalan();
  });
  io.observe(wadah);
  document.addEventListener("visibilitychange", jalan);
  jalan();

  // Klik dan seret.
  const ray = new THREE.Raycaster();
  const titik = new THREE.Vector2();
  let tekan = null;
  const kanvas = renderer.domElement;
  const turun = (e) => {
    if (keadaan.buklet) return;
    tekan = { x: e.clientX, fokus: keadaan.fokus, geser: false };
  };
  const gerak = (e) => {
    if (!tekan || keadaan.aktif) return;
    const dx = e.clientX - tekan.x;
    if (Math.abs(dx) > 8) tekan.geser = true;
    const f = Math.max(0, Math.min(kotak.length - 1, Math.round(tekan.fokus - dx / 110)));
    if (f !== keadaan.fokus) api.fokus(f);
  };
  const naik = (e) => {
    if (!tekan) return;
    const geser = tekan.geser;
    tekan = null;
    if (geser || keadaan.buklet) return;
    const r = kanvas.getBoundingClientRect();
    titik.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(titik, camera);
    const kena = ray.intersectObjects(kotak.map((k) => k.grup), true)[0];
    const slug = kena?.object.userData.slug;
    if (!slug) return;
    const i = proyek.findIndex((p) => p.slug === slug);
    if (keadaan.aktif) return;
    if (i === keadaan.fokus) onBuka?.(slug);
    else api.fokus(i);
  };
  kanvas.addEventListener("pointerdown", turun);
  window.addEventListener("pointermove", gerak);
  window.addEventListener("pointerup", naik);

  const api = {
    fokus(i) {
      keadaan.fokus = Math.max(0, Math.min(kotak.length - 1, i));
      onFokus?.(keadaan.fokus);
    },
    geser(arah) {
      api.fokus(keadaan.fokus + arah);
    },
    get indeksFokus() {
      return keadaan.fokus;
    },
    aktifkan(slug) {
      if (slug === keadaan.aktif) return;
      api.tutupBuklet();
      keadaan.putar = false;
      keadaan.aktif = slug;
      if (slug) api.fokus(proyek.findIndex((p) => p.slug === slug));
    },
    putar(nyala = !keadaan.putar) {
      if (!keadaan.aktif) return;
      keadaan.putar = nyala;
      const p = proyek.find((x) => x.slug === keadaan.aktif);
      if (nyala) {
        const lama = holo.bahan.uniforms.peta.value;
        const kanvasHolo = p.arsitektur
          ? gambarArsitektur(p.arsitektur, { latar: null, garis: "#d8cfc2", kotak: "rgba(20,18,16,0.35)", teks: "#f4efe7", aksen: "#ff7a6b" })
          : gambarSampul(p, locale, 1024);
        holo.bahan.uniforms.peta.value = tekstur(kanvasHolo, renderer);
        lama?.dispose();
      }
    },
    bukaBuklet() {
      if (!keadaan.aktif || keadaan.buklet) return;
      const p = proyek.find((x) => x.slug === keadaan.aktif);
      const b = new LeafThroughObject(
        { renderer, camera, domElement: kanvas },
        { pages: halamanBuklet(p, locale), pageAspect: 1, layout: "auto", loop: false, motion: { reducedMotion: kurangiGerak ? true : "auto" } },
      );
      const lebar = b.bounds.pages.width || 2;
      b.scale.setScalar(Math.min(2.2, 3.6 / lebar));
      // Sampul tertutup ada di kanan punggung; geser setengah halaman supaya di tengah.
      b.position.set(-0.5 * b.scale.x, 0.1, 1);
      scene.add(b);
      keadaan.buklet = b;
      return b;
    },
    tutupBuklet() {
      if (!keadaan.buklet) return;
      scene.remove(keadaan.buklet);
      keadaan.buklet.dispose();
      keadaan.buklet = null;
    },
    get bukletTerbuka() {
      return !!keadaan.buklet;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      api.tutupBuklet();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", jalan);
      kanvas.removeEventListener("pointerdown", turun);
      window.removeEventListener("pointermove", gerak);
      window.removeEventListener("pointerup", naik);
      scene.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry.dispose();
        for (const m of [].concat(o.material)) {
          m.map?.dispose();
          m.dispose();
        }
      });
      holo.bahan.uniforms.peta.value?.dispose();
      renderer.dispose();
      kanvas.remove();
    },
  };
  return api;
}
