import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { ANCHOR, easeInOut, poseAntara, durasiBlend, kekuatanBlur } from "./naskah";

// Dunia toko kaset (ADR 0014): satu ruangan di belakang seluruh beranda. Ruang dari primitif plus
// tekstur Flow, perabot CC0 Poly Haven (tekstur 512 px, meshopt), headphone Hunyuan3D.
// Kamera berpindah antar-anchor naskah.js; adegan digambar hanya saat ada yang berubah.

const ASET = "/assets/dunia/";
const MODEL = ["bar_chair_round_01", "hanging_industrial_lamp", "portable_cassette_player", "headphone"];

// Dua suasana mengikuti tema situs, supaya teks di atas kanvas tetap terbaca:
// gelap = toko setelah tutup, terang = toko pagi hari.
const SUASANA = {
  gelap: {
    latar: 0x0f0d0b,
    dinding: 0x2b2520,
    plafon: 0x141210,
    ambien: 0.4,
    lampu: 0xffb46a,
    kuatLampu: 7,
    jalan: 0x6f8fd6,
    kuatJalan: 5,
    paparan: 1.05,
  },
  terang: {
    latar: 0xe6dccd,
    dinding: 0xd8cbb6,
    plafon: 0xe9e1d3,
    ambien: 1.4,
    lampu: 0xffd6a0,
    kuatLampu: 3,
    jalan: 0xfff1d6,
    kuatJalan: 9,
    paparan: 0.95,
  },
};

const bingkaiBerikut = () => new Promise((r) => requestAnimationFrame(() => r()));

// Gerak kamera di dalam satu tempat mengikuti gulir: geser ke samping dan sedikit maju.
const GESER = { samping: 0.22, maju: 0.12 };

export function buatDunia(wadah, { kurangiGerak = false, tema = "gelap", onProgres = () => {} } = {}) {
  const hp = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  let rasio = Math.min(devicePixelRatio || 1, hp ? 1.25 : 1.5);
  renderer.setPixelRatio(rasio);
  const kanvas = renderer.domElement;
  wadah.appendChild(kanvas);

  const scene = new THREE.Scene();
  // Tanpa peta lingkungan: PMREM mengompilasi shader secara sinkron (terukur 462 ms di RX 6700 XT,
  // ular di loader membeku). Ruangan malam diterangi lampu titik dan cahaya langit saja.
  scene.fog = new THREE.Fog(0x000000, 6, 13);

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
        ASET + nama,
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
    lantai: new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.62 }),
    kayu: new THREE.MeshStandardMaterial({ color: 0xb8a088, roughness: 0.7 }),
    busa: new THREE.MeshStandardMaterial({ color: 0x9a948c, roughness: 1 }),
    gelapMatte: new THREE.MeshStandardMaterial({ color: 0x1c1b1d, roughness: 0.55, metalness: 0.1 }),
    logam: new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.32, metalness: 0.9 }),
    kuningan: new THREE.MeshStandardMaterial({ color: 0xc9a25a, roughness: 0.3, metalness: 1 }),
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
  const lantai = bidang(10, 8, bahan.lantai, 0, 0, 0, 0, -Math.PI / 2);
  // Lantai papan: tekstur bilah kayu diputar supaya papan memanjang ke arah pintu.
  lantai.geometry.rotateZ(Math.PI / 2);
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

  // ---- Meja kasir (klien) ------------------------------------------------------------------
  kotak(2.6, 0.96, 0.62, bahan.kayu, 2, 0.48, 3.0);
  kotak(2.7, 0.05, 0.72, bahan.gelapMatte, 2, 0.985, 3.0);
  kotak(0.42, 0.14, 0.36, bahan.gelapMatte, 2.8, 1.08, 3.05); // mesin kasir
  const layarKasir = kotak(0.32, 0.18, 0.02, bahan.gelapMatte, 2.8, 1.26, 3.18);
  layarKasir.rotation.x = -0.35;
  scene.add(buatStiker());
  bayang(2, 2.6, 1.5);

  // ---- Pintu dan lonceng (kontak) ----------------------------------------------------------
  kotak(0.08, 2.2, 0.14, bahan.gelapMatte, -2.2, 1.1, 4); // kusen
  kotak(0.08, 2.2, 0.14, bahan.gelapMatte, -1.0, 1.1, 4);
  kotak(1.28, 0.08, 0.14, bahan.gelapMatte, -1.6, 2.2, 4);
  // Jalan di luar: bidang bercahaya di balik kaca pintu.
  bidang(1.2, 2.15, bahan.jalan, -1.6, 1.08, 4.06, Math.PI);
  bidang(1.12, 2.1, bahan.kaca, -1.6, 1.08, 3.99, Math.PI);
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
    [2.0, yLampu, 2.5],
  ].map((p) => {
    const l = new THREE.PointLight(0xffffff, 1, 7, 2);
    l.position.set(...p);
    scene.add(l);
    return l;
  });
  const cahayaJalan = new THREE.SpotLight(0xffffff, 1, 9, 0.9, 0.7, 1.6);
  cahayaJalan.position.set(-1.6, 1.6, 4.6);
  cahayaJalan.target.position.set(-1, 0, 0.5);
  scene.add(cahayaJalan, cahayaJalan.target);

  const terapkanTema = (nama) => {
    const s = SUASANA[nama] ?? SUASANA.gelap;
    scene.background = new THREE.Color(s.latar);
    scene.fog.color.setHex(s.latar);
    bahan.dinding.color.setHex(s.dinding);
    bahan.plafon.color.setHex(s.plafon);
    ambien.intensity = s.ambien;
    for (const l of lampu) {
      l.color.setHex(s.lampu);
      l.intensity = s.kuatLampu;
    }
    cahayaJalan.color.setHex(s.jalan);
    cahayaJalan.intensity = s.kuatJalan;
    bahan.jalan.map?.dispose();
    bahan.jalan.map = teksturJalan(nama === "terang");
    bahan.jalan.needsUpdate = true;
    renderer.toneMappingExposure = s.paparan;
    kotor = true;
  };

  // ---- Gambar: adegan ke render target, lalu satu lintasan motion blur ---------------------
  const sampel = hp ? 0 : 4;
  const kedalaman = new THREE.DepthTexture(1, 1);
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: sampel, depthTexture: kedalaman });
  const blur = new THREE.ShaderMaterial({
    uniforms: {
      tWarna: { value: target.texture },
      tDalam: { value: kedalaman },
      uBalik: { value: new THREE.Matrix4() },
      uLalu: { value: new THREE.Matrix4() },
      uKuat: { value: 0 },
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
      void main() {
        vec4 c = texture2D(tWarna, vUv);
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
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(adeganLayar, kameraLayar);
    vpLalu.copy(vpKini);
  };

  // ---- Kamera ------------------------------------------------------------------------------
  const salinPose = (p) => ({ posisi: [...p.posisi], lihat: [...p.lihat], fov: p.fov });
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
    if (camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
  };

  const keAnchor = (i) => {
    if (i === indeks && !blend) return;
    const ke = ANCHOR[i];
    indeks = i;
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
    camera.aspect = w / h;
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
    if (!bergerak && !kotor) return;
    posLalu.copy(camera.position);
    lihatLalu.copy(lihat);
    pasangKamera();
    const kecepatan = dt > 0 ? Math.max(camera.position.distanceTo(posLalu), lihat.distanceTo(lihatLalu) * 0.6) / dt : 0;
    const kuat = kekuatanBlur(kecepatan, kurangiGerak);
    gambar(kuat > 0 ? Math.min(1, kuat * 5) * 1.6 : 0);
    if (blend) jagaKualitas(dt * 1000);
    kotor = false;
  };

  // ---- Muat dan pemanasan ------------------------------------------------------------------
  const muat = async () => {
    const [kayu, busa, kursi, lampuGantung, kaset, hp] = await Promise.all([
      tekstur("kayu.webp", [1, 1]),
      tekstur("busa.webp", [3, 3]),
      ...MODEL.map(model),
    ]);
    bahan.kayu.map = kayu;
    const kayuLantai = kayu.clone();
    kayuLantai.repeat.set(5, 4);
    kayuLantai.needsUpdate = true;
    bahan.lantai.map = kayuLantai;
    bahan.busa.map = busa;
    bahan.busa.color.setHex(0xffffff);
    for (const m of [bahan.kayu, bahan.lantai, bahan.busa]) m.needsUpdate = true;

    const taruh = (asal, x, y, z, ry = 0, s = 1) => {
      const o = asal.clone();
      o.position.set(x, y, z);
      o.rotation.y = ry;
      o.scale.setScalar(s);
      scene.add(o);
      return o;
    };
    taruh(kursi, -3.55, 0, -2.75, 0.6);
    taruh(kursi, 1.4, 0, 2.15, -0.3);
    taruh(kursi, 2.5, 0, 2.2, 0.4);
    for (const l of lampu) taruh(lampuGantung, l.position.x, 3.2, l.position.z, 0, SKALA_LAMPU);
    taruh(kaset, -4.05, 1.045, -3.74, 0.35, 1.5);
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
    taruh(kaset, 1.35, 1.01, 3.0, -0.6, 1.4);
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
    const benda = [];
    scene.traverse((o) => o.isMesh && o.visible && benda.push(o));
    target.scissor.set(0, 0, 1, 1);
    target.scissorTest = true;
    for (const o of benda) o.visible = false;
    for (let i = 0; i < benda.length; i += 3) {
      const kelompok = benda.slice(i, i + 3);
      for (const o of kelompok) o.visible = true;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      for (const o of kelompok) o.visible = false;
      onHangat(0.9 + (0.08 * (i + 3)) / benda.length);
      await bingkaiBerikut();
    }
    for (const o of benda) o.visible = true;
    target.scissorTest = false;
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
