import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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

export function buatPropsCerita({ bahan, tekstur, tambahBayang }) {
  const grup = new THREE.Group();
  const lampu = [];
  const momen = {};
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
  const gelasKopi = (x, y, z, induk) => {
    const g = tabung(0.034, 0.09, b.keramik, x, y + 0.045, z, induk, 20);
    const isi = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), new THREE.MeshStandardMaterial({ color: 0x2a170c, roughness: 0.2 }));
    isi.rotation.x = -Math.PI / 2;
    isi.position.set(x, y + 0.082, z);
    induk.add(isi);
    return g;
  };
  // Lampu kecil setempat, bila lampu gantung tidak menjangkau.
  const lampuKecil = (x, y, z, kuat) => {
    const l = new THREE.PointLight(0xffb46a, 1, 3.5, 2);
    l.position.set(x, y, z);
    l.userData.kuat = kuat;
    lampu.push(l);
    grup.add(l);
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
    const cap = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.034, 32), new THREE.MeshBasicMaterial({ color: 0xc9443a, transparent: true, opacity: 0, toneMapped: false }));
    cap.rotation.x = -Math.PI / 2;
    cap.position.set(0.06, 0.776, 0.13);
    g.add(cap);
    const stempel = new THREE.Group();
    tabung(0.028, 0.025, b.karet, 0, 0.0125, 0, stempel);
    tabung(0.012, 0.06, b.kayu, 0, 0.055, 0, stempel);
    const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), b.kayu);
    kepala.position.y = 0.09;
    stempel.add(kepala);
    stempel.position.set(0.32, 0.74, -0.14);
    g.add(stempel);
    tabung(0.04, 0.012, new THREE.MeshStandardMaterial({ color: 0x8c2a22, roughness: 0.8 }), 0.34, 0.746, 0.05, g);
    gelasKopi(-0.42, 0.74, 0.18, g);
    momen.rencana = (u) => {
      cap.material.opacity = halus((u - 0.5) / 0.06) * 0.85;
      const tekan = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.4) / 0.2)));
      stempel.position.set(0.32 + (0.06 - 0.32) * tekan, 0.74 + 0.07 * tekan, -0.14 + 0.27 * tekan);
    };
    tambahBayang(-4.5, -1.4, 0.7);
  }

  // ---- 03 bentuk: satu album dalam empat format, tiap format memuat satu layar -------------
  {
    const g = new THREE.Group();
    g.position.set(-4.4, 0, 0.3);
    g.rotation.y = Math.PI / 2 - 0.2;
    // Rak pajang bertingkat dua.
    kotak(1.2, 0.86, 0.44, b.kayu, 0, 0.43, 0, g, 0.01);
    kotak(1.2, 0.3, 0.22, b.kayu, 0, 1.01, -0.11, g, 0.01);
    const format = [];
    const pasang = (geo, mSisi, wajah, x, y, z, miring = -0.12) => {
      const o = new THREE.Group();
      o.add(new THREE.Mesh(geo, mSisi));
      wajah.position.z = geo.parameters.depth / 2 + 0.0008;
      o.add(wajah);
      o.position.set(x, y, z);
      o.rotation.x = miring;
      o.userData.dasar = { y, miring };
      g.add(o);
      format.push(o);
      return o;
    };
    // Piringan hitam: sampul 31 cm, layar sistem kantor sebagai seni sampulnya.
    pasang(new THREE.BoxGeometry(0.31, 0.31, 0.006), b.kertas, layar(0.29, 0.29, "03-format-piringan.webp", 0.85), -0.38, 1.33, -0.12, -0.15);
    // CD jewel case: dashboard distributor di HP.
    pasang(new THREE.BoxGeometry(0.142, 0.125, 0.01), bahan.kaca, layar(0.12, 0.12, "03-format-cd.webp", 0.85), 0.03, 0.96, 0.1);
    // Kaset: alur iklan ke WhatsApp di kartu sampulnya.
    pasang(new THREE.BoxGeometry(0.108, 0.07, 0.017), b.gelap, layar(0.1, 0.064, "03-format-kaset.webp", 0.85), 0.25, 0.92, 0.1);
    // Ponsel: aplikasi sendiri.
    pasang(new THREE.BoxGeometry(0.075, 0.155, 0.008), b.gelap, layar(0.068, 0.145, "03-format-hp.webp", 0.95), 0.43, 0.96, 0.08);
    for (const x of [0.03, 0.25, 0.43]) kotak(0.13, 0.012, 0.08, b.kayuTua, x, 0.866, 0.1, g, 0.003);
    momen.bentuk = (u) =>
      format.forEach((o, i) => {
        // Satu per satu tegak dan terangkat sedikit, seperti diambil untuk dilihat.
        const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.12 - i * 0.18) / 0.3)));
        o.rotation.x = o.userData.dasar.miring * (1 - t);
        o.position.y = o.userData.dasar.y + 0.03 * t;
      });
    grup.add(g);
    tambahBayang(-4.4, 0.3, 0.7);
  }

  // ---- 04 fondasi: rak hi-fi dari belakang, kabel berlabel, kotak listrik di dinding --------
  {
    const g = new THREE.Group();
    g.position.set(-4.05, 0, 1.95);
    g.rotation.y = -Math.PI / 2;
    kotak(0.66, 0.04, 0.48, b.kayu, 0, 0.92, 0, g, 0.008);
    for (const sx of [-0.31, 0.31]) kotak(0.04, 0.92, 0.48, b.kayu, sx, 0.46, 0, g, 0.008);
    kotak(0.62, 0.03, 0.46, b.kayu, 0, 0.015, 0, g);
    const led = [];
    [0.06, 0.32, 0.6].forEach((y) => {
      kotak(0.56, 0.2, 0.4, b.pelat, 0, y + 0.1, 0.01, g, 0.006);
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), new THREE.MeshBasicMaterial({ color: 0x2a221c, toneMapped: false }));
      l.position.set(0.22, y + 0.16, -0.193);
      g.add(l);
      led.push(l);
      for (let j = 0; j < 4; j++) tabung(0.009, 0.012, b.kuningan, -0.2 + j * 0.05, y + 0.08, -0.196, g, 12).rotation.x = Math.PI / 2;
      kotak(0.1, 0.04, 0.004, b.pelat, 0.08, y + 0.14, -0.192, g, 0.002);
    });
    // Kabel turun dalam satu jalur, diikat, dan diberi label kertas.
    for (let j = 0; j < 4; j++) {
      const x = -0.2 + j * 0.05;
      for (const y of [0.06, 0.32, 0.6]) {
        if (j > 1 && y > 0.5) continue;
        const kurva = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, y + 0.08, -0.2),
          new THREE.Vector3(x, y + 0.04, -0.25),
          new THREE.Vector3(-0.26 + j * 0.01, y - 0.02, -0.27),
          new THREE.Vector3(-0.26 + j * 0.01, 0.03, -0.28),
          new THREE.Vector3(-0.26 + j * 0.01, 0.012, -0.62),
        ]);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(kurva, 20, 0.005, 6), b.karet));
      }
      kotak(0.03, 0.016, 0.004, b.kertas, -0.26 + j * 0.01, 0.2, -0.285, g, 0.001).rotation.y = 0.3;
    }
    for (const y of [0.14, 0.3, 0.46]) kotak(0.06, 0.012, 0.03, b.gelap, -0.245, y, -0.28, g, 0.003);
    // Buku manual di atas rak.
    kotak(0.21, 0.025, 0.28, new THREE.MeshStandardMaterial({ color: 0x3f6fa8, roughness: 0.8 }), 0.1, 0.955, 0.02, g, 0.003).rotation.y = 0.2;
    tungguModel.push([
      "power_box_01",
      (m) => {
        m.position.set(-4.97, 1.35, 1.35);
        m.rotation.y = Math.PI / 2;
        m.scale.setScalar(1.1);
        grup.add(m);
        // Pipa kabel dari kotak listrik turun ke lantai di belakang rak.
        tabung(0.012, 1.1, b.logam, -4.96, 0.55, 1.5, grup, 12);
      },
    ]);
    const nyalaLed = new THREE.Color(0x7fe08a).multiplyScalar(3);
    const matiLed = new THREE.Color(0x2a221c);
    momen.fondasi = (u, nyala) => led.forEach((l, i) => l.material.color.copy(i < nyala ? nyalaLed : matiLed));
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
    lampuKecil(4.2, 2.1, -3.4, 0.35);
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
  let darurat;
  {
    tungguModel.push([
      "wooden_stool_01",
      (m) => {
        m.position.set(3.55, 0, -1.6);
        m.rotation.y = 0.4;
        grup.add(m);
      },
    ]);
    const hp = new THREE.Group();
    hp.position.set(3.65, 0.452, -1.52);
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
    darurat = new THREE.PointLight(0xfff1dc, 0, 3, 2);
    darurat.position.set(3.18, 0.25, -1.75);
    grup.add(darurat);
    momen.andal = (u) => {
      const padam = u > 0.42 && u < 0.72;
      strip.material.color.setHex(padam ? 0xffffff : 0x3a3430).multiplyScalar(padam ? 2.2 : 1);
      darurat.intensity = padam ? 2.2 : 0;
    };
    tambahBayang(3.55, -1.6, 0.35);
  }

  // ---- 09 aman: vitrin koleksi langka terkunci, papan kunci berlabel --------------------------
  {
    const g = new THREE.Group();
    g.position.set(0.25, 0.88, 0.2);
    kotak(0.68, 0.045, 0.36, b.kayuTua, 0, 0.0225, 0, g, 0.008);
    const kaca = kotak(0.64, 0.3, 0.32, bahan.kaca, 0, 0.195, 0, g, 0.004);
    kaca.renderOrder = 3;
    kotak(0.68, 0.02, 0.36, b.kayuTua, 0, 0.355, 0, g, 0.006);
    for (const sx of [-0.33, 0.33]) for (const sz of [-0.17, 0.17]) kotak(0.016, 0.3, 0.016, b.kuningan, sx, 0.195, sz, g, 0.004);
    ["#3f6fa8", "#e05a4a", "#d9a441", "#2b2a2e", "#4d8a5c"].forEach((w, i) => {
      kotak(0.125, 0.142, 0.012, new THREE.MeshStandardMaterial({ color: w, roughness: 0.35 }), -0.24 + i * 0.12, 0.12, 0.02, g, 0.002).rotation.x = 0.15;
    });
    const kunci = new THREE.Group();
    kunci.position.set(0, 0.2, -0.168);
    kotak(0.045, 0.055, 0.012, b.kuningan, 0, 0, 0, kunci, 0.006);
    const lubang = kotak(0.008, 0.03, 0.006, b.kuningan, 0, -0.004, -0.01, kunci, 0.002);
    g.add(kunci);
    grup.add(g);
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
    momen.aman = (u) => (lubang.rotation.z = (-Math.PI / 2) * halus((u - 0.38) / 0.12));
  }

  // ---- 10 rilis: tiga kotak CD proyek masuk ke celah rak -------------------------------------
  const kotakRilis = ["coderoach-os", "jeda", "akarkita"].map((slug, i) => {
    const k = new THREE.Group();
    // Kotak berdiri seperti CD lain di rak: sisi tipis menghadap ruangan, sampul ke samping.
    kotak(0.0104, 0.142, 0.125, bahan.kaca, 0, 0, 0, k, 0.002);
    const sampul = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    tekstur(`/assets/ilustrasi/${slug}.webp`, [1, 1]).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      sampul.map = t;
      sampul.needsUpdate = true;
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), sampul);
    s.rotation.y = -Math.PI / 2;
    s.position.x = -0.0056;
    k.add(s);
    k.userData.z = -0.34 + i * 0.012;
    grup.add(k);
    return k;
  });
  momen.rilis = (u) =>
    kotakRilis.forEach((k, i) => {
      const t = halus((u - 0.1 - i * 0.12) / 0.22);
      // Dari udara di depan rak, sampul menghadap kamera, lalu berputar dan meluncur masuk.
      k.position.set(4.8 - 0.65 * (1 - t), 1.52 + 0.071 - 0.22 * (1 - t), k.userData.z + 0.25 * (1 - t) - i * 0.05 * (1 - t));
      k.rotation.set(0, (1 - t) * 1.2, (1 - t) * 0.2);
      k.visible = u > 0.05;
    });
  momen.rilis(0);

  return {
    grup,
    lampu,
    modelDibutuhkan: tungguModel.map(([n]) => n),
    // Model CC0 yang sudah dimuat dunia.js dipasang di sini. `headphone` dipakai ulang di stasiun dengar.
    pasangModel(peta) {
      for (const [n, fn] of tungguModel) if (peta[n]) fn(peta[n]);
      if (peta.headphone && hpStasiun) hpStasiun.add(peta.headphone.clone());
      grup.traverse((o) => {
        if (!o.isMesh) return;
        const m = o.material;
        if (m?.isMeshBasicMaterial || m?.transparent) return;
        o.castShadow = true;
        o.receiveShadow = true;
      });
    },
    perbarui(id, u, s = {}) {
      if (piringan) piringan.rotation.y = s.waktu ? -s.waktu * 3.5 : 0;
      momen[id]?.(u, s.nyala ?? 0);
    },
    berputar: (id) => id === "bangun",
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
