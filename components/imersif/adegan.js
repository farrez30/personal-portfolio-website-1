// Adegan rak CD. Ditulis sendiri; perilakunya mengikuti ide Discography karya
// dmtrbrl (dipelajari dari halaman tayang dan catatan desainnya, bukan kodenya).
// Buklet memakai LeafThroughObject (MIT).
//
// Keadaan: "rak" (memilih), "buka" (kotak terbuka), "buklet" (membaca),
// "putar" (cakram di pemutar, layar proyektor menyala).
import * as THREE from "three";
import { LeafThroughObject } from "leafthrough";
import { HALAMAN } from "@/content/proyek";
import { KOTAK, BUKLET, buatKotak, buatPemutar, buatProyektor } from "./benda";
import { gambarSampul, gambarHalaman, gambarArsitektur } from "./gambar";

// Semua setelan gerak dan tata letak di satu tempat.
const C = {
  jarak: 2.15,
  lengkung: 0.16,
  putarSisi: 0.2,
  condong: -0.12,
  miringKursor: { x: 0.14, y: 0.22 },
  redam: 7,
  pikselPerKotak: 240,
  bukaAngkat: 0.12,
  bukaMaju: 1.6,
  bukaSkala: 1.18,
  tutupSudut: Math.PI,
  tutupSudutSempit: (110 * Math.PI) / 180,
  tetanggaPergi: 5,
  putaranPerDetik: 1.8,
  rem: 1,
};

const LABEL = {
  overview: "Overview",
  challenge: "Challenge",
  decisions: "Key decisions",
  solution: "Solution",
  delivery: "Delivery & role",
  outcome: "Outcome",
  architecture: "Architecture",
};

const dekat = (a, b, k) => a + (b - a) * k;
const halus = (x) => x * x * (3 - 2 * x);
const jepit = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

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
  if (hal.length % 2 === 1) hal.push({ src: gambarHalaman({ label: p.katalog }), alt: p.katalog });
  return hal;
}

// Ruang sederhana untuk pantulan: satu pita cahaya lembut seperti softbox.
function ruangPantul() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x8a8174, side: THREE.BackSide })));
  const pita = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  pita.position.set(0, 6, -4);
  pita.rotation.x = Math.PI / 3;
  const bawah = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: 0xe9e1d3 }));
  bawah.rotation.x = -Math.PI / 2;
  bawah.position.y = -6;
  s.add(pita, bawah);
  return s;
}

export function buatAdegan(wadah, { proyek, locale, kurangiGerak, onUbah }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  wadah.appendChild(renderer.domElement);
  const kanvas = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 60);
  scene.add(new THREE.HemisphereLight(0xfff7ec, 0xb9ad9c, 1.3));
  const kunci = new THREE.DirectionalLight(0xffffff, 1.8);
  kunci.position.set(-3, 5, 6);
  scene.add(kunci);
  const pantul = new THREE.DirectionalLight(0xffe9d2, 0.6);
  pantul.position.set(4, -1, 3);
  scene.add(pantul);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(ruangPantul(), 0.04).texture;

  const kotak = proyek.map((p, i) => {
    const k = buatKotak(p, locale, renderer);
    Object.assign(k, { i, p, balik: 0, balikTujuan: 0, buka: 0, miring: { x: 0, y: 0 } });
    k.grup.position.set(i * C.jarak, -3, 0);
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

  const k_ = {
    pos: 0,
    tujuan: 0,
    keadaan: "rak",
    aktif: null,
    sempit: false,
    perjalanan: 0,
    perjalananTujuan: 0,
    jalan: false,
    laju: 0,
    sudut: 0,
    buklet: null,
    bukletJalan: 0,
    bukletTujuan: 0,
    kursor: { x: 0, y: 0, ada: false },
    hover: false,
  };
  const dengar = {};
  const panggil = (nama, ...a) => dengar[nama]?.(...a);

  const kirim = () =>
    onUbah?.({
      fokus: k_.tujuan,
      keadaan: k_.keadaan,
      aktif: k_.aktif,
      terbalik: kotak[k_.tujuan]?.balikTujuan === 1,
      duduk: k_.keadaan === "putar" && k_.perjalanan > 0.98,
      jalan: k_.jalan,
    });

  const ukur = () => {
    const w = wadah.clientWidth;
    const h = wadah.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    k_.sempit = w <= 650;
    camera.position.set(0, 1.5, 8.4 / Math.min(1, camera.aspect / 1.2));
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  };
  ukur();
  const ro = new ResizeObserver(ukur);
  ro.observe(wadah);

  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  const v4 = new THREE.Vector3();
  const lensa = new THREE.Vector3();
  let lalu = performance.now();
  let duduk = false;
  let seret = null;

  const bingkai = (t) => {
    const dt = Math.min(0.05, (t - lalu) / 1000);
    lalu = t;
    const k = kurangiGerak ? 1 : 1 - Math.exp(-dt * C.redam);
    const kl = kurangiGerak ? 1 : 1 - Math.exp(-dt * 3.2);

    if (!seret?.gerak || seret.balik) k_.pos = dekat(k_.pos, k_.tujuan, k);
    const terbuka = k_.keadaan !== "rak";
    const naikKotak = k_.keadaan === "buklet" || k_.keadaan === "putar";

    for (const kt of kotak) {
      const d = kt.i - k_.pos;
      const aktif = kt.p.slug === k_.aktif;
      const g = kt.grup;
      let x = d * C.jarak;
      let y = 0;
      let z = -C.lengkung * d * d;
      let ry = -d * C.putarSisi;
      let rx = C.condong;
      let s = 1;
      if (terbuka && !aktif) {
        x = Math.sign(d || 1) * (Math.abs(d) * C.jarak + C.tetanggaPergi);
        z -= 1.6;
      }
      if (aktif) {
        x = k_.sempit ? 0.2 : KOTAK.w / 2;
        y = C.bukaAngkat + (naikKotak ? 4.6 : 0);
        z = C.bukaMaju;
        ry = 0;
        rx = -0.3;
        s = k_.sempit ? 0.95 : C.bukaSkala;
      }
      const depan = Math.abs(d) < 0.5 && !terbuka;
      const tx = k_.kursor.ada && (depan || aktif) ? k_.kursor.y * C.miringKursor.x * (aktif ? 0.35 : 1) : 0;
      const ty = k_.kursor.ada && depan ? k_.kursor.x * C.miringKursor.y : 0;
      kt.miring.x = dekat(kt.miring.x, tx, k);
      kt.miring.y = dekat(kt.miring.y, ty, k);
      if (!(seret?.balik && seret.kotak === kt)) kt.balik = dekat(kt.balik, aktif ? 0 : kt.balikTujuan ? kt.balikSasaran ?? Math.PI : Math.round(kt.balik / (2 * Math.PI)) * 2 * Math.PI, k);

      const kk = terbuka ? kl : k;
      g.position.set(dekat(g.position.x, x, kk), dekat(g.position.y, y, kl), dekat(g.position.z, z, kk));
      g.userData.rx = dekat(g.userData.rx ?? rx, rx, kk);
      g.userData.ry = dekat(g.userData.ry ?? ry, ry, kk);
      g.rotation.set(g.userData.rx + kt.miring.x, g.userData.ry + kt.balik + kt.miring.y, 0);
      g.scale.setScalar(dekat(g.scale.x, s, kk));

      kt.buka = dekat(kt.buka, aktif ? 1 : 0, kl);
      const sudut = k_.sempit ? C.tutupSudutSempit : C.tutupSudut;
      kt.engsel.rotation.y = -sudut * halus(jepit((kt.buka - 0.3) / 0.7));
      kt.sampul.visible = !(aktif && k_.buklet);
    }

    // Cakram: dari nampan terangkat, kotak naik keluar, pemutar naik, cakram turun ke poros.
    const kt = kotak.find((x) => x.p.slug === k_.aktif);
    k_.perjalanan = dekat(k_.perjalanan, k_.perjalananTujuan, kurangiGerak ? 1 : 1 - Math.exp(-dt * 2.4));
    if (Math.abs(k_.perjalanan - k_.perjalananTujuan) < 0.002) k_.perjalanan = k_.perjalananTujuan;
    const sudahDuduk = k_.keadaan === "putar" && k_.perjalanan > 0.98;
    if (sudahDuduk !== duduk) {
      duduk = sudahDuduk;
      kirim();
    }
    if (pemutar) {
      const tampil = k_.perjalanan > 0.001;
      const naik = halus(jepit(k_.perjalanan * 1.3));
      const px = k_.sempit ? 0 : -1.15;
      pemutar.grup.visible = tampil;
      pemutar.grup.position.set(px, dekat(-4.4, 0.35, naik), 0.9);
      pemutar.grup.rotation.set(0.12, Math.PI / 4, 0);
      proyektor.grup.visible = tampil && !k_.sempit;
      proyektor.grup.position.set(px + 0.55, dekat(-5, -0.7, naik), 0.5);
      proyektor.grup.rotation.set(0, -0.35, 0);
      proyektor.grup.scale.setScalar(0.55);
      pemutar.lampu.material.color.set(k_.jalan ? 0x8fd694 : 0xe0574b);
      proyektor.lensa.material.color.set(duduk ? 0xfff1d6 : 0x3a3530);
      pemutar.layar.gambar(t, duduk);
      if (tampil) {
        proyektor.lensa.getWorldPosition(lensa).project(camera);
        panggil("lensa", (lensa.x + 1) / 2, (1 - lensa.y) / 2, duduk);
      }
    }
    if (kt) {
      const c = kt.cakram;
      if (k_.perjalanan > 0.001 && pemutar) {
        kt.isi.updateWorldMatrix(true, false);
        const asal = kt.isi.localToWorld(v1.set(0.05, 0, 0.012));
        const atas = v2.copy(asal).add(v4.set(0, 0, 0.7));
        const tujuan = pemutar.grup.localToWorld(v3.set(0, pemutar.puncakY + 0.02, 0));
        const lewat = v4.copy(tujuan).add(new THREE.Vector3(0, 0.6, 0));
        const t1 = halus(jepit(k_.perjalanan / 0.3));
        const t2 = halus(jepit((k_.perjalanan - 0.2) / 0.65));
        const t3 = halus(jepit((k_.perjalanan - 0.85) / 0.15));
        if (c.parent !== scene) scene.attach(c);
        c.position.lerpVectors(asal, atas, t1).lerp(lewat, t2).lerp(tujuan, t3);
        // Dari tegak di nampan menjadi mendatar di atas poros, label menghadap ke atas.
        c.rotation.order = "XYZ";
        const laju = k_.jalan ? C.putaranPerDetik : 0;
        const rem = (C.putaranPerDetik / C.rem) * dt;
        k_.laju = k_.laju < laju ? Math.min(laju, k_.laju + rem * 2) : Math.max(laju, k_.laju - rem);
        if (!kurangiGerak) k_.sudut += k_.laju * Math.PI * 2 * dt;
        c.rotation.set(dekat(Math.PI / 2 - 0.3, 0, t2), -k_.sudut, 0);
      } else if (c.parent !== kt.isi) {
        kt.isi.attach(c);
        c.position.set(0.05, 0, 0.012);
        c.rotation.set(Math.PI / 2, 0, 0);
        k_.laju = 0;
      }
    }

    // Buklet: keluar dari tutup dengan busur, lalu dibaca menghadap kamera.
    if (k_.buklet && kt) {
      k_.bukletJalan = dekat(k_.bukletJalan, k_.bukletTujuan, kurangiGerak ? 1 : 1 - Math.exp(-dt * 2.2));
      const b = k_.buklet;
      const u = halus(k_.bukletJalan);
      const halaman = b.bounds.pages;
      const skalaBaca = k_.sempit ? 2.4 : Math.min(2.4, 4.4 / (halaman.width || 2));
      const skala = dekat(BUKLET * kt.grup.scale.x, skalaBaca, u);
      b.scale.setScalar(skala);
      const asal = kt.sampul.getWorldPosition(v1);
      const tujuan = v2.set(-(halaman.x + halaman.width / 2) * skala, 0.2, 2.2);
      b.position.lerpVectors(asal, tujuan, u);
      b.position.z += Math.sin(u * Math.PI) * 0.9;
      b.rotation.set(dekat(-0.3, 0, u), dekat(-0.6, 0, u), 0);
      b.enabled = k_.bukletJalan > 0.97 && k_.bukletTujuan === 1;
      b.tick(t);
      if (k_.bukletTujuan === 0 && k_.bukletJalan < 0.02) {
        scene.remove(b);
        b.dispose();
        k_.buklet = null;
      }
    }

    renderer.render(scene, camera);
  };

  let tampil = true;
  const jalan = () => renderer.setAnimationLoop(tampil && !document.hidden ? bingkai : null);
  const io = new IntersectionObserver(([e]) => {
    tampil = e.isIntersecting;
    jalan();
  });
  io.observe(wadah);
  const saatTersembunyi = () => {
    if (document.hidden && k_.jalan) {
      k_.jalan = false;
      kirim();
    }
    jalan();
  };
  document.addEventListener("visibilitychange", saatTersembunyi);
  jalan();

  // --- masukan --------------------------------------------------------------
  const ray = new THREE.Raycaster();
  const titik = new THREE.Vector2();
  const kena = (e) => {
    const r = kanvas.getBoundingClientRect();
    titik.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(titik, camera);
    const sasaran = kotak.map((x) => x.grup);
    if (pemutar?.grup.visible) sasaran.push(pemutar.grup);
    const kt = kotak.find((x) => x.p.slug === k_.aktif);
    if (kt && kt.cakram.parent === scene) sasaran.push(kt.cakram);
    return ray.intersectObjects(sasaran, true)[0]?.object ?? null;
  };

  let tahan = 0;
  const turun = (e) => {
    if (k_.buklet) return;
    const obj = kena(e);
    const kt = obj ? kotak.find((x) => x.p.slug === obj.userData.slug) : null;
    const depan = !!kt && kt.i === k_.tujuan && k_.keadaan === "rak";
    seret = { x: e.clientX, pos: k_.pos, waktu: performance.now(), gerak: false, kotak: kt, obj, balik: depan && e.pointerType === "mouse", balikAwal: kt?.balik ?? 0 };
    if (depan && e.pointerType !== "mouse") {
      clearTimeout(tahan);
      tahan = setTimeout(() => {
        if (seret && !seret.gerak) {
          kt.balikTujuan = kt.balikTujuan ? 0 : 1;
          kt.balikSasaran = kt.balik + Math.PI;
          seret.selesai = true;
          kirim();
        }
      }, 450);
    }
  };
  const gerak = (e) => {
    const r = kanvas.getBoundingClientRect();
    k_.kursor.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    k_.kursor.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    k_.kursor.ada = e.pointerType === "mouse";
    if (!seret) {
      if (e.pointerType === "mouse" && e.target === kanvas) {
        const obj = kena(e);
        const bisa =
          !!obj &&
          !k_.buklet &&
          (k_.keadaan === "rak" || obj.userData.bagian === "cakram" || !!obj.userData.tombol);
        if (bisa !== k_.hover) {
          k_.hover = bisa;
          panggil("hover", bisa);
        }
      }
      return;
    }
    const dx = e.clientX - seret.x;
    if (Math.abs(dx) > 6) {
      seret.gerak = true;
      clearTimeout(tahan);
    }
    if (k_.keadaan !== "rak" || !seret.gerak) return;
    if (seret.balik) seret.kotak.balik = seret.balikAwal + jepit(dx / 260, -1, 1) * Math.PI;
    else k_.pos = jepit(seret.pos - dx / C.pikselPerKotak, -0.4, kotak.length - 0.6);
  };
  const naik = (e) => {
    const s = seret;
    seret = null;
    clearTimeout(tahan);
    if (!s || s.selesai) return;
    if (s.balik && s.gerak) {
      const dx = e.clientX - s.x;
      const cepat = Math.abs(dx) / Math.max(1, performance.now() - s.waktu) > 0.9;
      const lewat = Math.abs(s.kotak.balik - s.balikAwal) > Math.PI / 2;
      if (cepat || lewat) s.kotak.balikTujuan = s.kotak.balikTujuan ? 0 : 1;
      // Berbalik searah seretan, bukan memutar jauh lewat sisi lain.
      s.kotak.balikSasaran = s.kotak.balikTujuan ? s.balikAwal + Math.sign(dx || 1) * Math.PI : s.balikAwal;
      if (!s.kotak.balikTujuan) s.kotak.balikSasaran = Math.round(s.balikAwal / Math.PI) * Math.PI;
      kirim();
      return;
    }
    if (s.gerak) {
      if (k_.keadaan !== "rak") return;
      const v = (e.clientX - s.x) / Math.max(1, performance.now() - s.waktu);
      api.fokus(Math.round(k_.pos - v * 0.5));
      return;
    }
    if (k_.keadaan === "rak" && s.kotak) {
      if (s.kotak.i === k_.tujuan) panggil("klikKotak", s.kotak.p.slug);
      else api.fokus(s.kotak.i);
    } else if (k_.keadaan === "buka" && s.obj?.userData.bagian === "cakram") {
      panggil("klikCakram");
    } else if (k_.keadaan === "putar" && s.obj) {
      if (s.obj.userData.tombol) panggil("tombol", s.obj.userData.tombol);
      else if (s.obj.userData.bagian === "cakram" && duduk) panggil("klikCakram");
    }
  };
  let akum = 0;
  let akumT = 0;
  const roda = (e) => {
    if (k_.keadaan !== "rak") return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    e.preventDefault();
    clearTimeout(akumT);
    akum += d;
    if (Math.abs(akum) > 70) {
      api.geser(Math.sign(akum));
      akum = 0;
    }
    akumT = setTimeout(() => (akum = 0), 180);
  };
  const keluar = () => {
    k_.kursor.ada = false;
    if (k_.hover) {
      k_.hover = false;
      panggil("hover", false);
    }
  };
  kanvas.addEventListener("pointerdown", turun);
  window.addEventListener("pointermove", gerak);
  window.addEventListener("pointerup", naik);
  kanvas.addEventListener("pointerleave", keluar);
  kanvas.addEventListener("wheel", roda, { passive: false });

  const api = {
    on(nama, fn) {
      dengar[nama] = fn;
    },
    fokus(i) {
      const baru = jepit(Math.round(i), 0, kotak.length - 1);
      if (baru !== k_.tujuan) kotak.forEach((x) => (x.balikTujuan = 0));
      k_.tujuan = baru;
      kirim();
    },
    geser(arah) {
      if (k_.keadaan === "rak") api.fokus(k_.tujuan + arah);
    },
    buka(slug) {
      const i = proyek.findIndex((p) => p.slug === slug);
      if (i < 0) return;
      k_.tujuan = i;
      k_.aktif = slug;
      k_.keadaan = "buka";
      kirim();
    },
    tutup() {
      if (k_.keadaan === "buklet") return api.tutupBuklet();
      if (k_.keadaan === "putar") return api.keluarkan();
      k_.aktif = null;
      k_.keadaan = "rak";
      kirim();
    },
    bukaBuklet() {
      if (k_.keadaan !== "buka") return;
      const p = proyek.find((x) => x.slug === k_.aktif);
      const b = new LeafThroughObject(
        { renderer, camera, domElement: kanvas },
        {
          pages: halamanBuklet(p, locale),
          pageAspect: 1,
          layout: k_.sempit ? "single" : "spread",
          loop: k_.sempit,
          motion: { reducedMotion: kurangiGerak ? true : "auto" },
        },
      );
      scene.add(b);
      k_.buklet = b;
      k_.bukletJalan = 0;
      k_.bukletTujuan = 1;
      k_.keadaan = "buklet";
      kirim();
    },
    tutupBuklet() {
      if (!k_.buklet) return;
      k_.bukletTujuan = 0;
      k_.keadaan = "buka";
      kirim();
    },
    halaman(arah) {
      if (!k_.buklet) return;
      if (arah > 0) k_.buklet.next();
      else k_.buklet.previous();
    },
    dengarkan() {
      if (k_.keadaan !== "buka") return;
      siapkanPemutar();
      const p = proyek.find((x) => x.slug === k_.aktif);
      pemutar.layar.setel(`${p.judul[locale]}  ${p.katalog}`, performance.now());
      k_.perjalananTujuan = 1;
      k_.keadaan = "putar";
      kirim();
    },
    keluarkan() {
      if (k_.keadaan !== "putar") return;
      k_.jalan = false;
      k_.perjalananTujuan = 0;
      k_.keadaan = "buka";
      kirim();
    },
    setJalan(nyala) {
      if (!duduk) return;
      k_.jalan = nyala;
      kirim();
    },
    balik() {
      const kt = kotak[k_.tujuan];
      if (k_.keadaan !== "rak" || !kt) return;
      kt.balikTujuan = kt.balikTujuan ? 0 : 1;
      kt.balikSasaran = kt.balik + Math.PI;
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
      clearTimeout(akumT);
      document.removeEventListener("visibilitychange", saatTersembunyi);
      kanvas.removeEventListener("pointerdown", turun);
      window.removeEventListener("pointermove", gerak);
      window.removeEventListener("pointerup", naik);
      kanvas.removeEventListener("pointerleave", keluar);
      kanvas.removeEventListener("wheel", roda);
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
      pmrem.dispose();
      renderer.dispose();
      kanvas.remove();
    },
  };
  return api;
}
