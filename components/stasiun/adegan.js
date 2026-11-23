// Dunia 3D cerita v5, fase F2: lantai kantor toon bergaris tinta (ADR 0019, 0020, 0023). Data
// lantai dari lantai.js; di sini diubah jadi segelintir mesh gabungan (satu per jenis bahan), jadi
// draw call tidak ikut naik dengan jumlah benda. Garis tinta image-space seperti previs: pass
// normal + depth, pass warna ke target MSAA, lalu quad tepi (docs/look-dev/cerita-v5.md).
// Kamera berpindah antaranchor lewat jalur bertipe berwaktu (F3: ikut nota, whip, layar, orbit,
// pilar, crane; F4: keluar jendela ke atas kota; poseAntara di naskah.js) dan mendorong pelan
// selama babak dibaca. Kota (kota3d.js) tampak sejak babak kebiasaan, saat jendelanya masuk
// bingkai. F5: peta Nusantara dan globe malam jadi adegan sendiri (peta3d.js) dengan satuan lokal,
// near/far, dan latarnya sendiri; serah terima antartahap menyilangkan dua adegan lewat satu
// render target. Gambar hanya saat ada yang berubah; di babak ramai lalu lintas bergerak terus,
// di babak penutup satelit mengorbit. F6: modul lab satelit jadi tahap keempat (lab3d.js); zoom
// dari globe ke jendela modul dengan jam globe dibekukan, gulir menggerakkan kamera di rel lorong,
// daftar proyek HTML menyalakan loker dan membukanya (setNyala, buka, tutup).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { susunLantai, susun, notaTerbang, LANTAI } from "./lantai.js";
import { gambarAtlas, uvWilayah } from "./layar.js";
import { ANCHOR_V5, poseAnchor, durasiAntara, poseDalam, poseAntara, lintasTahap, poseBlend, GESER } from "./naskah.js";
import { buatLab, bangunLabBertahap } from "./lab3d.js";
import { buatRel, poseRel, poseLoker, tahapBuka, BUKA, TARIK } from "./lab.js";
import { rangkaStasiun } from "./peta.js";
import { buatKota } from "./kota3d.js";
import { buatPeta, buatGlobe } from "./peta3d.js";

const LATAR = 0xf3ece0;
const TINTA = 0x2a2836;

function geometri(o) {
  const [a, b, c] = o.ukuran;
  switch (o.bentuk) {
    case "kotak":
      return o.bevel > 0 ? new RoundedBoxGeometry(a, b, c, 2, o.bevel) : new THREE.BoxGeometry(a, b, c);
    case "silinder":
      return new THREE.CylinderGeometry(a, a, b, a > 0.05 ? 24 : 12);
    case "bola":
      return a > 0.05 ? new THREE.SphereGeometry(a, 20, 14) : new THREE.SphereGeometry(a, 10, 8);
    case "ikosa":
      return new THREE.IcosahedronGeometry(a, 1);
    case "kapsul":
      return new THREE.CapsuleGeometry(a, b, 6, 16);
    case "torus":
      return new THREE.TorusGeometry(a, b, 10, 32);
    case "bidang":
      return new THREE.PlaneGeometry(a, b);
    case "tabung":
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(o.titik.map((p) => new THREE.Vector3(...p))), 40, a, 6);
    default:
      throw new Error(`bentuk ${o.bentuk}`);
  }
}

// Satu geometri dunia per benda: matriks diterapkan, warna jadi atribut titik, UV bidang atlas
// dipetakan ke wilayahnya. Semua dijadikan non-indexed supaya bisa digabung.
function siapkan(o) {
  let g = geometri(o);
  if (g.index) g = g.toNonIndexed();
  g.applyMatrix4(new THREE.Matrix4().fromArray(o.m));
  const n = g.attributes.position.count;
  const w = new THREE.Color(o.warna);
  const warna = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) warna.set([w.r, w.g, w.b], i * 3);
  g.setAttribute("color", new THREE.BufferAttribute(warna, 3));
  if (o.isi && o.isi !== "lantai") {
    const r = uvWilayah(o.isi);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, r.u0 + uv.getX(i) * r.du, r.v0 + uv.getY(i) * r.dv);
  }
  return g;
}

// `daftar` dan `kontak`: isi loker modul lab, urut seperti daftar HTML (ModulLab.jsx).
export function buatDuniaV5(wadah, { kurangiGerak = false, bahasa = "id", uji = false, daftar = [], kontak = "" } = {}) {
  const hp = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Bayangan lantai diam: dihitung sekali, bukan tiap bingkai.
  renderer.shadowMap.autoUpdate = false;
  // Preset HP (F7): HP kelas bawah (CPU atau memori 4 atau kurang) digambar di DPR 1.
  const hpLemah = hp && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4);
  const rasio = Math.min(devicePixelRatio || 1, hpLemah ? 1 : hp ? 1.25 : 1.5);
  renderer.setPixelRatio(rasio);
  const kanvas = renderer.domElement;
  wadah.appendChild(kanvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LATAR);
  // Kabut ke warna latar: tepi kota dan cakrawala melebur ke kertas (previs kota).
  scene.fog = new THREE.Fog(LATAR, 900, 2800);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);

  // ---- Bahan ---------------------------------------------------------------------------------
  const ramp = new THREE.DataTexture(new Uint8Array([150, 212, 255]), 3, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const atlas = gambarAtlas(bahasa, hp ? 0.5 : 1);
  const tekstur = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const titik = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#efe6d4";
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#d6c9b2";
    g.beginPath();
    g.arc(32, 32, 3, 0, 7);
    g.fill();
    const t = tekstur(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // satu titik tiap 20 cm (lembar look-dev)
    t.repeat.set((LANTAI.lebar - 0.6) / 0.2, (LANTAI.dalam - 0.6) / 0.2);
    return t;
  })();
  const toon = (o = {}) => new THREE.MeshToonMaterial({ gradientMap: ramp, ...o });
  const bahan = {
    toon: toon({ vertexColors: true }),
    kertas: toon({ map: tekstur(atlas.kertas) }),
    lantai: toon({ map: titik }),
    layar: new THREE.MeshBasicMaterial({ map: tekstur(atlas.layar), color: new THREE.Color(0.9, 0.9, 0.9) }),
    lampu: new THREE.MeshBasicMaterial({ vertexColors: true }),
    label: new THREE.MeshBasicMaterial({ map: tekstur(atlas.label), transparent: true, depthWrite: false }),
    kaca: new THREE.MeshBasicMaterial({ color: 0xcfe0f5, transparent: true, opacity: 0.15, depthWrite: false }),
  };

  // ---- Lantai: digabung per bahan dan per bayangan --------------------------------------------
  const benda = susunLantai();
  const kelompok = new Map();
  const garis = [];
  for (const o of benda) {
    if (o.bentuk === "garis") {
      garis.push(o);
      continue;
    }
    // nota merah yang terbang digambar sebagai mesh tersendiri (di bawah)
    if (o.terbang) continue;
    const kunci = `${o.bahan}|${o.bayang ? 1 : 0}`;
    if (!kelompok.has(kunci)) kelompok.set(kunci, []);
    kelompok.get(kunci).push(siapkan(o));
  }
  // Benda tanpa garis tinta disembunyikan saat pass normal + depth.
  const tanpaTepi = [];
  for (const [kunci, daftar] of kelompok) {
    const [nama, bayang] = kunci.split("|");
    const g = mergeGeometries(daftar);
    daftar.forEach((x) => x.dispose());
    const m = new THREE.Mesh(g, bahan[nama]);
    m.name = nama;
    m.castShadow = bayang === "1" && nama !== "lantai";
    m.receiveShadow = nama === "toon" || nama === "kertas" || nama === "lantai";
    if (nama === "label" || nama === "kaca") {
      m.renderOrder = 2;
      tanpaTepi.push(m);
    }
    scene.add(m);
  }
  for (const o of garis) {
    const g = new THREE.BufferGeometry().setFromPoints(o.titik.map((p) => new THREE.Vector3(...p)));
    g.applyMatrix4(new THREE.Matrix4().fromArray(o.m));
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0xe0574b, dashSize: 0.01, gapSize: 0.008 }));
    l.computeLineDistances();
    tanpaTepi.push(l);
    scene.add(l);
  }

  // Nota merah: satu kertas, diam di timbangan meja 1 sampai babak harga-diam, lalu di timbangan
  // meja 2; selama perpindahan "ikut" terbang di antaranya. Bayangan lantai dihitung sekali, jadi
  // kertas setipis 3 mm ini tidak ikut melempar bayangan.
  const NOTA = notaTerbang();
  const nota = new THREE.Mesh(siapkan({ bentuk: "kotak", ukuran: NOTA.ukuran, bevel: 0, warna: NOTA.warna, m: susun() }), bahan.toon);
  nota.name = "nota";
  nota.matrixAutoUpdate = false;
  nota.receiveShadow = true;
  scene.add(nota);
  const iHarga = ANCHOR_V5.findIndex((a) => a.id === "harga-diam");
  const letakNota = (q) => {
    const d = q ?? (indeks >= iHarga ? NOTA.ke : NOTA.dari);
    nota.matrix.fromArray(susun(d.posisi, d.rot ?? [0, d.ry, 0], [d.s, d.s, d.s]));
    nota.matrixWorldNeedsUpdate = true;
  };

  // ---- Kota (F4) -------------------------------------------------------------------------------
  // Dibangun saat dibutuhkan (babak kebiasaan ke atas) atau saat peramban senggang sesudah bingkai
  // pertama, supaya bingkai pertama hero tidak menunggu 100 ribu segitiga kota.
  const iKebiasaan = ANCHOR_V5.findIndex((a) => a.id === "kebiasaan");
  const iRamai = ANCHOR_V5.findIndex((a) => a.id === "ramai");
  const bahanPesan = new THREE.MeshBasicMaterial({ color: 0xf0b35a });
  let kota = null;
  let bayangKota = false;
  const bangunKota = () => {
    if (kota) return kota;
    kota = buatKota({ bahanToon: bahan.toon, bahanPesan, hp });
    for (const m of kota.mesh) {
      m.receiveShadow = m !== kota.pesan;
      scene.add(m);
    }
    tanpaTepi.push(kota.pesan);
    kotor = true;
    return kota;
  };

  // ---- Cahaya (previs dunia penuh, gaya terang) ------------------------------------------------
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6dccb, 1.4));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x201812, 0.6));
  const tengah = new THREE.PointLight(0xfff1dc, 0.3, 40, 1);
  tengah.position.set(0, LANTAI.tinggi, 0);
  scene.add(tengah);
  const kunci = new THREE.DirectionalLight(0xffffff, 1.3);
  kunci.position.set(-500, 900, 400).normalize().multiplyScalar(40);
  kunci.castShadow = true;
  kunci.shadow.mapSize.set(hp ? 2048 : 4096, hp ? 1024 : 2048);
  kunci.shadow.bias = -0.0004;
  kunci.shadow.normalBias = 0.012;
  // Kamera bayangan dihadapkan sepanjang lantai (arah atas -z), lalu batasnya dipas ke kotak
  // [a, b]: sudut lantai kantor, atau kota sekitar gedung klien saat kamera di atas kota (desktop).
  const arahKunci = kunci.position.clone().normalize();
  const pasBayang = (a, b, jauh) => {
    kunci.position.copy(arahKunci).multiplyScalar(jauh);
    const kb = kunci.shadow.camera;
    kb.up.set(0, 0, -1);
    kb.position.copy(kunci.position);
    kb.lookAt(0, 0, 0);
    kb.updateMatrixWorld();
    const inv = kb.matrixWorldInverse;
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const x of [a[0], b[0]]) for (const y of [a[1], b[1]]) for (const z of [a[2], b[2]]) {
      const p = new THREE.Vector3(x, y, z).applyMatrix4(inv);
      min.min(p);
      max.max(p);
    }
    Object.assign(kb, { left: min.x - 0.3, right: max.x + 0.3, bottom: min.y - 0.3, top: max.y + 0.3, near: Math.max(0.1, -max.z - 1), far: -min.z + 1 });
    kb.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate = true;
  };
  const BAYANG_LANTAI = [[-LANTAI.lebar / 2, 0, -LANTAI.dalam / 2], [LANTAI.lebar / 2, LANTAI.tinggi, LANTAI.dalam / 2]];
  const BAYANG_KOTA = [[-760, -4, -720], [700, 170, 760]];
  pasBayang(...BAYANG_LANTAI, 40);
  scene.add(kunci);
  scene.userData.tanpaTepi = tanpaTepi;

  // ---- Peta dan globe (F5) -----------------------------------------------------------------------
  // Dibangun dan dipanaskan saat senggang sesudah kota (tekstur didekode di luar utas utama, lalu
  // diunggah dan programnya dikompilasi), atau langsung bila halaman dibuka di babaknya.
  const iLangkah = ANCHOR_V5.findIndex((a) => a.id === "langkah-kecil");
  const iPenutup = ANCHOR_V5.findIndex((a) => a.id === "penutup");
  const iLab = ANCHOR_V5.findIndex((a) => a.id === "modul-lab");
  const tahap = { gedung: { scene }, peta: null, globe: null, lab: null };
  const panas = {};
  const bangunTahap = (nama) => {
    if (tahap[nama]) return tahap[nama];
    const t0 = performance.now();
    const t = nama === "lab" ? buatLab({ ramp, daftar, kontak }) : (nama === "peta" ? buatPeta : buatGlobe)({ ramp, hp, siap: () => (kotor = true) });
    panas[nama] = { bangun: +(performance.now() - t0).toFixed(1) };
    tahap[nama] = t;
    kotor = true;
    return t;
  };
  // Unggah tekstur dan kompilasi program sebelum adegannya tampil: bingkai pertamanya tidak
  // menunggu unggahan 4096 px (look-dev: previs 302 dan 403 ms).
  const panaskan = async (nama) => {
    // modul lab disicil per bagian di callback senggang terpisah (HP: satu hentakan 356 ms bila
    // dibangun sekaligus), kecuali sudah dibangun karena dibutuhkan seketika
    if (nama === "lab" && !tahap.lab) {
      const t0 = performance.now();
      const potong = [];
      let mulai = t0;
      const senggang = window.requestIdleCallback ?? ((f) => setTimeout(f, 50));
      const lab = await bangunLabBertahap({ ramp, daftar, kontak }, () => {
        potong.push(performance.now() - mulai);
        return new Promise((r) => senggang(() => ((mulai = performance.now()), r())));
      });
      potong.push(performance.now() - mulai);
      if (dibuang) return;
      if (!tahap.lab) {
        tahap.lab = lab;
        panas.lab = { bangun: +potong.reduce((a, b) => a + b, 0).toFixed(1), potong: potong.map((x) => +x.toFixed(1)) };
      }
      kotor = true;
    }
    const t = bangunTahap(nama);
    const tex = await t.janji;
    if (dibuang) return;
    const t0 = performance.now();
    if (tex) renderer.initTexture(tex);
    // tahap tanpa tekstur unduhan (lab): atlas dan tekstur kanvasnya diunggah di sini
    else t.scene.traverse((o) => o.material?.map && renderer.initTexture(o.material.map));
    panas[nama].unggah = +(performance.now() - t0).toFixed(1);
    const t1 = performance.now();
    await kompilasiAdegan(t.scene);
    panas[nama].kompilasi = +(performance.now() - t1).toFixed(1);
  };

  // ---- Garis tinta di layar ------------------------------------------------------------------
  const ext = renderer.extensions;
  const tipeWarna = ext.has("EXT_color_buffer_float") || ext.has("EXT_color_buffer_half_float") ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const rtWarna = new THREE.WebGLRenderTarget(1, 1, { type: tipeWarna, samples: hp ? 2 : 4 });
  const rtNormal = new THREE.WebGLRenderTarget(1, 1);
  rtNormal.depthTexture = new THREE.DepthTexture(1, 1);
  rtNormal.depthTexture.type = THREE.FloatType;
  const matNormal = new THREE.MeshNormalMaterial();
  const latarNormal = new THREE.Color(0.5, 0.5, 1);
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: {
        tWarna: { value: rtWarna.texture },
        tNormal: { value: rtNormal.texture },
        tDepth: { value: rtNormal.depthTexture },
        res: { value: new THREE.Vector2(1, 1) },
        near: { value: 0.05 },
        far: { value: 200 },
        tebal: { value: hp ? 1.6 : 1.5 },
        tinta: { value: new THREE.Color(TINTA) },
        tLapis: { value: null },
        lapis: { value: 0 },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `
        uniform sampler2D tWarna, tNormal, tDepth, tLapis; uniform vec2 res; uniform float near, far, tebal, lapis; uniform vec3 tinta; varying vec2 vUv;
        float jarak(vec2 uv){ float z = texture2D(tDepth, uv).x; float n = z * 2. - 1.; return 2. * near * far / (far + near - n * (far - near)); }
        vec3 nor(vec2 uv){ return texture2D(tNormal, uv).xyz * 2. - 1.; }
        void main(){
          vec2 px = tebal / res; float d0 = jarak(vUv); vec3 n0 = nor(vUv); float tepi = 0.;
          vec2 arah[8]; arah[0] = vec2(px.x, 0.); arah[1] = vec2(-px.x, 0.); arah[2] = vec2(0., px.y); arah[3] = vec2(0., -px.y);
          arah[4] = px * .7; arah[5] = -px * .7; arah[6] = vec2(px.x, -px.y) * .7; arah[7] = vec2(-px.x, px.y) * .7;
          for (int i = 0; i < 8; i++) { float d = jarak(vUv + arah[i]); vec3 n = nor(vUv + arah[i]);
            tepi = max(tepi, smoothstep(0.006, 0.02, abs(d - d0) / min(d, d0)));
            tepi = max(tepi, smoothstep(0.25, 0.45, 1. - dot(n, n0))); }
          vec4 w = texture2D(tWarna, vUv);
          vec3 c = mix(w.rgb, tinta, tepi * 0.92);
          if (lapis > 0.) c = mix(c, texture2D(tLapis, vUv).rgb, lapis);
          gl_FragColor = vec4(c, 1.);
          #include <colorspace_fragment>
        }`,
      depthTest: false,
      depthWrite: false,
    }),
  );
  const adeganLayar = new THREE.Scene();
  adeganLayar.add(quad);
  const kameraLayar = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Lapisan silang: bingkai tahap tujuan selama serah terima (dibuat saat pertama dipakai).
  let rtLapis = null;
  const info = { calls: 0, segitiga: 0, maksCalls: 0, bingkai: 0, pertama: {}, panas };
  // Satu tahap: pass normal + depth, pass warna ke target MSAA, lalu quad tepi ke `keluar`.
  const gambarTahap = (nama, keluar, lapis) => {
    const sc = tahap[nama].scene;
    const tanpa = sc.userData.tanpaTepi;
    const latarSc = sc.background;
    const u = quad.material.uniforms;
    u.near.value = camera.near;
    u.far.value = camera.far;
    sc.overrideMaterial = matNormal;
    sc.background = latarNormal;
    tanpa.forEach((o) => (o.visible = false));
    renderer.setRenderTarget(rtNormal);
    renderer.render(sc, camera);
    sc.overrideMaterial = null;
    sc.background = latarSc;
    tanpa.forEach((o) => (o.visible = true));
    renderer.setRenderTarget(rtWarna);
    renderer.render(sc, camera);
    u.lapis.value = lapis;
    u.tLapis.value = lapis > 0 ? rtLapis.texture : null;
    renderer.setRenderTarget(keluar);
    renderer.render(adeganLayar, kameraLayar);
    u.lapis.value = 0;
  };
  // Bingkai pertama tiap tahap diukur sampai GPU selesai (hanya di mode uji: readPixels memaksa
  // antrean perintah dikerjakan), termasuk unggah tekstur yang belum dipanaskan.
  const piksel = new Uint8Array(4);
  const gambar = (p) => {
    renderer.info.autoReset = false;
    renderer.info.reset();
    const baru = [p.tahap, p.silang?.tahap].filter((n) => n && !(n in info.pertama));
    const t0 = performance.now();
    if (p.silang && tahap[p.silang.tahap]) {
      if (!rtLapis) rtLapis = new THREE.WebGLRenderTarget(rtWarna.width, rtWarna.height, { type: tipeWarna, depthBuffer: false });
      pasang(p.silang);
      gambarTahap(p.silang.tahap, rtLapis, 0);
      pasang(p);
      gambarTahap(p.tahap, null, p.silang.w);
    } else gambarTahap(p.tahap, null, 0);
    if (baru.length) {
      if (uji) {
        const gl = renderer.getContext();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, piksel);
      }
      for (const n of baru) info.pertama[n] = +(performance.now() - t0).toFixed(1);
    }
    info.calls = renderer.info.render.calls;
    info.segitiga = renderer.info.render.triangles;
    info.maksCalls = Math.max(info.maksCalls, info.calls);
    info.bingkai++;
  };

  // ---- Kamera --------------------------------------------------------------------------------
  let tegak = false;
  let indeks = -1;
  let tujuan = null; // pose anchor kini (tanpa dorongan)
  let pose = null; // pose yang sedang dipakai kamera
  let blend = null; // { dari, lalu, ke, t0, dur }
  let geser = 0;
  let geserTujuan = 0;
  let kotor = true;
  let terlihat = true;
  let waktuUji = null;
  const sekarang = () => waktuUji ?? performance.now();
  // Jam globe (detik): dibekukan selama zoom ke modul lab dan selama di modul, supaya jalur zoom
  // dan gulir baliknya memakai rangka stasiun yang sama. Saat kembali ke babak penutup jam lanjut
  // dari titik beku (selisihnya disimpan), satelit tidak meloncat.
  let jamBeku = null;
  let selisihJam = 0;
  let rangkaBeku = rangkaStasiun(0);
  // Jeda gerak global (F7, WCAG 2.2.2): lalu lintas kota, satelit, dan gerak latar modul berhenti
  // di tempat dan lanjut dari titik yang sama. jamGerak = waktu dikurangi lama jeda (ms).
  let jeda = false;
  let jedaMulai = null;
  let jedaTotal = 0;
  const jamGerak = (t) => (jedaMulai ?? t) - jedaTotal;
  const jamGlobe = (t) => (kurangiGerak ? 0 : jamBeku ?? jamGerak(t) / 1000 - selisihJam);
  // Modul lab: jam gerak latar, loker yang menyala, loker yang dibuka, jeda gerak.
  let jamLab = 0;
  let nyalaLab = 0;
  let buka = null; // { i, arah, u0, t0 }
  const uBuka = (t) => (buka ? Math.min(1, Math.max(0, buka.u0 + (buka.arah * (t - buka.t0)) / (BUKA.total * 1000))) : 0);
  const relLab = () => buatRel(tahap.lab?.susunan.rak.length ?? 7, tegak);
  // Pose sasaran babak kini: dorongan pelan, atau di modul lab posisi rel ditambah dekat loker.
  const sasaranDari = (tj, t) => {
    if (!tj.rel) return poseDalam(tj, geser);
    const p = poseRel(relLab(), geser, { henti: !hp, potong: kurangiGerak });
    if (!buka || !tahap.lab) return p;
    // pindah loker dari panel (Berikutnya): kamera langsung di depan loker baru
    const u = buka.ganti ? 1 : tahapBuka(uBuka(t) * BUKA.total).kamera;
    return u > 0 ? { ...poseBlend(p, poseLoker(tahap.lab.susunan.loker[buka.i], tegak), u), tahap: "lab" } : p;
  };
  const lihat = new THREE.Vector3();

  const pasang = (p) => {
    camera.position.set(...p.posisi);
    lihat.set(...p.lihat);
    camera.lookAt(lihat);
    const j = camera.position.distanceTo(lihat);
    // Rentang depth sempit di sekitar sasaran supaya tepi depth tidak bergerigi (previs dunia penuh),
    // per tahap di satuan lokalnya. Kabut ikut jarak kamera: saat serah terima kota ke peta kamera
    // naik 1,4 km dan kotanya tetap terbaca.
    if (p.tahap === "peta") {
      camera.near = j * 0.02;
      camera.far = j * 6;
      const f = tahap.peta?.scene.fog;
      if (f) [f.near, f.far] = [j * 1.45, j * 2.6];
    } else if (p.tahap === "lab") {
      // di dalam modul: rak paling jauh sekitar 20 m, kamera bisa 0,3 m dari pintu loker
      camera.near = Math.min(0.05, Math.max(0.01, j * 0.015));
      camera.far = 60;
    } else if (p.tahap === "globe") {
      // bintang di jari-jari 2600 tetap di dalam far
      camera.near = j * 0.02;
      camera.far = Math.max(j * 12, 3400);
    } else {
      camera.near = Math.min(4, Math.max(0.03, j * 0.015));
      camera.far = Math.max(200, j * 12);
      scene.fog.near = Math.max(900, j * 1.2);
      scene.fog.far = Math.max(2800, j * 3);
    }
    camera.fov = p.fov;
    camera.updateProjectionMatrix();
  };

  const keAnchor = (i) => {
    if (i === indeks) return;
    const lalu = indeks;
    indeks = i;
    const ke = poseAnchor(i, tegak);
    if (!ke) {
      tujuan = null;
      blend = null;
      return;
    }
    const awal = { dari: pose ? { ...pose } : null, lalu, e0: 0 };
    let dur = pose && tujuan ? durasiAntara(lalu, i, kurangiGerak) : 0;
    if (blend && dur > 0) {
      const e = blend.e0 + (1 - blend.e0) * Math.min(1, (sekarang() - blend.t0) / blend.dur);
      if (blend.lalu === i && Math.abs(blend.ke - i) === 1) {
        // Disela lalu digulir balik: putar jalur yang sama mundur dari titik sekarang.
        Object.assign(awal, { dari: poseDalam(tujuan, geser), lalu: blend.ke, e0: 1 - e });
        dur = durasiAntara(blend.ke, i, kurangiGerak) * e;
      } else if (blend.makro || lintasTahap(lalu, i)) dur = 0;
      // Disela ke arah lain: kamera tidak di pose anchor mana pun, jadi blend biasa (lalu -1).
      else awal.lalu = -1;
    }
    blend = dur > 0 ? { ...awal, ke: i, t0: sekarang(), dur: dur * 1000, makro: awal.lalu >= 0 && lintasTahap(awal.lalu, i) } : null;
    tujuan = ke;
    if (ke.rel) bangunTahap("lab");
    if (!blend) pose = sasaranDari(ke, sekarang());
    kotor = true;
  };

  // ---- Ukuran --------------------------------------------------------------------------------
  const ukur = () => {
    const w = wadah.clientWidth || innerWidth;
    const h = wadah.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    const pw = Math.max(1, Math.floor(w * rasio));
    const ph = Math.max(1, Math.floor(h * rasio));
    rtWarna.setSize(pw, ph);
    rtNormal.setSize(pw, ph);
    rtLapis?.setSize(pw, ph);
    quad.material.uniforms.res.value.set(pw, ph);
    camera.aspect = w / h;
    const tegakBaru = w / h < 0.8;
    // Benda digeser dari kolom teks: ke kanan di layar lebar, ke atas di layar tegak (teks di bawah).
    if (tegakBaru) camera.setViewOffset(w, h, 0, h * GESER.tegak, w, h);
    else camera.setViewOffset(w, h, -w * GESER.lebar, 0, w, h);
    if (tegakBaru !== tegak) {
      tegak = tegakBaru;
      const ke = poseAnchor(indeks, tegak);
      if (ke) {
        tujuan = ke;
        pose = sasaranDari(ke, sekarang());
        blend = null;
      }
    }
    camera.updateProjectionMatrix();
    kotor = true;
  };
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);
  ukur();

  // ---- Lup -----------------------------------------------------------------------------------
  let raf = 0;
  let waktuLalu = sekarang();
  const langkah = () => {
    const t = sekarang();
    const dt = Math.min(0.1, (t - waktuLalu) / 1000);
    waktuLalu = t;
    if (!terlihat || !tujuan) return false;
    // Dorongan mengikuti gulir dengan sedikit pelembut supaya gulir roda tidak tersendat.
    const g = kurangiGerak ? geserTujuan : geser + (geserTujuan - geser) * Math.min(1, dt * 10);
    if (Math.abs(g - geser) > 1e-4 || (g !== geser && kurangiGerak)) {
      geser = Math.abs(g - geserTujuan) < 1e-4 ? geserTujuan : g;
      kotor = true;
    }
    // Jam globe beku sejak zoom ke modul lab mulai sampai kamera kembali diam di babak penutup.
    const perluBeku = indeks >= iLab || (blend && Math.max(blend.lalu, blend.ke) >= iLab);
    if (perluBeku && jamBeku == null) {
      jamBeku = jamGerak(t) / 1000 - selisihJam;
      rangkaBeku = rangkaStasiun(jamGlobe(t));
    } else if (!perluBeku && jamBeku != null) {
      selisihJam = jamGerak(t) / 1000 - jamBeku;
      jamBeku = null;
    }
    // Loker selesai ditutup: kembali ke rel biasa.
    if (buka && buka.arah < 0 && uBuka(t) <= 0) {
      tahap.lab?.tarik(-1, 0);
      buka = null;
      kotor = true;
    }
    const sasaran = sasaranDari(tujuan, t);
    if (buka) kotor = true;
    if (blend) {
      const u = Math.min(1, (t - blend.t0) / blend.dur);
      pose = poseAntara(blend.lalu, blend.ke, blend.dari, sasaran, blend.e0 + (1 - blend.e0) * u, { aspek: camera.aspect, tegak, stasiun: rangkaBeku });
      if (u >= 1) blend = null;
      kotor = true;
    } else if (kotor) pose = sasaran;
    // Kota bergerak terus selama babak ramai (kecuali gerak dikurangi): lalu lintas memadat
    // sejalan gulir di babak itu.
    const ramai = indeks === iRamai || (blend && blend.lalu === iRamai);
    const tampak = [pose.tahap, pose.silang?.tahap];
    // Gerak latar modul lab berjalan sejak tampil, berhenti saat dijeda atau panel proyek terbuka
    // (WCAG 2.2.2, storyboard §4); lampu loker memudar ke loker yang dipilih dari daftar.
    const lab = tampak.includes("lab") ? tahap.lab : null;
    const labJalan = lab && !kurangiGerak && !jeda && !buka;
    if (labJalan) jamLab += dt;
    if (lab && lab.nyala(nyalaLab, dt, kurangiGerak)) kotor = true;
    if (((ramai || tampak.includes("globe")) && !kurangiGerak && !jeda && jamBeku == null) || labJalan) kotor = true;
    if (!kotor) return false;
    letakNota(blend ? pose.nota : null);
    pasang(pose);
    if (tampak.includes("gedung")) aturKota(t, ramai);
    for (const n of ["peta", "globe", "lab"]) if (tampak.includes(n)) bangunTahap(n);
    // Rute satu cabang tumbuh sejalan gulir babak langkah-kecil; sesudahnya utuh.
    tahap.peta?.atur(kurangiGerak || indeks > iLangkah ? 1 : indeks === iLangkah && !blend ? (geser - 0.1) / 0.5 : 0);
    tahap.globe?.atur(jamGlobe(t));
    if (tahap.lab && tampak.includes("lab")) {
      tahap.lab.atur(jamLab);
      tahap.lab.tarik(buka ? buka.i : -1, buka ? tahapBuka(uBuka(t) * BUKA.total).tarik : 0);
    }
    gambar(pose);
    kotor = false;
    return true;
  };
  // Kota tampak sejak babak kebiasaan (jendelanya di belakang meja), termasuk selama perpindahan
  // dari atau ke sana. Pelat atas, lantai 3, dan atap hanya saat kamera keluar ke kota, karena
  // crane F3 membuka lantai kantor dari atas.
  const aturKota = (t, ramai) => {
    const asal = blend && blend.lalu >= 0 ? blend.lalu : indeks;
    const tampak = Math.max(indeks, asal) >= iKebiasaan;
    if (tampak) bangunKota();
    if (!kota) return;
    for (const m of kota.mesh) m.visible = tampak;
    kota.kulitAtas.visible = tampak && Math.max(indeks, asal) >= iRamai;
    if (!tampak) return;
    kota.atur(kurangiGerak ? 0 : jamGerak(t) / 1000, ramai && indeks === iRamai && !blend ? geser : 0);
    // Bayangan kota hanya di desktop (lembar look-dev: dimatikan di HP), dan hanya setelah kamera
    // jauh di atas gedung: peta bayangan dipas ulang sekali ke kota, lalu sekali lagi ke lantai.
    const diKota = !hp && kota.kulitAtas.visible && camera.position.y > 40;
    if (diKota !== bayangKota) {
      bayangKota = diKota;
      kota.diam.castShadow = kota.kulitAtas.castShadow = kota.mobil.castShadow = diKota;
      if (diKota) pasBayang(...BAYANG_KOTA, 2000);
      else pasBayang(...BAYANG_LANTAI, 40);
    }
  };

  const bingkai = () => {
    raf = requestAnimationFrame(bingkai);
    if (waktuUji == null) langkah();
  };

  // Program dikompilasi untuk target warna, tempat adegan sungguh digambar (kunci programnya ikut
  // ruang warna target). compile hanya menelusuri benda yang tampak, jadi kota ditampakkan sebentar.
  let dibuang = false;
  const kompilasiAdegan = async (sc) => {
    sc.overrideMaterial = matNormal;
    renderer.setRenderTarget(rtNormal);
    await renderer.compileAsync(sc, camera);
    sc.overrideMaterial = null;
    renderer.setRenderTarget(rtWarna);
    await renderer.compileAsync(sc, camera);
    renderer.setRenderTarget(null);
  };
  const kompilasi = async () => {
    const tampak = kota?.mesh.map((m) => m.visible);
    kota?.mesh.forEach((m) => (m.visible = true));
    // pass normal + depth (bahan pengganti) juga punya program sendiri untuk mesh instanced
    scene.overrideMaterial = matNormal;
    renderer.setRenderTarget(rtNormal);
    await renderer.compileAsync(scene, camera);
    scene.overrideMaterial = null;
    renderer.setRenderTarget(rtWarna);
    await renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(null);
    kota?.mesh.forEach((m, i) => (m.visible = tampak[i]));
  };

  const api = {
    kanvas,
    // Kompilasi program sebelum bingkai pertama terlihat (pelajaran beku-shader: tanpa PMREM,
    // satu bahan toon untuk hampir semua benda).
    async siapkan() {
      ukur();
      const p = poseAnchor(Math.max(0, indeks), tegak) ?? poseAnchor(0, tegak);
      pasang(p);
      if (indeks >= iKebiasaan && indeks < iLangkah) bangunKota();
      // Dibuka langsung di babak peta atau globe: tahapnya dipanaskan sebelum bingkai pertama.
      if (indeks === iLangkah) await panaskan("peta");
      if (indeks === iPenutup) await panaskan("globe");
      if (indeks === iLab) await panaskan("lab");
      await kompilasi();
      renderer.shadowMap.needsUpdate = true;
      kotor = true;
      raf = requestAnimationFrame(bingkai);
      // Sisanya satu per satu saat senggang: kota, peta, globe.
      const senggang = window.requestIdleCallback ?? ((f) => setTimeout(f, 1500));
      const lanjut = (sisa) =>
        senggang(async () => {
          if (dibuang || !sisa.length) return;
          await sisa[0]();
          lanjut(sisa.slice(1));
        });
      lanjut([
        async () => {
          if (kota) return;
          bangunKota();
          aturKota(sekarang(), false);
          await kompilasi();
        },
        () => panaskan("peta"),
        () => panaskan("globe"),
        () => panaskan("lab"),
      ]);
    },
    keAnchor,
    get indeks() {
      return indeks;
    },
    get adaDunia() {
      return !!tujuan;
    },
    setGeser(k) {
      geserTujuan = Math.min(1, Math.max(0, k));
    },
    setTerlihat(v) {
      if (v && !terlihat) kotor = true;
      terlihat = v;
    },
    // ---- Modul lab (ModulLab.jsx lewat DuniaV5) ----
    setNyala(i) {
      if (i !== nyalaLab) kotor = true;
      nyalaLab = i;
    },
    setJeda(v) {
      if (v === jeda) return;
      jeda = v;
      if (v) jedaMulai = sekarang();
      else if (jedaMulai != null) {
        jedaTotal += sekarang() - jedaMulai;
        jedaMulai = null;
      }
      kotor = true;
    },
    // Buka loker ke-i: kamera mendekat, loker meluncur (gerak dikurangi: langsung terbuka).
    buka(i) {
      const t = sekarang();
      if (buka && buka.i === i && buka.arah > 0) return;
      // Loker lain sementara panel terbuka: potong ke loker baru, pintunya meluncur dari awal.
      if (buka && buka.arah > 0) {
        buka = { i, arah: 1, u0: kurangiGerak ? 1 : BUKA.tarik[0] / BUKA.total, t0: t, ganti: true };
        nyalaLab = i;
        kotor = true;
        return;
      }
      buka = { i, arah: 1, u0: kurangiGerak ? 1 : buka?.i === i ? uBuka(t) : 0, t0: t, ganti: buka?.ganti && buka.i === i };
      nyalaLab = i;
      kotor = true;
    },
    tutup() {
      if (!buka) return;
      const t = sekarang();
      buka = { ...buka, arah: -1, u0: kurangiGerak ? 0 : uBuka(t), t0: t };
      kotor = true;
    },
    // Titik tengah pintu loker ke-i yang sudah meluncur, di piksel layar, dari pose dekat loker:
    // asal kartu HTML yang tumbuh jadi panel. null bila modul belum ada.
    layarLoker(i) {
      const l = tahap.lab?.susunan.loker[i];
      if (!l) return null;
      const p = poseLoker(l, tegak);
      const c = camera.clone();
      c.position.set(...p.posisi);
      c.lookAt(...p.lihat);
      c.fov = p.fov;
      c.updateProjectionMatrix();
      c.updateMatrixWorld();
      const v = new THREE.Vector3(l.pusat[0], l.pusat[1], l.pusat[2] + TARIK).project(c);
      return { x: ((v.x + 1) / 2) * wadah.clientWidth, y: ((1 - v.y) / 2) * wadah.clientHeight };
    },
    dispose() {
      dibuang = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const n of ["peta", "globe", "lab"])
        tahap[n]?.scene.traverse((o) => {
          o.geometry?.dispose();
          [].concat(o.material ?? []).forEach((m) => {
            m.map?.image?.close?.();
            m.map?.dispose();
            m.dispose();
          });
        });
      rtLapis?.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material ?? []).forEach((m) => {
          for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
          m.dispose();
        });
      });
      ramp.dispose();
      rtWarna.dispose();
      rtNormal.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
      matNormal.dispose();
      renderer.dispose();
      kanvas.remove();
    },
  };

  // Pegangan uji (?uji-stasiun, scripts/ukur-stasiun.mjs): jam beku untuk lembar kontak per
  // 0,1 detik, jumlah draw call, dan raycast tengah layar seperti __periksa di previs.
  if (uji) {
    window.__stasiunUji = {
      THREE,
      scene,
      camera,
      renderer,
      info: () => ({ ...info, programs: renderer.info.programs?.length ?? 0, tegak, indeks, rasio, jeda, jamGerak: jamGerak(sekarang()), lab: { nyala: nyalaLab, buka: buka && { i: buka.i, u: +uBuka(sekarang()).toFixed(3) }, jamLab: +jamLab.toFixed(2), jamBeku } }),
      // Bekukan jam di t milidetik, jalankan satu langkah, gambar. null melepas jam.
      waktu(t) {
        waktuUji = t;
        if (t != null) {
          kotor = true;
          langkah();
        } else waktuLalu = performance.now();
        return { ...info, posisi: camera.position.toArray(), tahap: pose?.tahap, silang: pose?.silang ? +pose.silang.w.toFixed(3) : 0, blend: !!blend, rinci: blend && { lalu: blend.lalu, ke: blend.ke, e0: +blend.e0.toFixed(4), t0: blend.t0, dur: blend.dur } };
      },
      periksa() {
        const r = new THREE.Raycaster();
        r.setFromCamera(new THREE.Vector2(0, 0), camera);
        const sc = tahap[pose?.tahap ?? "gedung"]?.scene ?? scene;
        const h = r.intersectObjects(sc.children.filter((o) => o.isMesh && o.visible && !sc.userData.tanpaTepi.includes(o)), false)[0];
        return h ? { jarak: +h.distance.toFixed(2), benda: h.object.name, titik: h.point.toArray().map((x) => +x.toFixed(2)) } : null;
      },
    };
  }
  return api;
}
