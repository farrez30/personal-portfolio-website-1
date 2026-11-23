// Adegan three.js tahap peta Nusantara dan globe malam (F5) dari data peta.js. Tiap tahap adegan
// sendiri dengan satuan, latar, kabut, dan cahayanya sendiri; adegan.js memilih adegan menurut
// `tahap` pose kamera dan menyilangkan dua adegan selama serah terima. Tekstur WebP hasil
// scripts/panggang-peta.mjs didekode di luar utas utama (createImageBitmap), lalu diunggah ke GPU
// saat senggang, jadi bingkai pertama adegannya tidak menunggu kanvas 4096 px seperti previs.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  BIDANG_PETA,
  KOTA_PETA,
  RUTE_PETA,
  TITIK_PETA,
  keLokal,
  kurvaRute,
  R_BUMI,
  keBola,
  TITIK_BOLA,
  ORBIT_KLIEN,
  ORBIT_STASIUN,
  posisiSatelit,
  posisiStasiun,
  SATELIT,
} from "./peta.js";

const MERAH = 0xe0574b;
const ABU = 0x847e75;
export const LATAR_PETA = 0xf3ece0;
export const LATAR_GLOBE = 0x1f2440;

// Dekode di luar utas utama; arah gambar dibalik di sini supaya flipY tekstur tidak dibutuhkan.
async function muatTekstur(url) {
  const r = await fetch(url);
  const blob = await r.blob();
  let gambar;
  try {
    gambar = await createImageBitmap(blob, { imageOrientation: "flipY" });
  } catch {
    gambar = null;
  }
  const t = new THREE.Texture();
  if (gambar) {
    t.image = gambar;
    t.flipY = false;
  } else {
    // peramban tanpa createImageBitmap berpilihan: elemen gambar biasa, flipY bawaan
    const im = new Image();
    im.src = URL.createObjectURL(blob);
    await im.decode();
    t.image = im;
  }
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

// Bahan dasar yang menunggu tekstur: warna rata dulu, peta dipasang begitu tekstur siap.
function bahanTekstur(url, warna, siap) {
  const m = new THREE.MeshBasicMaterial({ color: warna });
  const janji = muatTekstur(url).then((t) => {
    m.map = t;
    m.color.set(0xffffff);
    m.needsUpdate = true;
    siap?.(t);
    return t;
  });
  return { m, janji };
}

const v3 = (p) => new THREE.Vector3(...p);
const bola = (r, w, h) => new THREE.SphereGeometry(r, w, h);

export function buatPeta({ ramp, hp, siap }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LATAR_PETA);
  scene.fog = new THREE.Fog(LATAR_PETA, 600, 1100);
  scene.userData.tanpaTepi = [];
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x201812, 1.0));
  const kunci = new THREE.DirectionalLight(0xffffff, 1.2);
  kunci.position.set(-200, 400, 300);
  scene.add(kunci);
  const toon = (warna) => new THREE.MeshToonMaterial({ color: warna, gradientMap: ramp });

  const { m: bahanPeta, janji } = bahanTekstur(`/assets/stasiun/peta-${hp ? 2048 : 4096}.webp`, 0xa9c4ec, siap);
  const bidang = new THREE.Mesh(new THREE.PlaneGeometry(BIDANG_PETA.lebar, BIDANG_PETA.dalam), bahanPeta);
  bidang.rotation.x = -Math.PI / 2;
  bidang.position.set(...BIDANG_PETA.pusat);
  bidang.name = "peta";
  scene.add(bidang);

  const titik = (nama) => keLokal(...KOTA_PETA[nama], TITIK_PETA.y);
  const jakarta = new THREE.Mesh(bola(TITIK_PETA.jakarta, 20, 14), toon(MERAH));
  jakarta.position.set(...titik("jakarta"));
  jakarta.name = "jakarta";
  const cincin = new THREE.Mesh(new THREE.RingGeometry(...TITIK_PETA.cincin, 48), new THREE.MeshBasicMaterial({ color: MERAH, side: THREE.DoubleSide }));
  cincin.rotation.x = -Math.PI / 2;
  cincin.position.copy(jakarta.position);
  const cabang = new THREE.Mesh(bola(TITIK_PETA.cabang, 16, 12), toon(MERAH));
  cabang.position.set(...titik(RUTE_PETA[1]));
  cabang.name = "cabang";
  const { a, c, b } = kurvaRute();
  const SEG = 40;
  const rute = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(v3(a), v3(c), v3(b)), SEG, 0.5, 6), new THREE.MeshBasicMaterial({ color: MERAH }));
  rute.name = "rute";
  // Kota lain: satu geometri gabungan abu-abu.
  const lain = Object.keys(KOTA_PETA)
    .filter((n) => !RUTE_PETA.includes(n))
    .map((n) => bola(TITIK_PETA.kota, 12, 8).translate(...titik(n)));
  const kota = new THREE.Mesh(mergeGeometries(lain), toon(ABU));
  lain.forEach((g) => g.dispose());
  scene.add(jakarta, cincin, cabang, rute, kota);

  return {
    scene,
    janji,
    // Rute satu cabang tumbuh dari Jakarta ke Surabaya sejalan gulir babak (k 0..1); cabang
    // menyala begitu rute sampai.
    atur(k) {
      const n = Math.round(Math.min(1, Math.max(0, k)) * SEG);
      rute.geometry.setDrawRange(0, n * 6 * 6);
      rute.visible = n > 0;
      cabang.visible = n === SEG;
    },
  };
}

export function buatGlobe({ ramp, hp, siap }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LATAR_GLOBE);
  const tanpaTepi = (scene.userData.tanpaTepi = []);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const kunci = new THREE.DirectionalLight(0xffffff, 1.2);
  kunci.position.set(200, 200, 300);
  scene.add(kunci);
  const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: ramp, ...o });

  const { m: bahanBumi, janji } = bahanTekstur(`/assets/stasiun/bumi-${hp ? 2048 : 4096}.webp`, 0x2b3656, siap);
  const bumi = new THREE.Mesh(bola(R_BUMI, hp ? 96 : 128, hp ? 64 : 96), bahanBumi);
  bumi.name = "bumi";
  // Pendar atmosfer tipis di tepi (previs), tanpa garis tinta.
  const halo = new THREE.Mesh(
    bola(R_BUMI * 1.035, 64, 48),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      vertexShader: "varying vec3 n; void main(){ n = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: "varying vec3 n; void main(){ float f = pow(clamp(0.6 - n.z, 0., 1.), 3.); gl_FragColor = vec4(0.55,0.68,0.95, f*0.6); }",
    }),
  );
  // 900 bintang tetap (acak deterministik), titik 2 px tanpa garis tinta.
  const N = 900;
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const z = 2 * Math.abs(a) - 1;
    const th = i * 2.399963;
    const r = Math.sqrt(1 - z * z);
    p.set([Math.cos(th) * r * 2600, z * 2600, Math.sin(th) * r * 2600], i * 3);
  }
  const gBintang = new THREE.BufferGeometry();
  gBintang.setAttribute("position", new THREE.BufferAttribute(p, 3));
  const bintang = new THREE.Points(gBintang, new THREE.PointsMaterial({ color: 0xfff1d6, size: 2, sizeAttenuation: false }));

  // Jakarta dan satu cabang, lanjutan dari peta.
  const merah = new THREE.MeshBasicMaterial({ color: MERAH });
  const jkt = keBola(...KOTA_PETA.jakarta);
  const sby = keBola(...KOTA_PETA[RUTE_PETA[1]]);
  const jakarta = new THREE.Mesh(bola(TITIK_BOLA.jakarta, 12, 10), merah);
  jakarta.position.set(...jkt);
  jakarta.name = "jakarta";
  const cabang = new THREE.Mesh(bola(TITIK_BOLA.cabang, 10, 8), merah);
  cabang.position.set(...sby);
  const tengah = v3(jkt).add(v3(sby)).multiplyScalar(0.5);
  tengah.setLength(R_BUMI + v3(jkt).distanceTo(v3(sby)) * 0.35);
  const busur = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(v3(jkt), tengah, v3(sby)), 24, 0.3, 6), merah);

  // Lingkaran orbit: satu mesh gabungan berwarna per titik, tembus pandang, tanpa garis tinta.
  const MIRING_Z = 0.25;
  const putar = (miring) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(miring, 0, MIRING_Z));
  const cincin = (r, miring, warna) => {
    const g = new THREE.TorusGeometry(r, 0.15, 6, 220).toNonIndexed();
    g.rotateX(Math.PI / 2).applyMatrix4(putar(miring));
    const w = new THREE.Color(warna);
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).map((_, i) => [w.r, w.g, w.b][i % 3]), 3));
    g.deleteAttribute("uv");
    return g;
  };
  const gCincin = [...ORBIT_KLIEN.map((o) => cincin(o.r, o.miring, o.warna)), cincin(ORBIT_STASIUN.r, ORBIT_STASIUN.miring, MERAH)];
  const lingkar = new THREE.Mesh(mergeGeometries(gCincin), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false }));
  gCincin.forEach((g) => g.dispose());

  // Satelit klien: badan (warna kelompok) dan panel surya, dua InstancedMesh.
  const jumlah = ORBIT_KLIEN.reduce((s, o) => s + o.klien.length, 0);
  const badan = new THREE.InstancedMesh(new THREE.BoxGeometry(SATELIT.badan, SATELIT.badan, SATELIT.badan), toon({ color: 0xffffff }), jumlah);
  const panel = new THREE.InstancedMesh(new THREE.BoxGeometry(...SATELIT.panel), toon({ color: 0x9fb3e0 }), jumlah);
  badan.name = "satelit";
  panel.name = "panel";
  {
    let k = 0;
    for (const o of ORBIT_KLIEN) for (let i = 0; i < o.klien.length; i++) badan.setColorAt(k++, new THREE.Color(o.warna));
  }
  // Stasiun: dua modul silinder, node bola, cincin merah, empat panel; satu mesh gabungan.
  const bagian = [];
  const warnai = (g, warna) => {
    g = g.index ? g.toNonIndexed() : g;
    g.deleteAttribute("uv");
    const w = new THREE.Color(warna);
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).map((_, i) => [w.r, w.g, w.b][i % 3]), 3));
    bagian.push(g);
  };
  for (const x of [-5.2, 5.2]) warnai(new THREE.CylinderGeometry(2.15, 2.15, 7, 24).rotateZ(Math.PI / 2).translate(x, 0, 0), 0xeae6dc);
  warnai(new THREE.TorusGeometry(2.2, 0.2, 6, 32).rotateY(Math.PI / 2).translate(-5.2, 0, 0), MERAH);
  warnai(new THREE.SphereGeometry(2.4, 20, 14), 0xd9d2c6);
  warnai(new THREE.CylinderGeometry(0.14, 0.14, 26, 8).rotateZ(Math.PI / 2).translate(0, 0, -2.6), ABU);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) warnai(new THREE.BoxGeometry(4.2, 0.1, 2.4).translate(sx * 10.5, 0, -2.6 + sy * 1.4), 0x4b5f9e);
  const stasiun = new THREE.Mesh(mergeGeometries(bagian), toon({ vertexColors: true }));
  bagian.forEach((g) => g.dispose());
  stasiun.name = "stasiun";
  stasiun.scale.setScalar(1.4);

  scene.add(bumi, halo, bintang, jakarta, cabang, busur, lingkar, badan, panel, stasiun);
  tanpaTepi.push(halo, bintang, lingkar);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const satu = new THREE.Vector3(1, 1, 1);
  const rot = ORBIT_KLIEN.map((o) => q.clone().setFromRotationMatrix(putar(o.miring)));
  const atur = (t) => {
    let k = 0;
    ORBIT_KLIEN.forEach((o, j) => {
      for (let i = 0; i < o.klien.length; i++, k++) {
        m.compose(v3(posisiSatelit(o, i, t)), rot[j], satu);
        badan.setMatrixAt(k, m);
        panel.setMatrixAt(k, m);
      }
    });
    badan.instanceMatrix.needsUpdate = panel.instanceMatrix.needsUpdate = true;
    stasiun.position.set(...posisiStasiun(t));
    stasiun.quaternion.setFromRotationMatrix(putar(ORBIT_STASIUN.miring));
  };
  atur(0);
  // Satelit bergerak tiap bingkai; batas bola instanced tidak dihitung ulang.
  badan.frustumCulled = panel.frustumCulled = false;
  return { scene, janji, atur };
}
