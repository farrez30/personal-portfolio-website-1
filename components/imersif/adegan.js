// Adegan rak CD. Ditulis sendiri; perilaku dan angka setelannya mengikuti
// studi Discography karya dmtrbrl (halaman tayang dan catatan desainnya).
// Buklet memakai LeafThroughObject (MIT).
//
// Keadaan: "rak", "buka", "buklet", "putar". Setiap transisi digerakkan satu
// angka kemajuan linear; kurva dipasang per subfase supaya fase bisa saling
// tumpang tindih dan diputar balik dengan tepat.
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { LeafThroughObject } from "leafthrough";
import { HALAMAN } from "@/content/proyek";
import { KOTAK, BUKLET, buatKotak, buatPemutar, buatProyektor, buatLingkungan, sinkronCakram, setRedup } from "./benda";
import { gambarSampul, gambarHalaman, gambarArsitektur } from "./gambar";

// Satuan studi (1 = 60 mm) ke satuan kita (1 = 100 mm).
const U = 0.6;

const C = {
  fovRak: 40,
  fovDekat: 18,
  jarak: 4.4 * 0.6,
  miringRak: { x: (-22 * Math.PI) / 180, y: (-22 * Math.PI) / 180 },
  sudutPerKotak: 0.35,
  celah: 2.8 * 2.4 * U,
  lengkung: 2.4 * U,
  skalaJauh: 0.12,
  ikutDasar: 11,
  ikutSeret: 15,
  ikutJarak: 1.15,
  condong: 0.055,
  condongMaks: 0.3,
  tikung: 0.32,
  rundukPerAlir: 0.014 * U,
  rundukMaks: 0.09 * U,
  pegasFrek: 9.5,
  pegasRedam: 12,
  kotakPerLayar: 5.7,
  kotakPerLayarSentuh: 1.8,
  miringKursor: 0.21,
  balikPerPx: 0.95 * 0.0045,
  bukaDetik: 1.3,
  bukaTunduk: (-24 * Math.PI) / 180,
  tetanggaPergi: 5 * U,
  tetanggaMundur: 1.6 * U,
  dengarMasuk: 2.4,
  dengarKeluar: 1.9,
  geserNaik: 4.4 * U,
  rpm: 120,
  remDetik: 1,
  remKeluarkan: 0.25,
  bacaMasuk: 2.4,
  bacaKeluar: 1.9,
  pandangAtas: (26 * Math.PI) / 180,
};

// --- kurva ---------------------------------------------------------------
const jepit = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const p3o = (t) => 1 - Math.pow(1 - jepit(t), 3);
const p3io = (t) => {
  t = jepit(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const kuintik = (t) => {
  t = jepit(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const linear = (t) => t;
// cubic-bezier(0.32, 0.72, 0, 1): kurva "luncur" untuk semua perpindahan rak.
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const fy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    x = jepit(x);
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = 3 * ax * t * t + 2 * bx * t + cx;
      if (Math.abs(d) < 1e-6) break;
      t -= (fx(t) - x) / d;
    }
    return fy(jepit(t));
  };
}
const luncur = bezier(0.32, 0.72, 0, 1);

const LABEL = {
  overview: "Overview",
  challenge: "Challenge",
  decisions: "Key decisions",
  solution: "Solution",
  delivery: "Delivery & role",
  outcome: "Outcome",
  architecture: "Architecture",
};

function halamanBuklet(p, locale) {
  const hal = [{ src: gambarSampul(p, locale), alt: `${p.katalog} ${p.judul[locale]}` }];
  hal.push({
    src: gambarHalaman({ label: LABEL.overview, judul: p.judul[locale], isi: p.ringkas[locale], catatan: `${p.katalog}  ${p.periode}` }),
    alt: LABEL.overview,
    text: p.ringkas[locale],
  });
  for (const h of HALAMAN) {
    const b = p.buklet[h];
    if (!b) continue;
    hal.push({ src: gambarHalaman({ label: LABEL[h], judul: b.judul[locale], isi: b.isi[locale] }), alt: LABEL[h], text: `${b.judul[locale]}\n\n${b.isi[locale]}` });
  }
  if (p.arsitektur) {
    const c = gambarHalaman({ label: LABEL.architecture });
    const d = gambarArsitektur(p.arsitektur, { latar: null, garis: "#6f695f", kotak: "#f7f2ea", teks: "#1d1b19", aksen: "#b3322a" }, 864, 640);
    c.getContext("2d").drawImage(d, 80, 220, 864, 640);
    hal.push({ src: c, alt: LABEL.architecture, text: p.arsitektur.simpul.map((s) => s.label).join(", ") });
  }
  while (hal.length < 4 || hal.length % 2 === 1) hal.push({ src: gambarHalaman({ label: p.katalog }), alt: p.katalog });
  return hal;
}

// Kertas melengkung mengitari silinder di sepanjang punggung buklet.
const LENGKUNG_GLSL = `
uniform float uLengkung;
vec3 deformSheet(vec3 p, vec2 uv) {
  float a = uLengkung;
  if (a < 0.0005) return p;
  float sudut = a * uv.x;
  float s = p.x < 0.0 ? -1.0 : 1.0;
  return vec3(s * sin(sudut) / a, p.y, p.z + (1.0 - cos(sudut)) / a);
}`;

const tween = () => ({ aktif: false, dari: 0, ke: 0, mulai: 0, durasi: 1, kurva: luncur });

export function buatAdegan(wadah, { proyek, locale, kurangiGerak, onUbah }) {
  RectAreaLightUniformsLib.init();
  const sentuhKasar = matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: (window.devicePixelRatio || 1) < 2 || sentuhKasar,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x000000, 0);
  wadah.appendChild(renderer.domElement);
  const kanvas = renderer.domElement;

  const scene = new THREE.Scene();
  scene.environment = buatLingkungan(renderer);
  scene.fog = new THREE.Fog(0xebe3d4, 7 * U, 14 * U);
  const camera = new THREE.PerspectiveCamera(C.fovRak, 1, 0.6, 100);

  const ambien = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambien);
  const kunci = new THREE.DirectionalLight(0xfff9e8, 0.75);
  kunci.position.set(3.5, -8, 6);
  const isiCahaya = new THREE.DirectionalLight(0xffffff, 0.3);
  isiCahaya.position.set(-5, -2, 4);
  const tepi = new THREE.DirectionalLight(0x499ff5, 0.75);
  tepi.position.set(0, 3, -6);
  const strip = new THREE.RectAreaLight(0xffffff, 1.9, 6, 0.4);
  strip.position.set(0, 3.2, 3);
  strip.lookAt(0, 0, 0);
  // Cahaya baca: masuk saat buklet mendarat, menggantikan cahaya galeri.
  const matahari = new THREE.DirectionalLight(0xffffff, 0);
  matahari.position.set(0.6, 1.2, 3);
  scene.add(kunci, isiCahaya, tepi, strip, matahari);

  // Rak dimiringkan; kotak bukan anak rak, posenya dihitung lewat matriks ini.
  const rak = new THREE.Object3D();
  rak.rotation.set(C.miringRak.x, C.miringRak.y, 0);
  scene.add(rak);

  const kotak = proyek.map((p, i) => {
    const k = buatKotak(p, locale, renderer, i);
    Object.assign(k, {
      i,
      p,
      buka: 0,
      bukaT: tween(),
      balik: 0,
      balikT: tween(),
      balikTujuan: 0,
      miring: { x: 0, y: 0 },
      dorong: { z: 0, vz: 0, rx: 0, ry: 0, vrx: 0, vry: 0 },
    });
    k.grup.scale.setScalar(0.0001);
    k.cakram.userData.putarAsal = k.cakram.rotation.z;
    scene.add(k.grup);
    return k;
  });

  let pemutar = null;
  let proyektor = null;
  const siapkanPemutar = () => {
    if (pemutar) return;
    pemutar = buatPemutar(renderer);
    proyektor = buatProyektor();
    pemutar.grup.visible = proyektor.grup.visible = false;
    scene.add(pemutar.grup, proyektor.grup);
  };
  // Di perangkat sentuh shader dikompilasi di utas utama; buat lebih awal.
  if (sentuhKasar) siapkanPemutar();

  const k_ = {
    pos: 0,
    tujuan: 0,
    posT: tween(),
    alir: 0,
    settle: 0,
    inersia: 0,
    keadaan: "rak",
    aktif: null,
    sempit: false,
    dengar: 0,
    dengarT: tween(),
    jalan: false,
    laju: 0,
    rem: C.remDetik,
    sudut: 0,
    baca: 0,
    bacaT: tween(),
    buklet: null,
    kursor: { x: 0, y: 0, ada: false },
    hover: null,
    tombolHover: null,
    introMulai: performance.now(),
  };
  const dengar = {};
  const panggil = (n, ...a) => dengar[n]?.(...a);
  let duduk = false;

  const kirim = () =>
    onUbah?.({
      fokus: k_.tujuan,
      keadaan: k_.keadaan,
      aktif: k_.aktif,
      terbalik: kotak[k_.tujuan]?.balikTujuan !== 0,
      duduk,
      jalan: k_.jalan,
    });

  let W = 1;
  let H = 1;
  const ukur = () => {
    W = Math.max(1, wadah.clientWidth);
    H = Math.max(1, wadah.clientHeight);
    const batasRasio = W <= 767 ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, batasRasio, Math.sqrt(8e6 / (W * H))));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    k_.sempit = W <= 650;
    rak.scale.setScalar(1.08 * jepit(camera.aspect / 1.5, 0.45, 1) * (k_.sempit ? 1.3 : 1));
  };
  ukur();
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);

  // Lensa: satu kamera untuk semua tampilan. FOV 40 ke 18 sambil mundur supaya
  // bidang z = 0 tetap terbingkai sama; naik untuk melihat pemutar dari atas
  // sambil tetap memandang lurus, lalu frustum digeser (tilt-shift).
  const pasangLensa = (a) => {
    const fov = C.fovRak + (C.fovDekat - C.fovRak) * a;
    const tanS = Math.tan((fov * Math.PI) / 360);
    const jarak = (C.jarak * Math.tan((20 * Math.PI) / 180)) / tanS;
    const naik = jarak * Math.tan(C.pandangAtas) * a;
    camera.fov = fov;
    camera.position.set(0, naik, jarak);
    camera.rotation.set(0, 0, 0);
    camera.far = jarak + 15;
    const yNdc = -naik / (jarak * tanS);
    camera.setViewOffset(W, H, 0, (-yNdc * H) / 2, W, H);
    camera.updateProjectionMatrix();
    scene.fog.near = 7 * U + (jarak - C.jarak);
    scene.fog.far = 14 * U + (jarak - C.jarak);
  };
  pasangLensa(0);

  const tampak = () => {
    const h = 2 * C.jarak * Math.tan((C.fovRak * Math.PI) / 360);
    return { w: h * camera.aspect, h };
  };

  const pasangTween = (tw, dari, ke, durasi, kurva, now) =>
    Object.assign(tw, { aktif: true, dari, ke, durasi: kurangiGerak ? 1e-4 : Math.max(1e-4, durasi), kurva, mulai: now });
  const nilaiTween = (tw, now) => {
    if (!tw.aktif) return null;
    const t = (now - tw.mulai) / 1000 / tw.durasi;
    if (t >= 1) {
      tw.aktif = false;
      return tw.ke;
    }
    return tw.dari + (tw.ke - tw.dari) * tw.kurva(t);
  };
  const tegakkan = (kt, now, durasi = 1.2) => {
    kt.balikTujuan = 0;
    pasangTween(kt.balikT, kt.balik, Math.round(kt.balik / (2 * Math.PI)) * 2 * Math.PI, durasi, p3o, now);
  };

  // Pindah rak dengan tween plus "tendangan" ke aliran, supaya lompatan tetap condong.
  const keIndeks = (i, jenis) => {
    const now = performance.now();
    const baru = jepit(Math.round(i), 0, kotak.length - 1);
    if (baru !== k_.tujuan) kotak.forEach((x) => x.balikTujuan && tegakkan(x, now));
    const jauh = Math.abs(baru - k_.pos);
    const durasi =
      jenis === "roda" ? 0.51 : jenis === "kunci" ? Math.min(0.6, 0.42 + 0.05 * jauh) : jenis === "klik" ? jepit(0.45 + 0.11 * jauh, 0.46, 1.05) : jenis === "sentuh" ? 0.56 : 0.46;
    pasangTween(k_.posT, k_.pos, baru, durasi, jenis === "snap" ? p3o : luncur, now);
    if (jenis === "klik") k_.alir += Math.sign(baru - k_.pos) * Math.min(5, jauh * 2);
    k_.tujuan = baru;
    k_.settle = 0;
    k_.inersia = 0;
    kirim();
  };

  // --- tiap bingkai ---------------------------------------------------------
  const m4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const pos2 = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  const qTmp = new THREE.Quaternion();
  const eu = new THREE.Euler();
  const sk3 = new THREE.Vector3();
  const vTmp = new THREE.Vector3();
  const sumbuZ = new THREE.Vector3(0, 0, 1);
  const qBuka = new THREE.Quaternion().setFromEuler(new THREE.Euler(C.bukaTunduk, 0, 0));
  const qDatar = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const posNampan = new THREE.Vector3(0.06, 0, -KOTAK.d / 2 + 0.066);
  const lensaLayar = new THREE.Vector3();
  let lalu = performance.now();
  let seret = null;

  const bingkai = (now) => {
    const dt = Math.min(0.05, Math.max(1e-4, (now - lalu) / 1000));
    lalu = now;

    // Posisi rak: tween, seretan, inersia, atau pegas ke indeks terdekat.
    const sebelum = k_.pos;
    const tw = nilaiTween(k_.posT, now);
    if (tw != null) k_.pos = tw;
    else if (seret?.gerak && !seret.balik) {
      // diatur seretan
    } else if (Math.abs(k_.inersia) > 0.002) {
      k_.pos = jepit(k_.pos + k_.inersia * dt * 60, -0.3, kotak.length - 0.7);
      k_.inersia *= Math.pow(0.89, dt * 60);
    } else {
      k_.inersia = 0;
      const dekat = jepit(Math.round(k_.pos), 0, kotak.length - 1);
      if (dekat !== k_.tujuan && !seret && k_.keadaan === "rak") {
        kotak.forEach((x) => x.balikTujuan && tegakkan(x, now));
        k_.tujuan = dekat;
        kirim();
      }
      if (Math.abs(dekat - k_.pos) > 8e-4 || Math.abs(k_.settle) > 1e-3) {
        k_.settle += (dekat - k_.pos) * C.pegasFrek * C.pegasFrek * dt;
        k_.settle *= Math.exp(-C.pegasRedam * dt);
        k_.pos += k_.settle * dt;
      } else {
        k_.pos = dekat;
        k_.settle = 0;
      }
    }
    // Aliran: kecepatan rak yang dihaluskan, cepat naik dan pelan turun.
    const v = (k_.pos - sebelum) / dt;
    k_.alir += (v - k_.alir) * Math.min(1, (Math.abs(v) > Math.abs(k_.alir) ? 14 : 6) * dt);
    const condong = Math.sign(k_.alir) * Math.min(C.condongMaks, Math.sqrt(Math.abs(k_.alir)) * C.condong);
    const runduk = Math.min(C.rundukMaks, C.rundukPerAlir * Math.abs(k_.alir));

    const aktifK = kotak.find((x) => x.p.slug === k_.aktif) ?? null;
    const dv = nilaiTween(k_.dengarT, now);
    if (dv != null) k_.dengar = dv;
    const bv = nilaiTween(k_.bacaT, now);
    if (bv != null) k_.baca = bv;

    const geser = p3io((k_.dengar - 0.2) / 0.5);
    const keluarBaca = p3io((k_.baca - 0.4) / 0.5);
    const naikRak = Math.max(geser, keluarBaca) * C.geserNaik;
    pasangLensa(geser);
    // Cahaya tepi biru memudar bersama lensa; cahaya ambien naik untuk pemutar.
    const cahayaBaca = p3io((k_.baca - 0.6) / 0.26);
    tepi.intensity = 0.75 * (1 - geser) * (1 - cahayaBaca);
    ambien.intensity = 0.25 + 0.9 * geser + 1.25 * cahayaBaca;
    matahari.intensity = 2 * cahayaBaca;
    strip.intensity = 1.9 * (1 - cahayaBaca);
    scene.environmentIntensity = 1 - 0.6 * cahayaBaca;
    rak.updateMatrixWorld(true);

    const { w: vw, h: vh } = tampak();
    const lamaIntro = (now - k_.introMulai) / 1000;

    for (const kt of kotak) {
      const d = kt.i - k_.pos;
      const jarak = Math.abs(d);
      const terbuka = kt.buka > 0.001;
      kt.grup.visible = jarak < 5.5 || terbuka;
      if (!kt.grup.visible) continue;

      // Intro: kotak depan tumbuh dulu (1,15 dt), tetangga menyusul bergiliran.
      const awalDepan = kt.i === k_.tujuan;
      const tunda = awalDepan ? 0 : 0.115 + (Math.min(jarak, 4) / 4) * 0.28;
      const ti = kurangiGerak ? 1 : (lamaIntro - tunda) / (awalDepan ? 1.15 : 0.98);
      const intro = awalDepan ? luncur(ti) : jepit(ti);

      const dr = kt.dorong;
      dr.vz *= Math.exp(-4.5 * dt);
      dr.vrx *= Math.exp(-4.5 * dt);
      dr.vry *= Math.exp(-4.5 * dt);
      dr.z += dr.vz * dt - dr.z * 3.4 * dt;
      dr.rx += dr.vrx * dt - dr.rx * 3.4 * dt;
      dr.ry += dr.vry * dt - dr.ry * 3.4 * dt;

      const depan = jarak < 0.5 && k_.keadaan === "rak";
      const kH = Math.min(1, 10 * dt);
      const hx = k_.kursor.ada && (depan || kt === aktifK) ? k_.kursor.y * C.miringKursor * (kt === aktifK ? 0.4 : 1) : 0;
      const hy = k_.kursor.ada && depan ? k_.kursor.x * C.miringKursor : 0;
      kt.miring.x += (hx - kt.miring.x) * kH;
      kt.miring.y += (hy - kt.miring.y) * kH;
      const bt = nilaiTween(kt.balikT, now);
      if (bt != null) kt.balik = bt;

      // Pose di rak (busur landai), lalu ke ruang dunia lewat matriks rak.
      const sudut = C.sudutPerKotak * d;
      const sk = (jarak < 0.5 ? 1 : Math.max(0.8, 1 - C.skalaJauh * jarak)) * 0.78 * Math.max(0.0001, intro);
      pos.set(Math.sin(sudut) * C.celah, (jarak < 0.5 ? 0.036 : 0) - runduk, -C.lengkung * (1 - Math.cos(sudut)) - (1 - intro) * 2.2 * U + dr.z);
      if (aktifK && kt !== aktifK) {
        const face = p3io(aktifK.buka / 0.6);
        pos.x += Math.sign(d || 1) * C.tetanggaPergi * face;
        pos.z -= C.tetanggaMundur * face;
      }
      const lean = condong * (jarak < 0.5 ? 1 : 1.12);
      const bank = -C.tikung * condong * (jarak < 0.5 ? 0.7 : 1);
      eu.set(kt.miring.x + dr.rx, -sudut + lean + kt.miring.y + dr.ry + kt.balik, bank, "YXZ");
      q.setFromEuler(eu);
      m4.compose(pos, q, sk3.setScalar(sk));
      m4.premultiply(rak.matrixWorld);
      m4.decompose(pos, q, sk3);

      // Pose terbuka: menghadap kamera, tunduk 24 derajat, spread di tengah.
      const bk = nilaiTween(kt.bukaT, now);
      if (bk != null) kt.buka = bk;
      const swing = p3io((kt.buka - 0.3) / 0.7);
      const sudutTutup = k_.sempit ? (110 * Math.PI) / 180 : Math.PI;
      if (terbuka) {
        const face = p3io(kt.buka / 0.6);
        const lebarSpread = k_.sempit ? KOTAK.w * 1.35 : KOTAK.w * 2;
        const skBuka = Math.min((0.8 * vw) / lebarSpread, (0.62 * vh) / KOTAK.h, 1.6);
        const geserTengah = k_.sempit ? 0 : (KOTAK.w / 2) * swing * skBuka;
        pos2.set(geserTengah, 0.05, 0.3 * U);
        q2.copy(qBuka);
        if (k_.sempit) q2.multiply(qTmp.setFromEuler(eu.set(0, ((Math.PI - sudutTutup) / 2) * swing, 0)));
        q2.multiply(qTmp.setFromEuler(eu.set(kt.miring.x, 0, 0)));
        pos.lerp(pos2, face);
        q.slerp(q2, face);
        sk3.lerp(vTmp.setScalar(skBuka), face);
      }
      kt.engsel.rotation.y = -sudutTutup * swing;
      const redup = 0.1 + 0.9 * p3io(swing / 0.5);
      if (kt.cakram.parent === kt.badan) {
        setRedup(kt.cakram.userData.bahan.cetak, redup);
        setRedup(kt.cakram.userData.bahan.data, redup);
      }
      if (kt === aktifK || terbuka) pos.y += naikRak;

      // Ikuti sasaran: kotak jauh mengejar lebih lambat, memberi rasa inersia.
      const laju = kurangiGerak || terbuka ? 1 : Math.min(1, dt * jepit((seret?.gerak ? C.ikutSeret : C.ikutDasar) - C.ikutJarak * jarak, 6.5, 15));
      kt.grup.position.lerp(pos, laju);
      kt.grup.quaternion.slerp(q, laju);
      kt.grup.scale.lerp(sk3, laju);
      kt.sampul.visible = !(kt === aktifK && k_.buklet);
    }

    // --- pemutar dan proyektor ---------------------------------------------
    if (pemutar) {
      const tampil = k_.dengar > 0.001;
      pemutar.grup.visible = tampil;
      proyektor.grup.visible = tampil && !k_.sempit;
      const pY = -C.geserNaik * (1 - geser);
      const mx = k_.kursor.ada ? k_.kursor.y * C.miringKursor * 0.4 * 0.35 : 0;
      const my = k_.kursor.ada ? k_.kursor.x * C.miringKursor * 0.4 * 0.35 : 0;
      pemutar.grup.position.set(k_.sempit ? 0 : -0.3, pY + 0.12, 0);
      pemutar.grup.rotation.set(mx, Math.PI / 4 + my, 0);
      pemutar.grup.scale.setScalar(0.62);
      proyektor.grup.position.set(0.22, pY - 0.5, -0.1);
      proyektor.grup.scale.setScalar(0.32);
      proyektor.grup.rotation.set(0, -0.65, 0);
      pemutar.lampu.material.color.set(k_.jalan ? 0x8fd694 : 0xe0574b);
      proyektor.lensa.material.color.set(duduk ? 0xfff1d6 : 0x2a2622);
      for (const b of pemutar.tombol) {
        const sorot = k_.tombolHover === b.userData.tombol;
        const lab = b.userData.label.material;
        lab.opacity += ((sorot ? 1 : 0.5) - lab.opacity) * Math.min(1, dt / 0.08);
        b.position.z += (b.userData.dasarZ - (b.userData.tekan ? 0.004 : 0) - b.position.z) * Math.min(1, dt * 30);
      }
      pemutar.layar.gambar(now, duduk);
      if (tampil && !k_.sempit) {
        proyektor.lensa.getWorldPosition(lensaLayar).project(camera);
        panggil("lensa", (lensaLayar.x + 1) / 2, (1 - lensaLayar.y) / 2, duduk);
      }
    }

    // --- cakram: angkat, geser, bawa, jatuhkan ------------------------------
    if (aktifK) {
      const c = aktifK.cakram;
      if (k_.dengar > 0.001 && pemutar) {
        aktifK.badan.updateWorldMatrix(true, false);
        qTmp.setFromAxisAngle(sumbuZ, c.userData.putarAsal);
        m4.compose(posNampan, qTmp, vTmp.set(1, 1, 1)).premultiply(aktifK.badan.matrixWorld);
        m4.decompose(pos, q, sk3);
        pos.addScaledVector(vTmp.copy(sumbuZ).applyQuaternion(q), p3o(k_.dengar / 0.3) * 0.6 * U);
        pemutar.grup.updateWorldMatrix(true, false);
        const atas = pos2.set(0, pemutar.puncakY + 0.3 * U, 0).applyMatrix4(pemutar.grup.matrixWorld).clone();
        const poros = pos2.set(0, pemutar.puncakY, 0).applyMatrix4(pemutar.grup.matrixWorld).clone();
        q2.copy(pemutar.grup.getWorldQuaternion(qTmp)).multiply(qDatar);
        const bawa = p3io((k_.dengar - 0.35) / 0.45);
        const jatuh = p3io((k_.dengar - 0.78) / 0.22);
        pos.lerp(atas, bawa).lerp(poros, jatuh);
        q.slerp(q2, bawa);
        sk3.lerp(vTmp.setScalar(pemutar.grup.scale.x), bawa);
        if (c.parent !== scene) scene.attach(c);
        // 120 rpm, naik eksponensial (tau 0,4 dt), rem dengan perlambatan tetap.
        const sasaranLaju = k_.jalan ? C.rpm / 60 : 0;
        if (sasaranLaju > k_.laju) k_.laju += (sasaranLaju - k_.laju) * (1 - Math.exp(-dt / 0.4));
        else k_.laju = Math.max(sasaranLaju, k_.laju - (C.rpm / 60 / k_.rem) * dt);
        if (!kurangiGerak) k_.sudut += k_.laju * Math.PI * 2 * dt;
        q.multiply(qTmp.setFromAxisAngle(sumbuZ, -k_.sudut));
        c.position.copy(pos);
        c.quaternion.copy(q);
        c.scale.copy(sk3);
        setRedup(c.userData.bahan.cetak, 1);
        setRedup(c.userData.bahan.data, 1);
      } else if (c.parent !== aktifK.badan) {
        aktifK.badan.add(c);
        c.position.copy(posNampan);
        c.quaternion.setFromAxisAngle(sumbuZ, c.userData.putarAsal);
        c.scale.setScalar(1);
        k_.laju = 0;
      }
      sinkronCakram(c);
    }
    const sudahDuduk = k_.keadaan === "putar" && k_.dengar > 0.999;
    if (sudahDuduk !== duduk) {
      duduk = sudahDuduk;
      kirim();
    }

    // --- buklet: keluar dari tutup sambil melengkung, mendarat datar --------
    if (k_.buklet && aktifK) {
      const b = k_.buklet;
      const u = kuintik(k_.baca);
      const hal = b.bounds.pages;
      // Buklet dibaca sedikit di depan bidang rak; perkecil sesuai jaraknya ke kamera.
      const dekatKamera = (C.jarak - 0.3 * U) / C.jarak;
      const skBaca =
        dekatKamera *
        (k_.sempit
          ? (0.82 * vw) / Math.max(hal.width, 1)
          : Math.min((0.84 * vw) / Math.max(hal.width, 1), (0.64 * vh) / Math.max(hal.height, 1)));
      aktifK.sampul.updateWorldMatrix(true, false);
      aktifK.sampul.matrixWorld.decompose(pos, q, sk3);
      const skAsal = BUKLET * sk3.x;
      const sk = skAsal + (skBaca - skAsal) * u;
      // Sampul tertutup ada di x 0..1 (depan) atau -1..0 (belakang); geser ke tengah.
      const tutupDepan = b.page === 0 && !b.turning;
      const tutupBelakang = b.page >= b.pageCount - 1 && !b.turning && !k_.sempit;
      const geserTutup = k_.sempit ? 0 : tutupDepan ? -0.5 : tutupBelakang ? 0.5 : 0;
      b.userData.geser = (b.userData.geser ?? geserTutup) + (geserTutup - (b.userData.geser ?? geserTutup)) * Math.min(1, dt * 5);
      pos2.set((b.userData.geser - (hal.x + hal.width / 2)) * skBaca, 0.03 * vh, 0.3 * U);
      b.position.lerpVectors(pos, pos2, u);
      b.position.z += Math.sin(Math.PI * u) * 1.2 * U;
      b.quaternion.slerpQuaternions(q, qTmp.identity(), u);
      b.scale.setScalar(sk);
      const settle = jepit((k_.baca - 0.55) / 0.45);
      b.userData.deform.uniforms.uLengkung.value = Math.sin(Math.PI * jepit(k_.baca / 0.7)) * 1.1 * (1 - settle * settle);
      b.enabled = k_.baca > 0.999 && k_.keadaan === "buklet";
      const antre = k_.antreHalaman;
      if (antre && b.enabled && !b.turning) {
        const ok = antre.arah > 0 ? b.next() : b.prev();
        if (ok || now > antre.sampai) k_.antreHalaman = null;
      }
      b.tick(now);
      if (k_.keadaan !== "buklet" && k_.baca < 0.001) {
        scene.remove(b);
        b.dispose();
        k_.buklet = null;
      }
    }

    renderer.render(scene, camera);
  };

  let tampil = true;
  const jalan = () => renderer.setAnimationLoop(tampil && !document.hidden ? bingkai : null);
  const io = new IntersectionObserver(([en]) => {
    tampil = en.isIntersecting;
    jalan();
  });
  io.observe(wadah);
  const saatTersembunyi = () => {
    if (document.hidden && k_.jalan) {
      k_.jalan = false;
      kirim();
    }
    lalu = performance.now();
    jalan();
  };
  document.addEventListener("visibilitychange", saatTersembunyi);
  jalan();

  // --- masukan ----------------------------------------------------------------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const kena = (cx, cy) => {
    const r = kanvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const sasaran = kotak.filter((x) => x.grup.visible).map((x) => x.grup);
    if (pemutar?.grup.visible) sasaran.push(pemutar.grup);
    const ak = kotak.find((x) => x.p.slug === k_.aktif);
    if (ak && ak.cakram.parent === scene) sasaran.push(ak.cakram);
    return ray.intersectObjects(sasaran, true)[0] ?? null;
  };

  let tahan = 0;
  let gerakLalu = null;
  const turun = (ev) => {
    if (k_.keadaan === "buklet") return;
    const h = kena(ev.clientX, ev.clientY);
    const obj = h?.object ?? null;
    const kt = obj ? kotak.find((x) => x.p.slug === obj.userData.slug) : null;
    const depan = !!kt && kt.i === k_.tujuan && k_.keadaan === "rak";
    // Kotak merunduk di titik yang ditekan.
    if (kt && k_.keadaan === "rak") {
      const uv = h.uv ?? { x: 0.5, y: 0.5 };
      kt.dorong.vz -= 0.55 * U * 4;
      kt.dorong.vrx += (uv.y - 0.5) * 1.5;
      kt.dorong.vry -= (uv.x - 0.5) * 1.5;
    }
    if (obj?.userData.tombol && pemutar) {
      const b = pemutar.tombol.find((x) => x.userData.tombol === obj.userData.tombol);
      if (b) b.userData.tekan = true;
    }
    seret = {
      x: ev.clientX,
      pos: k_.pos,
      lalu: performance.now(),
      v: 0,
      gerak: false,
      kotak: kt,
      obj,
      sentuh: ev.pointerType !== "mouse",
      balik: depan && ev.pointerType === "mouse",
      balikAwal: kt?.balik ?? 0,
      vBalik: 0,
    };
    if (depan && ev.pointerType !== "mouse") {
      clearTimeout(tahan);
      tahan = setTimeout(() => {
        if (seret && !seret.gerak) {
          api.balik();
          seret.selesai = true;
        }
      }, 450);
    }
  };
  const gerak = (ev) => {
    const r = kanvas.getBoundingClientRect();
    k_.kursor.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    k_.kursor.y = ((ev.clientY - r.top) / r.height) * 2 - 1;
    k_.kursor.ada = ev.pointerType === "mouse";
    if (!seret) {
      if (ev.pointerType !== "mouse" || ev.target !== kanvas) return;
      const obj = kena(ev.clientX, ev.clientY)?.object ?? null;
      // Sapuan cepat melewati kotak: dorong dan pelintir sedikit.
      if (gerakLalu && obj?.userData.slug && k_.keadaan === "rak") {
        const lajuPx = Math.hypot(ev.clientX - gerakLalu.x, ev.clientY - gerakLalu.y);
        if (lajuPx > 9) {
          const kt = kotak.find((x) => x.p.slug === obj.userData.slug);
          kt.dorong.vz -= Math.min(0.5, 0.012 * lajuPx) * U;
          kt.dorong.vry += Math.sign(ev.clientX - gerakLalu.x) * Math.min(0.4, 0.009 * lajuPx);
        }
      }
      gerakLalu = { x: ev.clientX, y: ev.clientY };
      let jenis = null;
      if (obj && k_.keadaan !== "buklet") {
        if (obj.userData.tombol) jenis = duduk ? "tombol" : null;
        else if (obj.userData.bagian === "cakram" && (k_.keadaan === "buka" || duduk)) jenis = "cakram";
        else if (obj.userData.slug && k_.keadaan === "rak") jenis = "kotak";
      }
      k_.tombolHover = jenis === "tombol" ? obj.userData.tombol : null;
      if (jenis !== k_.hover) {
        k_.hover = jenis;
        panggil("hover", jenis);
      }
      return;
    }
    const dx = ev.clientX - seret.x;
    if (!seret.gerak && Math.abs(dx) > 5) {
      seret.gerak = true;
      clearTimeout(tahan);
      k_.posT.aktif = false;
      k_.inersia = 0;
    }
    if (k_.keadaan !== "rak" || !seret.gerak) return;
    const sekarang = performance.now();
    if (seret.balik) {
      // Seret untuk membalik; batas lunak lewat 80% dari setengah putaran.
      let a = dx * C.balikPerPx;
      const batas = 0.8 * Math.PI;
      if (Math.abs(a) > batas) {
        const lebih = (Math.abs(a) - batas) / Math.PI;
        a = Math.sign(a) * (batas + (Math.abs(a) - batas) / (1 + 14 * lebih * lebih));
      }
      const baru = seret.balikAwal + a;
      seret.vBalik = baru - seret.kotak.balik;
      seret.kotak.balik = baru;
      seret.kotak.balikT.aktif = false;
    } else {
      const perLayar = seret.sentuh ? C.kotakPerLayarSentuh : C.kotakPerLayar;
      const baru = jepit(seret.pos - (dx / W) * perLayar, -0.4, kotak.length - 0.6);
      seret.v += (jepit(baru - k_.pos, -0.5, 0.5) - seret.v) * 0.32;
      k_.pos = baru;
    }
    seret.lalu = sekarang;
  };
  const naik = () => {
    const s = seret;
    seret = null;
    clearTimeout(tahan);
    if (pemutar) pemutar.tombol.forEach((b) => (b.userData.tekan = false));
    if (!s || s.selesai) return;
    const now = performance.now();
    if (s.balik && s.gerak) {
      const kt = s.kotak;
      const putar = kt.balik - s.balikAwal;
      const sentil = Math.abs(s.vBalik) > 0.07 && now - s.lalu < 80;
      if (Math.abs(putar) > Math.PI / 2 || sentil) {
        const ke = s.balikAwal + Math.sign(putar || s.vBalik) * Math.PI;
        kt.balikTujuan = Math.abs(Math.round(ke / Math.PI)) % 2;
        pasangTween(kt.balikT, kt.balik, ke, 0.9, p3o, now);
      } else {
        pasangTween(kt.balikT, kt.balik, s.balikAwal, 1.2, p3o, now);
      }
      kirim();
      return;
    }
    if (s.gerak) {
      if (k_.keadaan !== "rak") return;
      if (s.sentuh && Math.abs(s.v) > 0.035) keIndeks(Math.round(s.pos) + (s.v > 0 ? 1 : -1), "sentuh");
      else k_.inersia = s.v;
      return;
    }
    if (k_.keadaan === "rak" && s.kotak) {
      if (s.kotak.i === k_.tujuan) panggil("klikKotak", s.kotak.p.slug);
      else keIndeks(s.kotak.i, "klik");
    } else if (k_.keadaan === "buka" && s.obj?.userData.bagian === "cakram") {
      panggil("klikCakram");
    } else if (k_.keadaan === "putar" && s.obj && duduk) {
      if (s.obj.userData.tombol) panggil("tombol", s.obj.userData.tombol);
      else if (s.obj.userData.bagian === "cakram") panggil("klikCakram");
    }
  };

  // Roda: tepat satu langkah per gestur. Selubung meluruh (tau 550 ms) supaya
  // ekor momentum trackpad tidak melangkah lagi.
  const roda = { selubung: 0, jumlah: 0, langkahLalu: 0, eventLalu: 0, siap: true, mulai: 0, puncak: 0 };
  const putarRoda = (ev) => {
    if (k_.keadaan !== "rak") return;
    ev.preventDefault();
    const now = performance.now();
    const d = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
    const a = Math.min(24, Math.abs(d));
    const jeda = now - roda.eventLalu;
    roda.selubung *= Math.exp(-jeda / 550);
    if (jeda > 150) {
      roda.jumlah = 0;
      roda.mulai = now;
      roda.puncak = 0;
    }
    const sejakLangkah = now - roda.langkahLalu;
    const naikTajam = a > 1.2 * roda.selubung && sejakLangkah > 190;
    const ketukan = ev.deltaMode === 1 && sejakLangkah > 90;
    const panjang = now - roda.mulai > 480 && a > 0.8 * roda.puncak && sejakLangkah > 480;
    if (!roda.siap && (jeda > 130 || naikTajam || ketukan || panjang)) roda.siap = true;
    roda.selubung = Math.max(roda.selubung, a);
    roda.puncak = Math.max(roda.puncak, a);
    roda.eventLalu = now;
    roda.jumlah += Math.sign(d) * a;
    if (roda.siap && Math.abs(roda.jumlah) > 6) {
      keIndeks(k_.tujuan + Math.sign(roda.jumlah), "roda");
      roda.langkahLalu = now;
      roda.jumlah = 0;
      roda.siap = false;
    }
  };
  const keluar = () => {
    k_.kursor.ada = false;
    gerakLalu = null;
    if (k_.hover) {
      k_.hover = null;
      panggil("hover", null);
    }
  };
  kanvas.addEventListener("pointerdown", turun);
  window.addEventListener("pointermove", gerak);
  window.addEventListener("pointerup", naik);
  kanvas.addEventListener("pointerleave", keluar);
  kanvas.addEventListener("wheel", putarRoda, { passive: false });

  const api = {
    on(nama, fn) {
      dengar[nama] = fn;
    },
    fokus(i) {
      if (k_.keadaan === "rak") keIndeks(i, "kunci");
    },
    lompat(i) {
      // Untuk tautan langsung: tanpa animasi geser.
      k_.tujuan = k_.pos = jepit(i, 0, kotak.length - 1);
      kirim();
    },
    geser(arah) {
      if (k_.keadaan === "rak") keIndeks(k_.tujuan + arah, "kunci");
    },
    buka(slug) {
      const i = proyek.findIndex((p) => p.slug === slug);
      if (i < 0 || k_.keadaan !== "rak") return;
      const now = performance.now();
      if (i !== k_.tujuan) {
        k_.tujuan = i;
        k_.pos = i;
      }
      const kt = kotak[i];
      if (kt.balikTujuan) tegakkan(kt, now, 0.6);
      pasangTween(kt.bukaT, kt.buka, 1, C.bukaDetik * (1 - kt.buka), linear, now);
      k_.aktif = slug;
      k_.keadaan = "buka";
      kirim();
    },
    tutup() {
      if (k_.keadaan === "buklet") return api.tutupBuklet();
      if (k_.keadaan === "putar") return api.keluarkan();
      if (k_.keadaan !== "buka") return;
      const kt = kotak.find((x) => x.p.slug === k_.aktif);
      pasangTween(kt.bukaT, kt.buka, 0, Math.max(0.2, C.bukaDetik * 0.85 * kt.buka), linear, performance.now());
      k_.aktif = null;
      k_.keadaan = "rak";
      kirim();
    },
    bukaBuklet() {
      if (k_.keadaan !== "buka" || k_.dengar > 0.001) return;
      const p = proyek.find((x) => x.slug === k_.aktif);
      if (!k_.buklet) {
        const deform = { glsl: LENGKUNG_GLSL, uniforms: { uLengkung: { value: 0 } } };
        const b = new LeafThroughObject(
          { renderer, camera, domElement: kanvas },
          {
            pages: halamanBuklet(p, locale),
            pageAspect: 1,
            layout: k_.sempit ? "single" : "spread",
            loop: k_.sempit,
            deform,
            paper: { wrinkles: 0.055, bulge: 0.22 },
            motion: { reducedMotion: kurangiGerak ? true : "auto" },
          },
        );
        b.userData.deform = deform;
        scene.add(b);
        k_.buklet = b;
      }
      pasangTween(k_.bacaT, k_.baca, 1, C.bacaMasuk * (1 - k_.baca), linear, performance.now());
      k_.keadaan = "buklet";
      kirim();
    },
    tutupBuklet() {
      if (k_.keadaan !== "buklet") return;
      pasangTween(k_.bacaT, k_.baca, 0, C.bacaKeluar * k_.baca, linear, performance.now());
      k_.keadaan = "buka";
      kirim();
    },
    halaman(arah) {
      if (!k_.buklet) return;
      // Selama halaman masih dimuat, LeafThrough menolak membalik; antrekan dan
      // coba tiap bingkai sampai berhasil (paling lama 4 detik).
      k_.antreHalaman = { arah, sampai: performance.now() + 4000 };
    },
    dengarkan() {
      if (k_.keadaan !== "buka" || k_.baca > 0.001) return;
      siapkanPemutar();
      const p = proyek.find((x) => x.slug === k_.aktif);
      pemutar.layar.setel(`${p.judul[locale]}  ${p.katalog}`, performance.now());
      pasangTween(k_.dengarT, k_.dengar, 1, C.dengarMasuk * (1 - k_.dengar), linear, performance.now());
      k_.keadaan = "putar";
      k_.rem = C.remDetik;
      kirim();
    },
    keluarkan() {
      if (k_.keadaan !== "putar") return;
      k_.jalan = false;
      k_.rem = C.remKeluarkan;
      pasangTween(k_.dengarT, k_.dengar, 0, C.dengarKeluar * k_.dengar, linear, performance.now());
      k_.keadaan = "buka";
      duduk = false;
      kirim();
    },
    setJalan(nyala) {
      if (!duduk) return;
      k_.jalan = nyala;
      k_.rem = C.remDetik;
      kirim();
    },
    balik() {
      const kt = kotak[k_.tujuan];
      if (k_.keadaan !== "rak" || !kt) return;
      const now = performance.now();
      if (kt.balikTujuan) tegakkan(kt, now, 0.9);
      else {
        kt.balikTujuan = 1;
        pasangTween(kt.balikT, kt.balik, kt.balik + Math.PI, 0.9, p3o, now);
      }
      kirim();
    },
    get keadaan() {
      return k_.keadaan;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      clearTimeout(tahan);
      document.removeEventListener("visibilitychange", saatTersembunyi);
      kanvas.removeEventListener("pointerdown", turun);
      window.removeEventListener("pointermove", gerak);
      window.removeEventListener("pointerup", naik);
      kanvas.removeEventListener("pointerleave", keluar);
      kanvas.removeEventListener("wheel", putarRoda);
      k_.buklet?.dispose();
      scene.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry.dispose();
        for (const m of [].concat(o.material)) {
          m.map?.dispose();
          m.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      kanvas.remove();
    },
  };
  return api;
}
