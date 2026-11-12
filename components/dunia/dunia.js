import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { N8AOPass } from "n8ao";
import { ANCHOR, anchorTegak, nyalaFondasi, easeInOut, poseAntara, durasiBlend, kekuatanBlur } from "./naskah";
import { buatPropsCerita } from "./props";

// Dunia toko kaset (ADR 0014): satu ruangan di belakang seluruh beranda. Ruang dari primitif plus
// tekstur Flow, perabot CC0 Poly Haven (tekstur 512 px, meshopt), headphone Hunyuan3D.
// Kamera berpindah antar-anchor naskah.js; adegan digambar hanya saat ada yang berubah.

const ASET = "/assets/dunia/";
const MODEL = ["bar_chair_round_01", "hanging_industrial_lamp", "portable_cassette_player", "headphone"];

// Dua suasana mengikuti tema situs, supaya teks di atas kanvas tetap terbaca:
// gelap = toko setelah tutup, terang = toko pagi hari. Nilai gelap mengikuti lembar look-dev
// (docs/look-dev.md): bayangan cokelat #1a1410, lampu hangat, biru hanya dari pintu.
// `berkas` = kuat kerucut cahaya dan kolam di lantai, `layar` = angkat bayangan, vignette, butir.
export const SUASANA = {
  gelap: {
    latar: 0x1a1410,
    kabut: [5, 15],
    dinding: 0x2b2520,
    plafon: 0x1a1410,
    // Isi bayangan rendah, supaya bayangan dari lampu tetap punya kontras (lembar look-dev).
    ambien: 0.5,
    lampu: 0xffb46a,
    kuatLampu: 7,
    jalan: 0x6f8fd6,
    kuatJalan: 9,
    terangJalan: 1.8,
    paparan: 1.3,
    berkas: 1,
    layar: { angkat: 0.02, vignette: 0.42, butir: 0.045 },
  },
  terang: {
    latar: 0xe6dccd,
    // Kabut pagi tipis: 6 sampai 18 m, lalu 12 sampai 32 m, masih dinilai terlalu pekat (masukan
    // Farrez 13 Nov). Ruangan terdalam sekitar 10 m dari kamera, jadi 18 sampai 48 m hampir bening.
    kabut: [18, 48],
    dinding: 0xd8cbb6,
    plafon: 0xe9e1d3,
    ambien: 1.4,
    lampu: 0xffd6a0,
    kuatLampu: 3,
    jalan: 0xfff1d6,
    kuatJalan: 9,
    terangJalan: 1,
    paparan: 0.95,
    berkas: 0.25,
    layar: { angkat: 0, vignette: 0.18, butir: 0.025 },
  },
};

const bingkaiBerikut = () => new Promise((r) => requestAnimationFrame(() => r()));

// Gerak kamera di dalam satu tempat mengikuti gulir: geser ke samping dan sedikit maju.
const GESER = { samping: 0.22, maju: 0.12 };

export function buatDunia(wadah, { kurangiGerak = false, tema = "gelap", onProgres = () => {} } = {}) {
  const hp = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // AgX, bukan ACES: ACES menggeser hue warna jenuh (stiker, seni album) dan cerita v3 sudah AgX.
  renderer.toneMapping = THREE.AgXToneMapping;
  // Bayangan dari setiap lampu gantung, lampu jalan, dan lampu kunci babak cerita. Tiap lampu
  // memegang jadwalnya sendiri (shadow.autoUpdate = false): lampu yang diam dihitung sekali dan
  // dicicil satu lampu per bingkai (perbaruiBayangan), lampu kunci hanya saat benda bergerak.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  let rasio = Math.min(devicePixelRatio || 1, hp ? 1.25 : 1.5);
  renderer.setPixelRatio(rasio);
  const kanvas = renderer.domElement;
  wadah.appendChild(kanvas);

  const scene = new THREE.Scene();
  // Tanpa peta lingkungan: PMREM mengompilasi shader secara sinkron (terukur 462 ms di RX 6700 XT,
  // ular di loader membeku). Ruangan malam diterangi lampu titik dan cahaya langit saja.
  scene.fog = new THREE.Fog(SUASANA.gelap.latar, ...SUASANA.gelap.kabut);

  const camera = new THREE.PerspectiveCamera(ANCHOR[0].fov, 1, 0.05, 40);

  // ---- Bahan dan tekstur -------------------------------------------------------------------
  const pemuat = new THREE.LoadingManager();
  const aset = new Map(); // nama -> 0..1
  const lapor = () => onProgres({ aset: [...aset.values()] });
  const tandai = (nama, nilai) => {
    aset.set(nama, Math.max(aset.get(nama) ?? 0, nilai));
    lapor();
  };
  const pemuatTekstur = new THREE.TextureLoader(pemuat);
  const tekstur = (nama, ulang) => {
    aset.set(nama, 0);
    return new Promise((ok, gagal) =>
      pemuatTekstur.load(
        nama.startsWith("/") ? nama : ASET + nama,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(...ulang);
          t.anisotropy = 4;
          tandai(nama, 1);
          ok(t);
        },
        undefined,
        gagal,
      ),
    );
  };
  const gltf = new GLTFLoader(pemuat).setMeshoptDecoder(MeshoptDecoder);
  const model = (nama) => {
    aset.set(nama, 0);
    return new Promise((ok, gagal) =>
      gltf.load(
        `${ASET}${nama}.glb`,
        (g) => {
          // Kaca transmission (lampu CC0) memaksa render ulang seluruh adegan ke target kedua
          // dengan shader lain: terukur 293 ms beku di gambar pertama. Diganti kaca transparan.
          g.scene.traverse((o) => {
            const m = o.material;
            // Peta ARM Poly Haven: AO di kanal merah, roughness hijau, metalness biru. GLTFLoader
            // memasangnya sebagai roughness dan metalness; AO-nya dipakai juga supaya celah gelap.
            if (m?.roughnessMap && m.roughnessMap === m.metalnessMap && !m.aoMap) m.aoMap = m.roughnessMap;
            if (m?.transmission > 0) {
              m.transmission = 0;
              m.transparent = true;
              m.opacity = 0.32;
              m.depthWrite = false;
            }
          });
          tandai(nama, 1);
          ok(g.scene);
        },
        (e) => e.lengthComputable && tandai(nama, 0.9 * (e.loaded / e.total)),
        gagal,
      ),
    );
  };

  const bahan = {
    dinding: new THREE.MeshStandardMaterial({ roughness: 0.92 }),
    plafon: new THREE.MeshStandardMaterial({ roughness: 1 }),
    // Beton tergores (lembar look-dev): peta dari scripts/beton.py, dipasang di muat().
    lantai: new THREE.MeshStandardMaterial({ color: 0x6e655c, roughness: 0.8 }),
    kayu: new THREE.MeshStandardMaterial({ color: 0xb8a088, roughness: 0.7 }),
    busa: new THREE.MeshStandardMaterial({ color: 0x9a948c, roughness: 1 }),
    gelapMatte: new THREE.MeshStandardMaterial({ color: 0x1c1b1d, roughness: 0.55, metalness: 0.1 }),
    // Permukaan meja kasir: kayu tua berminyak, cukup terang untuk memantulkan kolam lampu.
    mejaAtas: new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.45 }),
    logam: new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.32, metalness: 0.9 }),
    kuningan: new THREE.MeshStandardMaterial({ color: 0xc9a25a, roughness: 0.45, metalness: 1 }),
    jalan: new THREE.MeshBasicMaterial({ toneMapped: true }),
    kaca: new THREE.MeshStandardMaterial({ color: 0x9fb4c8, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18 }),
    bayang: new THREE.MeshBasicMaterial({ map: teksturBayang(), transparent: true, depthWrite: false, color: 0x000000 }),
  };

  const kotak = (w, h, d, m, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };
  const bidang = (w, h, m, x, y, z, ry = 0, rx = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    scene.add(mesh);
    return mesh;
  };
  const bayang = (x, z, r) => {
    const b = bidang(r * 2, r * 2, bahan.bayang, x, 0.003, z, 0, -Math.PI / 2);
    b.renderOrder = 1;
  };

  // ---- Ruangan -----------------------------------------------------------------------------
  bidang(10, 8, bahan.lantai, 0, 0, 0, 0, -Math.PI / 2);
  bidang(10, 8, bahan.plafon, 0, 3.2, 0, 0, Math.PI / 2);
  bidang(10, 3.2, bahan.dinding, 0, 1.6, -4); // belakang
  bidang(8, 3.2, bahan.dinding, -5, 1.6, 0, Math.PI / 2); // kiri
  bidang(8, 3.2, bahan.dinding, 5, 1.6, 0, -Math.PI / 2); // kanan
  // Dinding depan dengan lubang pintu (x -2,2..-1,0, tinggi 2,2).
  bidang(2.8, 3.2, bahan.dinding, -3.6, 1.6, 4, Math.PI);
  bidang(6, 3.2, bahan.dinding, 2, 1.6, 4, Math.PI);
  bidang(1.2, 1, bahan.dinding, -1.6, 2.7, 4, Math.PI);
  // Lis kayu di bawah dinding.
  for (const [w, x, z, ry] of [
    [10, 0, -3.99, 0],
    [8, -4.99, 0, Math.PI / 2],
    [8, 4.99, 0, -Math.PI / 2],
  ])
    bidang(w, 0.9, bahan.kayu, x, 0.45, z, ry);

  // ---- Bilik dengar (hero) -----------------------------------------------------------------
  bidang(2.6, 2.6, bahan.busa, -3.7, 1.55, -3.97); // busa di dinding belakang bilik
  bidang(2.4, 2.6, bahan.busa, -4.97, 1.55, -2.8, Math.PI / 2);
  kotak(0.08, 2.6, 1.6, bahan.kayu, -2.4, 1.3, -3.2); // sekat bilik
  kotak(0.08, 0.12, 1.6, bahan.gelapMatte, -2.4, 2.62, -3.2);
  const rakDengar = kotak(1.5, 0.05, 0.42, bahan.kayu, -3.6, 1.02, -3.76);
  rakDengar.material = bahan.kayu;
  kotak(0.04, 0.2, 0.36, bahan.gelapMatte, -4.3, 0.92, -3.76);
  kotak(0.04, 0.2, 0.36, bahan.gelapMatte, -2.9, 0.92, -3.76);
  const headphone = buatDudukan(bahan);
  headphone.position.set(-3.5, 1.045, -3.7);
  headphone.rotation.y = -0.5;
  scene.add(headphone);
  bayang(-3.6, -2.7, 0.55);

  // ---- Dinding catatan sampul (cerita) -----------------------------------------------------
  const catatan = buatCatatan();
  catatan.position.set(1.7, 1.55, -3.975);
  scene.add(catatan);

  // ---- Rak CD (proyek) ---------------------------------------------------------------------
  const rakCD = buatRakCD(bahan);
  scene.add(rakCD);

  // Props tur cerita dibuat belakangan (muatCerita), sesudah hero tampil.
  let props = null;

  // ---- Meja kasir (klien) ------------------------------------------------------------------
  kotak(2.6, 0.96, 0.62, bahan.kayu, 2, 0.48, 3.0);
  kotak(2.7, 0.05, 0.72, bahan.mejaAtas, 2, 0.985, 3.0);
  kotak(0.42, 0.14, 0.36, bahan.gelapMatte, 2.8, 1.08, 3.05); // mesin kasir
  const layarKasir = kotak(0.32, 0.18, 0.02, bahan.gelapMatte, 2.8, 1.26, 3.18);
  layarKasir.rotation.x = -0.35;
  scene.add(buatStiker());
  bayang(2, 2.6, 1.5);

  // Dinding depan tidak boleh kosong (lembar look-dev: kasir dan pintu terukur 15 dan 13, target
  // 35). Rak kaset di belakang meja, peti piringan dan rak sampul di kedua sisi pintu, dua poster.
  scene.add(buatDindingDepan(bahan));

  // ---- Pintu dan lonceng (kontak) ----------------------------------------------------------
  kotak(0.08, 2.2, 0.14, bahan.gelapMatte, -2.2, 1.1, 4); // kusen
  kotak(0.08, 2.2, 0.14, bahan.gelapMatte, -1.0, 1.1, 4);
  kotak(1.28, 0.08, 0.14, bahan.gelapMatte, -1.6, 2.2, 4);
  // Jalan di luar: bidang bercahaya di balik kaca pintu.
  bidang(1.2, 2.15, bahan.jalan, -1.6, 1.08, 4.06, Math.PI);
  bidang(1.12, 2.1, bahan.kaca, -1.6, 1.08, 3.99, Math.PI);
  // Cahaya jalan yang jatuh ke lantai di depan pintu: sumber "lampu" tempat kontak.
  const tumpahJalan = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.6),
    new THREE.MeshBasicMaterial({ map: teksturRadial(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }),
  );
  tumpahJalan.rotation.x = -Math.PI / 2;
  tumpahJalan.position.set(-1.6, 0.005, 3.0);
  tumpahJalan.renderOrder = 2;
  scene.add(tumpahJalan);
  const lonceng = new THREE.Group();
  const mangkok = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.11, 24, 1, true), bahan.kuningan);
  mangkok.material.side = THREE.DoubleSide;
  mangkok.position.y = -0.06;
  const pemukul = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), bahan.kuningan);
  pemukul.position.y = -0.12;
  const lengan = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.2), bahan.gelapMatte);
  lengan.position.z = 0.1;
  lonceng.add(mangkok, pemukul, lengan);
  lonceng.position.set(-1.6, 2.34, 3.78);
  scene.add(lonceng);

  // ---- Cahaya ------------------------------------------------------------------------------
  const ambien = new THREE.HemisphereLight(0xfff4e6, 0x3a2e24, 0.2);
  scene.add(ambien);
  // Lampu gantung CC0 diperkecil (tinggi asli 1,34 m) supaya tidak menghalangi kamera.
  const SKALA_LAMPU = 0.72;
  const yLampu = 3.2 - 1.3 * SKALA_LAMPU;
  const lampu = [
    [-3.55, yLampu, -2.9],
    [1.7, yLampu, -3.25],
    [3.9, yLampu, 0.2],
    [2.1, yLampu, 2.95], // tepat di atas meja kasir, supaya stiker berada di kolam cahaya
    [-3.6, yLampu, 3.15], // di atas rak sampul kiri pintu (tempat kontak)
    [-3.95, yLampu, -0.45], // dinding kiri: meja tulis dan papan storyboard
    [0.1, yLampu, 0.4], // gondola tengah
  ].map((p) => {
    // Jangkauan tak terbatas (decay fisik): dengan distance 7 meja kasir hampir tak tersentuh.
    const l = new THREE.PointLight(0xffffff, 1, 0, 2);
    l.position.set(...p);
    // Di HP bayangan hanya dari lampu kunci babak dan lampu jalan: tujuh peta kubus menaikkan
    // kompilasi shader dari 0,4 ke 1,9 detik (terukur 13 Nov 2026), terlalu berat untuk HP.
    l.castShadow = !hp;
    l.shadow.autoUpdate = false;
    l.shadow.mapSize.setScalar(hp ? 256 : 512);
    l.shadow.camera.near = 0.1;
    l.shadow.camera.far = 7;
    l.shadow.bias = -0.003;
    l.shadow.normalBias = 0.03;
    scene.add(l);
    return l;
  });
  // Tiap lampu terlihat menyala: bola lampu, halo, kerucut berkas di udara berkabut, dan kolam
  // cahaya di lantai. Semuanya additive tanpa pass tambahan (halo menggantikan bloom post).
  const nyala = buatNyala(lampu);
  scene.add(nyala.grup);
  const cahayaJalan = new THREE.SpotLight(0xffffff, 1, 9, 0.9, 0.7, 1.6);
  cahayaJalan.position.set(-1.6, 1.6, 4.6);
  cahayaJalan.target.position.set(-1, 0, 0.5);
  cahayaJalan.castShadow = true;
  cahayaJalan.shadow.autoUpdate = false;
  cahayaJalan.shadow.mapSize.setScalar(hp ? 512 : 1024);
  cahayaJalan.shadow.bias = -0.0006;
  scene.add(cahayaJalan, cahayaJalan.target);
  // Lampu kecil di atas pintu (dalam toko): tanpa ini kusen dan dinding pintu tenggelam, dan
  // tempat kontak tidak punya sumber cahaya yang terlihat.
  const lampuPintu = new THREE.PointLight(0xffffff, 1, 0, 2);
  lampuPintu.position.set(-1.6, 2.5, 3.75);
  scene.add(lampuPintu);
  nyala.tambahBola(lampuPintu);

  // Lampu props cerita, dibuat sejak awal supaya jumlah lampu (bagian dari kunci program shader)
  // tidak berubah saat props dimuat belakangan: lampu dinding di atas papan pre-order, dan lampu
  // darurat babak andal yang padam sampai listrik toko mati.
  const lampuMeja = new THREE.PointLight(0xffffff, 1, 3.5, 2);
  lampuMeja.position.set(4.2, 2.1, -3.4);
  lampuMeja.userData.kuat = 0.35;
  const lampuDarurat = new THREE.PointLight(0xfff1dc, 0, 3, 2);
  lampuDarurat.position.set(3.18, 0.25, -1.75);
  scene.add(lampuMeja, lampuDarurat);

  // Lampu kunci: satu-satunya yang membuat bayangan, dipindah ke benda babak yang aktif.
  // Sudut lebar dan penumbra penuh: tanpa lingkaran sorot bertepi tajam di lantai.
  const kunciLampu = new THREE.SpotLight(0xffffff, 1, 7, 0.85, 1, 2);
  kunciLampu.castShadow = true;
  kunciLampu.shadow.mapSize.setScalar(hp ? 512 : 1024);
  kunciLampu.shadow.camera.near = 0.3;
  kunciLampu.shadow.camera.far = 6;
  kunciLampu.shadow.bias = -0.0004;
  kunciLampu.shadow.normalBias = 0.02;
  kunciLampu.shadow.autoUpdate = false;
  scene.add(kunciLampu, kunciLampu.target);
  let faktorRedup = 1;
  // Pose lampu kunci untuk satu anchor: dari atas dan sedikit dari arah kamera, miring ke samping
  // supaya bayangan memanjang dan terlihat. Menyala hanya di babak cerita.
  // Dari samping dan sedikit di belakang benda, tidak dari arah kamera: bayangan lalu jatuh ke
  // sisi yang terlihat kamera, bukan tersembunyi di balik bendanya (masukan Farrez 13 Nov).
  const poseKunci = (a) => {
    const t = a.benda ?? a.lihat;
    const dx = a.posisi[0] - t[0];
    const dz = a.posisi[2] - t[2];
    const k = 1 / Math.max(0.01, Math.hypot(dx, dz));
    const [ax, az] = [dx * k, dz * k];
    return { p: [t[0] - az * 1.1 - ax * 0.35, 2.4, t[2] + ax * 1.1 - az * 0.35], t: [...t], nyala: a.cerita ? 1 : 0 };
  };
  let kunciKini = poseKunci(ANCHOR[0]);
  let kunciDari = kunciKini;
  let kunciKe = kunciKini;
  // Lampu kunci ikut terbang bersama kamera (e = progres blend yang sudah di-ease), jadi cahaya
  // tidak melompat atau menyala mendadak saat pindah babak.
  const pasangKunci = (e) => {
    const l = (a, b) => a.map((v, i) => v + (b[i] - v) * e);
    kunciKini = { p: l(kunciDari.p, kunciKe.p), t: l(kunciDari.t, kunciKe.t), nyala: kunciDari.nyala + (kunciKe.nyala - kunciDari.nyala) * e };
    kunciLampu.position.set(...kunciKini.p);
    kunciLampu.target.position.set(...kunciKini.t);
    kunciLampu.target.updateMatrixWorld();
    kunciLampu.intensity = (kunciLampu.userData.dasar ?? 0) * kunciKini.nyala * faktorRedup;
    kunciLampu.shadow.needsUpdate = true;
  };
  const arahkanKunci = (a, langsung) => {
    kunciDari = kunciKini;
    kunciKe = poseKunci(a);
    if (langsung) pasangKunci(1);
  };
  arahkanKunci(ANCHOR[0], true);

  let paparanTema = 1;
  const terapkanTema = (nama) => {
    const s = SUASANA[nama] ?? SUASANA.gelap;
    scene.background = new THREE.Color(s.latar);
    scene.fog.color.setHex(s.latar);
    [scene.fog.near, scene.fog.far] = s.kabut;
    nyala.setel(s.lampu, s.berkas);
    // Angkat dihitung di ruang sRGB keluaran: hex dibaca apa adanya, tanpa konversi ke linear.
    blur.uniforms.uAngkat.value.setHex(s.latar, THREE.LinearSRGBColorSpace).multiplyScalar(s.layar.angkat * 10);
    blur.uniforms.uVignette.value = s.layar.vignette;
    blur.uniforms.uButir.value = s.layar.butir;
    bahan.dinding.color.setHex(s.dinding);
    bahan.plafon.color.setHex(s.plafon);
    ambien.intensity = s.ambien;
    for (const l of lampu) {
      l.color.setHex(s.lampu);
      l.intensity = s.kuatLampu;
    }
    lampuMeja.color.setHex(s.lampu);
    lampuMeja.userData.dasar = lampuMeja.intensity = s.kuatLampu * lampuMeja.userData.kuat;
    for (const l of lampu) l.userData.dasar = l.intensity;
    kunciLampu.color.setHex(s.lampu);
    kunciLampu.userData.dasar = s.kuatLampu * 1.5;
    kunciLampu.intensity = kunciLampu.userData.dasar * kunciKini.nyala * faktorRedup;
    lampuPintu.color.setHex(s.lampu);
    lampuPintu.intensity = s.kuatLampu * 0.8;
    cahayaJalan.color.setHex(s.jalan);
    cahayaJalan.intensity = s.kuatJalan;
    bahan.jalan.map?.dispose();
    bahan.jalan.map = teksturJalan(nama === "terang");
    bahan.jalan.color.setScalar(s.terangJalan);
    bahan.jalan.needsUpdate = true;
    tumpahJalan.material.color.setHex(s.jalan);
    tumpahJalan.material.opacity = 0.5 * s.berkas;
    paparanTema = s.paparan;
    renderer.toneMappingExposure = paparanTema * pose.paparan;
    kotor = true;
  };

  // ---- Gambar: adegan ke render target, lalu satu lintasan motion blur ---------------------
  const sampel = hp ? 0 : 4;
  const kedalaman = new THREE.DepthTexture(1, 1);
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: sampel, depthTexture: kedalaman });
  // Ambient occlusion N8AO (ADR 0017): sudut, kolong, dan kaki benda gelap alami, supaya benda
  // menapak. Adegan tetap digambar sekali ke `target`; N8AO memakai warna dan kedalamannya
  // (autoRenderBeauty mati), lalu hasilnya, masih linear, dibaca lintasan layar di bawah.
  const ao = new N8AOPass(scene, camera, 1, 1);
  ao.beautyRenderTarget.dispose();
  ao.beautyRenderTarget = target;
  Object.assign(ao.configuration, {
    autoRenderBeauty: false,
    gammaCorrection: false,
    aoRadius: 1.1,
    distanceFalloff: 1,
    intensity: 5,
    aoSamples: hp ? 8 : 16,
    denoiseSamples: hp ? 4 : 8,
  });
  // Jalur setengah resolusi N8AO (halfRes) tidak dipakai: dengan target adegan pinjaman ia
  // melempar galat tiap bingkai (terukur 13 Nov 2026). HP memakai sampel lebih sedikit.
  let aoAktif = true;
  ao.configuration.color.setHex(0x1a1410);
  const hasilAO = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });

  const blur = new THREE.ShaderMaterial({
    uniforms: {
      tWarna: { value: hasilAO.texture },
      tDalam: { value: kedalaman },
      uBalik: { value: new THREE.Matrix4() },
      uLalu: { value: new THREE.Matrix4() },
      uKuat: { value: 0 },
      // Grade layar (lembar look-dev): bayangan diangkat ke cokelat, vignette lembut, butir film.
      uAngkat: { value: new THREE.Color() },
      uVignette: { value: 0 },
      uButir: { value: 0 },
      uBenih: { value: 0 },
      uAspek: { value: 1 },
      // Kedalaman layar: ambient occlusion dari peta kedalaman, dan depth of field ke benda babak.
      uDekat: { value: 0.05 },
      uJauh: { value: 40 },
      uPiksel: { value: new THREE.Vector2(1, 1) },
      uFokus: { value: 2 },
      uDof: { value: 0 },
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    // Blur kamera lewat proyeksi ulang kedalaman (GPU Gems 3 bab 27): tiap piksel diproyeksikan
    // ke posisi layar bingkai lalu, dan warna dirata-rata sepanjang jejak itu. Diam = satu sampel.
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tWarna;
      uniform sampler2D tDalam;
      uniform mat4 uBalik;
      uniform mat4 uLalu;
      uniform float uKuat;
      uniform vec3 uAngkat;
      uniform float uVignette;
      uniform float uButir;
      uniform float uBenih;
      uniform float uAspek;
      uniform float uDekat;
      uniform float uJauh;
      uniform vec2 uPiksel;
      uniform float uFokus;
      uniform float uDof;
      float acak(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float linear(float d) {
        float z = d * 2.0 - 1.0;
        return 2.0 * uDekat * uJauh / (uJauh + uDekat - z * (uJauh - uDekat));
      }
      void main() {
        vec4 c = texture2D(tWarna, vUv);
        float zKini = linear(texture2D(tDalam, vUv).x);
        // Depth of field: lingkaran kabur sebanding jarak dari bidang fokus, diambil 12 titik
        // berpola sudut emas. Hanya saat kamera diam di babak cerita.
        if (uDof > 0.001 && uKuat <= 0.001) {
          float coc = clamp(abs(zKini - uFokus) / max(zKini, 0.1) * 1.6, 0.0, 1.0) * uDof;
          if (coc > 0.02) {
            vec3 jumlah = c.rgb;
            float bobot = 1.0;
            float putar = acak(gl_FragCoord.xy) * 6.2832;
            for (int i = 1; i < 13; i++) {
              float fi = float(i);
              float r = sqrt(fi / 12.0) * coc * 4.5;
              float a = fi * 2.39996 + putar;
              vec2 uv = vUv + vec2(cos(a), sin(a)) * r * uPiksel;
              float zS = linear(texture2D(tDalam, uv).x);
              // Titik yang lebih dekat dan tajam tidak dioles ke latar.
              float w = smoothstep(0.0, 0.25, abs(zS - uFokus) / max(zS, 0.1));
              jumlah += texture2D(tWarna, uv).rgb * w;
              bobot += w;
            }
            c.rgb = jumlah / bobot;
          }
        }
        if (uKuat > 0.001) {
          float d = texture2D(tDalam, vUv).x;
          vec4 p = uBalik * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
          p /= p.w;
          vec4 q = uLalu * p;
          vec2 v = (vUv - (q.xy / q.w * 0.5 + 0.5)) * uKuat;
          float pj = length(v);
          if (pj > 0.06) v *= 0.06 / pj;
          vec3 jumlah = c.rgb;
          for (int i = 1; i < 10; i++) jumlah += texture2D(tWarna, vUv + v * (float(i) / 9.0 - 0.5)).rgb;
          c.rgb = jumlah / 10.0;
        }
        gl_FragColor = vec4(c.rgb, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        vec3 g = gl_FragColor.rgb;
        g = g + uAngkat * (1.0 - g);
        vec2 d = (vUv - 0.5) * vec2(uAspek, 1.0);
        g *= 1.0 - uVignette * smoothstep(0.35, 1.05, length(d) * 1.25);
        // Butir lebih kuat di nada tengah, seperti film; tidak mengotori hitam dan putih.
        float n = acak(gl_FragCoord.xy + uBenih) - 0.5;
        float l = dot(g, vec3(0.299, 0.587, 0.114));
        g += n * uButir * (0.35 + 2.6 * l * (1.0 - l));
        gl_FragColor = vec4(g, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const segitiga = new THREE.BufferGeometry();
  segitiga.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  segitiga.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const layar = new THREE.Mesh(segitiga, blur);
  layar.frustumCulled = false;
  const adeganLayar = new THREE.Scene();
  adeganLayar.add(layar);
  const kameraLayar = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const vpLalu = new THREE.Matrix4();
  const vpKini = new THREE.Matrix4();
  const gambar = (kuat) => {
    camera.updateMatrixWorld();
    vpKini.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    blur.uniforms.uBalik.value.copy(vpKini).invert();
    blur.uniforms.uLalu.value.copy(vpLalu);
    blur.uniforms.uKuat.value = kuat;
    blur.uniforms.uFokus.value = camera.position.distanceTo(lihat);
    // Butir berganti hanya saat adegan digambar ulang; diam berarti butir ikut diam.
    if (!kurangiGerak) blur.uniforms.uBenih.value = (blur.uniforms.uBenih.value + 37.13) % 1000;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    if (aoAktif) ao.render(renderer, hasilAO);
    renderer.setRenderTarget(null);
    renderer.render(adeganLayar, kameraLayar);
    vpLalu.copy(vpKini);
  };

  // ---- Kamera ------------------------------------------------------------------------------
  const salinPose = (p) => ({ posisi: [...p.posisi], lihat: [...p.lihat], fov: p.fov, paparan: p.paparan ?? 1 });
  let pose = salinPose(ANCHOR[0]);
  let blend = null; // { dari, ke, t0, dur }
  let indeks = 0;
  let geser = 0;
  let geserTujuan = 0;
  const posLalu = new THREE.Vector3();
  const lihatLalu = new THREE.Vector3();
  const lihat = new THREE.Vector3();
  const samping = new THREE.Vector3();
  const atas = new THREE.Vector3(0, 1, 0);

  const pasangKamera = () => {
    camera.position.set(...pose.posisi);
    lihat.set(...pose.lihat);
    // Geser dalam tempat: menyamping tegak lurus arah pandang, dan sedikit maju.
    samping.subVectors(lihat, camera.position).normalize();
    const maju = samping.clone().multiplyScalar(GESER.maju * geser);
    samping.cross(atas).normalize().multiplyScalar(GESER.samping * geser);
    camera.position.add(samping).add(maju);
    lihat.add(samping);
    camera.lookAt(lihat);
    renderer.toneMappingExposure = paparanTema * pose.paparan;
    if (camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
  };

  const keAnchor = (i) => {
    if (i === indeks && !blend) return;
    const ke = camera.aspect < 0.8 ? anchorTegak(ANCHOR[i]) : ANCHOR[i];
    indeks = i;
    arahkanKunci(ANCHOR[i], kurangiGerak);
    if (kurangiGerak) {
      pose = salinPose(ke);
      blend = null;
      kotor = true;
      return;
    }
    blend = { dari: salinPose(pose), ke, t0: performance.now(), dur: durasiBlend(pose, ke) * 1000 };
  };

  // ---- Ukuran dan kualitas -----------------------------------------------------------------
  let kotor = true;
  const ukur = () => {
    const w = wadah.clientWidth || innerWidth;
    const h = wadah.clientHeight || innerHeight;
    renderer.setPixelRatio(rasio);
    renderer.setSize(w, h, false);
    const pw = Math.max(1, Math.floor(w * rasio));
    const ph = Math.max(1, Math.floor(h * rasio));
    target.setSize(pw, ph);
    ao.setSize(pw, ph);
    hasilAO.setSize(pw, ph);
    camera.aspect = w / h;
    blur.uniforms.uAspek.value = w / h;
    blur.uniforms.uPiksel.value.set(1 / pw, 1 / ph);
    // Layar tegak: bidang pandang dilebarkan supaya benda kunci tetap masuk bingkai.
    camera.zoom = w / h < 0.8 ? 0.62 : 1;
    camera.updateProjectionMatrix();
    kotor = true;
  };
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);
  ukur();

  // Penjaga kualitas: bila median bingkai selama kamera terbang di atas 26 ms (di bawah ~38 fps)
  // dua kali berturut-turut, resolusi diturunkan bertahap. Bingkai di atas 100 ms diabaikan:
  // itu tugas panjang di luar dunia (seksi lain menyiapkan dirinya), bukan GPU yang kewalahan.
  const lambat = [];
  let buruk = 0;
  const jagaKualitas = (dt) => {
    if (dt > 100) return;
    lambat.push(dt);
    if (lambat.length < 24) return;
    lambat.sort((a, b) => a - b);
    const median = lambat[lambat.length >> 1];
    lambat.length = 0;
    buruk = median > 26 ? buruk + 1 : 0;
    if (buruk >= 2 && rasio > 0.75) {
      buruk = 0;
      rasio = Math.max(0.75, rasio - 0.2);
      // Yang pertama dikorbankan AO: sampelnya dikurangi, lalu dimatikan.
      if (ao.configuration.aoSamples > 8) {
        ao.configuration.aoSamples = 8;
        ao.configuration.denoiseSamples = 4;
      } else if (aoAktif) {
        aoAktif = false;
        blur.uniforms.tWarna.value = target.texture;
      }
      ukur();
    }
  };

  // ---- Lup ---------------------------------------------------------------------------------
  let terlihat = true;
  let hangat = false;
  let raf = 0;
  let lalu = performance.now();
  const bingkai = (now) => {
    raf = requestAnimationFrame(bingkai);
    const dt = Math.min(0.1, (now - lalu) / 1000);
    lalu = now;
    if (!hangat || !terlihat) return;
    let bergerak = false;
    if (blend) {
      const u = (now - blend.t0) / blend.dur;
      pose = poseAntara(blend.dari, blend.ke, easeInOut(u));
      pasangKunci(easeInOut(u));
      if (u >= 1) {
        pose = salinPose(blend.ke);
        blend = null;
      }
      bergerak = true;
    }
    const sisa = geserTujuan - geser;
    if (Math.abs(sisa) > 1e-4) {
      geser += sisa * (1 - Math.exp(-dt / 0.18));
      bergerak = true;
    }
    const a = ANCHOR[indeks];
    if (a.cerita && !blend && props) {
      const u = geser + 0.5;
      const lampuStatus = a.id === "fondasi" ? nyalaFondasi(u) : 0;
      props.perbarui(a.id, u, { waktu: now / 1000, nyala: lampuStatus });
      // Listrik toko padam di tengah babak andal, didahului kedip singkat. Pemutar kaset, ponsel,
      // dan lampu darurat tetap menyala.
      // Diatur oleh posisi gulir, bukan waktu: kedip berbasis waktu (sin(now/30), sekitar 5 Hz)
      // berkedip terus selama pembaca berhenti di rentang itu. Sekarang satu kedip pendek saat
      // digulir melewati u 0,43, lalu padam memudar.
      const padam = a.id === "andal" && u > 0.42 && u < 0.72;
      redup(padam ? (u < 0.435 ? 0.45 : u < 0.445 ? 0.8 : 0.05) : 1);
      if (props.berputar(a.id) && !kurangiGerak) bergerak = true;
      // Kerucut berkas lampu gantung hanya untuk gambar lebar; dari dekat ia jadi segitiga putih.
      nyala.kerucut(a.id === "dinding");
      // Bayangan kunci digambar ulang hanya saat benda babak bergerak mengikuti gulir.
      if (Math.abs(geserTujuan - geser) > 1e-4 || kotor) kunciLampu.shadow.needsUpdate = true;
    } else {
      redup(1);
      nyala.kerucut(true);
    }
    if (langkahRedup(dt)) bergerak = true;
    if (nyala.langkah(dt)) bergerak = true;
    // Fokus ke benda babak hanya saat kamera sudah mendarat; selama terbang yang bekerja motion blur.
    const dofTujuan = a.cerita && !blend && !kurangiGerak ? 1 : 0;
    const dof = blur.uniforms.uDof;
    if (Math.abs(dofTujuan - dof.value) > 0.01) {
      dof.value += (dofTujuan - dof.value) * (1 - Math.exp(-dt / 0.25));
      bergerak = true;
    } else dof.value = dofTujuan;
    if (!bergerak && !kotor) return;
    posLalu.copy(camera.position);
    lihatLalu.copy(lihat);
    pasangKamera();
    const kecepatan = dt > 0 ? Math.max(camera.position.distanceTo(posLalu), lihat.distanceTo(lihatLalu) * 0.6) / dt : 0;
    const kuat = kekuatanBlur(kecepatan, kurangiGerak);
    gambar(kuat > 0 ? Math.min(1, kuat * 5) * 1.6 : 0);
    // Penjaga kualitas juga saat menggambar terus (piringan berputar, geser gulir), bukan hanya
    // saat terbang: di sana lag terasa paling lama.
    if (bergerak) jagaKualitas(dt * 1000);
    kotor = false;
  };

  // redup() menyetel tujuan; terang lampu memudar ke sana di langkahRedup(), tidak melompat.
  let tujuanRedup = 1;
  const redup = (f) => {
    tujuanRedup = f;
    nyala.redup(f);
  };
  const langkahRedup = (dt) => {
    if (faktorRedup === tujuanRedup) return false;
    const f = Math.abs(tujuanRedup - faktorRedup) < 0.002 ? tujuanRedup : faktorRedup + (tujuanRedup - faktorRedup) * (1 - Math.exp(-dt / 0.12));
    faktorRedup = f;
    for (const l of [...lampu, lampuMeja]) l.intensity = (l.userData.dasar ?? l.intensity) * f;
    kunciLampu.intensity = (kunciLampu.userData.dasar ?? 0) * kunciKini.nyala * f;
    return true;
  };

  // ---- Muat dan pemanasan ------------------------------------------------------------------
  const muat = async () => {
    const [kayu, busa, beton, betonKasar, kursi, lampuGantung, kaset, hp] = await Promise.all([
      tekstur("kayu.webp", [1, 1]),
      tekstur("busa.webp", [3, 3]),
      tekstur("beton.webp", [3, 2.4]),
      tekstur("beton-kasar.webp", [3, 2.4]),
      ...MODEL.map(model),
    ]);
    // Dinding plester (Poly Haven CC0): warna dinding tetap dari suasana, teksturnya memberi
    // serat dan pantulan yang tidak rata.
    const [plester, plesterNormal, plesterKasar] = await Promise.all([
      tekstur("bahan/plester-warna.webp", [3, 1]),
      tekstur("bahan/plester-normal.webp", [3, 1]),
      tekstur("bahan/plester-kasar.webp", [3, 1]),
    ]);
    plesterNormal.colorSpace = plesterKasar.colorSpace = THREE.NoColorSpace;
    Object.assign(bahan.dinding, { map: plester, normalMap: plesterNormal, roughnessMap: plesterKasar, roughness: 1 });
    bahan.dinding.normalScale.setScalar(0.7);
    bahan.dinding.needsUpdate = true;
    // Peta roughness adalah data, bukan warna: dibaca tanpa konversi sRGB.
    betonKasar.colorSpace = THREE.NoColorSpace;
    bahan.lantai.map = beton;
    bahan.lantai.roughnessMap = betonKasar;
    bahan.lantai.color.setHex(0xffffff);
    bahan.lantai.roughness = 1;
    bahan.lantai.needsUpdate = true;
    bahan.kayu.map = kayu;
    bahan.busa.map = busa;
    bahan.busa.color.setHex(0xffffff);
    for (const m of [bahan.kayu, bahan.busa]) m.needsUpdate = true;

    const taruh = (asal, x, y, z, ry = 0, s = 1) => {
      const o = asal.clone();
      o.position.set(x, y, z);
      o.rotation.y = ry;
      o.scale.setScalar(s);
      scene.add(o);
      return o;
    };
    // Didudukkan di permukaan menurut kotak batasnya, bukan titik asal model: titik asal pemutar
    // kaset ada di tengah badannya, jadi separuh badannya dulu tenggelam ke papan (13 Nov 2026).
    const dudukkan = (o, atas) => {
      o.updateMatrixWorld(true);
      o.position.y += atas - new THREE.Box3().setFromObject(o).min.y;
      return o;
    };
    taruh(kursi, -3.55, 0, -2.75, 0.6);
    taruh(kursi, 1.4, 0, 2.15, -0.3);
    taruh(kursi, 2.5, 0, 2.2, 0.4);
    for (const l of lampu) taruh(lampuGantung, l.position.x, 3.2, l.position.z, 0, SKALA_LAMPU);
    dudukkan(taruh(kaset, -4.05, 0, -3.74, 0.35, 1.5), 1.045); // papan rak dengar bilik

    // Headphone Hunyuan3D hanya berisi bentuk (tanpa normal dan tekstur): normal dihitung di sini,
    // ukurannya disetel ke tinggi 22 cm, lalu digantung di puncak dudukan.
    hp.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.computeVertexNormals();
      o.material = bahan.gelapMatte;
    });
    const batas = new THREE.Box3().setFromObject(hp);
    const skala = 0.22 / batas.getSize(new THREE.Vector3()).y;
    const pusat = batas.getCenter(new THREE.Vector3()).multiplyScalar(skala);
    hp.scale.setScalar(skala);
    hp.position.set(-pusat.x, 0.2 - pusat.y, -pusat.z);
    headphone.add(hp);
    dudukkan(taruh(kaset, 1.35, 0, 3.0, -0.6, 1.4), 1.01); // permukaan meja kasir
    modelHeadphone = hp;
    modelKaset = kaset;
    // Ruangan menerima bayangan lampu kunci; yang membuatnya hanya props cerita.
    tandaiBayangan(scene);
    kotor = true;
  };

  let modelHeadphone = null;
  let modelKaset = null;

  // Semua benda menerima bayangan; yang membuat bayangan adalah benda, bukan bidang ruangan.
  const bidangRuang = new Set([bahan.dinding, bahan.plafon, bahan.lantai]);
  const tandaiBayangan = (akar) =>
    akar.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      if (m?.isMeshBasicMaterial || m?.transparent || m?.isSpriteMaterial) return;
      o.receiveShadow = true;
      o.castShadow = !bidangRuang.has(m);
    });
  // Peta bayangan lampu yang diam dihitung satu lampu per bingkai: enam sisi kubus per lampu
  // titik sekaligus untuk tujuh lampu terlalu panjang untuk satu bingkai.
  const lampuBerbayang = () => [...lampu, cahayaJalan, kunciLampu];
  const perbaruiBayangan = async () => {
    for (const l of lampuBerbayang()) {
      l.shadow.needsUpdate = true;
      // Seluruh adegan ke 1 piksel: peta bayangan dihitung dari semua benda, layarnya tidak berubah.
      target.scissor.set(0, 0, 1, 1);
      target.scissorTest = true;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      target.scissorTest = false;
      await bingkaiBerikut();
    }
  };

  // Gambar latihan sekelompok benda ke render target 1 piksel. Benda lain disembunyikan hanya
  // di dalam panggilan ini, jadi bingkai biasa tidak pernah melihat adegan yang setengah.
  // frustumCulled dimatikan: benda di luar pandangan kamera saat itu juga harus tergambar, kalau
  // tidak programnya baru diselesaikan ANGLE saat pertama terlihat (trace 13 Nov 2026: 778 ms
  // beku di dekat rak, karena GPU sedang mengompilasi shader rak).
  const latih = (kelompok) => {
    const sembunyi = [];
    scene.traverse((o) => o.isMesh && o.visible && !kelompok.includes(o) && (sembunyi.push(o), (o.visible = false)));
    const pulih = kelompok.map((o) => [o, o.visible, o.frustumCulled]);
    for (const o of kelompok) {
      o.visible = true;
      o.frustumCulled = false;
    }
    target.scissor.set(0, 0, 1, 1);
    target.scissorTest = true;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    target.scissorTest = false;
    for (const [o, v, f] of pulih) {
      o.visible = v;
      o.frustumCulled = f;
    }
    for (const o of sembunyi) o.visible = true;
  };

  // Props cerita sesudah dunia siap: dimuat, dikompilasi, teksturnya diunggah satu per bingkai,
  // lalu digambar latihan per tiga benda, baru tampil. Sama dengan siapkan(), tapi tanpa loader.
  const muatCerita = async () => {
    if (props) return;
    const calon = buatPropsCerita({ bahan, tekstur, tambahBayang: bayang, lampuMeja, lampuDarurat });
    const daftar = calon.modelDibutuhkan;
    const [hasil] = await Promise.all([Promise.all(daftar.map(model)), calon.tunggu()]);
    calon.pasangModel({ ...Object.fromEntries(daftar.map((n, i) => [n, hasil[i]])), headphone: modelHeadphone, kaset: modelKaset });
    tandaiBayangan(calon.grup);
    calon.grup.visible = false;
    scene.add(calon.grup);
    renderer.setRenderTarget(target);
    try {
      await renderer.compileAsync(calon.grup, camera, scene);
    } catch {}
    renderer.setRenderTarget(null);
    const tx = new Set();
    calon.grup.traverse((o) =>
      [].concat(o.material ?? []).forEach((m) => {
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"]) if (m[k]) tx.add(m[k]);
        for (const u of Object.values(m.uniforms ?? {})) if (u.value?.isTexture) tx.add(u.value);
      }),
    );
    for (const t of tx) {
      if (t.image) renderer.initTexture(t);
      await bingkaiBerikut();
    }
    calon.grup.visible = true;
    const benda = [];
    calon.grup.traverse((o) => o.isMesh && benda.push(o));
    for (let i = 0; i < benda.length; i += 3) {
      latih(benda.slice(i, i + 3));
      await bingkaiBerikut();
    }
    props = calon;
    await perbaruiBayangan();
    kotor = true;
  };

  // Pemanasan sebelum gambar pertama (pola siapkan() rak, PR #54): shader dikompilasi lewat
  // compileAsync untuk render target yang dipakai, tekstur diunggah satu per bingkai, lalu satu
  // gambar utuh. `onHangat` menerima 0..1.
  const siapkan = async (onHangat = () => {}) => {
    terapkanTema(tema);
    pasangKamera();
    renderer.setRenderTarget(target);
    try {
      await renderer.compileAsync(scene, camera);
    } catch {}
    renderer.setRenderTarget(null);
    performance.mark("dunia:kompilasi");
    onHangat(0.5);
    const tx = new Set();
    scene.traverse((o) =>
      [].concat(o.material ?? []).forEach((m) => {
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) if (m[k]) tx.add(m[k]);
      }),
    );
    let n = 0;
    for (const t of tx) {
      if (t.image) renderer.initTexture(t);
      onHangat(0.5 + (0.4 * ++n) / Math.max(1, tx.size));
      await bingkaiBerikut();
    }
    performance.mark("dunia:tekstur");
    // Gambar latihan per beberapa benda, satu kelompok per bingkai, ke 1 piksel render target.
    // ANGLE (D3D11) baru menyelesaikan program saat draw pertama; sekaligus semuanya terukur
    // 386 ms beku. Dicicil begini, loader tetap bergerak.
    // Termasuk benda yang masih tersembunyi atau di luar pandangan (lihat latih()).
    const benda = [];
    scene.traverse((o) => o.isMesh && benda.push(o));
    for (let i = 0; i < benda.length; i += 3) {
      latih(benda.slice(i, i + 3));
      onHangat(0.9 + (0.08 * (i + 3)) / benda.length);
      await bingkaiBerikut();
    }
    await perbaruiBayangan();
    performance.mark("dunia:bayangan");
    gambar(0);
    await bingkaiBerikut();
    hangat = true;
    lalu = performance.now();
    onHangat(1);
  };

  raf = requestAnimationFrame(bingkai);

  return {
    kanvas,
    muat,
    siapkan,
    muatCerita,
    keAnchor,
    get indeks() {
      return indeks;
    },
    setGeser(k) {
      geserTujuan = Math.max(-0.5, Math.min(0.5, k));
    },
    setTerlihat(v) {
      if (v && !terlihat) kotor = true;
      terlihat = v;
    },
    setTema(nama) {
      tema = nama;
      if (hangat) terapkanTema(nama);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material ?? []).forEach((m) => {
          for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
          m.dispose();
        });
      });
      target.dispose();
      ao.dispose?.();
      hasilAO.dispose();
      kedalaman.dispose();
      blur.dispose();
      segitiga.dispose();
      renderer.dispose();
      kanvas.remove();
    },
  };
}

// Dudukan headphone: tiang logam dan alas.
function buatDudukan(b) {
  const g = new THREE.Group();
  const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 12), b.logam);
  tiang.position.y = 0.15;
  const alas = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.012, 32), b.gelapMatte);
  alas.position.y = 0.006;
  g.add(tiang, alas);
  return g;
}

// Kartu catatan sampul: satu atlas kanvas (12 rupa), satu geometri, satu draw call.
function buatCatatan() {
  const kv = document.createElement("canvas");
  kv.width = 1024;
  kv.height = 768;
  const c = kv.getContext("2d");
  const kertas = ["#efe6d4", "#e7dcc6", "#f3ede1", "#e2d5bd"];
  const aksen = ["#e05a4a", "#3f6fa8", "#d9a441", "#4d8a5c", "#2b2a2e"];
  const acak = mulberry(7);
  for (let i = 0; i < 12; i++) {
    const x = (i % 4) * 256;
    const y = Math.floor(i / 4) * 256;
    c.fillStyle = kertas[i % kertas.length];
    c.fillRect(x + 4, y + 4, 248, 248);
    c.fillStyle = "#2b2a2e";
    c.fillRect(x + 22, y + 26, 100 + acak() * 90, 12);
    c.fillStyle = "#6b645a";
    const kotakSeni = i % 3 === 0;
    if (kotakSeni) {
      c.fillStyle = aksen[i % aksen.length];
      c.fillRect(x + 22, y + 52, 92, 92);
    }
    c.fillStyle = "#8a8378";
    for (let b = 0; b < 11; b++) {
      const by = y + 56 + b * 15;
      const bx = kotakSeni && by < y + 150 ? x + 126 : x + 22;
      c.fillRect(bx, by, (x + 230 - bx) * (0.55 + acak() * 0.45), 5);
    }
    c.fillStyle = "#c9443a";
    c.beginPath();
    c.arc(x + 128, y + 14, 6, 0, Math.PI * 2);
    c.fill();
  }
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const posisi = [];
  const uv = [];
  const indeks = [];
  let n = 0;
  for (let baris = 0; baris < 4; baris++)
    for (let kol = 0; kol < 8; kol++) {
      if (acak() < 0.12) continue;
      const w = 0.3 + acak() * 0.06;
      const h = w * (1.05 + acak() * 0.2);
      const cx = -1.45 + kol * 0.42 + (acak() - 0.5) * 0.08;
      const cy = 0.75 - baris * 0.48 + (acak() - 0.5) * 0.08;
      const r = (acak() - 0.5) * 0.14;
      const sel = Math.floor(acak() * 12);
      const u0 = (sel % 4) / 4;
      const v0 = 1 - (Math.floor(sel / 4) + 1) / 3;
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        const x = (sx * w) / 2;
        const y = (sy * h) / 2;
        posisi.push(cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r), n * 0.0004);
        uv.push(u0 + (sx > 0 ? 0.25 : 0), v0 + (sy > 0 ? 1 / 3 : 0));
      }
      const o = n * 4;
      indeks.push(o, o + 1, o + 2, o, o + 2, o + 3);
      n++;
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(posisi, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indeks);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
}

// Rak CD di dinding kanan: rangka kayu plus ribuan punggung CD sebagai satu InstancedMesh.
function buatRakCD(b) {
  const g = new THREE.Group();
  const z0 = -2.6;
  const z1 = 2.2;
  const panjang = z1 - z0;
  const tinggiRak = [0.32, 0.72, 1.12, 1.52, 1.92];
  const papan = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, panjang), b.kayu);
  for (const y of [...tinggiRak, 2.32]) {
    const p = papan.clone();
    p.position.set(4.8, y - 0.015, (z0 + z1) / 2);
    g.add(p);
  }
  for (const z of [z0, (z0 + z1) / 2, z1]) {
    const tiang = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.34, 0.04), b.kayu);
    tiang.position.set(4.8, 1.17, z);
    g.add(tiang);
  }
  const warna = ["#2b2a2e", "#e05a4a", "#e9e1d3", "#3f6fa8", "#d9a441", "#4d8a5c", "#6b645a", "#8a5a9e", "#c7c2b8"].map(
    (w) => new THREE.Color(w),
  );
  const acak = mulberry(11);
  const tebal = 0.0104;
  const per = Math.floor((panjang - 0.1) / (tebal + 0.0006));
  const cd = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.125, 0.142, tebal),
    new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 }),
    per * tinggiRak.length,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  let n = 0;
  for (const y of tinggiRak) {
    let z = z0 + 0.04;
    while (z < z1 - 0.04 && n < cd.count) {
      // Celah sesekali, seperti rak toko yang tidak pernah penuh rapat.
      if (acak() < 0.02) {
        z += 0.05 + acak() * 0.08;
        continue;
      }
      // Celah untuk tiga kotak CD yang masuk di akhir cerita (props.js, babak rilis).
      if (y === 1.52 && z > -0.37 && z < -0.29) {
        z = -0.29;
        continue;
      }
      if (Math.abs(z - (z0 + z1) / 2) < 0.03) {
        z += 0.06;
        continue;
      }
      e.set(0, 0, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(4.8 + (acak() - 0.5) * 0.02, y + 0.071, z), q, new THREE.Vector3(1, 1, 1));
      cd.setMatrixAt(n, m);
      cd.setColorAt(n, warna[Math.floor(acak() * warna.length)]);
      z += tebal + 0.0006;
      n++;
    }
  }
  cd.count = n;
  g.add(cd);
  return g;
}

// Benda di dinding depan (z = 4): semua dari primitif, isinya InstancedMesh supaya ratusan
// kaset dan sampul tetap beberapa draw call. Satu warna instance per benda, tanpa tekstur.
function buatDindingDepan(b) {
  const g = new THREE.Group();
  const acak = mulberry(47);
  const papan = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), b.kayu);
    m.position.set(x, y, z);
    g.add(m);
  };
  const isi = (geo, warna, posisi) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.02 }), posisi.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    posisi.forEach(([x, y, z, rz = 0, rx = 0], i) => {
      e.set(rx, 0, rz);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
      im.setMatrixAt(i, m);
      im.setColorAt(i, warna[Math.floor(acak() * warna.length)]);
    });
    g.add(im);
  };
  const tinta = (daftar) => daftar.map((w) => new THREE.Color(w));

  // Rak kaset di belakang meja kasir: 5 papan, kaset berdiri dengan punggung menghadap ruangan.
  const x0 = 0.6;
  const x1 = 4.4;
  const zr = 3.86;
  for (const y of [1.2, 1.5, 1.8, 2.1, 2.4]) papan(x1 - x0, 0.025, 0.16, (x0 + x1) / 2, y, zr);
  for (const x of [x0, (x0 + x1) / 2, x1]) papan(0.03, 1.34, 0.16, x, 1.86, zr);
  const kaset = [];
  for (const y of [1.2, 1.5, 1.8, 2.1]) {
    let x = x0 + 0.03;
    while (x < x1 - 0.03) {
      if (acak() < 0.03) x += 0.06 + acak() * 0.1;
      else if (Math.abs(x - (x0 + x1) / 2) < 0.03) x += 0.04;
      else {
        kaset.push([x, y + 0.0675, zr + 0.01 + (acak() - 0.5) * 0.01, (acak() - 0.5) * 0.04]);
        x += 0.0175;
      }
    }
  }
  isi(new THREE.BoxGeometry(0.017, 0.11, 0.07), tinta(["#e9e1d3", "#2b2a2e", "#c9443a", "#d9a441", "#3f6fa8", "#4d8a5c", "#8a8378", "#c7c2b8"]), kaset);

  // Peti piringan di kanan pintu: kotak kayu terbuka di atas kaki pendek, sampul condong ke belakang.
  const petiX = -0.15;
  const petiZ = 3.55;
  papan(0.82, 0.02, 0.38, petiX, 0.55, petiZ);
  papan(0.82, 0.3, 0.02, petiX, 0.7, petiZ - 0.18);
  papan(0.82, 0.3, 0.02, petiX, 0.7, petiZ + 0.18);
  papan(0.02, 0.3, 0.38, petiX - 0.4, 0.7, petiZ);
  papan(0.02, 0.3, 0.38, petiX + 0.4, 0.7, petiZ);
  for (const dx of [-0.36, 0.36]) for (const dz of [-0.15, 0.15]) papan(0.04, 0.55, 0.04, petiX + dx, 0.275, petiZ + dz);
  const piringan = [];
  for (let i = 0; i < 46; i++) piringan.push([petiX - 0.37 + i * 0.016, 0.72, petiZ, -0.18 - acak() * 0.08]);
  isi(new THREE.BoxGeometry(0.004, 0.31, 0.31), tinta(["#e05a4a", "#efe6d4", "#2b2a2e", "#3f6fa8", "#d9a441", "#8a5a9e", "#4d8a5c", "#c46b3a"]), piringan);

  // Rak sampul piringan di kiri pintu: lemari rendah dua tingkat, sampul berdiri rapat.
  const rx0 = -4.8;
  const rx1 = -2.45;
  const zs = 3.78;
  for (const y of [0.02, 0.48, 0.94]) papan(rx1 - rx0, 0.03, 0.36, (rx0 + rx1) / 2, y, zs);
  for (const x of [rx0, (rx0 + rx1) / 2, rx1]) papan(0.03, 0.95, 0.36, x, 0.475, zs);
  const sampul = [];
  for (const y of [0.035, 0.495])
    for (let x = rx0 + 0.04; x < rx1 - 0.04; x += 0.0065) {
      if (Math.abs(x - (rx0 + rx1) / 2) < 0.03 || acak() < 0.015) continue;
      sampul.push([x, y + 0.155, zs + (acak() - 0.5) * 0.02, (acak() - 0.5) * 0.03]);
    }
  isi(new THREE.BoxGeometry(0.0045, 0.31, 0.31), tinta(["#efe6d4", "#2b2a2e", "#e05a4a", "#d9a441", "#3f6fa8", "#6b645a", "#c7c2b8"]), sampul);

  // Dua poster tanpa tulisan: komposisi bidang seperti poster konser lama, sudut ditempel selotip.
  for (const [x, y, w, h, benih] of [
    [0.05, 1.95, 0.5, 0.7, 3],
    [-3.6, 1.75, 0.62, 0.86, 9],
  ]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: teksturPoster(benih), roughness: 0.9 }));
    m.position.set(x, y, 3.985);
    m.rotation.set(0, Math.PI, (mulberry(benih)() - 0.5) * 0.04);
    g.add(m);
  }
  return g;
}

function teksturPoster(benih) {
  const kv = document.createElement("canvas");
  kv.width = 256;
  kv.height = 352;
  const c = kv.getContext("2d");
  const acak = mulberry(benih);
  const palet = ["#e05a4a", "#d9a441", "#3f6fa8", "#2b2a2e", "#4d8a5c"];
  c.fillStyle = "#e7dcc6";
  c.fillRect(0, 0, 256, 352);
  c.fillStyle = palet[benih % palet.length];
  c.fillRect(18, 18, 220, 230);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = palet[Math.floor(acak() * palet.length)];
    c.beginPath();
    c.arc(40 + acak() * 176, 50 + acak() * 170, 18 + acak() * 50, 0, Math.PI * 2);
    c.fill();
  }
  // Baris-baris abu di bawah gambar meniru susunan huruf tanpa menulis apa pun.
  c.fillStyle = "#2b2a2e";
  c.fillRect(18, 266, 150, 16);
  c.fillStyle = "#8a8378";
  for (let i = 0; i < 3; i++) c.fillRect(18, 294 + i * 14, 120 + acak() * 90, 6);
  c.fillStyle = "rgba(240,232,210,0.75)";
  for (const [x, y] of [
    [0, 0],
    [216, 0],
    [0, 324],
    [216, 324],
  ])
    c.fillRect(x, y, 40, 28);
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Stiker label di meja kasir: cakram kecil berwarna, satu InstancedMesh.
function buatStiker() {
  const acak = mulberry(23);
  const warna = ["#e05a4a", "#ffd84a", "#5aa8ff", "#6bd49e", "#c46bff", "#f3ede1"].map((w) => new THREE.Color(w));
  const s = new THREE.InstancedMesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshStandardMaterial({ roughness: 0.5 }), 16);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  for (let i = 0; i < 16; i++) {
    const r = 0.8 + acak() * 0.6;
    m.compose(new THREE.Vector3(1.0 + acak() * 1.4, 1.012 + i * 0.0002, 2.78 + acak() * 0.42), q, new THREE.Vector3(r, r, r));
    s.setMatrixAt(i, m);
    s.setColorAt(i, warna[i % warna.length]);
  }
  return s;
}

// Nyala lampu gantung: bola lampu, halo, kerucut berkas, dan kolam cahaya di lantai. Satu
// tekstur radial dan satu tekstur gradasi dipakai bersama; semua bahan additive, tanpa kabut,
// tanpa menulis kedalaman. `setel` mengikuti warna lampu dan kuat berkas per suasana.
function buatNyala(lampu) {
  const grup = new THREE.Group();
  const radial = teksturRadial();
  const tegak = teksturTegak();
  const tambah = (o) => ({ transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, ...o });
  const bola = new THREE.MeshBasicMaterial({ fog: false });
  const halo = new THREE.SpriteMaterial(tambah({ map: radial, opacity: 0.55 }));
  const kerucut = new THREE.MeshBasicMaterial(tambah({ map: tegak, opacity: 0.07, side: THREE.DoubleSide }));
  const kolam = new THREE.MeshBasicMaterial(tambah({ map: radial, opacity: 0.22 }));
  const geoBola = new THREE.SphereGeometry(0.035, 16, 10);
  let kuatBerkas = 1;
  let warna = 0xffffff;
  let [tujuanKerucut, kerucutKini, tujuanRedup, redupKini] = [1, 1, 1, 1];
  const terapkan = () => {
    bola.color.setHex(warna).multiplyScalar(6 * Math.max(0.15, redupKini));
    for (const [m, dasar] of [
      [halo, 0.55],
      [kerucut, 0.07 * kerucutKini],
      [kolam, 0.22],
    ]) {
      m.color.setHex(warna);
      m.opacity = dasar * kuatBerkas * redupKini;
    }
    kerucut.visible = kerucut.opacity > 0.0005;
  };
  for (const l of lampu) {
    const { x, y, z } = l.position;
    const b = new THREE.Mesh(geoBola, bola);
    b.position.set(x, y - 0.02, z);
    const h = new THREE.Sprite(halo);
    h.position.copy(b.position);
    h.scale.setScalar(0.5);
    // Kerucut dari kap lampu sampai lantai, terbuka di kedua ujung.
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.95, y, 32, 1, true), kerucut);
    k.position.set(x, y / 2, z);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), kolam);
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, 0.004, z);
    p.renderOrder = 2;
    grup.add(b, h, k, p);
  }
  return {
    grup,
    // Bola dan halo saja, tanpa kerucut dan kolam: untuk lampu dinding kecil.
    tambahBola(l) {
      const b = new THREE.Mesh(geoBola, bola);
      b.position.copy(l.position);
      const h = new THREE.Sprite(halo);
      h.position.copy(l.position);
      h.scale.setScalar(0.35);
      grup.add(b, h);
    },
    // Kerucut dan redup listrik tidak pernah dinyalakan atau dimatikan seketika: dulu
    // `visible` berganti dalam satu bingkai dan terbaca sebagai kedip (masukan Farrez 13 Nov).
    // kerucut() dan redup() hanya menyetel tujuan; langkah(dt) memudarkan ke sana dan
    // mengembalikan true selama masih berubah, supaya pemanggil menggambar ulang.
    kerucut(v) {
      tujuanKerucut = v && kuatBerkas > 0.3 ? 1 : 0;
    },
    redup(f) {
      tujuanRedup = f;
    },
    langkah(dt) {
      const dekat = (a, b) => Math.abs(a - b) < 0.002;
      if (dekat(kerucutKini, tujuanKerucut) && dekat(redupKini, tujuanRedup)) {
        if (kerucutKini === tujuanKerucut && redupKini === tujuanRedup) return false;
        kerucutKini = tujuanKerucut;
        redupKini = tujuanRedup;
      } else {
        const k = 1 - Math.exp(-dt / 0.35);
        kerucutKini += (tujuanKerucut - kerucutKini) * k;
        redupKini += (tujuanRedup - redupKini) * (1 - Math.exp(-dt / 0.12));
      }
      terapkan();
      return true;
    },
    setel(w, kuat) {
      warna = w;
      kuatBerkas = kuat;
      if (kuat <= 0.3) tujuanKerucut = kerucutKini = 0;
      terapkan();
    },
  };
}

function teksturRadial() {
  const kv = document.createElement("canvas");
  kv.width = kv.height = 128;
  const c = kv.getContext("2d");
  const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,0.45)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gr;
  c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(kv);
}

// Gradasi tegak untuk kerucut berkas: terang di dekat kap, memudar ke lantai.
function teksturTegak() {
  const kv = document.createElement("canvas");
  kv.width = 4;
  kv.height = 128;
  const c = kv.getContext("2d");
  const gr = c.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.6, "rgba(255,255,255,0.35)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gr;
  c.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(kv);
}

// Bayangan kontak lembut: gradasi radial, bukan peta bayangan, supaya murah di HP.
function teksturBayang() {
  const kv = document.createElement("canvas");
  kv.width = kv.height = 128;
  const c = kv.getContext("2d");
  const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,0.55)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = gr;
  c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(kv);
}

// Jalan di balik kaca pintu: malam dengan lampu jalan, atau pagi yang terang.
function teksturJalan(terang) {
  const kv = document.createElement("canvas");
  kv.width = 128;
  kv.height = 256;
  const c = kv.getContext("2d");
  const gr = c.createLinearGradient(0, 0, 0, 256);
  if (terang) {
    gr.addColorStop(0, "#fff6e2");
    gr.addColorStop(1, "#d9cdb5");
  } else {
    gr.addColorStop(0, "#1b2740");
    gr.addColorStop(0.7, "#2d3550");
    gr.addColorStop(1, "#4a3a2c");
  }
  c.fillStyle = gr;
  c.fillRect(0, 0, 128, 256);
  // Gedung di seberang jalan dengan beberapa jendela menyala, dan satu lampu jalan.
  c.fillStyle = terang ? "#cbbfa8" : "#121826";
  c.fillRect(0, 40, 128, 150);
  const acak = mulberry(5);
  for (let y = 52; y < 180; y += 22)
    for (let x = 8; x < 120; x += 20) {
      if (acak() < (terang ? 0.9 : 0.6)) continue;
      c.fillStyle = terang ? "#e9dfcc" : "#e8b36a";
      c.fillRect(x, y, 10, 12);
    }
  if (!terang) {
    const lampu = c.createRadialGradient(104, 196, 0, 104, 196, 26);
    lampu.addColorStop(0, "rgba(255,210,150,0.95)");
    lampu.addColorStop(1, "rgba(255,210,150,0)");
    c.fillStyle = lampu;
    c.fillRect(0, 0, 128, 256);
  }
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
