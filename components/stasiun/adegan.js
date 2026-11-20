// Dunia 3D cerita v5, fase F2: lantai kantor toon bergaris tinta (ADR 0019, 0020, 0023). Data
// lantai dari lantai.js; di sini diubah jadi segelintir mesh gabungan (satu per jenis bahan), jadi
// draw call tidak ikut naik dengan jumlah benda. Garis tinta image-space seperti previs: pass
// normal + depth, pass warna ke target MSAA, lalu quad tepi (docs/look-dev/cerita-v5.md).
// Kamera berpindah antaranchor dengan blend arah pandang berwaktu (poseBlend; perpindahan bertipe
// menyusul di F3) dan mendorong pelan selama babak dibaca. Gambar hanya saat ada yang berubah.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { susunLantai, LANTAI } from "./lantai.js";
import { gambarAtlas, uvWilayah } from "./layar.js";
import { poseAnchor, durasiAntara, poseDalam, poseBlend } from "./naskah.js";
import { easeInOut } from "../dunia/naskah.js";

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

export function buatDuniaV5(wadah, { kurangiGerak = false, bahasa = "id", uji = false } = {}) {
  const hp = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Bayangan lantai diam: dihitung sekali, bukan tiap bingkai.
  renderer.shadowMap.autoUpdate = false;
  const rasio = Math.min(devicePixelRatio || 1, hp ? 1.25 : 1.5);
  renderer.setPixelRatio(rasio);
  const kanvas = renderer.domElement;
  wadah.appendChild(kanvas);

  const scene = new THREE.Scene();
  const latar = new THREE.Color(LATAR);
  scene.background = latar;
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
  // Kamera bayangan dihadapkan sepanjang lantai (arah atas -z), lalu batasnya dipas ke sudut lantai.
  {
    const kb = kunci.shadow.camera;
    kb.up.set(0, 0, -1);
    kb.position.copy(kunci.position);
    kb.lookAt(0, 0, 0);
    kb.updateMatrixWorld();
    const inv = kb.matrixWorldInverse;
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const x of [-1, 1]) for (const y of [0, 1]) for (const z of [-1, 1]) {
      const p = new THREE.Vector3((x * LANTAI.lebar) / 2, y * LANTAI.tinggi, (z * LANTAI.dalam) / 2).applyMatrix4(inv);
      min.min(p);
      max.max(p);
    }
    Object.assign(kb, { left: min.x - 0.3, right: max.x + 0.3, bottom: min.y - 0.3, top: max.y + 0.3, near: Math.max(0.1, -max.z - 1), far: -min.z + 1 });
    kb.updateProjectionMatrix();
  }
  scene.add(kunci);

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
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `
        uniform sampler2D tWarna, tNormal, tDepth; uniform vec2 res; uniform float near, far, tebal; uniform vec3 tinta; varying vec2 vUv;
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
          gl_FragColor = vec4(mix(w.rgb, tinta, tepi * 0.92), 1.);
          #include <colorspace_fragment>
        }`,
      depthTest: false,
      depthWrite: false,
    }),
  );
  const adeganLayar = new THREE.Scene();
  adeganLayar.add(quad);
  const kameraLayar = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const info = { calls: 0, segitiga: 0, maksCalls: 0, bingkai: 0 };
  const gambar = () => {
    renderer.info.autoReset = false;
    renderer.info.reset();
    const u = quad.material.uniforms;
    u.near.value = camera.near;
    u.far.value = camera.far;
    scene.overrideMaterial = matNormal;
    scene.background = latarNormal;
    tanpaTepi.forEach((o) => (o.visible = false));
    renderer.setRenderTarget(rtNormal);
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    scene.background = latar;
    tanpaTepi.forEach((o) => (o.visible = true));
    renderer.setRenderTarget(rtWarna);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(adeganLayar, kameraLayar);
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
  let blend = null; // { dari, t0, dur }
  let geser = 0;
  let geserTujuan = 0;
  let kotor = true;
  let terlihat = true;
  let waktuUji = null;
  const sekarang = () => waktuUji ?? performance.now();
  const lihat = new THREE.Vector3();

  const pasang = (p) => {
    camera.position.set(...p.posisi);
    lihat.set(...p.lihat);
    camera.lookAt(lihat);
    const j = camera.position.distanceTo(lihat);
    // Rentang depth sempit di sekitar sasaran supaya tepi depth tidak bergerigi (previs dunia penuh).
    camera.near = Math.min(4, Math.max(0.03, j * 0.015));
    camera.far = Math.max(200, j * 12);
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
    const dur = pose && tujuan ? durasiAntara(lalu, i, kurangiGerak) : 0;
    blend = dur > 0 ? { dari: { ...pose }, t0: sekarang(), dur: dur * 1000 } : null;
    tujuan = ke;
    if (!blend) pose = poseDalam(ke, geser);
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
    quad.material.uniforms.res.value.set(pw, ph);
    camera.aspect = w / h;
    const tegakBaru = w / h < 0.8;
    // Benda digeser dari kolom teks: ke kanan di layar lebar, ke atas di layar tegak (teks di bawah).
    if (tegakBaru) camera.setViewOffset(w, h, 0, h * 0.14, w, h);
    else camera.setViewOffset(w, h, -w * 0.17, 0, w, h);
    if (tegakBaru !== tegak) {
      tegak = tegakBaru;
      const ke = poseAnchor(indeks, tegak);
      if (ke) {
        tujuan = ke;
        pose = poseDalam(ke, geser);
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
    const sasaran = poseDalam(tujuan, geser);
    if (blend) {
      const u = (t - blend.t0) / blend.dur;
      pose = poseBlend(blend.dari, sasaran, easeInOut(Math.min(1, u)));
      if (u >= 1) blend = null;
      kotor = true;
    } else if (kotor) pose = sasaran;
    if (!kotor) return false;
    pasang(pose);
    gambar();
    kotor = false;
    return true;
  };
  const bingkai = () => {
    raf = requestAnimationFrame(bingkai);
    if (waktuUji == null) langkah();
  };

  const api = {
    kanvas,
    // Kompilasi program sebelum bingkai pertama terlihat (pelajaran beku-shader: tanpa PMREM,
    // satu bahan toon untuk hampir semua benda).
    async siapkan() {
      ukur();
      const p = poseAnchor(Math.max(0, indeks), tegak) ?? poseAnchor(0, tegak);
      pasang(p);
      // Program dikompilasi untuk target warna, tempat adegan sungguh digambar (kunci programnya
      // ikut ruang warna target).
      renderer.setRenderTarget(rtWarna);
      await renderer.compileAsync(scene, camera);
      renderer.setRenderTarget(null);
      renderer.shadowMap.needsUpdate = true;
      kotor = true;
      raf = requestAnimationFrame(bingkai);
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
      info: () => ({ ...info, programs: renderer.info.programs?.length ?? 0, tegak, indeks }),
      // Bekukan jam di t milidetik, jalankan satu langkah, gambar. null melepas jam.
      waktu(t) {
        waktuUji = t;
        if (t != null) {
          kotor = true;
          langkah();
        } else waktuLalu = performance.now();
        return { ...info, posisi: camera.position.toArray(), blend: !!blend };
      },
      periksa() {
        const r = new THREE.Raycaster();
        r.setFromCamera(new THREE.Vector2(0, 0), camera);
        const h = r.intersectObjects(scene.children.filter((o) => o.isMesh && !tanpaTepi.includes(o)), false)[0];
        return h ? { jarak: +h.distance.toFixed(2), benda: h.object.name, titik: h.point.toArray().map((x) => +x.toFixed(2)) } : null;
      },
    };
  }
  return api;
}
