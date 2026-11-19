import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { pemicuSekali } from "./naskah";

// Props tur cerita gulir (cerita v4): satu benda per babak di toko kaset, dipilih dari istilah
// toko musik yang membawa pesan babaknya (desain/cerita-v4/usulan-revisi-1.md bagian 3).
// Layar produk tampil sebagai tekstur di permukaan benda, bukan ditempel ke foto. Bahan
// mengikuti lembar look-dev toko (docs/look-dev.md): kayu PBR CC0, tepi dibulatkan, bayangan
// dari satu lampu kunci yang pindah ke babak aktif (dunia.js). `perbarui(id, u)` menggerakkan
// momen tiap babak dari progres gulir di dalam babak itu (0..1).

const LAYAR = "/assets/dunia/layar/";
const BAHAN = "/assets/dunia/bahan/";
const halus = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// UV kotak diproyeksikan dari posisi per meter, supaya serat kayu tidak melar di kotak besar.
function uvDunia(geo, perMeter = 1) {
  const p = geo.attributes.position;
  const n = geo.attributes.normal;
  const uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i));
    const ay = Math.abs(n.getY(i));
    const az = Math.abs(n.getZ(i));
    const [a, b] = ax >= ay && ax >= az ? [p.getZ(i), p.getY(i)] : ay >= az ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
    uv.setXY(i, a * perMeter, b * perMeter);
  }
  uv.needsUpdate = true;
  return geo;
}

// Dibuat sesudah dunia siap (muatCerita di dunia.js), supaya loader tidak menunggu aset cerita.
// Lampu yang dipakai props (`lampuMeja`, `lampuDarurat`) sudah ada di adegan sejak awal: lampu
// baru di tengah jalan memaksa semua shader dikompilasi ulang.
export function buatPropsCerita({ bahan, tekstur: muatTekstur, tambahBayang, lampuMeja, lampuDarurat }) {
  const tunggu = [];
  const tekstur = (...a) => {
    const p = muatTekstur(...a);
    tunggu.push(p);
    return p;
  };
  const grup = new THREE.Group();
  const momen = {};
  const sorot = {};
  const tungguModel = []; // [nama, fn(scene)] dipasang di pasangModel()

  // ---- Bahan PBR: kayu meja, triplek, pelat logam (Poly Haven CC0, 512 px) ------------------
  const pbr = (nama, warna, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: warna, roughness: 1, metalness: o.logam ?? 0 });
    const ulang = o.ulang ?? 1;
    tekstur(`${BAHAN}${nama}-warna.webp`, [ulang, ulang]).then((t) => ((m.map = t), (m.needsUpdate = true)));
    tekstur(`${BAHAN}${nama}-normal.webp`, [ulang, ulang]).then((t) => {
      t.colorSpace = THREE.NoColorSpace;
      m.normalMap = t;
      m.normalScale.setScalar(o.normal ?? 0.8);
      m.needsUpdate = true;
    });
    tekstur(`${BAHAN}${nama}-kasar.webp`, [ulang, ulang]).then((t) => {
      t.colorSpace = THREE.NoColorSpace;
      m.roughnessMap = t;
      m.needsUpdate = true;
    });
    return m;
  };
  const b = {
    kayu: pbr("wood_table_001", 0xc49a74, { ulang: 1.6 }),
    kayuTua: pbr("wood_table_001", 0x7a5236, { ulang: 1.6 }),
    triplek: pbr("plywood", 0xd8c3a2, { ulang: 0.9, normal: 0.5 }),
    pelat: pbr("metal_plate", 0x3a3836, { logam: 0.6, ulang: 2 }),
    gelap: bahan.gelapMatte,
    logam: bahan.logam,
    kuningan: bahan.kuningan,
    kertas: new THREE.MeshStandardMaterial({ color: 0xeee6d6, roughness: 0.95 }),
    karet: new THREE.MeshStandardMaterial({ color: 0x15120f, roughness: 0.65 }),
    keramik: new THREE.MeshStandardMaterial({ color: 0xd9cdb5, roughness: 0.55 }),
  };

  const layar = (w, h, nama, terang = 0.9) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(terang), toneMapped: false });
    tekstur(LAYAR + nama, [1, 1]).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      m.map = t;
      m.needsUpdate = true;
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  };
  const layarKanvas = (w, h, peta, terang = 0.95) =>
    new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: peta, color: new THREE.Color().setScalar(terang), toneMapped: false }));
  const kertasBertekstur = (w, h, nama) => {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    tekstur(LAYAR + nama, [1, 1]).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      m.map = t;
      m.needsUpdate = true;
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  };
  // Kotak bertepi bulat; kayu, triplek, dan pelat memakai UV per meter.
  const kotak = (w, h, d, m, x, y, z, induk = grup, r = 0.004) => {
    const geo = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2));
    if (m === b.kayu || m === b.kayuTua || m === b.triplek || m === b.pelat) uvDunia(geo, 1.2);
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    induk.add(o);
    return o;
  };
  const tabung = (r, h, m, x, y, z, induk = grup, seg = 24) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    o.position.set(x, y, z);
    induk.add(o);
    return o;
  };
  const meja = (w, d, tinggi, m, mAtas = m, induk = grup) => {
    const g = new THREE.Group();
    kotak(w, 0.04, d, mAtas, 0, tinggi - 0.02, 0, g, 0.008);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) kotak(0.045, tinggi - 0.04, 0.045, m, (sx * (w - 0.1)) / 2, (tinggi - 0.04) / 2, (sz * (d - 0.1)) / 2, g, 0.006);
    kotak(w - 0.12, 0.08, 0.02, m, 0, tinggi - 0.08, (d - 0.1) / 2, g);
    induk.add(g);
    return g;
  };
  // Mug keramik krem berisi kopi (pilihan Farrez 19 Nov; dulu silinder polos yang terbaca
  // trapesium kosong): 11 oz, 82 x 95 mm, dinding 4 mm, bibir membulat, gagang C, cincin krema.
  const glasir = new THREE.MeshStandardMaterial({ color: 0xe9e0cf, roughness: 0.28 });
  const kopi = new THREE.MeshStandardMaterial({ color: 0x1a0d07, roughness: 0.08 });
  const krema = new THREE.MeshStandardMaterial({ color: 0x6e4325, roughness: 0.5 });
  const R_MUG = 0.041;
  const geoMug = new THREE.LatheGeometry(
    [
      [0, 0],
      [R_MUG - 0.006, 0],
      [R_MUG - 0.001, 0.003],
      [R_MUG, 0.012],
      [R_MUG, 0.09],
      [R_MUG - 0.001, 0.0945],
      [R_MUG - 0.004, 0.0945],
      [R_MUG - 0.0045, 0.09],
      [R_MUG - 0.0045, 0.01],
      [0, 0.008],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    40,
  );
  const geoGagang = new THREE.TorusGeometry(0.024, 0.0055, 12, 24, Math.PI * 1.15);
  const gelasKopi = (x, y, z, induk) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = 0.6;
    g.add(new THREE.Mesh(geoMug, glasir));
    const gagang = new THREE.Mesh(geoGagang, glasir);
    gagang.rotation.z = -Math.PI * 0.575;
    gagang.position.set(R_MUG + 0.012, 0.05, 0);
    gagang.scale.set(0.8, 1, 1);
    g.add(gagang);
    const permukaan = new THREE.Mesh(new THREE.CircleGeometry(R_MUG - 0.0045, 32), kopi);
    permukaan.rotation.x = -Math.PI / 2;
    permukaan.position.y = 0.08;
    const cincin = new THREE.Mesh(new THREE.RingGeometry(R_MUG - 0.011, R_MUG - 0.0045, 32), krema);
    cincin.rotation.x = -Math.PI / 2;
    cincin.position.y = 0.0802;
    g.add(permukaan, cincin);
    induk.add(g);
    return g;
  };

  // ---- 01 ide: papan titipan pelanggan, laptop dengan rapat Meet -----------------------------
  {
    // Papan triplek berbingkai di belakang kartu catatan (kartu dibuat dunia.js).
    kotak(3.3, 1.95, 0.025, b.triplek, 1.65, 1.55, -3.985, grup, 0.006);
    for (const [w, h, x, y] of [
      [3.4, 0.05, 1.65, 2.55],
      [3.4, 0.05, 1.65, 0.55],
      [0.05, 2.05, -0.05, 1.55],
      [0.05, 2.05, 3.35, 1.55],
    ])
      kotak(w, h, 0.05, b.kayuTua, x, y, -3.965);
    const g = meja(0.6, 0.45, 0.66, b.kayuTua, b.kayu);
    g.position.set(2.7, 0, -3.48);
    g.rotation.y = -0.3;
    tungguModel.push([
      "classic_laptop",
      (m) => {
        // Layar laptop CC0 diganti tangkapan rapat Meet; badannya tetap bahan aslinya.
        const meet = layar(1, 1, "01-meet.webp", 0.95).material;
        m.traverse((o) => {
          if (o.isMesh && o.material?.name === "classic_laptop_screen") o.material = meet;
        });
        m.scale.setScalar(0.62);
        m.position.set(0.02, 0.66, 0.02);
        m.rotation.y = 0.1;
        g.add(m);
      },
    ]);
    gelasKopi(-0.2, 0.66, 0.12, g);
    const pena = kotak(0.14, 0.009, 0.009, b.gelap, 0.2, 0.665, 0.15, g, 0.003);
    pena.rotation.y = 0.6;
    tambahBayang(2.7, -3.48, 0.45);
  }

  // ---- 02 rencana: meja tulis, papan jepit dengan daftar kebutuhan, stempel setuju ---------
  {
    const g = meja(1.1, 0.58, 0.74, b.kayuTua, b.kayu);
    g.position.set(-4.5, 0, -1.4);
    g.rotation.y = Math.PI / 2;
    const jepit = new THREE.Group();
    jepit.position.set(0.02, 0.742, 0.03);
    jepit.rotation.y = 0.1;
    g.add(jepit);
    tungguModel.push([
      "clipboard",
      (m) => {
        m.scale.setScalar(1.15);
        jepit.add(m);
        // Kertas kebutuhan di atas papan jepit CC0 (kertas bawaannya tertutup).
        const k = kertasBertekstur(0.215, 0.3, "02-kebutuhan.webp");
        k.rotation.x = -Math.PI / 2;
        k.position.set(0, 0.03, -0.01);
        jepit.add(k);
      },
    ]);
    for (let i = 0; i < 3; i++) {
      const lembar = kotak(0.21, 0.002, 0.297, b.kertas, -0.34, 0.743 + i * 0.002, -0.02, g, 0.0008);
      lembar.rotation.y = 0.2 - i * 0.08;
    }
    // Bekas cap di kertas: tinta belang dengan tepi lebih gelap, bukan cincin sempurna. Diterangi
    // seperti kertasnya (MeshStandard), sedikit di atas permukaan supaya tidak berkedip.
    const cap = new THREE.Mesh(
      new THREE.PlaneGeometry(0.058, 0.058),
      new THREE.MeshStandardMaterial({ map: teksturCap(), transparent: true, opacity: 0, roughness: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    cap.rotation.set(-Math.PI / 2, 0, 0.07);
    cap.position.set(0.06, 0.7765, 0.13);
    g.add(cap);
    const stempel = new THREE.Group();
    tabung(0.028, 0.025, b.karet, 0, 0.0125, 0, stempel);
    tabung(0.012, 0.06, b.kayu, 0, 0.055, 0, stempel);
    const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), b.kayu);
    kepala.position.y = 0.09;
    stempel.add(kepala);
    stempel.position.set(0.32, 0.74, -0.14);
    g.add(stempel);
    // Bantalan tinta: kotak logam rendah, permukaan bantalan merah gelap.
    tabung(0.04, 0.012, new THREE.MeshStandardMaterial({ color: 0x8c2a22, roughness: 0.8 }), 0.34, 0.746, 0.05, g);
    gelasKopi(-0.42, 0.74, 0.18, g);
    // Gerak stempel sungguhan (riset 19 Nov 2026): tepuk bantalan dua kali, bawa melengkung ke
    // atas kertas, turun lurus dan melambat, karet tertekan sekitar 1 mm dan ditahan diam, lalu
    // diangkat lurus dan diletakkan kembali. Tidak digoyang: goyangan membuat cap ganda.
    const DIAM = [0.32, 0.74, -0.14];
    const PAD = [0.34, 0.752, 0.05];
    const KERTAS = [0.06, 0.7765, 0.13];
    const lerp3 = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
    const fase = (u, a, b) => Math.min(1, Math.max(0, (u - a) / (b - a)));
    const lengkung = (a, b, t, naik) => {
      const p = lerp3(a, b, halus(t));
      p[1] += naik * Math.sin(Math.PI * t);
      return p;
    };
    // Pose stempel sepanjang satu kali mengecap, t 0..1 (dulu dipetakan ke gulir 0,3..0,7).
    const poseStempel = (t) => {
      const u = 0.3 + 0.4 * Math.min(1, Math.max(0, t));
      let p = DIAM;
      let tekan = 0;
      if (u < 0.3) p = DIAM;
      else if (u < 0.35) p = lengkung(DIAM, [PAD[0], PAD[1] + 0.03, PAD[2]], fase(u, 0.3, 0.35), 0.05);
      else if (u < 0.41) {
        // Dua tepukan pendek ke bantalan.
        const t = fase(u, 0.35, 0.41) * 2;
        p = [PAD[0], PAD[1] + 0.03 * (1 - Math.sin(Math.PI * (t % 1))), PAD[2]];
      } else if (u < 0.47) p = lengkung([PAD[0], PAD[1] + 0.03, PAD[2]], [KERTAS[0], KERTAS[1] + 0.05, KERTAS[2]], fase(u, 0.41, 0.47), 0.06);
      else if (u < 0.5) {
        // Turun lurus, melambat sampai menyentuh.
        const t = fase(u, 0.47, 0.5);
        p = [KERTAS[0], KERTAS[1] + 0.05 * (1 - t) * (1 - t), KERTAS[2]];
      } else if (u < 0.57) {
        p = KERTAS;
        tekan = Math.min(1, fase(u, 0.5, 0.51) * 1);
      } else if (u < 0.62) {
        const t = fase(u, 0.57, 0.62);
        p = [KERTAS[0], KERTAS[1] + 0.06 * t * t, KERTAS[2]];
      } else if (u < 0.7) p = lengkung([KERTAS[0], KERTAS[1] + 0.06, KERTAS[2]], DIAM, fase(u, 0.62, 0.7), 0.03);
      stempel.position.set(p[0], p[1] - 0.001 * tekan, p[2]);
      stempel.scale.y = 1 - 0.012 * tekan;
      cap.material.opacity = u >= 0.505 ? 1 : 0;
    };
    // Mengecap itu kejadian sekali, bukan gerak yang bisa digulung balik (masukan Farrez 19 Nov:
    // glitch saat gulir mundur). Dulu pose dipetakan langsung ke gulir: mundur menghapus cap
    // saat stempel menempel lagi, dan langkah gulir HP yang besar melompati fase. Sekarang gulir
    // hanya memicu: lewat 0,3 stempel dimainkan menurut waktu, capnya tetap; disetel ulang saat
    // kamera masuk lagi dari babak ide (pemicuSekali di naskah.js).
    const cap0 = pemicuSekali({ ambang: 0.3, ulang: 0.12, akhir: 0.75, durasi: 2.2 });
    momen.rencana = (u, s = {}) => poseStempel(cap0.langkah(u, s.waktu ?? 0, s.diam, s.terbang));
    momen.rencana.sibuk = cap0.sibuk;
    tambahBayang(-4.5, -1.4, 0.7);
  }

  // ---- 03 bentuk: benda sesuai kalimat bab (storyboard disetujui Farrez 19 Nov 2026) ---------
  // Ponsel dengan dashboard, laptop dengan sistem kantor, brosur promo lalu ponsel berisi chat
  // WhatsApp, dan kotak aplikasi tersegel yang baru naik sedikit paling akhir ("hanya kalau
  // memang perlu"). Dulu satu album dalam empat format: bendanya tidak bisa ditebak.
  // Tiap benda naik 12 cm, menghadap kamera, dan disorot lampu kunci dari atas depan.
  {
    const g = new THREE.Group();
    g.position.set(-4.4, 0, 0.3);
    g.rotation.y = Math.PI / 2 - 0.2;
    // Rak pajang bertingkat dua. Tingkat atas 14 cm (dulu 22): laptop 14 inci yang terbuka butuh
    // kedalaman bebas 30 cm di depannya, tutupnya dulu menembus balok.
    kotak(1.2, 0.86, 0.44, b.kayu, 0, 0.43, 0, g, 0.01);
    kotak(1.2, 0.3, 0.14, b.kayu, 0, 1.01, -0.15, g, 0.01);
    const ATAS = 0.86;
    const benda = [];
    // Tingkat bawah bebas dari z -0,08 sampai 0,22: di belakangnya balok tingkat atas. Benda yang
    // melewatinya menembus kayu (terlihat di lembar kontak 19 Nov).
    const pasangBenda = (o, x, z, angkat = 0.12, alas = ATAS) => {
      o.position.set(x, alas, z);
      g.add(o);
      o.updateMatrixWorld(true);
      // Titik tengah benda: sasaran lampu kunci saat benda terangkat (dunia.js, sorotKunci).
      const titik = new THREE.Object3D();
      titik.position.copy(o.worldToLocal(new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())));
      o.add(titik);
      benda.push({ o, titik, angkat, dasar: { y: alas, z, ry: o.rotation.y } });
      return o;
    };
    // Benda nyata berukuran sebenarnya (riset audit ulang 19 Nov 2026, pratinjau disetujui Farrez
    // dengan ubahan pada brosur dan kotak software). Dulu kotak polos dengan gambar layar.
    const aluminium = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.85 });
    const rangka = new THREE.MeshStandardMaterial({ color: 0x2c3442, roughness: 0.3, metalness: 0.7 });
    const kacaHitam = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.08 });
    // Ponsel kelas menengah: 77 x 161 x 8,2 mm, sudut membulat, lubang kamera, tiga cincin kamera.
    const ponsel = (peta) => {
      const o = new THREE.Group();
      o.add(new THREE.Mesh(persegiBulat(0.0774, 0.1611, 0.0095, 0.0082), [kacaHitam, rangka]));
      const l = layarKanvas(0.0718, 0.1555, peta, 0.92);
      l.position.z = 0.0042;
      o.add(l);
      const lubang = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      lubang.position.set(0, 0.0735, 0.00425);
      o.add(lubang);
      for (let i = 0; i < 3; i++) tabung(0.0062, 0.0014, rangka, 0.024, 0.062 - i * 0.0155, -0.0048, o, 24).rotation.x = Math.PI / 2;
      return o;
    };
    // Dudukan ponsel lipat aluminium (120 x 76 mm, pelat 2 mm): alas, lengan, sandaran yang
    // bersandar ke belakang, bibir karet, dua engsel. Ponsel bersandar di atasnya.
    const ponselBerdiri = (peta) => {
      const o = new THREE.Group();
      const pelat = (w, h) => new THREE.Mesh(persegiBulat(w, h, 0.006, 0.0022, 0.0004), aluminium);
      const alas = pelat(0.072, 0.085);
      alas.rotation.x = -Math.PI / 2;
      alas.position.y = 0.0011;
      const lengan = pelat(0.06, 0.07);
      lengan.position.set(0, 0.034, -0.03);
      lengan.rotation.x = 0.25;
      const sandaran = pelat(0.062, 0.075);
      sandaran.position.set(0, 0.085, -0.028);
      sandaran.rotation.x = -0.32;
      o.add(alas, lengan, sandaran);
      kotak(0.06, 0.009, 0.006, b.karet, 0, 0.052, -0.008, o, 0.002);
      for (const [y, z] of [
        [0.004, -0.04],
        [0.066, -0.022],
      ])
        tabung(0.0035, 0.058, aluminium, 0, y, z, o, 14).rotation.z = Math.PI / 2;
      const hp = ponsel(peta);
      hp.rotation.x = -0.32;
      hp.position.set(0, 0.133, -0.016);
      o.add(hp);
      return o;
    };
    // 1. Ponsel di dudukan, layar dashboard stok.
    pasangBenda(ponselBerdiri(teksturDashboard()), -0.42, 0.1);
    // 2. Laptop 14 inci (325 x 214 x 18 mm): alas 12 mm dengan dek tuts dan touchpad, engsel,
    // tutup 5 mm terbuka sekitar 100 derajat, bezel tipis.
    {
      const o = new THREE.Group();
      const abu = new THREE.MeshStandardMaterial({ color: 0x5b6068, roughness: 0.38, metalness: 0.75 });
      const W = 0.325;
      const D = 0.214;
      const alas = new THREE.Mesh(persegiBulat(W, D, 0.008, 0.012, 0.0012), abu);
      alas.rotation.x = -Math.PI / 2;
      alas.position.y = 0.006;
      o.add(alas);
      const dek = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.016, D - 0.012), new THREE.MeshStandardMaterial({ map: teksturDekLaptop(), roughness: 0.55, metalness: 0.5 }));
      dek.rotation.x = -Math.PI / 2;
      dek.position.set(0, 0.0121, 0.004);
      o.add(dek);
      tabung(0.005, W - 0.05, new THREE.MeshStandardMaterial({ color: 0x3a3e44, roughness: 0.4, metalness: 0.7 }), 0, 0.012, -D / 2 + 0.004, o, 16).rotation.z = Math.PI / 2;
      const tutup = new THREE.Group();
      tutup.position.set(0, 0.012, -D / 2 + 0.004);
      tutup.rotation.x = -0.2;
      const cangkang = new THREE.Mesh(persegiBulat(W, D, 0.008, 0.005, 0.0008), [new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.2 }), abu]);
      cangkang.position.y = D / 2;
      tutup.add(cangkang);
      const l = layar(W - 0.012, D - 0.022, "03-format-piringan.webp", 0.9);
      l.position.set(0, D / 2 + 0.002, 0.0026);
      tutup.add(l);
      o.add(tutup);
      o.rotation.y = 0.08;
      pasangBenda(o, -0.1, 0.11);
    }
    // 3. Brosur promo, lalu ponsel dengan chat WhatsApp: satu alur, dua benda. Brosurnya tumpukan
    // leaflet lipat tiga ukuran DL (99 x 210 mm) di kantong akrilik, tebal tumpukannya terlihat
    // di atas, seperti rak brosur di meja kasir (masukan Farrez: dulu belum terbaca brosur).
    {
      const o = new THREE.Group();
      const akrilik = new THREE.MeshStandardMaterial({ color: 0xf2f6f8, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false });
      const tepiAkrilik = new THREE.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.5, toneMapped: false });
      const sandar = new THREE.Group();
      sandar.position.set(0, 0.003, -0.012);
      sandar.rotation.x = -0.22;
      for (let i = 0; i < 9; i++) {
        // Lembar di belakang sedikit lebih tinggi dan tergeser, supaya tepinya bertumpuk.
        const lembar = kotak(0.099, 0.21, 0.0009, b.kertas, 0.0006 * (i % 3), 0.107 + i * 0.0007, -0.001 * i, sandar, 0.0003);
        lembar.rotation.z = 0.004 * (((i * 7) % 5) - 2);
      }
      const sampul = new THREE.Mesh(new THREE.PlaneGeometry(0.099, 0.21), new THREE.MeshStandardMaterial({ map: teksturBrosur(), roughness: 0.6 }));
      sampul.position.set(0, 0.107, 0.0006);
      sandar.add(sampul);
      const kantong = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.0018), akrilik);
      kantong.position.set(0, 0.035, 0.006);
      kantong.renderOrder = 4;
      const punggung = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.17, 0.0018), akrilik);
      punggung.position.set(0, 0.085, -0.012);
      punggung.renderOrder = 4;
      sandar.add(kantong, punggung);
      for (const [w, h, x, y, z] of [
        [0.11, 0.002, 0, 0.07, 0.006],
        [0.002, 0.07, -0.055, 0.035, 0.006],
        [0.002, 0.07, 0.055, 0.035, 0.006],
        [0.11, 0.002, 0, 0.17, -0.012],
      ]) {
        const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.002), tepiAkrilik);
        e.position.set(x, y, z);
        sandar.add(e);
      }
      o.add(sandar);
      const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.002, 0.055), akrilik);
      kaki.position.set(0, 0.001, -0.004);
      o.add(kaki);
      pasangBenda(o, 0.18, 0.08);
      const hp = ponselBerdiri(teksturChat());
      hp.rotation.y = -0.15;
      pasangBenda(hp, 0.33, 0.1);
    }
    // 4. Kotak software tersegel di tingkat atas (big box 178 x 229 x 51 mm), diputar supaya
    // punggung bertulisan dan tebalnya terlihat: kedalaman itu yang membuatnya terbaca kotak
    // software, bukan tablet. Hanya naik sedikit, paling akhir.
    {
      const o = new THREE.Group();
      const [sampul, punggung] = teksturKotakAplikasi();
      const muka = new THREE.MeshStandardMaterial({ map: sampul, roughness: 0.4 });
      const sisi = new THREE.MeshStandardMaterial({ map: punggung, roughness: 0.45 });
      const putih = new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.6 });
      const atas = new THREE.MeshStandardMaterial({ color: 0x1f3550, roughness: 0.5 });
      // Muka +z sampul, +x punggung (menghadap kanan rak, terlihat dari kamera di depan kiri).
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.178, 0.229, 0.051), [sisi, putih, atas, atas, muka, putih]);
      k.position.y = 0.1145;
      o.add(k);
      // Plastik segel: kilau tipis di atas seluruh kotak.
      const segel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.231, 0.053), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.07, depthWrite: false }));
      segel.position.y = 0.1145;
      segel.renderOrder = 4;
      o.add(segel);
      o.rotation.y = -0.5;
      pasangBenda(o, 0.42, -0.15, 0.05, 1.16);
    }
    // Tiap benda naik, bertahan, lalu turun saat benda berikut naik. Brosur dan ponsel chat naik
    // berurutan dan turun bersama (satu alur). Kotak aplikasi tetap terangkat sampai akhir.
    const JADWAL = [
      [0.1, 0.3],
      [0.3, 0.5],
      [0.5, 0.72],
      [0.56, 0.72],
      [0.74, 9],
    ];
    momen.bentuk = (u) => {
      benda.forEach((x, i) => {
        const [a, z] = JADWAL[i];
        const t = halus((u - a) / 0.07) * (1 - halus((u - z) / 0.07));
        // Naik, maju 5 cm ke arah kamera seperti diambil untuk dilihat, dan sedikit memutar
        // menghadap kamera di sisi kanan rak. Maju lebih dulu menjauhkan tepi belakang dari
        // balok tingkat atas sebelum benda berputar.
        x.o.position.y = x.dasar.y + x.angkat * t;
        x.o.position.z = x.dasar.z + 0.05 * t;
        x.o.rotation.y = x.dasar.ry + 0.16 * t;
        x.t = t;
      });
    };
    // Sasaran sorot: rata-rata titik benda yang terangkat, berbobot tingginya, supaya sorot pindah
    // halus dari brosur ke ponsel chat yang naik berurutan (bukan melompat).
    const titikSorot = new THREE.Vector3();
    const v = new THREE.Vector3();
    sorot.bentuk = () => {
      let w = 0;
      let kuat = 0;
      titikSorot.set(0, 0, 0);
      for (const x of benda) {
        if (!(x.t > 0.001)) continue;
        titikSorot.addScaledVector(x.titik.getWorldPosition(v), x.t);
        w += x.t;
        kuat = Math.max(kuat, x.t);
      }
      return w ? { p: titikSorot.divideScalar(w), kuat, benda: benda.filter((x) => x.t > 0.001).map((x) => x.o) } : null;
    };
    momen.bentuk(0);
    grup.add(g);
    tambahBayang(-4.4, 0.3, 0.7);
  }

  // ---- 04 fondasi: belakang rak sound, kabel kusut yang dirapikan, panel MCB berlabel --------
  // Pilihan Farrez 19 Nov 2026 (gabungan panel MCB dan belakang amplifier): kabel semrawut yang
  // seiring gulir menjadi rapi, diikat, lalu menyatu jadi satu jalur ke panel listrik berlabel
  // dengan daftar sirkuit di tutupnya. Dulu rak logam kosong, terbaca seperti rak server.
  {
    const g = new THREE.Group();
    g.position.set(-4.05, 0, 1.95);
    g.rotation.y = -Math.PI / 2;
    kotak(0.66, 0.04, 0.48, b.kayu, 0, 0.92, 0, g, 0.008);
    for (const sx of [-0.31, 0.31]) kotak(0.04, 0.92, 0.48, b.kayu, sx, 0.46, 0, g, 0.008);
    kotak(0.62, 0.03, 0.46, b.kayu, 0, 0.015, 0, g);
    // Tiga alat dilihat dari belakang: amplifier, CD player, stopkontak bersaklar. Panel belakang
    // bertekstur (terminal speaker merah hitam, RCA, soket listrik), lampu status menyala satu
    // per satu seperti dulu.
    const led = [];
    [
      [0.6, "amplifier"],
      [0.32, "cd"],
      [0.06, "listrik"],
    ].forEach(([y, jenis]) => {
      kotak(0.56, 0.2, 0.4, b.pelat, 0, y + 0.1, 0.01, g, 0.006);
      const muka = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.18), new THREE.MeshStandardMaterial({ map: teksturBelakangAlat(jenis), roughness: 0.6, metalness: 0.3 }));
      muka.position.set(0, y + 0.1, -0.1915);
      muka.rotation.y = Math.PI;
      g.add(muka);
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), new THREE.MeshBasicMaterial({ color: 0x2a221c, toneMapped: false }));
      l.position.set(0.22, y + 0.16, -0.193);
      g.add(l);
      led.push(l);
    });
    // Diagram kabel ditempel lakban di sisi rak.
    const diagram = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.21), new THREE.MeshStandardMaterial({ map: teksturCatatanTangan("DIAGRAM KABEL", ["Amp ke speaker kiri", "Amp ke speaker kanan", "CD ke input CD", "Semua listrik ke MCB 7", "Diperbarui 12/11"]), roughness: 0.85 }));
    diagram.position.set(0.335, 0.62, -0.08);
    diagram.rotation.y = Math.PI / 2;
    g.add(diagram);
    kotak(0.004, 0.016, 0.06, new THREE.MeshStandardMaterial({ color: 0xd9cfae, roughness: 0.6 }), 0.336, 0.725, -0.08, g, 0.001);
    // Buku manual di atas rak.
    kotak(0.21, 0.025, 0.28, new THREE.MeshStandardMaterial({ color: 0x3f6fa8, roughness: 0.8 }), 0.1, 0.955, 0.02, g, 0.003).rotation.y = 0.2;

    // Panel MCB di dinding belakang rak (dinding x -5), kanan rak dari kamera: kotak putih,
    // deret MCB berlabel, tutup asap terbuka dengan daftar sirkuit berlaminating.
    const panel = new THREE.Group();
    panel.position.set(0.78, 1.18, 0.9);
    panel.rotation.y = Math.PI;
    g.add(panel);
    {
      const putih = new THREE.MeshStandardMaterial({ color: 0xeeece6, roughness: 0.45 });
      const W = 0.36;
      const H = 0.3;
      const D = 0.095;
      kotak(W, H, D, putih, 0, 0, 0, panel, 0.006);
      kotak(W - 0.03, H - 0.03, 0.004, new THREE.MeshStandardMaterial({ color: 0x2b2b2d, roughness: 0.7 }), 0, 0, D / 2 - 0.001, panel, 0.001);
      const label = ["UTAMA", "LAMPU", "KASIR", "AC", "STOP KONTAK", "GUDANG", "RAK SOUND", "CADANGAN"];
      const lebar = 0.026;
      const abu = new THREE.MeshStandardMaterial({ color: 0xd8d5cd, roughness: 0.5 });
      label.forEach((n, i) => {
        const x = -((label.length - 1) * lebar) / 2 + i * lebar;
        kotak(lebar - 0.002, 0.1, 0.05, abu, x, 0.03, D / 2 + 0.02, panel, 0.002);
        kotak(0.008, 0.022, 0.012, new THREE.MeshStandardMaterial({ color: i === 0 ? 0xc0392b : 0x2d2f33, roughness: 0.5 }), x, 0.045, D / 2 + 0.05, panel, 0.002);
        const lb = new THREE.Mesh(new THREE.PlaneGeometry(lebar - 0.003, 0.05), new THREE.MeshStandardMaterial({ map: teksturLabelMCB(n), roughness: 0.8 }));
        lb.position.set(x, -0.075, D / 2 + 0.0035);
        panel.add(lb);
      });
      const engsel = new THREE.Group();
      engsel.position.set(-W / 2, 0, D / 2 + 0.002);
      engsel.rotation.y = -1.9;
      const tutup = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.004), new THREE.MeshStandardMaterial({ color: 0x3a4148, roughness: 0.15, transparent: true, opacity: 0.45 }));
      tutup.position.x = W / 2;
      engsel.add(tutup);
      const daftar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.26),
        new THREE.MeshStandardMaterial({ map: teksturCatatanTangan("DAFTAR SIRKUIT", ["1 Utama 32A", "2 Lampu toko", "3 Meja kasir, router", "4 AC 1/2 PK", "5 Stop kontak depan", "6 Gudang", "7 Rak sound", "Cek tiap 6 bulan"]), roughness: 0.35 }),
      );
      daftar.position.set(W / 2, 0, -0.004);
      daftar.rotation.y = Math.PI;
      engsel.add(daftar);
      panel.add(engsel);
    }
    // Talang kabel PVC dari lantai ke panel: satu jalur tempat semua kabel bertemu.
    const talang = new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: 0.5 });
    kotak(0.06, 1.03, 0.04, talang, 0.78, 0.515, 0.93, g, 0.004);

    // Enam kabel: speaker kiri (merah, hitam), speaker kanan, RCA, dua kabel listrik abu tebal.
    // Tiap kabel punya jalur kusut dan jalur rapi dengan jumlah titik sama; shader memadukan
    // keduanya lewat satu uniform, jadi geometri tidak dibangun ulang tiap bingkai.
    const rapi = { value: 0 };
    const kabel = [
      [0xc0392b, 0.005, 0.66, -0.18],
      [0x151515, 0.005, 0.66, -0.13],
      [0xc0392b, 0.005, 0.66, 0.12],
      [0xe8e3d8, 0.0045, 0.38, -0.1],
      [0x6f7276, 0.007, 0.12, 0.14],
      [0x6f7276, 0.007, 0.38, 0.16],
    ];
    let benih = 3;
    const acak = () => ((benih = (benih * 16807) % 2147483647) / 2147483647 - 0.5);
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const SEG = 64;
    kabel.forEach(([warna, r, y, x], k) => {
      const awal = V(x, y, -0.2);
      const masuk = V(0.775 + (k - 2.5) * 0.006, 0.04, 0.91);
      // Rapi: turun lurus dari soket, berbaris di lantai belakang rak, belok di sisi rak, lalu
      // menyatu ke mulut talang.
      const lajur = -0.42 - k * 0.012;
      const jalurRapi = new THREE.CatmullRomCurve3([awal, V(x, y - 0.03, -0.24), V(x, 0.03, lajur + 0.06), V(x + 0.02, 0.012, lajur), V(0.4, 0.012, lajur), V(0.62 + k * 0.004, 0.012, lajur + 0.08), V(0.7 + k * 0.004, 0.012, 0.6 - k * 0.006), masuk], false, "catmullrom", 0.2);
      // Kusut: lilitan dan lengkungan acak di lantai, satu kabel tergantung di depan rak.
      const jalurKusut = new THREE.CatmullRomCurve3([
        awal,
        V(x + acak() * 0.1, y - 0.12, -0.3 + acak() * 0.08),
        V(-0.25 + acak() * 0.4, 0.02, -0.75 + acak() * 0.2),
        V(0.05 + acak() * 0.4, 0.06 + Math.abs(acak()) * 0.2, -0.55 + acak() * 0.2),
        V(0.35 + acak() * 0.25, 0.015, -0.85 + acak() * 0.2),
        V(0.6 + acak() * 0.15, 0.015, -0.2 + acak() * 0.3),
        V(0.62 + acak() * 0.1, 0.08 + Math.abs(acak()) * 0.15, 0.55 + acak() * 0.15),
        masuk,
      ]);
      const geoRapi = new THREE.TubeGeometry(jalurRapi, SEG, r, 6);
      const geo = new THREE.TubeGeometry(jalurKusut, SEG, r, 6);
      geo.setAttribute("posRapi", geoRapi.attributes.position);
      geo.setAttribute("normalRapi", geoRapi.attributes.normal);
      const m = bahanKabel(warna, rapi);
      const o = new THREE.Mesh(geo, m);
      o.customDepthMaterial = bahanKabelBayang(THREE.MeshDepthMaterial, rapi, { depthPacking: THREE.RGBADepthPacking });
      o.customDistanceMaterial = bahanKabelBayang(THREE.MeshDistanceMaterial, rapi);
      // Batas tidak dihitung ulang saat kabel bergerak: jangan dibuang frustum culling.
      o.frustumCulled = false;
      g.add(o);
    });
    // Pengikat kabel hitam di berkas lantai: muncul satu per satu sesudah kabel rapi.
    const ikat = [];
    for (const [x, z] of [
      [0.1, -0.45],
      [0.28, -0.45],
      [0.62, -0.36],
      [0.69, 0.05],
      [0.71, 0.45],
    ]) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0035, 6, 18), b.karet);
      t.position.set(x, 0.022, z);
      // Berkas mendatar sepanjang x di lajur depan, sepanjang z di sisi rak.
      t.rotation.set(0, z < -0.4 ? Math.PI / 2 : 0, 0);
      t.scale.setScalar(0.001);
      g.add(t);
      ikat.push(t);
    }
    const nyalaLed = new THREE.Color(0x7fe08a).multiplyScalar(3);
    const matiLed = new THREE.Color(0x2a221c);
    momen.fondasi = (u, s) => {
      led.forEach((l, i) => l.material.color.copy(i < (s.nyala ?? 0) ? nyalaLed : matiLed));
      // Kabel dirapikan di paruh pertama babak, pengikat menyusul berurutan.
      rapi.value = halus((u - 0.12) / 0.45);
      ikat.forEach((t, i) => t.scale.setScalar(Math.max(0.001, halus((u - 0.5 - i * 0.05) / 0.08))));
    };
    momen.fondasi(0, {});
    grup.add(g);
    tambahBayang(-4.05, 1.95, 0.5);
  }

  // ---- Gondola tengah: tempat turntable (05), stasiun dengar (07), dan vitrin (09) ----------
  {
    const g = new THREE.Group();
    g.position.set(0.1, 0, 0.4);
    kotak(2.4, 0.8, 0.72, b.kayu, 0, 0.44, 0, g, 0.012);
    kotak(2.48, 0.04, 0.8, b.kayuTua, 0, 0.86, 0, g, 0.01);
    kotak(2.32, 0.08, 0.64, b.gelap, 0, 0.04, 0, g, 0.01);
    // Bak CD di kedua sisi: deretan kotak CD miring, satu InstancedMesh.
    const cd = new THREE.InstancedMesh(new THREE.BoxGeometry(0.142, 0.125, 0.01), new THREE.MeshStandardMaterial({ roughness: 0.35 }), 120);
    const warna = ["#e05a4a", "#3f6fa8", "#d9a441", "#2b2a2e", "#4d8a5c", "#e9e1d3", "#8a5a9e"].map((w) => new THREE.Color(w));
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let n = 0;
    for (const sisi of [-1, 1])
      for (let i = 0; i < 60; i++) {
        const x = -1.08 + i * 0.036;
        if (Math.abs(x) < 0.08) continue;
        q.setFromEuler(new THREE.Euler(sisi * -0.35, 0, 0));
        mat.compose(new THREE.Vector3(x, 0.7, sisi * 0.33), q, new THREE.Vector3(1, 1, 1));
        cd.setMatrixAt(n, mat);
        cd.setColorAt(n, warna[(i * 7 + (sisi > 0 ? 3 : 0)) % warna.length]);
        n++;
      }
    cd.count = n;
    g.add(cd);
    for (const sisi of [-1, 1]) kotak(2.3, 0.14, 0.02, b.kayuTua, 0, 0.62, sisi * 0.39, g, 0.004);
    grup.add(g);
    tambahBayang(0.1, 0.4, 1.5);
  }

  // ---- 05 bangun: turntable dengan test pressing dan monitor rancangan ----------------------
  let piringan;
  {
    const g = new THREE.Group();
    g.position.set(-0.55, 0.88, 0.55);
    g.rotation.y = 0.15;
    kotak(0.46, 0.085, 0.36, b.kayuTua, 0, 0.0425, 0, g, 0.01);
    kotak(0.44, 0.006, 0.34, b.gelap, 0, 0.088, 0, g, 0.002);
    for (const [x, z] of [
      [-0.2, -0.15],
      [0.2, -0.15],
      [-0.2, 0.15],
      [0.2, 0.15],
    ])
      tabung(0.018, 0.02, b.karet, x, -0.005, z, g, 14);
    tabung(0.152, 0.014, b.logam, -0.05, 0.098, 0, g, 64);
    piringan = new THREE.Group();
    const alur = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.15, map: teksturAlur() });
    const vinil = new THREE.Mesh(new THREE.CylinderGeometry(0.149, 0.149, 0.003, 64), [new THREE.MeshStandardMaterial({ color: 0x0e0d0d }), alur, alur]);
    // Label putih polos: test pressing belum punya sampul dan label cetak.
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.0035, 40), new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.85, map: teksturLabelUji() }));
    piringan.add(vinil, label);
    piringan.position.set(-0.05, 0.107, 0);
    g.add(piringan);
    tabung(0.006, 0.02, b.logam, -0.05, 0.115, 0, g, 10);
    // Lengan tonearm dan kepala jarum.
    const lengan = new THREE.Group();
    lengan.position.set(0.16, 0.1, -0.12);
    tabung(0.02, 0.025, b.logam, 0, 0.012, 0, lengan, 20);
    kotak(0.008, 0.008, 0.22, b.logam, 0, 0.03, 0.1, lengan, 0.004);
    kotak(0.018, 0.01, 0.03, b.gelap, 0, 0.025, 0.215, lengan, 0.003);
    lengan.rotation.y = 0.42;
    g.add(lengan);
    // Sampul putih polos test pressing di sebelahnya.
    kotak(0.31, 0.004, 0.31, new THREE.MeshStandardMaterial({ color: 0xf0ebe2, roughness: 0.9 }), 0.42, 0.002, 0.05, g, 0.001).rotation.y = -0.25;
    grup.add(g);
    // Monitor kecil di sebelahnya: rancangan yang bisa dicoba.
    const m = new THREE.Group();
    m.position.set(0.08, 0.88, 0.42);
    m.rotation.y = -0.2;
    kotak(0.16, 0.012, 0.12, b.gelap, 0, 0.006, 0, m, 0.004);
    kotak(0.025, 0.15, 0.025, b.gelap, 0, 0.08, -0.025, m, 0.006);
    kotak(0.5, 0.31, 0.022, b.gelap, 0, 0.3, 0, m, 0.01);
    const l = layar(0.47, 0.29, "05-rancangan.webp");
    l.position.set(0, 0.3, 0.0115);
    m.add(l);
    grup.add(m);
  }

  // ---- 06 progres: papan pre-order di dinding belakang kanan, buku catatan --------------------
  {
    const g = new THREE.Group();
    g.position.set(4.2, 1.35, -3.975);
    g.scale.setScalar(0.82);
    kotak(1.35, 0.92, 0.025, b.triplek, 0, 0, 0, g, 0.006);
    for (const [w, h, x, y] of [
      [1.42, 0.04, 0, 0.47],
      [1.42, 0.04, 0, -0.47],
      [0.04, 0.98, -0.69, 0],
      [0.04, 0.98, 0.69, 0],
    ])
      kotak(w, h, 0.04, b.kayuTua, x, y, 0.01, g, 0.004);
    // Kepala kolom: ikon dipesan, dalam perjalanan, sudah tiba (tanpa tulisan, satu tekstur).
    const kepala = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.13), new THREE.MeshStandardMaterial({ map: teksturKolom(), roughness: 0.9, transparent: true }));
    kepala.position.set(0, 0.36, 0.0135);
    g.add(kepala);
    for (const x of [-0.21, 0.21]) kotak(0.006, 0.76, 0.004, b.kayuTua, x, -0.04, 0.014, g, 0.002);
    const kartu = [];
    const buatKartu = (warna) => {
      const k = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.16), new THREE.MeshStandardMaterial({ map: teksturKartu(warna), roughness: 0.9 }));
      g.add(k);
      kartu.push(k);
      return k;
    };
    const kolom = [-0.42, 0, 0.42];
    for (const [c, y, w, dx] of [
      [0, 0.18, "#3f6fa8", 0.004],
      [0, 0.0, "#d9a441", -0.006],
      [1, 0.18, "#4d8a5c", 0.003],
      [2, 0.18, "#8a5a9e", -0.004],
      [2, 0.0, "#e05a4a", 0.006],
    ])
      buatKartu(w).position.set(kolom[c] + dx, y, 0.016);
    // Kartu yang tertahan di kolom tengah, dengan catatan merah alasannya.
    buatKartu("#2b2a2e").position.set(kolom[1], 0.0, 0.016);
    const catatan = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.07), new THREE.MeshStandardMaterial({ color: 0xe0574b, roughness: 0.9 }));
    catatan.position.set(kolom[1] + 0.11, -0.05, 0.018);
    catatan.rotation.z = 0.15;
    g.add(catatan);
    // Kartu yang bergerak selama babak: dipesan, dalam perjalanan, sudah tiba.
    const jalan = buatKartu("#c46b3a");
    for (const k of kartu) {
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc9443a, roughness: 0.4 }));
      pin.position.set(0, 0.065, 0.006);
      k.add(pin);
    }
    momen.progres = (u) => {
      const t = halus((u - 0.15) / 0.65) * 2;
      const i = Math.min(1, Math.floor(t));
      const f = halus(t - i);
      jalan.position.set(kolom[i] + (kolom[i + 1] - kolom[i]) * f, -0.18 + 0.05 * Math.sin(Math.PI * f), 0.02 + 0.02 * Math.sin(Math.PI * f));
      jalan.rotation.z = 0.08 * Math.sin(Math.PI * f);
    };
    momen.progres(0);
    grup.add(g);
    // Rak kecil di bawah papan: buku catatan keputusan terbuka, ponsel dengan status proyek.
    const r = meja(0.9, 0.4, 0.78, b.kayuTua, b.kayu);
    r.position.set(4.2, 0, -3.72);
    const buku = new THREE.Group();
    buku.position.set(-0.12, 0.785, 0.02);
    buku.rotation.y = 0.15;
    for (const s of [-1, 1]) {
      kotak(0.16, 0.012, 0.22, b.kertas, s * 0.082, 0.006, 0, buku, 0.002).rotation.z = s * -0.05;
      const tulisan = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.19), new THREE.MeshBasicMaterial({ map: teksturBaris(), transparent: true, opacity: 0.8 }));
      tulisan.rotation.x = -Math.PI / 2;
      tulisan.position.set(s * 0.082, 0.0135, 0);
      buku.add(tulisan);
    }
    kotak(0.34, 0.006, 0.24, new THREE.MeshStandardMaterial({ color: 0x5a2f22, roughness: 0.7 }), 0, 0.001, 0, buku, 0.002);
    r.add(buku);
    const hp = new THREE.Group();
    hp.position.set(0.24, 0.79, 0.03);
    hp.rotation.set(-Math.PI / 2, 0, 0.35);
    kotak(0.075, 0.155, 0.008, b.gelap, 0, 0, 0, hp, 0.006);
    const lh = layar(0.068, 0.145, "06-coderoach-os.webp");
    lh.position.z = 0.0045;
    hp.add(lh);
    r.add(hp);
    gelasKopi(0.35, 0.78, -0.1, r);
    tambahBayang(4.2, -3.72, 0.6);
  }

  // ---- 07 rapi: stasiun dengar coba, layar kasir sebelum dan sesudah dirapikan --------------
  let hpStasiun;
  {
    const g = new THREE.Group();
    g.position.set(0.85, 0.88, 0.6);
    g.rotation.y = -0.35;
    kotak(0.34, 0.025, 0.22, b.kayuTua, 0, 0.0125, 0, g, 0.006);
    kotak(0.03, 0.12, 0.03, b.logam, 0, 0.07, -0.04, g, 0.008);
    const t = kotak(0.34, 0.235, 0.014, b.gelap, 0, 0.17, 0, g, 0.012);
    t.rotation.x = -0.4;
    const bahanBelah = new THREE.ShaderMaterial({
      uniforms: { tA: { value: null }, tB: { value: null }, uBelah: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      // Garis belah menyapu dari kiri: kiri sudah dirapikan (A), kanan masih mentah (B).
      fragmentShader: `varying vec2 vUv; uniform sampler2D tA; uniform sampler2D tB; uniform float uBelah;
        void main() {
          vec3 a = texture2D(tA, vUv).rgb;
          vec3 b = texture2D(tB, vUv).rgb;
          float garis = 1.0 - smoothstep(0.0, 0.005, abs(vUv.x - uBelah));
          vec3 c = mix(b, a, step(vUv.x, uBelah));
          c = mix(c, vec3(0.88, 0.34, 0.29), garis * step(0.001, uBelah) * step(uBelah, 0.999));
          gl_FragColor = vec4(c * 0.9, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    tekstur(LAYAR + "07-kasir-sesudah.webp", [1, 1]).then((x) => (bahanBelah.uniforms.tA.value = x));
    tekstur(LAYAR + "07-kasir-sebelum.webp", [1, 1]).then((x) => (bahanBelah.uniforms.tB.value = x));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.315, 0.21), bahanBelah);
    l.position.z = 0.0075;
    t.add(l);
    // Kait headphone di sisi stasiun.
    kotak(0.012, 0.3, 0.012, b.logam, 0.22, 0.15, -0.02, g, 0.006);
    kotak(0.06, 0.012, 0.012, b.logam, 0.25, 0.3, -0.02, g, 0.006);
    hpStasiun = new THREE.Group();
    hpStasiun.position.set(0.27, 0.19, -0.02);
    hpStasiun.rotation.y = Math.PI / 2;
    g.add(hpStasiun);
    momen.rapi = (u) => (bahanBelah.uniforms.uBelah.value = halus((u - 0.18) / 0.6));
    grup.add(g);
  }

  // ---- 08 andal: bangku, pemutar kaset baterai, ponsel, lampu darurat ------------------------
  let tinggiDudukan = 0.44;
  {
    tungguModel.push([
      "wooden_stool_01",
      (m) => {
        m.position.set(3.55, 0, -1.6);
        m.rotation.y = 0.4;
        grup.add(m);
        m.updateMatrixWorld(true);
        // Benda di atas bangku diletakkan dari tinggi dudukan sebenarnya, bukan angka tebakan,
        // supaya tidak tenggelam ke kayunya.
        tinggiDudukan = new THREE.Box3().setFromObject(m).max.y;
        hp.position.y = tinggiDudukan + 0.005;
      },
    ]);
    const hp = new THREE.Group();
    hp.position.set(3.6, 0.45, -1.52);
    hp.rotation.set(-Math.PI / 2, 0, -0.4);
    kotak(0.075, 0.155, 0.008, b.gelap, 0, 0, 0, hp, 0.006);
    const l = layar(0.068, 0.145, "08-jeda.webp");
    l.position.z = 0.0045;
    hp.add(l);
    grup.add(hp);
    // Lampu darurat isi ulang di lantai: menyala saat listrik toko padam.
    const ld = new THREE.Group();
    ld.position.set(3.15, 0, -1.85);
    ld.rotation.y = 0.7;
    kotak(0.2, 0.13, 0.07, new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.5 }), 0, 0.065, 0, ld, 0.012);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshBasicMaterial({ color: 0x3a3430, toneMapped: false }));
    strip.position.set(0, 0.08, 0.0355);
    ld.add(strip);
    kotak(0.12, 0.014, 0.014, b.gelap, 0, 0.14, 0, ld, 0.006);
    grup.add(ld);
    momen.andal = (u) => {
      const padam = u > 0.42 && u < 0.72;
      strip.material.color.setHex(padam ? 0xffffff : 0x3a3430).multiplyScalar(padam ? 2.2 : 1);
      lampuDarurat.intensity = padam ? 2.2 : 0;
    };
    tambahBayang(3.55, -1.6, 0.35);
  }

  // ---- 09 aman: vitrin kaca berisi buku kas dan map arsip, tutupnya dikunci gembok -----------
  // Masukan Farrez 13 Nov: isi vitrin harus benda yang langsung dikenali, dan gembok di tepi atas
  // tutup, bukan di tengah kaca. Lemari arsip berlaci sempat dicoba lalu dibuang (terlalu asing).
  {
    const g = new THREE.Group();
    g.position.set(0.25, 0.88, 0.2);
    grup.add(g);
    const W = 0.62;
    const D = 0.34;
    const H = 0.24;
    kotak(W + 0.04, 0.045, D + 0.04, b.kayuTua, 0, 0.0225, 0, g, 0.008);
    // Empat panel kaca 5 mm, bukan satu kotak pejal: tepi tiap panel hijau botol, mukanya hampir
    // tak terlihat (riset audit ulang 19 Nov 2026). Kotak pejal terbaca seperti jeli.
    const TEBAL = 0.005;
    const panel = (w, h, d, x, y, z, induk = g) => {
      const tepi = bahan.tepiKaca;
      const muka = bahan.kaca;
      // Urutan muka BoxGeometry: +x, -x, +y, -y, +z, -z. Muka lebar dapat kaca, sisi tipis dapat tepi.
      const urut = w <= d && w <= h ? [muka, muka, tepi, tepi, tepi, tepi] : h <= d && h <= w ? [tepi, tepi, muka, muka, tepi, tepi] : [tepi, tepi, tepi, tepi, muka, muka];
      const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), urut);
      o.position.set(x, y, z);
      o.renderOrder = 3;
      induk.add(o);
      return o;
    };
    const yKaca = 0.045 + H / 2;
    for (const sz of [-1, 1]) panel(W - 0.012, H, TEBAL, 0, yKaca, (sz * (D - TEBAL)) / 2);
    for (const sx of [-1, 1]) panel(TEBAL, H, D - 0.012, (sx * (W - TEBAL)) / 2, yKaca, 0);
    for (const sx of [-W / 2, W / 2]) for (const sz of [-D / 2, D / 2]) kotak(0.012, H, 0.012, b.kuningan, sx, 0.045 + H / 2, sz, g, 0.003);
    // Buku kas bersampul kulit merah tua, label kertas di sampulnya.
    const kulit = new THREE.MeshStandardMaterial({ color: 0x5a1f1a, roughness: 0.6 });
    const buku = kotak(0.24, 0.045, 0.31, kulit, -0.14, 0.045 + 0.0225, 0.0, g, 0.006);
    buku.rotation.y = 0.12;
    kotak(0.23, 0.04, 0.3, b.kertas, -0.14 + 0.006, 0.045 + 0.0225, 0.0, g, 0.002).rotation.y = 0.12;
    const label = kotak(0.1, 0.002, 0.05, new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 }), -0.14, 0.091, -0.06, g, 0.0008);
    label.rotation.y = 0.12;
    // Tumpukan map arsip dengan tab warna (merah, biru, kuning) dan ujung kertas yang mencuat.
    [0xc9443a, 0x3f6fa8, 0xd9a441].forEach((w, i) => {
      const y = 0.045 + 0.006 + i * 0.014;
      const map = kotak(0.24, 0.01, 0.3, new THREE.MeshStandardMaterial({ color: 0xd8b57a, roughness: 0.85 }), 0.15, y, 0.005 - i * 0.008, g, 0.002);
      map.rotation.y = -0.08 + i * 0.06;
      const tab = kotak(0.06, 0.009, 0.025, new THREE.MeshStandardMaterial({ color: w, roughness: 0.7 }), 0.15 + 0.05 - i * 0.05, y, -0.16 - i * 0.008, g, 0.002);
      tab.rotation.y = map.rotation.y;
      kotak(0.21, 0.003, 0.27, b.kertas, 0.15, y + 0.006, 0.005 - i * 0.008, g, 0.0008).rotation.y = map.rotation.y + 0.03;
    });
    // Tutup kaca berengsel di tepi belakang (jauh dari kamera), berbingkai kuningan.
    const tutup = new THREE.Group();
    tutup.position.set(0, 0.045 + H, D / 2);
    panel(W, 0.006, D, 0, 0.003, -D / 2, tutup);
    for (const [w, d, x, z] of [
      [W + 0.01, 0.012, 0, -D],
      [W + 0.01, 0.012, 0, 0],
      [0.012, D, -W / 2, -D / 2],
      [0.012, D, W / 2, -D / 2],
    ])
      kotak(w, 0.01, d, b.kuningan, x, 0.005, z, tutup, 0.003);
    // Kait di tepi depan tutup: pelat menekuk turun melewati kepala gelang di dinding kaca.
    kotak(0.04, 0.05, 0.004, b.kuningan, 0, -0.018, -D - 0.006, tutup, 0.002);
    g.add(tutup);
    kotak(0.03, 0.012, 0.012, b.kuningan, 0, 0.045 + H - 0.03, -D / 2 - 0.008, g, 0.003);
    // Gembok tergantung di gelang kait, tepat di tepi atas depan vitrin.
    const gembok = new THREE.Group();
    gembok.position.set(0, 0.045 + H - 0.065, -D / 2 - 0.016);
    kotak(0.042, 0.038, 0.016, b.kuningan, 0, 0, 0, gembok, 0.006);
    tabung(0.004, 0.003, b.gelap, 0, 0.002, -0.0085, gembok, 12).rotation.x = Math.PI / 2;
    kotak(0.002, 0.008, 0.002, b.gelap, 0, -0.004, -0.0088, gembok, 0.0005);
    const lengkung = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0032, 10, 24, Math.PI), bahan.logam);
    gembok.add(lengkung);
    for (const sx of [-0.013, 0.013]) tabung(0.0032, 0.014, bahan.logam, sx, -0.007, 0, lengkung, 10);
    g.add(gembok);
    // Papan kunci berdiri di sisi vitrin: kunci kasir, gudang, dan pemilik, tiap kunci satu warna.
    const pk = new THREE.Group();
    pk.position.set(-0.45, 0.88, 0.12);
    pk.rotation.y = Math.PI + 0.3;
    kotak(0.32, 0.22, 0.02, b.triplek, 0, 0.13, 0, pk, 0.006);
    kotak(0.34, 0.02, 0.12, b.kayuTua, 0, 0.01, 0.04, pk, 0.004);
    for (const [w, x] of [
      ["#e05a4a", -0.1],
      ["#3f6fa8", 0],
      ["#d9a441", 0.1],
    ]) {
      tabung(0.004, 0.03, b.logam, x, 0.19, 0.02, pk, 8).rotation.x = Math.PI / 2;
      const k = new THREE.Group();
      k.position.set(x, 0.17, 0.03);
      tabung(0.012, 0.004, b.kuningan, 0, 0, 0, k, 18).rotation.x = Math.PI / 2;
      kotak(0.006, 0.05, 0.004, b.kuningan, 0, -0.035, 0, k, 0.002);
      kotak(0.035, 0.022, 0.003, new THREE.MeshStandardMaterial({ color: w, roughness: 0.7 }), 0.01, -0.07, 0.003, k, 0.003);
      pk.add(k);
    }
    grup.add(pk);
    const tutupPeredam = (x) => {
      const t = Math.min(1, Math.max(0, x));
      // 0..0,5: jatuh dipercepat sampai sisa 22%; 0,5..0,92: direm peredam; lalu pantul 1 derajat.
      if (t < 0.5) return 0.78 * (t / 0.5) ** 2;
      if (t < 0.92) return 0.78 + 0.22 * (1 - (1 - (t - 0.5) / 0.42) ** 2);
      return 1 - 0.02 * Math.sin(Math.PI * ((t - 0.92) / 0.08));
    };
    momen.aman = (u) => {
      // Tutup kaca yang terangkat sedikit turun menutup, lalu lengkung gembok turun dan mengunci.
      // Engsel di tepi belakang (z +D/2), tepi depan di -z: sudut positif mengangkat tepi depan.
      // Dulu negatif, jadi tutup yang "terbuka" malah menembus ke dalam kaca.
      // Tutup berperedam (riset 19 Nov 2026): jatuh bebas dulu, direm di 20 derajat terakhir,
      // satu pantulan kecil saat mendarat. Dulu 20 derajat dalam rentang gulir 0,18: terlalu cepat.
      tutup.rotation.x = 0.9 * (1 - tutupPeredam((u - 0.1) / 0.32));
      // Gembok baru dikunci sesudah tutup rapat: lengkungnya turun masuk badan.
      lengkung.position.y = 0.019 + 0.018 * (1 - halus((u - 0.48) / 0.1));
    };
    momen.aman(0);
  }

  // ---- 10 rilis: CD proyek diambil satu per satu dari rak, terbang melengkung ke kiri --------
  // Pilihan Farrez 19 Nov 2026 ("A ke kiri"): searah gulir rak koleksi yang masuk dari kanan.
  // Gerak dari riset (desain/cerita-v4/riset-masukan-19nov.md): tiap kotak ditarik lurus keluar
  // sampai bebas dari tetangganya, baru berputar dan naik; jalur melengkung, miring mengikuti
  // belokan, goyang kecil dengan fase berbeda, jeda antarbenda. Dulu tiga kotak meluncur masuk
  // celah dan sempat menembus rak.
  const SLUG_RILIS = ["coderoach-os", "jeda", "akarkita", "d-day", "viralytics", "yiheecam", "fifofun", "nds-etl", "pilot-iklan", "erp-software-house"];
  const WARNA_PUNGGUNG = [0xe05a4a, 0x2b2a2e, 0xd9a441, 0x3f6fa8, 0x4d8a5c, 0xe9e1d3, 0x8a5a9e, 0x6b645a, 0xc9443a, 0x3f6fa8];
  const kotakRilis = SLUG_RILIS.map((slug, i) => {
    const sampul = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
    tekstur(`/assets/ilustrasi/${slug}.webp`, [1, 1]).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      sampul.map = t;
      sampul.needsUpdate = true;
    });
    const punggung = new THREE.MeshStandardMaterial({ color: WARNA_PUNGGUNG[i], roughness: 0.4 });
    const belakang = new THREE.MeshStandardMaterial({ color: 0x9a968e, roughness: 0.5 });
    // Ukuran dan arah sama dengan CD di rak (dunia.js buatRakCD): dalam 12,5 cm ke arah dinding,
    // tebal 1,04 cm sepanjang rak, punggung menghadap ruangan (-x), sampul di muka +z.
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.142, 0.0104), [belakang, punggung, belakang, belakang, sampul, belakang]);
    k.userData.awal = new THREE.Vector3(4.8, 1.12 + 0.071, -0.433 + i * 0.0116);
    k.position.copy(k.userData.awal);
    grup.add(k);
    return k;
  });
  const titikKurva = (a, b, c, t) => a.clone().multiplyScalar((1 - t) ** 2).addScaledVector(b, 2 * (1 - t) * t).addScaledVector(c, t * t);
  const masukKeluar = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  momen.rilis = (u) =>
    kotakRilis.forEach((k, i) => {
      const tau = (u - 0.08 - i * 0.05) / 0.35;
      const a = k.userData.awal;
      if (tau <= 0) {
        k.position.copy(a);
        k.rotation.set(0, 0, 0);
        k.visible = true;
        return;
      }
      // Ditarik lurus keluar sepanjang kedalaman rak sampai bebas dari tetangganya.
      const tarik = halus(tau / 0.2);
      const keluar = new THREE.Vector3(a.x - 0.16 * tarik, a.y + 0.004 * tarik, a.z);
      if (tau < 0.2) {
        k.position.copy(keluar);
        k.rotation.set(0, 0, 0.05 * Math.sin(Math.PI * tarik));
        k.visible = true;
        return;
      }
      // Lalu terbang melengkung ke kiri layar dan keluar bingkai.
      const f = Math.min(1, (tau - 0.2) / 0.8);
      const e = masukKeluar(f);
      const p0 = new THREE.Vector3(a.x - 0.16, a.y + 0.004, a.z);
      const p1 = new THREE.Vector3(4.25, 1.52 - i * 0.012, a.z - 0.15);
      const p2 = new THREE.Vector3(3.8, 1.36 - (i % 3) * 0.05, -2.3);
      k.position.copy(titikKurva(p0, p1, p2, e));
      k.rotation.set(
        0.06 * Math.sin(2 * Math.PI * 1.4 * f + i),
        -0.85 * halus(f / 0.35),
        -0.45 * Math.sin(Math.PI * e) + 0.05 * Math.sin(2 * Math.PI * 1.7 * f + i * 1.3),
      );
      k.visible = f < 1;
    });
  momen.rilis(0);

  return {
    grup,
    tunggu: () => Promise.all(tunggu),
    modelDibutuhkan: tungguModel.map(([n]) => n),
    // Model CC0 yang sudah dimuat dunia.js dipasang di sini. `headphone` dipakai ulang di stasiun
    // dengar. Tanda bayangan dipasang dunia.js untuk seluruh adegan sekaligus.
    pasangModel(peta) {
      for (const [n, fn] of tungguModel) if (peta[n]) fn(peta[n]);
      if (peta.headphone && hpStasiun) hpStasiun.add(peta.headphone.clone());
      if (peta.kaset) {
        // Pemutar kaset baterai berbaring di dudukan bangku. Model CC0-nya satu mesh dengan kaset
        // setengah keluar dari tutup: berdiri tegak, kaset itu mencuat dan tampak melayang.
        const k = peta.kaset.clone();
        k.scale.setScalar(1.4);
        k.rotation.set(-Math.PI / 2, 0, 0.5);
        k.position.set(3.46, 0, -1.66);
        grup.add(k);
        k.updateMatrixWorld(true);
        k.position.y = tinggiDudukan - new THREE.Box3().setFromObject(k).min.y + 0.002;
      }
    },
    perbarui(id, u, s = {}) {
      if (piringan) piringan.rotation.y = s.waktu ? -s.waktu * 3.5 : 0;
      momen[id]?.(u, s);
    },
    // Dunia terus menggambar selama benda babak bergerak sendiri (piringan, stempel yang sedang mengecap).
    berputar: (id) => id === "bangun" || !!momen[id]?.sibuk?.(),
    // Benda yang bergerak dan membuat bayangan (stempel): peta bayangan kunci ikut diperbarui.
    sibuk: (id) => !!momen[id]?.sibuk?.(),
    // Sasaran sorot lampu kunci di babak ini ({ p, kuat }) atau null.
    sorot: (id) => sorot[id]?.() ?? null,
  };
}

// Alur piringan: cincin tipis berselang terang gelap, digambar sekali di kanvas kecil.
function teksturAlur() {
  const kv = document.createElement("canvas");
  kv.width = kv.height = 256;
  const c = kv.getContext("2d");
  c.fillStyle = "#0e0d0d";
  c.fillRect(0, 0, 256, 256);
  for (let r = 44; r < 127; r += 1.6) {
    c.strokeStyle = `rgba(255,255,255,${0.03 + 0.04 * (Math.round(r * 7) % 3 === 0 ? 1 : 0)})`;
    c.beginPath();
    c.arc(128, 128, r, 0, Math.PI * 2);
    c.stroke();
  }
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Bekas cap tinta "disetujui": cincin ganda dan tanda centang. Tinta seperti cap karet asli
// (riset 19 Nov 2026, efek squeegee): tepi goresan lebih gelap, tengahnya belang, ada bintik
// kosong, satu sisi sedikit lebih pucat. Satu kali, 256 px, saat props dibuat.
function teksturCap() {
  const kv = document.createElement("canvas");
  kv.width = kv.height = 256;
  const c = kv.getContext("2d", { willReadFrequently: true });
  const goresan = (lebar, warna) => {
    c.strokeStyle = warna;
    c.lineWidth = lebar;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.arc(128, 128, 112, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(128, 128, 94, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(84, 132);
    c.lineTo(114, 162);
    c.lineTo(172, 96);
    c.stroke();
  };
  goresan(13, "rgb(66,4,12)");
  goresan(7, "rgb(92,8,18)");
  const im = c.getImageData(0, 0, 256, 256);
  const d = im.data;
  let benih = 7;
  const acak = () => ((benih = (benih * 16807) % 2147483647) / 2147483647);
  const derau = new Float32Array(32 * 32).map(acak);
  const halusDerau = (x, y) => {
    const gx = (x / 256) * 31;
    const gy = (y / 256) * 31;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = gx - i;
    const fy = gy - j;
    const v = (a, b) => derau[Math.min(31, b) * 32 + Math.min(31, a)];
    return (v(i, j) * (1 - fx) + v(i + 1, j) * fx) * (1 - fy) + (v(i, j + 1) * (1 - fx) + v(i + 1, j + 1) * fx) * fy;
  };
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const k = (y * 256 + x) * 4;
      if (!d[k + 3]) continue;
      const belang = 0.72 + 0.28 * halusDerau(x, y);
      const sisi = 0.8 + 0.2 * (x / 256);
      const kosong = acak() < 0.035 ? 0.15 : 1;
      d[k + 3] = Math.round(d[k + 3] * Math.min(1, belang * sisi * kosong + 0.05));
    }
  }
  c.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Persegi bersudut membulat diekstrusi dengan bevel kecil (badan ponsel, laptop, pelat dudukan).
// Bidang di XY, tebal sepanjang z dan berpusat di 0. Grup bahan: 0 muka, 1 sisi.
function persegiBulat(w, h, r, tebal, bevel = 0.0006) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: tebal - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -tebal / 2 + bevel);
  return g;
}

const kanvasTeks = (w, h) => {
  const kv = document.createElement("canvas");
  kv.width = w;
  kv.height = h;
  return [kv, kv.getContext("2d")];
};
const jadiTekstur = (kv) => {
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};
const kotakBulat = (c, x, y, w, h, r) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
};

// Kabel yang berpindah dari jalur kusut (position) ke jalur rapi (posRapi) lewat `rapi.value`
// 0..1. Bahan bayangannya ikut dipadukan, supaya bayangan kabel tidak tertinggal di jalur lama.
const sisipMorfKabel = (sh, rapi) => {
  sh.uniforms.uRapi = rapi;
  sh.vertexShader = sh.vertexShader
    .replace("#include <common>", "#include <common>\nattribute vec3 posRapi;\nattribute vec3 normalRapi;\nuniform float uRapi;")
    .replace("#include <beginnormal_vertex>", "vec3 objectNormal = normalize(mix(vec3(normal), normalRapi, uRapi));\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(tangent.xyz);\n#endif")
    .replace("#include <begin_vertex>", "vec3 transformed = mix(vec3(position), posRapi, uRapi);");
};
function bahanKabel(warna, rapi) {
  const m = new THREE.MeshStandardMaterial({ color: warna, roughness: 0.55 });
  m.onBeforeCompile = (sh) => sisipMorfKabel(sh, rapi);
  m.customProgramCacheKey = () => "kabel-morf";
  return m;
}
function bahanKabelBayang(Kelas, rapi, opsi = {}) {
  const m = new Kelas(opsi);
  m.onBeforeCompile = (sh) => sisipMorfKabel(sh, rapi);
  m.customProgramCacheKey = () => "kabel-morf-bayang";
  return m;
}

// Panel belakang alat rak sound: amplifier (terminal speaker merah hitam, RCA, soket listrik),
// CD player (RCA keluar, digital, soket), stopkontak bersaklar (enam soket dan saklar merah).
function teksturBelakangAlat(jenis) {
  const [kv, c] = kanvasTeks(540, 180);
  c.fillStyle = "#2c2c2f";
  c.fillRect(0, 0, 540, 180);
  c.fillStyle = "#cfc9bb";
  c.font = "600 13px sans-serif";
  const bulat = (x, y, r, w) => {
    c.fillStyle = w;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  };
  if (jenis === "amplifier") {
    for (let i = 0; i < 4; i++) {
      bulat(60 + i * 56, 80, 13, i % 2 ? "#151515" : "#c0392b");
      bulat(60 + i * 56, 80, 5, "#d8b26a");
    }
    c.fillStyle = "#cfc9bb";
    c.fillText("SPEAKER A        SPEAKER B", 40, 122);
    for (let i = 0; i < 4; i++) {
      bulat(300 + i * 40, 66, 9, "#e8e3d8");
      bulat(300 + i * 40, 96, 9, "#c0392b");
    }
    c.fillStyle = "#cfc9bb";
    c.fillText("CD   TAPE   AUX   OUT", 290, 132);
  } else if (jenis === "cd") {
    bulat(90, 82, 10, "#e8e3d8");
    bulat(130, 82, 10, "#c0392b");
    c.fillStyle = "#cfc9bb";
    c.fillText("ANALOG OUT", 70, 122);
    c.fillStyle = "#111";
    c.fillRect(220, 68, 34, 28);
    c.fillStyle = "#cfc9bb";
    c.fillText("DIGITAL", 212, 122);
  } else {
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "#e9e6df";
      kotakBulat(c, 40 + i * 66, 50, 52, 70, 8);
      bulat(56 + i * 66, 85, 5, "#2c2c2f");
      bulat(76 + i * 66, 85, 5, "#2c2c2f");
    }
    c.fillStyle = "#c0392b";
    kotakBulat(c, 450, 60, 50, 50, 6);
  }
  c.fillStyle = "#1b1b1d";
  c.fillRect(470, 20, 50, 34);
  c.fillStyle = "#f4efe6";
  c.fillRect(20, 148, 120, 20);
  c.fillStyle = "#222";
  c.font = "600 12px sans-serif";
  c.fillText(jenis === "amplifier" ? "AMP RAK 1" : jenis === "cd" ? "CD RAK 2" : "LISTRIK RAK", 26, 162);
  return jadiTekstur(kv);
}

// Catatan tulisan tangan di kertas bergaris: diagram kabel, daftar sirkuit panel.
function teksturCatatanTangan(judul, baris) {
  const [kv, c] = kanvasTeks(512, 680);
  c.fillStyle = "#f6f2e8";
  c.fillRect(0, 0, 512, 680);
  c.fillStyle = "#1d2633";
  c.font = "bold 40px sans-serif";
  c.fillText(judul, 30, 64);
  c.font = "italic 30px serif";
  baris.forEach((t, i) => {
    c.fillStyle = i % 2 ? "#283a56" : "#1d2633";
    c.fillText(t, 30, 130 + i * 56);
    c.fillStyle = "rgba(40,60,90,0.25)";
    c.fillRect(30, 144 + i * 56, 452, 2);
  });
  return jadiTekstur(kv);
}

// Label tegak di bawah tiap MCB.
function teksturLabelMCB(nama) {
  const [kv, c] = kanvasTeks(64, 128);
  c.fillStyle = "#fffdf6";
  c.fillRect(0, 0, 64, 128);
  c.fillStyle = "#1a1a1a";
  c.save();
  c.translate(40, 122);
  c.rotate(-Math.PI / 2);
  c.font = "bold 18px sans-serif";
  c.fillText(nama, 0, 0);
  c.restore();
  return jadiTekstur(kv);
}

// Dashboard stok di ponsel: angka besar, tiga kartu status, grafik batang. Dari jarak kamera
// yang terbaca hanya susunan khas dashboard, jadi bentuknya yang diutamakan.
function teksturDashboard() {
  const [kv, c] = kanvasTeks(300, 640);
  c.fillStyle = "#f4f2ee";
  c.fillRect(0, 0, 300, 640);
  c.fillStyle = "#1f2a44";
  c.fillRect(0, 0, 300, 70);
  c.fillStyle = "#ffffff";
  c.font = "600 26px sans-serif";
  c.fillText("Stok hari ini", 20, 46);
  c.fillStyle = "#1f2a44";
  c.font = "700 54px sans-serif";
  c.fillText("1.284", 20, 150);
  c.fillStyle = "#6b7280";
  c.font = "22px sans-serif";
  c.fillText("barang tersedia", 20, 182);
  [["#e8604c", "Habis"], ["#e2a93b", "Menipis"], ["#3f9b6b", "Aman"]].forEach(([w, t], i) => {
    c.fillStyle = "#ffffff";
    kotakBulat(c, 20 + i * 90, 210, 80, 90, 10);
    c.fillStyle = w;
    kotakBulat(c, 32 + i * 90, 224, 24, 24, 6);
    c.fillStyle = "#374151";
    c.font = "18px sans-serif";
    c.fillText(t, 30 + i * 90, 282);
  });
  c.fillStyle = "#ffffff";
  kotakBulat(c, 20, 320, 260, 230, 12);
  [0.5, 0.75, 0.42, 0.9, 0.62, 0.8, 0.55].forEach((v, i) => {
    c.fillStyle = i === 3 ? "#e8604c" : "#3b5b9a";
    kotakBulat(c, 40 + i * 34, 520 - v * 170, 22, v * 170, 4);
  });
  return jadiTekstur(kv);
}

// Dek laptop: deret tuts gelap di pelat abu dan touchpad dengan tepi tipis. Satu tekstur, tanpa
// geometri per tuts: dari jarak kamera yang terbaca hanya pola tuts dan kotak touchpad.
function teksturDekLaptop() {
  const [kv, c] = kanvasTeks(640, 420);
  c.fillStyle = "#5d626a";
  c.fillRect(0, 0, 640, 420);
  c.fillStyle = "#1b1d21";
  const lebarTuts = (640 - 80) / 15;
  for (let r = 0; r < 6; r++)
    for (let k = 0; k < 15; k++) {
      // Baris bawah: spasi panjang di tengah.
      if (r === 5 && k > 4 && k < 10) continue;
      kotakBulat(c, 40 + k * lebarTuts + 2, 22 + r * 32, lebarTuts - 4, 26, 3);
    }
  kotakBulat(c, 40 + 5 * lebarTuts + 2, 22 + 5 * 32, lebarTuts * 5 - 4, 26, 3);
  c.fillStyle = "#666b73";
  kotakBulat(c, 200, 232, 240, 150, 8);
  c.strokeStyle = "#4a4e55";
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(200, 232, 240, 150, 8);
  c.stroke();
  return jadiTekstur(kv);
}

// QR hiasan: modul acak dengan tiga penanda sudut, seperti QR WhatsApp di brosur toko.
function gambarQR(c, qx, qy, sel, benih = 11) {
  const acak = () => ((benih = (benih * 16807) % 2147483647) / 2147483647);
  c.fillStyle = "#ffffff";
  c.fillRect(qx - 6, qy - 6, sel * 11 + 12, sel * 11 + 12);
  c.fillStyle = "#111111";
  for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) if (acak() < 0.48) c.fillRect(qx + i * sel, qy + j * sel, sel, sel);
  for (const [a, d] of [
    [0, 0],
    [8, 0],
    [0, 8],
  ]) {
    c.fillStyle = "#111111";
    c.fillRect(qx + a * sel, qy + d * sel, sel * 3, sel * 3);
    c.fillStyle = "#ffffff";
    c.fillRect(qx + a * sel + sel * 0.4, qy + d * sel + sel * 0.4, sel * 2.2, sel * 2.2);
    c.fillStyle = "#111111";
    c.fillRect(qx + a * sel + sel * 0.9, qy + d * sel + sel * 0.9, sel * 1.2, sel * 1.2);
  }
}

// Sampul leaflet lipat tiga ukuran DL (99 x 210 mm), seperti brosur di meja kasir: foto produk di
// atas, pita judul promo, diskon besar, harga coret, chip WhatsApp dan QR di bawah. Masukan Farrez
// 19 Nov: brosur lama (kartu A6 dengan lingkaran) belum terbaca sebagai brosur.
function teksturBrosur() {
  const [kv, c] = kanvasTeks(400, 848);
  c.fillStyle = "#fbf6ec";
  c.fillRect(0, 0, 400, 848);
  // Foto produk: meja kayu, tiga stoples kue dan satu tas belanja, cahaya dari kiri.
  const foto = c.createLinearGradient(0, 0, 400, 360);
  foto.addColorStop(0, "#f3d9b0");
  foto.addColorStop(1, "#c98f5a");
  c.fillStyle = foto;
  c.fillRect(0, 0, 400, 360);
  c.fillStyle = "#8a5a36";
  c.fillRect(0, 280, 400, 80);
  c.fillStyle = "rgba(0,0,0,0.18)";
  for (const [x, w] of [
    [40, 92],
    [150, 92],
    [262, 100],
  ])
    c.fillRect(x + 14, 286, w, 14);
  for (const [x, w, h, tutup] of [
    [40, 84, 150, "#d9442f"],
    [150, 84, 120, "#2f6b57"],
  ]) {
    c.fillStyle = "rgba(255,255,255,0.55)";
    kotakBulat(c, x, 286 - h, w, h, 14);
    c.fillStyle = "#e7b36a";
    kotakBulat(c, x + 8, 286 - h + 34, w - 16, h - 42, 10);
    c.fillStyle = tutup;
    kotakBulat(c, x - 4, 286 - h - 18, w + 8, 24, 6);
  }
  c.fillStyle = "#f4efe6";
  c.beginPath();
  c.moveTo(262, 286);
  c.lineTo(276, 140);
  c.lineTo(350, 140);
  c.lineTo(362, 286);
  c.fill();
  c.strokeStyle = "#b9a98f";
  c.lineWidth = 6;
  c.beginPath();
  c.arc(313, 140, 26, Math.PI, 0);
  c.stroke();
  c.fillStyle = "#d9442f";
  c.font = "800 30px sans-serif";
  c.fillText("SINAR", 272, 230);
  // Pita judul.
  c.fillStyle = "#d9442f";
  c.fillRect(0, 360, 400, 118);
  c.fillStyle = "#fff6e8";
  c.font = "800 50px sans-serif";
  c.fillText("PROMO", 28, 420);
  c.font = "600 30px sans-serif";
  c.fillText("akhir pekan", 30, 460);
  // Diskon dan harga.
  c.fillStyle = "#1d2633";
  c.font = "800 92px sans-serif";
  c.fillText("20%", 26, 584);
  c.font = "600 26px sans-serif";
  c.fillText("Sabtu dan Minggu", 30, 622);
  c.fillStyle = "#8c8478";
  c.font = "500 24px sans-serif";
  c.fillText("Rp56.000", 30, 664);
  c.fillRect(30, 656, 106, 3);
  c.fillStyle = "#d9442f";
  c.font = "800 34px sans-serif";
  c.fillText("Rp45.000", 150, 666);
  // Chip WhatsApp dan QR.
  c.fillStyle = "#25a35a";
  kotakBulat(c, 26, 708, 214, 54, 27);
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(56, 735, 15, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#25a35a";
  c.beginPath();
  c.arc(56, 735, 9, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffffff";
  c.font = "700 22px sans-serif";
  c.fillText("Pesan lewat chat", 80, 743);
  gambarQR(c, 268, 708, 10);
  c.fillStyle = "#5f564c";
  c.font = "500 20px sans-serif";
  c.fillText("Toko Sinar, Jl. Melati 12", 26, 818);
  return jadiTekstur(kv);
}

// Chat WhatsApp: kepala hijau tua, gelembung putih dan hijau muda bergantian.
function teksturChat() {
  const [kv, c] = kanvasTeks(300, 640);
  c.fillStyle = "#e9e1d6";
  c.fillRect(0, 0, 300, 640);
  c.fillStyle = "#075e54";
  c.fillRect(0, 0, 300, 76);
  c.fillStyle = "#cfd8dc";
  c.beginPath();
  c.arc(40, 38, 20, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffffff";
  c.font = "600 22px sans-serif";
  c.fillText("Toko", 72, 46);
  const pesan = [
    [false, "Halo, promonya masih ada?"],
    [true, "Masih, Kak. Mau pesan apa?"],
    [false, "Yang di brosur ya"],
    [true, "Siap, saya catat"],
  ];
  pesan.forEach(([kanan, t], i) => {
    const y = 110 + i * 110;
    const w = 190;
    const x = kanan ? 300 - w - 14 : 14;
    c.fillStyle = kanan ? "#dcf8c6" : "#ffffff";
    kotakBulat(c, x, y, w, 76, 14);
    c.fillStyle = "#1f2933";
    c.font = "18px sans-serif";
    const kata = t.split(" ");
    let baris = "";
    let by = y + 32;
    for (const k of kata) {
      if (c.measureText(baris + k).width > w - 24) {
        c.fillText(baris, x + 12, by);
        baris = "";
        by += 24;
      }
      baris += k + " ";
    }
    c.fillText(baris, x + 12, by);
  });
  c.fillStyle = "#ffffff";
  kotakBulat(c, 12, 580, 230, 46, 23);
  c.fillStyle = "#128c7e";
  c.beginPath();
  c.arc(268, 603, 23, 0, Math.PI * 2);
  c.fill();
  return jadiTekstur(kv);
}

// Kotak software ritel (big box): sampul berjudul dengan tangkapan layar aplikasi di jendela,
// lencana platform dan versi, kilau plastik segel; punggung bertulisan tegak. Masukan Farrez
// 19 Nov: kotak lama (ikon di persegi gelap) terbaca tablet, bukan kotak software.
function teksturKotakAplikasi() {
  const [kv, c] = kanvasTeks(512, 660);
  const latar = c.createLinearGradient(0, 0, 512, 660);
  latar.addColorStop(0, "#1f3a5f");
  latar.addColorStop(1, "#13243c");
  c.fillStyle = latar;
  c.fillRect(0, 0, 512, 660);
  c.fillStyle = "rgba(255,255,255,0.05)";
  c.beginPath();
  c.arc(470, 80, 180, 0, Math.PI * 2);
  c.fill();
  // Logo dan judul.
  c.fillStyle = "#d85a30";
  kotakBulat(c, 36, 40, 74, 74, 18);
  c.fillStyle = "#fff4ea";
  kotakBulat(c, 57, 61, 32, 32, 7);
  c.fillStyle = "#ffffff";
  c.font = "800 54px sans-serif";
  c.fillText("Kasir Sinar", 128, 96);
  c.fillStyle = "#c8d6e8";
  c.font = "500 26px sans-serif";
  c.fillText("Kasir, stok, dan laporan toko", 38, 160);
  // Jendela aplikasi dengan dashboard.
  const [jx, jy, jw, jh] = [38, 194, 436, 290];
  c.fillStyle = "rgba(0,0,0,0.3)";
  kotakBulat(c, jx + 8, jy + 10, jw, jh, 12);
  c.fillStyle = "#f4f2ee";
  kotakBulat(c, jx, jy, jw, jh, 12);
  c.fillStyle = "#d9dde3";
  c.fillRect(jx, jy + 12, jw, 22);
  for (const [i, w] of ["#e05a4a", "#d9a441", "#4d8a5c"].entries()) {
    c.fillStyle = w;
    c.beginPath();
    c.arc(jx + 18 + i * 18, jy + 23, 5, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#1f2a44";
  c.fillRect(jx, jy + 34, 96, jh - 34);
  for (let i = 0; i < 3; i++) {
    c.fillStyle = "#ffffff";
    kotakBulat(c, jx + 110 + i * 108, jy + 50, 96, 58, 8);
    c.fillStyle = ["#d9442f", "#2f6b57", "#3f6fa8"][i];
    c.fillRect(jx + 120 + i * 108, jy + 64, 48, 8);
    c.fillStyle = "#1d2633";
    c.fillRect(jx + 120 + i * 108, jy + 82, 64, 12);
  }
  for (let i = 0; i < 9; i++) {
    const t = [60, 90, 70, 120, 100, 140, 110, 150, 130][i];
    c.fillStyle = i === 7 ? "#d85a30" : "#7f9bc2";
    c.fillRect(jx + 118 + i * 34, jy + jh - 18 - t, 22, t);
  }
  // Lencana platform dan versi.
  c.fillStyle = "#ffffff";
  kotakBulat(c, 38, 516, 300, 46, 23);
  c.fillStyle = "#1f3a5f";
  c.font = "700 22px sans-serif";
  c.fillText("Untuk Windows & Android", 56, 547);
  c.fillStyle = "#d85a30";
  kotakBulat(c, 356, 516, 118, 46, 23);
  c.fillStyle = "#ffffff";
  c.fillText("Versi 1.0", 370, 547);
  c.fillStyle = "#c8d6e8";
  c.font = "500 20px sans-serif";
  c.fillText("Instal sekali, pakai di semua kasir", 38, 610);
  const kilau = c.createLinearGradient(0, 0, 512, 660);
  kilau.addColorStop(0.32, "rgba(255,255,255,0)");
  kilau.addColorStop(0.42, "rgba(255,255,255,0.16)");
  kilau.addColorStop(0.5, "rgba(255,255,255,0)");
  c.fillStyle = kilau;
  c.fillRect(0, 0, 512, 660);
  const sampul = jadiTekstur(kv);

  // Punggung: tebal 51 mm berbanding tinggi 229 mm.
  const [kp, p] = kanvasTeks(148, 660);
  p.fillStyle = "#1f3a5f";
  p.fillRect(0, 0, 148, 660);
  p.fillStyle = "#d85a30";
  kotakBulat(p, 37, 28, 74, 74, 18);
  p.fillStyle = "#fff4ea";
  kotakBulat(p, 58, 49, 32, 32, 7);
  p.save();
  p.translate(98, 640);
  p.rotate(-Math.PI / 2);
  p.fillStyle = "#ffffff";
  p.font = "800 50px sans-serif";
  p.fillText("Kasir Sinar", 0, 0);
  p.fillStyle = "#c8d6e8";
  p.font = "500 22px sans-serif";
  p.fillText("Versi 1.0", 300, -6);
  p.restore();
  return [sampul, jadiTekstur(kp)];
}

// Label test pressing: putih polos dengan dua coretan pulpen, tanpa tulisan.
function teksturLabelUji() {
  const kv = document.createElement("canvas");
  kv.width = kv.height = 128;
  const c = kv.getContext("2d");
  c.fillStyle = "#f2ece0";
  c.fillRect(0, 0, 128, 128);
  c.strokeStyle = "#2b3f8a";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(34, 44);
  c.bezierCurveTo(50, 36, 70, 52, 92, 40);
  c.moveTo(40, 84);
  c.bezierCurveTo(56, 78, 66, 90, 86, 82);
  c.stroke();
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Kepala kolom papan pre-order: tiga ikon (kotak, truk, centang) tanpa tulisan.
function teksturKolom() {
  const kv = document.createElement("canvas");
  kv.width = 768;
  kv.height = 80;
  const c = kv.getContext("2d");
  c.strokeStyle = "#2b2722";
  c.fillStyle = "#2b2722";
  c.lineWidth = 6;
  c.lineJoin = "round";
  const tengah = [128, 384, 640];
  c.strokeRect(tengah[0] - 26, 18, 52, 44);
  c.beginPath();
  c.moveTo(tengah[0] - 26, 32);
  c.lineTo(tengah[0] + 26, 32);
  c.stroke();
  c.strokeRect(tengah[1] - 34, 22, 40, 30);
  c.beginPath();
  c.moveTo(tengah[1] + 6, 32);
  c.lineTo(tengah[1] + 24, 32);
  c.lineTo(tengah[1] + 34, 44);
  c.lineTo(tengah[1] + 34, 52);
  c.lineTo(tengah[1] + 6, 52);
  c.stroke();
  for (const x of [tengah[1] - 22, tengah[1] + 20]) {
    c.beginPath();
    c.arc(x, 58, 7, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = "#1f7a4d";
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(tengah[2] - 24, 40);
  c.lineTo(tengah[2] - 6, 58);
  c.lineTo(tengah[2] + 28, 20);
  c.stroke();
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Kartu pesanan: kertas dengan kotak sampul berwarna dan baris abu, tanpa tulisan.
function teksturKartu(warna) {
  const kv = document.createElement("canvas");
  kv.width = 240;
  kv.height = 128;
  const c = kv.getContext("2d");
  c.fillStyle = "#f1ead9";
  c.fillRect(0, 0, 240, 128);
  c.fillStyle = warna;
  c.fillRect(14, 18, 76, 76);
  c.fillStyle = "#2b2722";
  c.fillRect(104, 24, 110, 12);
  c.fillStyle = "#8a8378";
  for (let i = 0; i < 3; i++) c.fillRect(104, 50 + i * 16, 90 - i * 18, 7);
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Tulisan tangan di buku catatan: baris-baris tipis biru, tanpa huruf.
function teksturBaris() {
  const kv = document.createElement("canvas");
  kv.width = 128;
  kv.height = 192;
  const c = kv.getContext("2d");
  c.strokeStyle = "rgba(43,63,138,0.8)";
  c.lineWidth = 2;
  for (let y = 18; y < 180; y += 14) {
    c.beginPath();
    c.moveTo(10, y);
    let x = 10;
    while (x < 100 + ((y * 13) % 18)) {
      x += 6;
      c.lineTo(x, y + Math.sin(x * 0.7 + y) * 2);
    }
    c.stroke();
  }
  const t = new THREE.CanvasTexture(kv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
