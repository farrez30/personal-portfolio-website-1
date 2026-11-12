import * as THREE from "three";

// Props tur cerita gulir (ADR 0014, cerita v4): satu benda per babak di toko kaset. Layar produk
// asli tampil sebagai tekstur di permukaan layar benda, bukan ditempel ke foto. `perbarui(id, u)`
// menggerakkan momen tiap babak dari progres gulir di dalam babak itu (0..1).

const LAYAR = "/assets/dunia/layar/";
const halus = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export function buatPropsCerita({ bahan, tekstur, tambahBayang }) {
  const grup = new THREE.Group();
  const lampu = [];
  const momen = {};
  const layar = (w, h, nama) => {
    const m = new THREE.MeshBasicMaterial({ color: 0xd8d2c8, toneMapped: false });
    tekstur(LAYAR + nama, [1, 1]).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      m.map = t;
      m.needsUpdate = true;
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  };
  const kotak = (w, h, d, m, x, y, z, induk = grup) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    induk.add(o);
    return o;
  };
  const kaki = (w, d, tinggi, m, induk, tebal = 0.04) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) kotak(tebal, tinggi, tebal, m, (sx * (w - tebal)) / 2, tinggi / 2, (sz * (d - tebal)) / 2, induk);
  };
  const meja = (w, d, tinggi, m, mAtas = m) => {
    const g = new THREE.Group();
    kotak(w, 0.04, d, mAtas, 0, tinggi - 0.02, 0, g);
    kaki(w - 0.04, d - 0.04, tinggi - 0.04, m, g);
    grup.add(g);
    return g;
  };

  // ---- 01 ide: meja kecil dan laptop dengan rapat Meet -------------------------------------
  {
    const g = meja(0.5, 0.4, 0.62, bahan.kayu);
    g.position.set(2.65, 0, -3.5);
    g.rotation.y = -0.35;
    const laptop = new THREE.Group();
    kotak(0.32, 0.014, 0.22, bahan.gelapMatte, 0, 0.007, 0, laptop);
    const tutup = new THREE.Group();
    tutup.position.set(0, 0.014, -0.11);
    tutup.rotation.x = -0.32;
    kotak(0.32, 0.21, 0.008, bahan.gelapMatte, 0, 0.105, 0, tutup);
    const l = layar(0.3, 0.188, "01-meet.webp");
    l.position.set(0, 0.105, 0.0045);
    tutup.add(l);
    laptop.add(tutup);
    laptop.position.set(0, 0.62, 0.02);
    g.add(laptop);
    tambahBayang(2.65, -3.5, 0.4);
  }

  // ---- 02 rencana: meja tulis, daftar kebutuhan, stempel setuju ---------------------------
  {
    const g = meja(1.1, 0.56, 0.74, bahan.kayu, bahan.mejaAtas);
    g.position.set(-4.55, 0, -1.45);
    g.rotation.y = Math.PI / 2;
    const kertas = layar(0.42, 0.27, "02-kebutuhan.webp");
    kertas.material.color.setHex(0xe8e0d0);
    kertas.rotation.x = -Math.PI / 2;
    kertas.rotation.z = 0.06;
    kertas.position.set(0.05, 0.742, 0.02);
    g.add(kertas);
    // Cap merah yang turun di tengah babak.
    const cap = new THREE.Mesh(new THREE.RingGeometry(0.028, 0.04, 32), new THREE.MeshBasicMaterial({ color: 0xc9443a, transparent: true, opacity: 0, toneMapped: false }));
    cap.rotation.x = -Math.PI / 2;
    cap.position.set(0.19, 0.744, 0.08);
    g.add(cap);
    const stempel = new THREE.Group();
    kotak(0.05, 0.03, 0.05, bahan.gelapMatte, 0, 0.015, 0, stempel);
    kotak(0.022, 0.07, 0.022, bahan.kayu, 0, 0.065, 0, stempel);
    stempel.position.set(0.32, 0.74, -0.12);
    g.add(stempel);
    const pena = kotak(0.14, 0.008, 0.008, bahan.gelapMatte, -0.28, 0.748, 0.1, g);
    pena.rotation.y = 0.5;
    momen.rencana = (u) => {
      const t = Math.min(1, Math.max(0, (u - 0.5) / 0.08));
      cap.material.opacity = t * 0.85;
      // Stempel melompat ke cap, menekan, lalu kembali ke tempatnya.
      const tekan = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.42) / 0.16)));
      stempel.position.set(0.32 + (0.19 - 0.32) * tekan, 0.74 + 0.12 * tekan * (1 - tekan), -0.12 + 0.2 * tekan);
    };
    tambahBayang(-4.55, -1.45, 0.7);
  }

  // ---- 03 bentuk: papan storyboard dengan sketsa yang berubah jadi layar -------------------
  {
    const g = new THREE.Group();
    g.position.set(-4.35, 0, 0.3);
    g.rotation.y = Math.PI / 2 - 0.25;
    for (const sx of [-0.55, 0.55]) {
      const k = kotak(0.04, 1.75, 0.04, bahan.kayu, sx, 0.875, 0, g);
      k.rotation.x = -0.08;
    }
    kotak(1.3, 0.92, 0.03, bahan.gelapMatte, 0, 1.3, 0.06, g);
    kotak(1.3, 0.03, 0.08, bahan.kayu, 0, 0.83, 0.1, g);
    const lembar = [
      { sketsa: "03-sketsa-laptop.webp", layar: "03-layar-laptop.webp", w: 0.62, h: 0.39, x: -0.27, y: 1.36 },
      { sketsa: "03-sketsa-hp.webp", layar: "03-layar-hp.webp", w: 0.22, h: 0.44, x: 0.36, y: 1.34 },
    ].map((s) => {
      const a = layar(s.w, s.h, s.sketsa);
      const b = layar(s.w, s.h, s.layar);
      b.material.transparent = true;
      b.material.opacity = 0;
      a.position.set(s.x, s.y, 0.078);
      b.position.set(s.x, s.y, 0.079);
      g.add(a, b);
      return b;
    });
    momen.bentuk = (u) => lembar.forEach((b, i) => (b.material.opacity = Math.min(1, Math.max(0, (u - 0.35 - i * 0.12) / 0.15))));
    grup.add(g);
    tambahBayang(-4.35, 0.3, 0.6);
  }

  // ---- 04 fondasi: rak hi-fi dari belakang, kabel rapi, lampu menyala bertahap -------------
  {
    const g = new THREE.Group();
    g.position.set(-4.05, 0, 1.95);
    // Muka rak menghadap dinding; kamera melihat panel belakang.
    g.rotation.y = -Math.PI / 2;
    kotak(0.62, 0.04, 0.46, bahan.kayu, 0, 0.9, 0, g);
    for (const sx of [-0.29, 0.29]) kotak(0.04, 0.9, 0.46, bahan.kayu, sx, 0.45, 0, g);
    const led = [];
    [0.14, 0.36, 0.6].forEach((y, i) => {
      kotak(0.54, 0.16, 0.38, bahan.gelapMatte, 0, y + 0.08, 0, g);
      // Panel belakang (sisi -z lokal menghadap kamera): soket dan lampu status.
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2a221c, toneMapped: false }));
      l.position.set(0.2, y + 0.12, -0.195);
      g.add(l);
      led.push(l);
      for (let j = 0; j < 3; j++) kotak(0.022, 0.022, 0.01, bahan.logam, -0.18 + j * 0.06, y + 0.07, -0.193, g);
    });
    // Tiga kabel turun rapi dalam satu jalur, diikat, lalu ke stopkontak di dinding.
    const kabel = new THREE.MeshStandardMaterial({ color: 0x15120f, roughness: 0.6 });
    for (let j = 0; j < 3; j++) {
      const x = -0.18 + j * 0.06;
      const kurva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 0.71, -0.2),
        new THREE.Vector3(x, 0.65, -0.26),
        new THREE.Vector3(-0.24 + j * 0.012, 0.3, -0.27),
        new THREE.Vector3(-0.24 + j * 0.012, 0.03, -0.3),
        new THREE.Vector3(-0.24 + j * 0.012, 0.01, -0.6),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(kurva, 24, 0.006, 6), kabel));
    }
    for (const y of [0.25, 0.45]) kotak(0.05, 0.012, 0.03, bahan.kuningan, -0.23, y, -0.27, g);
    const nyalaLed = new THREE.Color(0x7fe08a);
    const matiLed = new THREE.Color(0x2a221c);
    momen.fondasi = (u, nyala) => led.forEach((l, i) => l.material.color.copy(i < nyala ? nyalaLed : matiLed).multiplyScalar(i < nyala ? 3 : 1));
    grup.add(g);
    tambahBayang(-4.05, 1.95, 0.5);
  }

  // ---- Gondola tengah: tempat turntable (05), stasiun dengar (07), dan vitrin (09) ----------
  {
    const g = new THREE.Group();
    g.position.set(0.1, 0, 0.4);
    kotak(2.4, 0.84, 0.72, bahan.kayu, 0, 0.42, 0, g);
    kotak(2.46, 0.04, 0.78, bahan.mejaAtas, 0, 0.86, 0, g);
    kotak(2.3, 0.08, 0.6, bahan.gelapMatte, 0, 0.04, 0, g);
    grup.add(g);
    tambahBayang(0.1, 0.4, 1.5);
  }

  // ---- 05 bangun: turntable dengan test pressing dan layar rancangan -----------------------
  let piringan;
  {
    const g = new THREE.Group();
    g.position.set(-0.55, 0.88, 0.55);
    g.rotation.y = 0.15;
    kotak(0.46, 0.08, 0.36, bahan.kayu, 0, 0.04, 0, g);
    const piring = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 48), bahan.logam);
    piring.position.set(-0.05, 0.086, 0);
    g.add(piring);
    piringan = new THREE.Group();
    const vinil = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.148, 0.004, 64), new THREE.MeshStandardMaterial({ color: 0x0e0d0d, roughness: 0.28, metalness: 0.2 }));
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.005, 32), new THREE.MeshStandardMaterial({ color: 0xefe8da, roughness: 0.8 }));
    const garis = kotak(0.04, 0.0055, 0.006, new THREE.MeshBasicMaterial({ color: 0x2b2a2e }), 0, 0, 0.012, piringan);
    piringan.add(vinil, label, garis);
    piringan.position.set(-0.05, 0.095, 0);
    g.add(piringan);
    const lengan = new THREE.Group();
    lengan.position.set(0.16, 0.1, -0.12);
    kotak(0.014, 0.014, 0.24, bahan.logam, 0, 0.02, 0.1, lengan);
    lengan.rotation.y = 0.55;
    g.add(lengan);
    grup.add(g);
    // Monitor kecil di sebelahnya, layar rancangan yang bisa dicoba.
    const m = new THREE.Group();
    m.position.set(0.05, 0.88, 0.45);
    m.rotation.y = -0.2;
    kotak(0.12, 0.012, 0.1, bahan.gelapMatte, 0, 0.006, 0, m);
    kotak(0.02, 0.14, 0.02, bahan.gelapMatte, 0, 0.08, -0.02, m);
    kotak(0.48, 0.3, 0.025, bahan.gelapMatte, 0, 0.3, 0, m);
    const l = layar(0.45, 0.28, "05-rancangan.webp");
    l.position.set(0, 0.3, 0.0135);
    m.add(l);
    grup.add(m);
  }

  // ---- 06 progres: meja kerja, dua monitor, lampu meja ---------------------------------------
  {
    const g = meja(1.35, 0.62, 0.74, bahan.gelapMatte, bahan.mejaAtas);
    g.position.set(3.95, 0, -3.45);
    for (const [x, ry, nama] of [
      [-0.32, 0.18, "06-d-day.webp"],
      [0.3, -0.18, "06-coderoach-os.webp"],
    ]) {
      const m = new THREE.Group();
      m.position.set(x, 0.74, -0.05);
      m.rotation.y = ry;
      kotak(0.16, 0.012, 0.12, bahan.gelapMatte, 0, 0.006, 0, m);
      kotak(0.03, 0.2, 0.03, bahan.gelapMatte, 0, 0.1, -0.03, m);
      kotak(0.56, 0.34, 0.03, bahan.gelapMatte, 0, 0.36, 0, m);
      const l = layar(0.53, 0.315, nama);
      l.position.set(0, 0.36, 0.0155);
      m.add(l);
      g.add(m);
    }
    kotak(0.44, 0.015, 0.14, bahan.gelapMatte, 0, 0.75, 0.16, g); // keyboard
    const gelas = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 20), new THREE.MeshStandardMaterial({ color: 0xd9cdb5, roughness: 0.7 }));
    gelas.position.set(-0.55, 0.785, 0.15);
    g.add(gelas);
    // Lampu meja: tiang miring dan kap, plus cahayanya sendiri.
    const lm = new THREE.Group();
    lm.position.set(0.58, 0.74, -0.15);
    kotak(0.1, 0.015, 0.1, bahan.gelapMatte, 0, 0.008, 0, lm);
    const tiang = kotak(0.012, 0.42, 0.012, bahan.logam, 0, 0.21, 0, lm);
    tiang.rotation.z = 0.25;
    const kap = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.1, 20, 1, true), bahan.gelapMatte);
    kap.material = bahan.gelapMatte;
    kap.position.set(-0.1, 0.42, 0.02);
    kap.rotation.z = 0.9;
    lm.add(kap);
    g.add(lm);
    const cahaya = new THREE.PointLight(0xffb46a, 1, 0, 2);
    cahaya.position.set(3.95 + 0.46, 1.1, -3.4);
    cahaya.userData.kuat = 0.9;
    lampu.push(cahaya);
    grup.add(cahaya);
    tambahBayang(3.95, -3.45, 0.9);
  }

  // ---- 07 rapi: stasiun dengar coba, layar sebelum dan sesudah dirapikan --------------------
  {
    const g = new THREE.Group();
    g.position.set(0.85, 0.88, 0.6);
    g.rotation.y = -0.35;
    kotak(0.3, 0.02, 0.2, bahan.gelapMatte, 0, 0.01, 0, g);
    const t = kotak(0.32, 0.22, 0.015, bahan.gelapMatte, 0, 0.16, 0, g);
    t.rotation.x = -0.45;
    const bahanBelah = new THREE.ShaderMaterial({
      uniforms: { tA: { value: null }, tB: { value: null }, uBelah: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      // Garis belah menyapu dari kiri: kiri sudah rapi (A), kanan masih berantakan (B).
      fragmentShader: `varying vec2 vUv; uniform sampler2D tA; uniform sampler2D tB; uniform float uBelah;
        void main() { vec3 a = texture2D(tA, vUv).rgb; vec3 b = texture2D(tB, vUv).rgb * 0.8;
          float garis = 1.0 - smoothstep(0.0, 0.004, abs(vUv.x - uBelah));
          vec3 c = mix(b, a, step(vUv.x, uBelah)); c = mix(c, vec3(0.88, 0.34, 0.29), garis * step(0.001, uBelah) * step(uBelah, 0.999));
          gl_FragColor = vec4(c * 0.85, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    tekstur(LAYAR + "07-rapi.webp", [1, 1]).then((x) => (bahanBelah.uniforms.tA.value = x));
    tekstur(LAYAR + "07-berantakan.webp", [1, 1]).then((x) => (bahanBelah.uniforms.tB.value = x));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), bahanBelah);
    l.position.z = 0.0085;
    t.add(l);
    grup.add(g);
    momen.rapi = (u) => (bahanBelah.uniforms.uBelah.value = Math.min(1, Math.max(0, (u - 0.2) / 0.6)));
  }

  // ---- 08 andal: bangku, pemutar kaset baterai (model dipasang di muat), ponsel Jeda --------
  const bangku = new THREE.Group();
  {
    bangku.position.set(3.55, 0, -1.6);
    kotak(0.38, 0.04, 0.38, bahan.kayu, 0, 0.46, 0, bangku);
    kaki(0.34, 0.34, 0.44, bahan.kayu, bangku, 0.035);
    const hp = new THREE.Group();
    hp.position.set(0.1, 0.48, 0.08);
    hp.rotation.set(-Math.PI / 2, 0, -0.4);
    kotak(0.075, 0.155, 0.008, bahan.gelapMatte, 0, 0, 0, hp);
    const l = layar(0.068, 0.145, "08-jeda.webp");
    l.position.z = 0.0045;
    hp.add(l);
    bangku.add(hp);
    grup.add(bangku);
    tambahBayang(3.55, -1.6, 0.35);
  }

  // ---- 09 aman: vitrin terkunci di sisi belakang gondola -------------------------------------
  let kunci;
  {
    const g = new THREE.Group();
    g.position.set(0.25, 0.88, 0.2);
    kotak(0.66, 0.04, 0.34, bahan.kayu, 0, 0.02, 0, g);
    const kaca = kotak(0.64, 0.3, 0.32, bahan.kaca, 0, 0.19, 0, g);
    kaca.renderOrder = 3;
    kotak(0.66, 0.02, 0.34, bahan.kayu, 0, 0.35, 0, g);
    const warna = [0x3f6fa8, 0xe05a4a, 0xd9a441, 0x2b2a2e, 0x4d8a5c];
    warna.forEach((w, i) => {
      const k = kotak(0.125, 0.142, 0.012, new THREE.MeshStandardMaterial({ color: w, roughness: 0.35 }), -0.24 + i * 0.12, 0.115, 0.02, g);
      k.rotation.x = -0.15;
    });
    kunci = new THREE.Group();
    kunci.position.set(0, 0.2, -0.165);
    kotak(0.04, 0.05, 0.01, bahan.kuningan, 0, 0, 0, kunci);
    const anak = kotak(0.008, 0.035, 0.006, bahan.kuningan, 0, -0.005, -0.01, kunci);
    anak.userData.anak = true;
    g.add(kunci);
    grup.add(g);
    momen.aman = (u) => {
      const t = Math.min(1, Math.max(0, (u - 0.38) / 0.12));
      kunci.children[1].rotation.z = (-Math.PI / 2) * t;
    };
  }

  // ---- 10 rilis: tiga kotak CD masuk ke celah rak ------------------------------------------
  const kotakRilis = [0xe05a4a, 0x3f6fa8, 0xd9a441].map((w, i) => {
    const k = kotak(0.125, 0.142, 0.0104, new THREE.MeshStandardMaterial({ color: w, roughness: 0.3 }), 0, 0, 0);
    k.userData.z = -0.34 + i * 0.012;
    return k;
  });
  momen.rilis = (u) =>
    kotakRilis.forEach((k, i) => {
      const t = halus((u - 0.1 - i * 0.12) / 0.22);
      // Dari udara di depan rak, meluncur masuk ke papan kedua dari atas.
      k.position.set(4.8 - 0.9 * (1 - t), 1.52 + 0.071 + 0.25 * (1 - t), k.userData.z + 0.3 * (1 - t));
      k.rotation.set(0, (1 - t) * 0.8, (1 - t) * 0.3);
      k.visible = u > 0.05;
    });
  momen.rilis(0);

  return {
    grup,
    lampu,
    bangku,
    perbarui(id, u, s = {}) {
      if (piringan) piringan.rotation.y = s.waktu ? -s.waktu * 3.5 : 0;
      momen[id]?.(u, s.nyala ?? 0);
    },
    berputar: (id) => id === "bangun",
  };
}
