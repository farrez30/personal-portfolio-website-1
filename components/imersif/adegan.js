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
import { albumUntuk } from "@/content/album";
import { GULUNG_GLSL, UKURAN, aturGulung, letakTengah, gulungDari, mulaiBelok, tarikBelok, tekuk } from "./gulung";
import { KOTAK, BUKLET, buatKotak, buatPemutar, buatLingkungan, sinkronCakram, setRedup, setBlurPutar } from "./benda";
import { gambarSampul, gambarHalaman, gambarBelakang, gambarDaftarLagu, muatGambar } from "./gambar";
import { buatHalamanUV } from "./halamanUV";
import { buatSorot, ujungSorot, kedip } from "./sorot";

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
  // Setelah Play: pemutar turun dan mengecil supaya ruang proyeksi di atasnya terlihat.
  mundurDetik: 1.2,
  mundurTurun: 1.1 * U,
  mundurSkala: 0.3,
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

function halamanBuklet(p, locale, uv) {
  const hal = [{ src: gambarSampul(p, locale, 2048), alt: `${p.katalog} ${p.judul[locale]}` }];
  hal.push({
    src: gambarHalaman({ label: LABEL.overview, judul: p.judul[locale], isi: p.ringkas[locale], catatan: `${p.katalog}  ${p.periode}` }, 2048),
    alt: LABEL.overview,
    text: p.ringkas[locale],
  });
  // Ilustrasi album bergenre: diberikan sebagai URL supaya LeafThrough baru memuatnya
  // saat buklet dibuka. Sepertiga kanannya sengaja kosong untuk teks yang menunggu
  // persetujuan naskah (content/proyek.js), jadi untuk sekarang dekoratif.
  for (const src of albumUntuk(p.slug)?.buklet ?? []) hal.push({ src, alt: "" });
  // CD musik: daftar lagu playlist Farrez (content/musik.js, diisi dari /api/musik/daftar).
  const lagu = p.daftarLagu ?? [];
  for (let i = 0; i < lagu.length; i += 10) {
    const isi = lagu.slice(i, i + 10);
    hal.push({ src: gambarDaftarLagu(isi, { awal: i }), alt: "Tracklist", text: isi.map((l) => `${l.judul}, ${l.artis}`).join("\n") });
  }
  for (const h of HALAMAN) {
    const b = p.buklet[h];
    if (!b) continue;
    hal.push({ src: gambarHalaman({ label: LABEL[h], judul: b.judul[locale], isi: b.isi[locale] }, 2048), alt: LABEL[h], text: `${b.judul[locale]}\n\n${b.isi[locale]}` });
  }
  if (uv) {
    // Halaman UV selalu di sisi kanan spread (indeks genap) supaya senter mudah diarahkan.
    if (hal.length % 2 === 1) hal.push({ src: gambarHalaman({ label: "" }), alt: "" });
    uv.indeks = hal.length;
    hal.push({ src: uv.tekstur, alt: LABEL.architecture, text: p.arsitektur.alur.map((l, i) => `${i + 1}. ${l.judul[locale]}`).join("\n") });
  }
  // Halaman belakang sama persis dengan yang terlihat di tutup kotak, supaya tidak
  // ada tekstur yang berganti saat buklet ditarik keluar.
  const belakang = { src: gambarBelakang(p, locale, 1024), alt: p.katalog };
  while (hal.length < 3 || hal.length % 2 === 0) hal.push({ src: gambarHalaman({ label: "" }), alt: "" });
  hal.push(belakang);
  return hal;
}

// Kapan pose buklet mulai berubah (tengahnya mulai mengitari silinder), untuk tutup 180 derajat.
// Sisi 1: layar lebar, tutup terbuka 180 derajat. Sisi -1: HP, tutup terbuka 110 derajat.
const MULAI = { 1: mulaiBelok(1, 180), [-1]: mulaiBelok(-1, 110) };
// Kotak naik keluar layar mulai saat itu, dengan kurva yang sama seperti Dengarkan.
const mulaiGeserBaca = (sisi) => Math.max(0.4, MULAI[sisi]);

const tween = () => ({ aktif: false, dari: 0, ke: 0, mulai: 0, durasi: 1, kurva: luncur });

export function buatAdegan(wadah, { proyek, locale, kurangiGerak, onUbah, gulirHalaman = false }) {
  RectAreaLightUniformsLib.init();
  const sentuhKasar = matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: (window.devicePixelRatio || 1) < 2 || sentuhKasar,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  renderer.setClearColor(0x000000, 0);
  const iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  renderer.shadowMap.enabled = !iOS;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  // Peta bayangan digambar sekali sejak awal: bahan yang menerima bayangan butuh teksturnya ada.
  renderer.shadowMap.needsUpdate = true;
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
  // Posisinya dalam lebar halaman relatif ke buklet: dari kiri atas depan, cukup rendah
  // supaya lengkung kertas dan bayangan lembar yang dibalik terlihat di dekat punggung.
  const matahari = new THREE.DirectionalLight(0xffffff, 0);
  matahari.castShadow = true;
  matahari.shadow.mapSize.set(2048, 2048);
  matahari.shadow.bias = -0.0007;
  matahari.shadow.normalBias = 0.002;
  matahari.shadow.radius = 3;
  const langit = new THREE.HemisphereLight(0xffffff, 0xa1aeaf, 0);
  // Senter UV sebagai lampu sorot sungguhan: cahayanya jatuh merata ke dua halaman
  // dan melewati punggung buklet, bukan dilukis di tekstur satu halaman.
  const senterLampu = new THREE.SpotLight(0x7d5cff, 0, 0, 0.3, 1, 0);
  scene.add(kunci, isiCahaya, tepi, strip, matahari, matahari.target, langit, senterLampu, senterLampu.target);

  // Rak dimiringkan; kotak bukan anak rak, posenya dihitung lewat matriks ini.
  const rak = new THREE.Object3D();
  rak.rotation.set(C.miringRak.x, C.miringRak.y, 0);
  scene.add(rak);

  for (const p of proyek) if (p.ilustrasi) muatGambar(p.ilustrasi);
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
  const siapkanPemutar = () => {
    if (pemutar) return;
    pemutar = buatPemutar(renderer);
    pemutar.grup.visible = false;
    scene.add(pemutar.grup);
  };
  // Di perangkat sentuh shader dikompilasi di utas utama; buat lebih awal.
  if (sentuhKasar) siapkanPemutar();
  // Sorot proyektor ke panel hologram (panelnya HTML, diukur tiap bingkai).
  const sorot = buatSorot();
  scene.add(sorot.mesh);
  let panelHolo = null;
  let sorotNyala = false;
  let terangSorot = 0;
  const asalSorot = new THREE.Vector3();
  const tepiSumur = new THREE.Vector3();

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
    mundur: 0,
    mundurT: tween(),
    pernahMain: false,
    sibuk: false,
    baca: 0,
    bacaT: tween(),
    buklet: null,
    uv: null,
    senter: false,
    uvTerlihat: false,
    kursor: { x: 0, y: 0, ada: false },
    hover: null,
    tombolHover: null,
    introMulai: performance.now(),
  };
  const dengar = {};
  // Penunggu: selesai di bingkai pertama kondisinya terpenuhi.
  const menunggu = [];
  const tunggu = (cek) => new Promise((selesai) => menunggu.push({ cek, selesai }));
  // Selama urutan ganti album berjalan, klik dan tombol lain diabaikan.
  let urut = false;
  const terkunci = () => k_.sibuk && !urut;
  const panggil = (n, ...a) => dengar[n]?.(...a);
  // Laju motor dikirim hanya saat berubah berarti, bukan tiap bingkai.
  let motorLalu = 0;
  const kirimMotor = (r) => {
    if (Math.abs(r - motorLalu) < 0.01 && !(r === 0 && motorLalu !== 0)) return;
    motorLalu = r;
    panggil("motor", r);
  };
  let duduk = false;

  const kirim = () =>
    onUbah?.({
      fokus: k_.tujuan,
      keadaan: k_.keadaan,
      aktif: k_.aktif,
      terbalik: kotak[k_.tujuan]?.balikTujuan !== 0,
      duduk,
      jalan: k_.jalan,
      pernahMain: k_.pernahMain,
      sibuk: k_.sibuk,
      uvTerlihat: k_.uvTerlihat,
      senter: k_.senter,
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
  const pasangLensa = (a, aNaik = a) => {
    const fov = C.fovRak + (C.fovDekat - C.fovRak) * a;
    const tanS = Math.tan((fov * Math.PI) / 360);
    const jarak = (C.jarak * Math.tan((20 * Math.PI) / 180)) / tanS;
    const naik = jarak * Math.tan(C.pandangAtas) * aNaik;
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
  const vTengahBaca = new THREE.Vector3();
  const vAkhir = new THREE.Vector3();
  const vGeser = new THREE.Vector3();
  const vTengah = new THREE.Vector3();
  const qBalik = new THREE.Quaternion();
  const qTenang = new THREE.Quaternion();
  const sumbuY = new THREE.Vector3(0, 1, 0);
  const gAkhir = {};
  const vArah = new THREE.Vector3();
  const vPosB = new THREE.Vector3();
  const sumbuZ = new THREE.Vector3(0, 0, 1);
  const qBuka = new THREE.Quaternion().setFromEuler(new THREE.Euler(C.bukaTunduk, 0, 0));
  const qDatar = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const posNampan = new THREE.Vector3(0.06, 0, -KOTAK.d / 2 + 0.066);
  const lensaLayar = new THREE.Vector3();
  const raySenter = new THREE.Raycaster();
  const ndcSenter = new THREE.Vector2();
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

    if (k_.menutup && !k_.menutup.bukaT.aktif) {
      if (k_.aktif === k_.menutup.p.slug && k_.keadaan === "rak") k_.aktif = null;
      k_.menutup = null;
      kirim();
    }
    const aktifK = kotak.find((x) => x.p.slug === k_.aktif) ?? null;
    for (let n = menunggu.length - 1; n >= 0; n--) {
      if (menunggu[n].cek()) menunggu.splice(n, 1)[0].selesai();
    }
    const dv = nilaiTween(k_.dengarT, now);
    const dengarLalu = k_.dengar;
    if (dv != null) k_.dengar = dv;
    if (k_.dengar > 0.03 && dengarLalu <= 0.03 && k_.keadaan === "putar") panggil("suara", "angkat");
    const bv = nilaiTween(k_.bacaT, now);
    if (bv != null) k_.baca = bv;
    const mv = nilaiTween(k_.mundurT, now);
    if (mv != null) k_.mundur = mv;

    const geser = p3io((k_.dengar - 0.2) / 0.5);
    const sisiBuklet = k_.sempit ? -1 : 1;
    const keluarBaca = p3io((k_.baca - mulaiGeserBaca(sisiBuklet)) / 0.5);
    const naikRak = Math.max(geser, keluarBaca) * C.geserNaik;
    pasangLensa(Math.max(geser, keluarBaca), geser);
    // Cahaya tepi biru memudar bersama lensa; cahaya ambien naik untuk pemutar.
    const cahayaBaca = p3io((k_.baca - 0.6) / 0.26);
    tepi.intensity = 0.75 * (1 - geser) * (1 - cahayaBaca);
    ambien.intensity = (0.25 + 0.9 * geser) * (1 - cahayaBaca);
    langit.intensity = 1.5 * cahayaBaca;
    // Senter UV menyala: ruangan meredup dan bernuansa ungu, seperti memakai lampu UV.
    k_.redupUV = (k_.redupUV ?? 0) + ((k_.senter ? 1 : 0) - (k_.redupUV ?? 0)) * Math.min(1, dt * 6);
    // Matahari baca sudah menyala selama buklet terbang (1,6), penuh saat mendarat (2).
    const sinarBaca = (1.6 + 0.4 * cahayaBaca) * p3io(k_.baca / 0.35);
    matahari.intensity = sinarBaca * (1 - 0.45 * k_.redupUV);
    langit.color.setRGB(1 - 0.2 * k_.redupUV, 1 - 0.3 * k_.redupUV, 1);
    strip.intensity = 1.9 * (1 - cahayaBaca);
    kunci.intensity = 0.75 * (1 - cahayaBaca);
    isiCahaya.intensity = 0.3 * (1 - cahayaBaca);
    scene.environmentIntensity = 1 - cahayaBaca;
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
      // Bunyi mengikuti gerak tutupnya: kait lepas di awal buka, klak saat rapat.
      const bukaLalu = kt.bukaLalu ?? 0;
      if (kt.buka > 0.04 && bukaLalu <= 0.04) panggil("suara", "bukaKotak");
      else if (kt.buka < 0.02 && bukaLalu >= 0.02) panggil("suara", "rapat");
      kt.bukaLalu = kt.buka;
      const swing = p3io((kt.buka - 0.3) / 0.7);
      const sudutTutup = k_.sempit ? (110 * Math.PI) / 180 : Math.PI;
      if (terbuka) {
        const face = p3io(kt.buka / 0.6);
        const lebarSpread = k_.sempit ? KOTAK.w * 1.35 : KOTAK.w * 2;
        // Kotak terbuka dengan ruang di sekelilingnya, seperti benda di atas meja.
        const skBuka = Math.min(((k_.sempit ? 0.86 : 0.7) * vw) / lebarSpread, (0.46 * vh) / KOTAK.h, 1.6);
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
      // Kotak klik menutupi isi; saat terbuka, cakram dan buklet harus bisa diklik langsung.
      kt.sasaran.visible = !terbuka;
      const redup = 0.1 + 0.9 * p3io(swing / 0.5);
      if (kt.cakram.parent === kt.badan) {
        setRedup(kt.cakram.userData.bahan.cetak, redup);
        setRedup(kt.cakram.userData.bahan.data, redup);
      }
      // Seluruh rak naik bersama, termasuk tetangga, seperti satu galeri.
      pos.y += naikRak;

      // Ikuti sasaran: kotak jauh mengejar lebih lambat, memberi rasa inersia.
      const laju = kurangiGerak || terbuka ? 1 : Math.min(1, dt * jepit((seret?.gerak ? C.ikutSeret : C.ikutDasar) - C.ikutJarak * jarak, 6.5, 15));
      kt.grup.position.lerp(pos, laju);
      kt.grup.quaternion.slerp(q, laju);
      kt.grup.scale.lerp(sk3, laju);
      // Buklet di tutup disembunyikan selama salinannya (LeafThrough) sedang keluar.
      kt.sampul.visible = kt.belakangBuklet.visible = !(kt === aktifK && k_.buklet);
    }

    // --- pemutar -----------------------------------------------------------
    if (pemutar) {
      const tampil = k_.dengar > 0.001;
      pemutar.grup.visible = tampil;
      const pY = -C.geserNaik * (1 - geser);
      const mx = k_.kursor.ada ? k_.kursor.y * C.miringKursor * 0.4 * 0.35 : 0;
      const my = k_.kursor.ada ? k_.kursor.x * C.miringKursor * 0.4 * 0.35 : 0;
      const mundur = p3io(k_.mundur);
      pemutar.grup.position.set(0, pY + 0.2 - mundur * C.mundurTurun, 0);
      pemutar.grup.rotation.set(mx, Math.PI / 4 + my, 0);
      // Di layar sempit pemutar mengecil mengikuti lebar layar, seperti Discography.
      const muat = jepit(vw / 2 / (1.4 * U), 0.4, 1);
      pemutar.grup.scale.setScalar(0.62 * muat * (1 - C.mundurSkala * mundur));
      pemutar.lampu.material.color.set(k_.jalan ? 0x8fd694 : 0xe0574b);
      for (const b of pemutar.tombol) {
        const sorot = k_.tombolHover === b.userData.tombol;
        const lab = b.userData.label.material;
        lab.opacity += ((sorot ? 1 : 0.5) - lab.opacity) * Math.min(1, dt / 0.08);
        b.position.z += (b.userData.dasarZ - (b.userData.tekan ? 0.004 : 0) - b.position.z) * Math.min(1, dt * 30);
      }
      pemutar.layar.gambar(now, duduk);
      if (tampil) {
        // Titik sumur di layar: dari sini hologram naik.
        lensaLayar.set(0, pemutar.puncakY, 0).applyMatrix4(pemutar.grup.matrixWorld).project(camera);
        const lebarSumur = vTmp.set(0.62, pemutar.puncakY, 0).applyMatrix4(pemutar.grup.matrixWorld).project(camera);
        panggil("sumur", (lensaLayar.x + 1) / 2, (1 - lensaLayar.y) / 2, Math.abs(lebarSumur.x - lensaLayar.x) / 2, duduk);
      }
    }

    // --- sorot proyektor ------------------------------------------------------
    // Menyala pelan saat Play, padam lebih cepat saat jeda atau cakram dikeluarkan.
    const sasaranSorot = sorotNyala && panelHolo && pemutar && k_.dengar > 0.001 ? 1 : 0;
    terangSorot += (sasaranSorot - terangSorot) * Math.min(1, dt * (sasaranSorot ? 2.4 : 6));
    sorot.mesh.visible = false;
    if (terangSorot > 0.002 && panelHolo && pemutar?.grup.visible) {
      const ujung = ujungSorot(panelHolo.getBoundingClientRect(), kanvas.getBoundingClientRect());
      asalSorot.set(0, pemutar.puncakY, 0).applyMatrix4(pemutar.grup.matrixWorld);
      const jari = tepiSumur.set(0.62 * 0.55, pemutar.puncakY, 0).applyMatrix4(pemutar.grup.matrixWorld).distanceTo(asalSorot);
      if (ujung && sorot.pasang(asalSorot, ujung, jari, camera, U)) {
        const detik = kurangiGerak ? 0 : now / 1000;
        sorot.uniforms.uWaktu.value = detik;
        sorot.uniforms.uKedip.value = kurangiGerak ? 1 : kedip(detik);
        sorot.uniforms.uKuat.value = terangSorot;
        sorot.mesh.visible = true;
      }
    }
    if (Math.abs(terangSorot - (k_.dengungLalu ?? 0)) > 0.005 || (terangSorot < 0.002 && k_.dengungLalu)) {
      k_.dengungLalu = terangSorot < 0.002 ? 0 : terangSorot;
      panggil("proyektor", k_.dengungLalu, kurangiGerak ? 1 : kedip(now / 1000));
    }

    // --- cakram: angkat, geser, bawa, jatuhkan ------------------------------
    if (aktifK) {
      const c = aktifK.cakram;
      if (k_.dengar > 0.001 && pemutar) {
        aktifK.badan.updateWorldMatrix(true, false);
        qTmp.setFromAxisAngle(sumbuZ, c.userData.putarAsal);
        m4.compose(posNampan, qTmp, vTmp.set(1, 1, 1)).premultiply(aktifK.badan.matrixWorld);
        m4.decompose(pos, q, sk3);
        // Asal cakram tetap di tempat kotak semula: kotak naik keluar layar, cakram tidak ikut.
        pos.y -= geser * C.geserNaik;
        pos.addScaledVector(vTmp.copy(sumbuZ).applyQuaternion(q), p3o(k_.dengar / 0.3) * 0.6 * U);
        pemutar.grup.updateWorldMatrix(true, false);
        const atas = pos2.set(0, pemutar.kursiY + 0.3 * U, 0).applyMatrix4(pemutar.grup.matrixWorld).clone();
        const poros = pos2.set(0, pemutar.kursiY, 0).applyMatrix4(pemutar.grup.matrixWorld).clone();
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
        kirimMotor(k_.laju / (C.rpm / 60));
        setBlurPutar(c.userData.bahan.cetak, kurangiGerak ? 0 : k_.laju * Math.PI * 2 * Math.max(0.025, dt));
        // Sudut putar kembali ke nol selama dibawa pulang, supaya tidak meloncat saat masuk nampan.
        const sudutTampak = (k_.sudut % (Math.PI * 2)) * bawa;
        q.multiply(qTmp.setFromAxisAngle(sumbuZ, -sudutTampak));
        pemutar.poros.rotation.y = -sudutTampak;
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
        k_.sudut = 0;
        kirimMotor(0);
      }
      sinkronCakram(c);
    }
    const sudahDuduk = k_.keadaan === "putar" && k_.dengar > 0.999;
    if (sudahDuduk !== duduk) {
      if (sudahDuduk) panggil("suara", "duduk");
      duduk = sudahDuduk;
      kirim();
    }

    const perluBuklet = !!aktifK && aktifK.buka > 0.25;
    if (k_.buklet && (!perluBuklet || k_.buklet.userData.slug !== aktifK?.p.slug) && k_.baca < 0.001) buangBuklet();
    if (perluBuklet && !k_.buklet) k_.buklet = buatBuklet(aktifK.p);
    if (!k_.buklet) senterLampu.intensity = 0;
    // --- buklet: keluar dari tutup sambil melengkung, mendarat datar --------
    if (k_.buklet && aktifK) {
      const b = k_.buklet;
      const hal = b.bounds.pages;
      // Buklet dibaca sedikit di depan bidang rak; perkecil sesuai jaraknya ke kamera.
      const dekatKamera = (camera.position.z - 0.3 * U) / camera.position.z;
      const skBaca =
        dekatKamera *
        (k_.sempit
          ? (0.82 * vw) / Math.max(hal.width, 1)
          : Math.min((0.84 * vw) / Math.max(hal.width, 1), (0.64 * vh) / Math.max(hal.height, 1)));
      // Kerangka diam: buklet di tutup, tengahnya di tengah sampul. Satuannya satuan kotak,
      // dikali skala kotak di dunia.
      aktifK.sampul.updateWorldMatrix(true, false);
      aktifK.sampul.matrixWorld.decompose(pos, q, sk3);
      // Kotak naik keluar layar, kertas yang sudah keluar tidak ikut terbawa.
      pos.y -= Math.max(0, naikRak - geser * C.geserNaik);
      const skKotak = sk3.x;
      const skAsal = BUKLET * skKotak;
      // Sampul tertutup ada di x 0..1 (depan) atau -1..0 (belakang); geser ke tengah.
      const tutupDepan = b.page === 0 && !b.turning;
      const tutupBelakang = b.page >= b.pageCount - 1 && !b.turning && !k_.sempit;
      const geserTutup = k_.sempit ? 0 : tutupDepan ? -0.5 : tutupBelakang ? 0.5 : 0;
      b.userData.geser = (b.userData.geser ?? geserTutup) + (geserTutup - (b.userData.geser ?? geserTutup)) * Math.min(1, dt * 5);
      // Titik asal LeafThrough (punggung) saat dibaca, lalu tengah sampulnya.
      pos2.set((b.userData.geser - (hal.x + hal.width / 2)) * skBaca, 0.03 * vh, 0.3 * U);
      const tengahBaca = vTengahBaca.copy(pos2).add(vTmp.set(0.5 * skBaca, 0, 0));

      // Kertas meluncur sepanjang jalur gulung; tengahnya ikut jalur itu, jadi buklet
      // berputar mengitari sumbu silinder di sisi punggung.
      const g = (k_.gul ??= {});
      const sudutTutupDeg = k_.sempit ? 110 : 180;
      aturGulung(gulungDari(k_.baca, sisiBuklet, sudutTutupDeg), g, sisiBuklet, sudutTutupDeg);
      const [cx, cz, ca] = letakTengah(g);
      aturGulung(gulungDari(1, sisiBuklet, sudutTutupDeg), gAkhir, sisiBuklet, sudutTutupDeg);
      const [ax, az] = letakTengah(gAkhir);
      // Satu perubahan pose sejak tengahnya mulai mengitari silinder: miring, ukuran, dan
      // geseran yang membawa ujung putaran ke tengah layar baca. Lengkung kertas ikut lemas.
      const mulaiB = MULAI[sisiBuklet];
      const settle = kuintik(jepit((k_.baca - mulaiB) / (1 - mulaiB)));
      const akhir = vAkhir.set(ax, 0, az).applyQuaternion(q).multiplyScalar(skKotak).add(pos);
      const geserBaca = vGeser.subVectors(tengahBaca, akhir);
      const tengah = vTengah.set(cx, 0, cz).applyQuaternion(q).multiplyScalar(skKotak).add(pos).addScaledVector(geserBaca, settle);
      // Arah: diputar di punggung sebesar sudut jalur, lalu pose kotak berubah ke pose baca.
      // Sudut akhir -pi dibatalkan oleh putaran setengah lingkaran, sampul depan menghadap kita.
      qBalik.setFromAxisAngle(sumbuY, Math.PI).multiply(q2.copy(q).invert());
      qTenang.identity().slerp(qBalik, settle);
      const qBuklet = qTmp.copy(q).multiply(q2.setFromAxisAngle(sumbuY, ca)).premultiply(qTenang);
      let sk = skAsal + (skBaca - skAsal) * settle;
      // Bingkai terbang: begitu buklet mulai mengitari silinder, ukurannya di layar dibatasi
      // supaya tidak membesar keluar layar saat mendekat ke kamera, dan tingginya digeser masuk
      // ke batas atas dan bawah. Hanya kertasnya yang dikoreksi, kotaknya tidak.
      // Bingkai masuk sepanjang 140 mm tarikan sejak tengahnya mulai berbelok.
      const bingkai = p3io((g.y - tarikBelok(sisiBuklet)) / 1.4) * (1 - jepit((k_.baca - 0.97) / 0.03));
      if (bingkai > 0) {
        camera.updateMatrixWorld();
        const tepiNdc = (2 * 64) / H;
        // Titik kertas yang sudah ditekuk (sama dengan shader), bukan hanya sudut datarnya:
        // saat melengkung kertas menonjol melewati sudut-sudut itu.
        const datar = settle * settle;
        const titik = (px, sy) => {
          const [tx, tz] = k_.baca < 0.9999 ? tekuk((px - 0.5) * UKURAN, g, datar) : [(px - 0.5) * UKURAN, 0];
          return vTmp.set((tx / UKURAN) * sk, sy * sk, (tz / UKURAN) * sk).applyQuaternion(qBuklet).add(tengah).project(camera);
        };
        const ukur = () => {
          let atas = -Infinity;
          let bawah = Infinity;
          for (let n = 0; n <= 8; n++) {
            for (const sy of [-0.5, 0.5]) {
              titik(n / 8, sy);
              atas = Math.max(atas, vTmp.y);
              bawah = Math.min(bawah, vTmp.y);
            }
          }
          return [atas, bawah];
        };
        let [atas, bawah] = ukur();
        const batas = 2 - 2 * tepiNdc;
        if (atas - bawah > batas) {
          sk *= 1 - bingkai * (1 - batas / (atas - bawah));
          [atas, bawah] = ukur();
        }
        const lebih = Math.max(0, atas - (1 - tepiNdc)) - Math.max(0, -1 + tepiNdc - bawah);
        const jarakKamera = camera.position.z - tengah.z;
        const tanS = Math.tan((camera.fov * Math.PI) / 360);
        if (lebih !== 0) tengah.y -= bingkai * lebih * jarakKamera * tanS;
        if (!k_.sempit) {
          let kiri = Infinity;
          let kanan = -Infinity;
          for (let n = 0; n <= 8; n++) {
            for (const sy of [-0.5, 0.5]) {
              titik(n / 8, sy);
              kiri = Math.min(kiri, vTmp.x);
              kanan = Math.max(kanan, vTmp.x);
            }
          }
          const tepiX = (2 * 48) / W;
          const lewat = Math.max(0, kanan - (1 - tepiX)) - Math.max(0, -1 + tepiX - kiri);
          if (lewat !== 0) tengah.x -= bingkai * lewat * jarakKamera * tanS * camera.aspect;
        }
      }
      b.quaternion.copy(qBuklet);
      b.position.copy(tengah).add(vTmp.set(-0.5 * sk, 0, 0).applyQuaternion(qBuklet));
      b.scale.setScalar(sk);
      const un = b.userData.deform.uniforms;
      un.uGulung.value.set(g.x, g.y, k_.baca < 0.9999 ? sisiBuklet : 0, g.w);
      // Selagi di tutup lembar dalam diselipkan masuk; di luar kotak tumpukannya merenggang
      // dari 0,007 mm per lembar sampai 1,2 mm seluruhnya.
      k_.selip = 1 - p3io(k_.baca / 0.12);
      const lembar = Math.max(1, Math.ceil(b.pageCount / 2) - 1);
      k_.renggang = 1 + (Math.max(1, 1.2 / (0.007 * lembar)) - 1) * bingkaiRenggang(g, sisiBuklet);
      pasangLembar(b);
      un.uDatar.value = settle * settle;
      b.enabled = k_.baca > 0.999 && k_.keadaan === "buklet";
      // Kembali: tunggu halaman tertutup di sampul dan sudah ke tengah, baru terbang.
      if (k_.tutupMenunggu && b.page === 0 && !b.turning && Math.abs(b.userData.geser + 0.5) < 0.01) {
        k_.tutupMenunggu = false;
        pasangTween(k_.bacaT, k_.baca, 0, C.bacaKeluar * k_.baca, linear, performance.now());
        panggil("suara", "kertas");
      }
      matahari.target.position.copy(tengahBaca);
      matahari.position.copy(tengahBaca).add(vTmp.set(-3.5, 1.3, 4.1).multiplyScalar(skBaca));
      const kb = matahari.shadow.camera;
      Object.assign(kb, { left: -1.3 * skBaca, right: 1.3 * skBaca, top: 0.9 * skBaca, bottom: -0.9 * skBaca, near: 0.5 * skBaca, far: 12 * skBaca });
      kb.updateProjectionMatrix();
      b.userData.lantai.material.opacity = 0.15 * p3io((k_.baca - 0.6) / 0.4);
      b.userData.lantai.visible = b.userData.lantai.material.opacity > 0.002;
      // Senter UV: posisi kursor dipetakan ke halaman kanan buklet yang sudah mendarat.
      if (k_.uv) {
        const terlihat = b.enabled && b.visiblePages.includes(k_.uv.indeks);
        if (terlihat !== k_.uvTerlihat) {
          k_.uvTerlihat = terlihat;
          if (!terlihat) k_.senter = false;
          kirim();
        }
        let titik = null;
        let kenaBuklet = false;
        if (terlihat && k_.senter && k_.kursor.ada) {
          ndcSenter.set(k_.kursor.x, -k_.kursor.y);
          raySenter.setFromCamera(ndcSenter, camera);
          b.updateWorldMatrix(true, false);
          m4.copy(b.matrixWorld).invert();
          const o = vTmp.copy(raySenter.ray.origin).applyMatrix4(m4);
          const arah = pos2.copy(raySenter.ray.direction).transformDirection(m4);
          if (Math.abs(arah.z) > 1e-6) {
            const t = -o.z / arah.z;
            const x = o.x + arah.x * t;
            const y = o.y + arah.y * t;
            // Titik senter tetap dikirim walau di luar halaman UV (misalnya di halaman kiri),
            // supaya tinta ikut memudar masuk dari tepi cahaya, bukan muncul tiba-tiba.
            titik = { u: x, v: 0.5 - y };
            // Lampu sorot diarahkan ke titik kursor di bidang buklet, dari arah kamera.
            const kena = pos.set(x, y, 0).applyMatrix4(b.matrixWorld);
            senterLampu.target.position.copy(kena);
            const jarakSorot = 1.5 * sk;
            senterLampu.position.copy(kena).addScaledVector(vTmp.subVectors(camera.position, kena).normalize(), jarakSorot);
            senterLampu.angle = Math.atan((0.75 * sk) / jarakSorot);
            kenaBuklet = Math.abs(x) <= 1.3 && Math.abs(y) <= 0.8;
          }
        }
        k_.sorot = (k_.sorot ?? 0) + ((kenaBuklet ? 1 : 0) - (k_.sorot ?? 0)) * Math.min(1, dt * 8);
        senterLampu.intensity = 3 * k_.sorot;
        k_.uv.setTitik(titik);
        k_.uv.gambar(k_.senter && terlihat, dt);
      }
      const antre = k_.antreHalaman;
      if (antre && b.enabled && !b.turning) {
        const ok = antre.arah > 0 ? b.next() : b.prev();
        if (ok || now > antre.sampai) k_.antreHalaman = null;
      }
      if (b.turning && !k_.membalik) panggil("suara", "halaman");
      k_.membalik = b.turning;
      b.tick(now);
      if (k_.baca > 0.0005 || k_.bayanganLama) renderer.shadowMap.needsUpdate = true;
      k_.bayanganLama = k_.baca > 0.0005;
    }

    renderer.render(scene, camera);
  };

  let tampil = true;
  const jalan = () => renderer.setAnimationLoop(tampil && !document.hidden ? bingkai : null);
  let pernahTampil = false;
  const io = new IntersectionObserver(([en]) => {
    tampil = en.isIntersecting;
    // Intro rak diputar saat bagian rak pertama kali masuk layar, bukan saat dimuat.
    if (tampil && !pernahTampil) {
      pernahTampil = true;
      k_.introMulai = performance.now();
    }
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

  // Buklet LeafThrough yang sama dari tutup sampai dibaca: dibuat begitu kotak terbuka,
  // jadi kertasnya sudah punya serat dan lengkung di tutup dan tidak ada pertukaran benda
  // saat ditarik keluar atau dikembalikan.
  const buatBuklet = (p) => {
    const deform = {
      glsl: GULUNG_GLSL,
      uniforms: { uGulung: { value: new THREE.Vector4() }, uDatar: { value: 0 }, uSelip: { value: 1 } },
    };
    let ilustrasi = null;
    if (p.ilustrasi) {
      ilustrasi = new Image();
      ilustrasi.src = p.ilustrasi;
    }
    k_.uv = p.arsitektur ? buatHalamanUV(p, locale, ilustrasi) : null;
    const b = new LeafThroughObject(
      { renderer, camera, domElement: kanvas },
      {
        pages: halamanBuklet(p, locale, k_.uv),
        pageAspect: 1,
        layout: k_.sempit ? "single" : "spread",
        loop: k_.sempit,
        deform,
        paper: { wrinkles: 0.055, bulge: 0.22, sheetGap: 0.007 / 120 },
        lighting: { sun: { position: [-3.5, 1.3, 4.1] }, shadows: true },
        motion: { reducedMotion: kurangiGerak ? true : "auto" },
      },
    );
    b.enabled = false;
    b.userData.deform = deform;
    b.userData.slug = p.slug;
    // Lantai tak terlihat tepat di belakang halaman, hanya menangkap bayangan buklet.
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0, transparent: true, depthWrite: false }));
    lantai.position.z = -0.24 / 120;
    lantai.receiveShadow = true;
    lantai.visible = false;
    lantai.raycast = () => {};
    b.add(lantai);
    b.userData.lantai = lantai;
    scene.add(b);
    return b;
  };

  const buangBuklet = () => {
    const b = k_.buklet;
    scene.remove(b);
    b.userData.lantai.geometry.dispose();
    b.userData.lantai.material.dispose();
    b.dispose();
    k_.buklet = null;
    k_.uv?.dispose();
    k_.uv = null;
    k_.uvTerlihat = false;
    k_.senter = false;
    renderer.shadowMap.needsUpdate = true;
  };

  // Per lembar: selipkan lembar yang bukan terluar, dan renggangkan celah tumpukan.
  // Celah antarlembar ditulis LeafThrough ke uniform uStackGap tiap bingkai; nilai yang
  // berbeda dari yang terakhir kita tulis adalah nilai dari pustaka, jadi itu dasarnya.
  const pasangLembar = (b) =>
    b.traverse((n) => {
      if (!n.isMesh || n.userData.lembar || !n.material || n === b.userData.lantai) return;
      n.userData.lembar = true;
      const m = n.material;
      const asal = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => {
        asal?.call(m, sh, r);
        n.userData.celah = sh.uniforms.uStackGap;
      };
      const renggang = { dasar: 0, ditulis: NaN };
      n.onBeforeRender = (r, sc, cam) => {
        const celah = n.userData.celah ?? r.properties.get(m).uniforms?.uStackGap;
        if (celah) {
          if (celah.value !== renggang.ditulis) renggang.dasar = celah.value;
          renggang.ditulis = renggang.dasar * (k_.renggang ?? 1);
          celah.value = renggang.ditulis;
        }
        // Lembar terluar: yang menghadap kamera. Dari depan sampul (renderOrder terkecil),
        // dari belakang halaman terakhir (renderOrder terbesar).
        let kecil = Infinity;
        let besar = -Infinity;
        for (const s of n.parent.children) {
          if (!s.isMesh || s === b.userData.lantai) continue;
          kecil = Math.min(kecil, s.renderOrder);
          besar = Math.max(besar, s.renderOrder);
        }
        b.getWorldDirection(vArah);
        const dariDepan = vArah.dot(vTmp.subVectors(cam.position, b.getWorldPosition(vPosB))) > 0;
        const terluar = n.renderOrder === (dariDepan ? kecil : besar);
        b.userData.deform.uniforms.uSelip.value = terluar ? 0 : k_.selip ?? 0;
      };
    });

  // Kapan tumpukan mulai merenggang: begitu kertas keluar dari bawah tutup, selama 140 mm.
  const bingkaiRenggang = (g, sisi) => p3io((g.y - tarikBelok(sisi)) / 1.4);

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
    // Lewati benda yang disembunyikan (raycaster tetap mengenainya).
    const tampak = (o) => {
      for (let x = o; x; x = x.parent) if (!x.visible) return false;
      return true;
    };
    const h = ray.intersectObjects(sasaran, true).find((x) => tampak(x.object)) ?? null;
    // Kotak terbuka: yang menentukan adalah sisi yang diklik, bukan mesh mana yang kena
    // (plastik bening tutup dan dasar menutupi cakram dan buklet). Separuh kiri = tutup
    // berisi buklet, separuh kanan = nampan berisi cakram.
    if (h && ak && k_.keadaan === "buka" && h.object.userData.slug === ak.p.slug) {
      const lokal = ak.grup.worldToLocal(h.point.clone());
      const bagian = lokal.x < -KOTAK.w / 2 + 0.02 ? "buklet" : "cakram";
      return { ...h, object: { userData: { slug: ak.p.slug, bagian } } };
    }
    return h;
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
      kt.dorong.vz -= 0.55 * U;
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
        else if (obj.userData.bagian === "buklet" && k_.keadaan === "buka") jenis = "cakram";
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
    } else if (k_.keadaan === "buka" && s.obj?.userData.bagian === "buklet") {
      api.bukaBuklet();
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
  // Di halaman utuh, roda menggulir halaman; gulir itulah yang memindah rak.
  if (!gulirHalaman) kanvas.addEventListener("wheel", putarRoda, { passive: false });

  const api = {
    on(nama, fn) {
      dengar[nama] = fn;
    },
    fokus(i) {
      if (k_.keadaan === "rak" && !k_.sibuk) keIndeks(i, "kunci");
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
      if (i < 0 || k_.keadaan !== "rak" || terkunci()) return;
      const now = performance.now();
      if (i !== k_.tujuan) keIndeks(i, "klik");
      const kt = kotak[i];
      if (k_.menutup === kt) k_.menutup = null;
      if (kt.balikTujuan) tegakkan(kt, now, 0.6);
      pasangTween(kt.bukaT, kt.buka, 1, C.bukaDetik * (1 - kt.buka), linear, now);
      k_.aktif = slug;
      k_.keadaan = "buka";
      kirim();
    },
    tutup() {
      if (terkunci()) return;
      if (k_.keadaan === "buklet") return api.tutupBuklet();
      if (k_.keadaan === "putar") return api.keluarkan();
      if (k_.keadaan !== "buka") return;
      const kt = kotak.find((x) => x.p.slug === k_.aktif);
      pasangTween(kt.bukaT, kt.buka, 0, Math.max(0.2, C.bukaDetik * 0.85 * kt.buka), linear, performance.now());
      // Kotak tetap aktif sampai tutupnya rapat, supaya tetangga dan buklet kembali halus.
      k_.menutup = kt;
      k_.keadaan = "rak";
      kirim();
    },
    bukaBuklet() {
      if (k_.keadaan !== "buka" || k_.dengar > 0.001) return;
      const p = proyek.find((x) => x.slug === k_.aktif);
      k_.tutupMenunggu = false;
      if (!k_.buklet) k_.buklet = buatBuklet(p);
      pasangTween(k_.bacaT, k_.baca, 1, C.bacaMasuk * (1 - k_.baca), linear, performance.now());
      panggil("suara", "kertas");
      k_.keadaan = "buklet";
      kirim();
    },
    tutupBuklet() {
      if (k_.keadaan !== "buklet") return;
      const b = k_.buklet;
      // Halaman dikembalikan ke sampul dulu, baru buklet terbang masuk ke tutup.
      if (b && b.page > 0 && !kurangiGerak) {
        b.enabled = false;
        b.goTo(0, { animate: true });
        k_.tutupMenunggu = true;
      } else {
        b?.goTo(0);
        pasangTween(k_.bacaT, k_.baca, 0, C.bacaKeluar * k_.baca, linear, performance.now());
        panggil("suara", "kertas");
      }
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
      if (k_.keadaan !== "buka" || k_.baca > 0.001 || terkunci()) return;
      siapkanPemutar();
      const p = proyek.find((x) => x.slug === k_.aktif);
      pemutar.layar.setel(p.musik ? p.ringkas[locale].replace(/\.$/, "") : `${p.judul[locale]}  ${p.katalog}`, performance.now());
      pasangTween(k_.dengarT, k_.dengar, 1, C.dengarMasuk * (1 - k_.dengar), linear, performance.now());
      k_.pernahMain = false;
      k_.keadaan = "putar";
      k_.rem = C.remDetik;
      kirim();
    },
    keluarkan() {
      if (k_.keadaan !== "putar" || terkunci()) return;
      panggil("suara", "keluarkan");
      k_.jalan = false;
      k_.rem = C.remKeluarkan;
      const now = performance.now();
      pasangTween(k_.dengarT, k_.dengar, 0, C.dengarKeluar * k_.dengar, linear, now);
      pasangTween(k_.mundurT, k_.mundur, 0, C.mundurDetik * 0.6 * k_.mundur, linear, now);
      k_.pernahMain = false;
      k_.keadaan = "buka";
      duduk = false;
      kirim();
    },
    setJalan(nyala) {
      if (!duduk) return;
      panggil("suara", "tombol");
      k_.jalan = nyala;
      k_.rem = C.remDetik;
      // Play pertama: pemutar mundur supaya proyeksi di atasnya terlihat. Pause tidak membalik.
      if (nyala && !k_.pernahMain) {
        k_.pernahMain = true;
        pasangTween(k_.mundurT, k_.mundur, 1, C.mundurDetik * (1 - k_.mundur), linear, performance.now());
      }
      kirim();
    },
    // Ganti album dari pemutar atau kotak terbuka, berurutan seperti tangan sungguhan:
    // keluarkan cakram, tutup kotak, geser rak, buka kotak berikut, masukkan cakramnya,
    // lalu putar lagi bila tadi sedang diputar. Klik lagi selama berjalan hanya mengubah tujuan.
    async gantiAlbum(arah) {
      if (k_.sibuk) {
        k_.tujuanGanti = jepit(k_.tujuanGanti + arah, 0, kotak.length - 1);
        return;
      }
      const dariPutar = k_.keadaan === "putar";
      const mainLagi = dariPutar && k_.jalan;
      if (!dariPutar && k_.keadaan !== "buka") return;
      const awal = kotak.findIndex((x) => x.p.slug === k_.aktif);
      k_.tujuanGanti = jepit(awal + arah, 0, kotak.length - 1);
      if (k_.tujuanGanti === awal) return;
      if (dariPutar) panggil("suara", "tombol");
      k_.sibuk = true;
      kirim();
      const langkah = (fn) => {
        urut = true;
        fn();
        urut = false;
      };
      if (dariPutar) {
        langkah(api.keluarkan);
        await tunggu(() => !k_.dengarT.aktif);
      }
      const lama = kotak[awal];
      langkah(api.tutup);
      await tunggu(() => !lama.bukaT.aktif && !k_.menutup);
      keIndeks(k_.tujuanGanti, "klik");
      panggil("indeks", k_.tujuanGanti);
      await tunggu(() => !k_.posT.aktif);
      const kt = kotak[k_.tujuanGanti];
      langkah(() => api.buka(kt.p.slug));
      await tunggu(() => !kt.bukaT.aktif);
      if (dariPutar) {
        langkah(api.dengarkan);
        await tunggu(() => duduk);
        if (mainLagi) api.setJalan(true);
      }
      k_.sibuk = false;
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
    // Panel hologram (elemen HTML) yang jadi ujung sorot, dan apakah sorotnya menyala.
    setSorot(el, nyala) {
      panelHolo = el ?? null;
      sorotNyala = !!nyala && !!el;
    },
    setSenter(nyala) {
      k_.senter = !!nyala && k_.uvTerlihat;
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
      panelHolo = null;
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
