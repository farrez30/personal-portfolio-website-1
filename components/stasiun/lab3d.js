// Adegan three.js modul lab (F6) dari data lab.js: dua modul dan node sebagai satu mesh gabungan,
// semua pintu loker satu mesh (loker yang dibuka digeser lewat rentang titiknya, jadi pass normal
// untuk garis tinta ikut bergeser), label loker satu atlas, lampu loker satu mesh berwarna per titik.
// Bentuk ikut riset-bentuk-prop.md (benda keras berbevel, pegangan besar, robot dan astronot
// berkepala besar), warna dari lembar look-dev v5. Tanpa bayangan: ramp toon memberi bentuk.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { susunLab, pusatModul, MODUL, NODE, PALKA, RAK, PINTU, MUKA_RAK, PERALATAN, JENDELA_LAB, TARIK, RUANG } from "./lab.js";

const MERAH = 0xe0574b;
const LAMPU_MATI = new THREE.Color(0x3a3a48);
const LAMPU_NYALA = new THREE.Color(0x8fe39c);

// Geometri berwarna per titik, siap digabung (non-indexed, tanpa uv kecuali diminta).
function warnai(g, warna, uv = false) {
  g = g.index ? g.toNonIndexed() : g;
  if (!uv) g.deleteAttribute("uv");
  const w = new THREE.Color(warna);
  const c = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < c.length; i += 3) c.set([w.r, w.g, w.b], i);
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return g;
}
// Kotak berbevel dibangun sekali per ukuran lalu disalin: 14 pintu dan 7 rak memakai ukuran yang
// sama, dan membangun RoundedBoxGeometry berulang memakan sebagian besar waktu bangun modul.
const cetakan = new Map();
const kotak = (w, h, d, bevel = 0, seg = 1) => {
  const kunci = `${w}|${h}|${d}|${bevel}|${seg}`;
  if (!cetakan.has(kunci)) {
    const g = bevel > 0 ? new RoundedBoxGeometry(w, h, d, seg, Math.min(bevel, Math.min(w, h, d) / 2 - 1e-4)) : new THREE.BoxGeometry(w, h, d);
    cetakan.set(kunci, g.toNonIndexed());
    g.dispose();
  }
  return cetakan.get(kunci).clone();
};
// Pelat tipis tegak lurus sumbu `sumbu` ("x" atau "z") dengan lubang bulat.
function pelatBerlubang(lebar, tinggi, tebal, lubang, sumbu) {
  const s = new THREE.Shape();
  s.moveTo(-lebar / 2, -tinggi / 2);
  s.lineTo(lebar / 2, -tinggi / 2);
  s.lineTo(lebar / 2, tinggi / 2);
  s.lineTo(-lebar / 2, tinggi / 2);
  s.closePath();
  for (const [x, y, r] of lubang) {
    const h = new THREE.Path();
    h.absarc(x, y, r, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: tebal, bevelEnabled: false, curveSegments: 28 });
  g.translate(0, 0, -tebal / 2);
  if (sumbu === "x") g.rotateY(Math.PI / 2);
  return g;
}

function kanvas(w, h, gambar) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  gambar(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Robot kecil berwajah layar di rel plafon (benda.js previs, disederhanakan jadi satu geometri).
function geoRobot() {
  const b = [];
  const taruh = (g, warna, x, y, z, rx = 0, rz = 0) => b.push(warnai(g.rotateX(rx).rotateZ(rz).translate(x, y, z), warna));
  taruh(kotak(0.42, 0.34, 0.3, 0.11), 0xf6efe3, 0, 0.18, 0);
  taruh(kotak(0.32, 0.22, 0.02, 0.008), 0x2a2836, 0, 0.18, 0.148);
  for (const sx of [-1, 1]) taruh(new THREE.CapsuleGeometry(0.018, 0.05, 3, 8), 0xf2d27a, sx * 0.07, 0.19, 0.16, 0, Math.PI / 2);
  const profil = [[0, -0.32], [0.12, -0.3], [0.17, -0.2], [0.16, -0.08], [0.11, 0], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
  taruh(new THREE.LatheGeometry(profil, 18), 0xd9d2c6, 0, 0, 0);
  taruh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), 0x847e75, 0, 0.42, 0);
  taruh(new THREE.SphereGeometry(0.035, 10, 8), MERAH, 0, 0.5, 0);
  taruh(new THREE.SphereGeometry(0.05, 10, 8), 0x4b4a5c, 0.14, 0.03, 0.12);
  for (const sx of [-1, 1]) {
    taruh(new THREE.SphereGeometry(0.04, 10, 8), 0x847e75, sx * 0.19, -0.08, 0);
    taruh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), 0xf6efe3, sx * 0.24, -0.17, 0.02, 0, sx * 0.4);
  }
  // gantungan ke rel plafon
  taruh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), 0x847e75, 0, 0.6, 0);
  const g = mergeGeometries(b);
  b.forEach((x) => x.dispose());
  return g;
}

// Astronot: helm besar, visor, cincin leher, ransel, sepatu besar, patch bahu merah.
function geoAstronot() {
  const b = [];
  const taruh = (g, warna, x, y, z, rz = 0) => b.push(warnai(g.rotateZ(rz).translate(x, y, z), warna));
  taruh(new THREE.CapsuleGeometry(0.2, 0.28, 4, 12), 0xf6efe3, 0, -0.12, 0);
  taruh(new THREE.SphereGeometry(0.21, 16, 10), 0xf6efe3, 0, 0.33, 0);
  taruh(new THREE.SphereGeometry(0.16, 14, 9).scale(1.05, 0.78, 0.7), 0xf2b8a0, 0, 0.34, 0.08);
  taruh(new THREE.TorusGeometry(0.15, 0.04, 8, 20).rotateX(Math.PI / 2), 0xa9c4ec, 0, 0.14, 0);
  taruh(kotak(0.3, 0.36, 0.14, 0.06), 0xd9d2c6, 0, 0, -0.2);
  for (const sx of [-1, 1]) {
    taruh(new THREE.CapsuleGeometry(0.065, 0.2, 4, 8), 0xf6efe3, sx * 0.26, -0.05, 0.02, sx * 0.55);
    taruh(new THREE.SphereGeometry(0.07, 10, 8), 0xd9d2c6, sx * 0.35, -0.16, 0.05);
    taruh(new THREE.CapsuleGeometry(0.075, 0.12, 4, 8), 0xf6efe3, sx * 0.1, -0.45, 0);
    taruh(kotak(0.14, 0.08, 0.2, 0.035), 0x847e75, sx * 0.1, -0.56, 0.03);
  }
  taruh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16), MERAH, 0.21, 0.02, 0.03, Math.PI / 2);
  const g = mergeGeometries(b);
  b.forEach((x) => x.dispose());
  return g;
}

// `daftar`: [{ slug, judul (teks bahasa aktif), warna }] urut seperti daftar HTML; `kontak`: judul loker kontak.
// Dibangun bertahap: generator berhenti sesudah kulit modul dan sesudah pintu, supaya adegan.js
// bisa menyicil pembangunan di beberapa callback senggang (bangunLabBertahap). buatLab
// menjalankannya sekaligus untuk saat modul dibutuhkan seketika.
export function buatLab(opsi) {
  const g = langkahLab(opsi);
  let r = g.next();
  while (!r.done) r = g.next();
  return r.value;
}
export async function bangunLabBertahap(opsi, jeda) {
  const g = langkahLab(opsi);
  let r = g.next();
  while (!r.done) {
    await jeda();
    r = g.next();
  }
  return r.value;
}
function* langkahLab({ ramp, daftar, kontak: judulKontak = "", arsip: judulArsip = "" }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfc7b8);
  const tanpaTepi = (scene.userData.tanpaTepi = []);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xcabfae, 1.35));
  const kunci = new THREE.DirectionalLight(0xfff4e4, 0.85);
  kunci.position.set(-2, 6, 4);
  scene.add(kunci);
  const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: ramp, ...o });
  const bahanToon = toon({ vertexColors: true });

  const S = susunLab(daftar);
  const geo = [];
  const pasang = (g, warna, x, y, z) => geo.push(warnai(g.translate(x, y, z), warna));

  // ---- Kulit dalam: dua modul, node, sekat berpalka -----------------------------------------
  const [y0, y1] = RUANG.y;
  const [z0, z1] = RUANG.z;
  const tinggi = y1 - y0;
  const ruas = [];
  for (let m = 0; m < S.modul; m++) ruas.push({ x: pusatModul(m), p: MODUL.panjang, m });
  for (let m = 0; m + 1 < S.modul; m++) ruas.push({ x: (NODE[0] + NODE[1]) / 2 + pusatModul(m), p: NODE[1] - NODE[0], node: true });
  for (const r of ruas) {
    pasang(kotak(r.p, 0.08, tinggi), r.node ? 0xcfc7b8 : 0xd9d2c6, r.x, y0 - 0.04, 0);
    pasang(kotak(r.p, 0.08, tinggi), 0xe9e4da, r.x, y1 + 0.04, 0);
    pasang(kotak(r.p, tinggi, 0.06), 0xcfc7b8, r.x, 0, z0 - 0.06);
    if (r.m === 0) {
      // dinding jendela dengan lubang bulat untuk kaca
      const [jx, jy] = JENDELA_LAB.pusat;
      geo.push(warnai(pelatBerlubang(r.p, tinggi, 0.06, [[jx - r.x, jy, JENDELA_LAB.r + 0.03]], "z").translate(r.x, 0, z1 + 0.06), 0xd9d2c6));
      geo.push(warnai(new THREE.TorusGeometry(JENDELA_LAB.r + 0.04, 0.07, 8, 32).translate(jx, jy, z1 + 0.01), 0x4b4a5c));
    } else pasang(kotak(r.p, tinggi, 0.06), r.node ? 0xcfc7b8 : 0xd9d2c6, r.x, 0, z1 + 0.06);
    if (r.node) {
      // port node kosong di plafon dan dek: tempat modul berikutnya berlabuh
      for (const sy of [-1, 1]) geo.push(warnai(new THREE.TorusGeometry(0.55, 0.05, 8, 28).rotateX(Math.PI / 2).translate(r.x, sy * (y1 - 0.02), 0), 0xf2d27a));
      continue;
    }
    // pegangan tangan kuning di empat sudut lorong, lampu plafon di tengah
    for (const [py, pz] of [[0.98, -0.98], [0.98, 0.98], [-0.98, -0.98], [-0.98, 0.98]]) geo.push(warnai(new THREE.CylinderGeometry(0.03, 0.03, r.p - 0.5, 8).rotateZ(Math.PI / 2).translate(r.x, py, pz), 0xf2d27a));
    // rel plafon robot di modul pertama
    if (r.m === 0) geo.push(warnai(new THREE.CylinderGeometry(0.025, 0.025, r.p - 0.6, 8).rotateZ(Math.PI / 2).translate(r.x, y1 - 0.08, 0.78), 0x847e75));
  }
  yield;
  const sekat = new Set();
  for (let m = 0; m < S.modul; m++) for (const sx of [-1, 1]) sekat.add(+(pusatModul(m) + (sx * MODUL.panjang) / 2).toFixed(3));
  const ujung = [Math.min(...sekat), Math.max(...sekat)];
  for (const x of sekat) {
    geo.push(warnai(pelatBerlubang(tinggi, tinggi, 0.08, [[0, 0, PALKA.r]], "x").translate(x, 0, 0), 0xcfc7b8));
    geo.push(warnai(new THREE.TorusGeometry(PALKA.r, 0.06, 8, 32).rotateY(Math.PI / 2).translate(x, 0, 0), 0x847e75));
    // ujung lorong: palka tertutup (port yang belum dipakai)
    if (ujung.includes(x)) geo.push(warnai(new THREE.CylinderGeometry(PALKA.r, PALKA.r, 0.04, 28).rotateZ(Math.PI / 2).translate(x, 0, 0), 0xbdb5a8));
  }
  yield;
  // rak peralatan di dinding jendela, layar gelap kecil dan lampu status
  for (let m = 0; m < S.modul; m++)
    for (const dx of PERALATAN.letak) {
      const x = pusatModul(m) + dx;
      if (m === 0 && Math.abs(x - JENDELA_LAB.pusat[0]) < 0.9) continue;
      const zp = z1 - PERALATAN.dalam / 2;
      pasang(kotak(PERALATAN.lebar, PERALATAN.tinggi, PERALATAN.dalam, 0.05), 0xbdb5a8, x, 0, zp);
      pasang(kotak(0.6, 0.35, 0.02, 0.01), 0x2a2836, x, 0.45, z1 - PERALATAN.dalam - 0.005);
      pasang(kotak(0.2, 0.06, 0.02), dx > 0 ? 0xb9dcb0 : 0xf2d27a, x - 0.25, -0.2, z1 - PERALATAN.dalam - 0.005);
    }
  yield;
  // rangka rak loker (diam)
  for (const r of S.rak) {
    pasang(kotak(RAK.lebar, RAK.tinggi, RAK.dalam, 0.08, 2), 0xe9e4da, r.x, 0, RAK.z);
    pasang(kotak(RAK.lebar * 0.96, 0.08, 0.05, 0.02), 0xd9d2c6, r.x, 0, MUKA_RAK);
  }
  const kulit = new THREE.Mesh(mergeGeometries(geo), bahanToon);
  geo.forEach((g) => g.dispose());
  kulit.name = "modul";
  scene.add(kulit);

  yield;
  // ---- Pintu, label, lampu loker -------------------------------------------------------------
  const n = S.loker.length;
  const kolom = 2;
  const baris = Math.ceil(n / kolom);
  const atlas = kanvas(1024, baris * 96, (g) => {
    g.fillStyle = "#fffaf0";
    g.fillRect(0, 0, 1024, baris * 96);
    S.loker.forEach((l, i) => {
      const [x, y] = [(i % kolom) * 512, Math.floor(i / kolom) * 96];
      if (l.kontak) {
        g.fillStyle = "#e0574b";
        g.fillRect(x, y, 512, 96);
      }
      g.fillStyle = l.kontak ? "#fffaf0" : "#2a2836";
      g.textBaseline = "middle";
      g.font = "700 38px ui-monospace, monospace";
      g.fillText(l.label, x + 20, y + 48);
      // satu kali ukur di 38 px lalu diskalakan supaya muat 340 px (mengganti font berulang mahal di HP)
      const judul = l.jenis === "kontak" ? judulKontak : l.jenis === "arsip" ? judulArsip : daftar[i].judul;
      g.font = "600 38px system-ui, sans-serif";
      const lebar = g.measureText(judul).width;
      if (lebar > 340) g.font = `600 ${Math.max(20, Math.floor((38 * 340) / lebar))}px system-ui, sans-serif`;
      g.fillText(judul, x + 156, y + 50);
    });
  });
  // atlas label (14 teks kanvas) potongan sendiri: di HP CPU 4x bersama empat pintu 195 ms
  yield;
  const gPintu = [];
  const gLabel = [];
  const gLampu = [];
  const rentang = { pintu: [], label: [], lampu: [] };
  let jumlah = { pintu: 0, label: 0, lampu: 0 };
  const catat = (jenis, daftarGeo, i, g) => {
    rentang[jenis][i] = [jumlah[jenis], g.attributes.position.count];
    jumlah[jenis] += g.attributes.position.count;
    daftarGeo.push(g);
  };
  for (const l of S.loker) {
    // HP: satu jeda tiap empat loker (lembar ukur F6: dua potongan 468 dan 612 ms di CPU 4x)
    if (l.i && l.i % 4 === 0) yield;
    const [x, y, z] = l.pusat;
    // loker arsip: strip hitam seperti label piringan hitam rak CD lama
    const warna = l.kontak ? MERAH : l.jenis === "arsip" ? 0x2a2836 : new THREE.Color(daftar[l.i]?.warna ?? "#a9c4ec").getHex();
    const bagian = [];
    const t = (g, w) => bagian.push(warnai(g.translate(x, y, z), w));
    t(kotak(PINTU.lebar, PINTU.tinggi, PINTU.tebal, 0.07, 2), 0xf6efe3);
    t(kotak(PINTU.lebar - 0.04, 0.12, PINTU.tebal + 0.01).translate(0, 0.33, 0.005), warna);
    // pegangan tegak di sisi kanan dan satu kait: dua kancing sejajar pegangan mendatar terbaca
    // sebagai wajah tersenyum (lembar kontak F6 putaran 1)
    t(new THREE.TorusGeometry(0.11, 0.025, 6, 10, Math.PI).rotateX(Math.PI / 2).rotateZ(-Math.PI / 2).translate(0.32, -0.12, 0.04), 0x847e75);
    t(kotak(0.1, 0.05, 0.03).translate(-0.33, -0.3, 0.035), 0x4b4a5c);
    // baki di balik pintu, tersembunyi di dalam rak saat loker tertutup
    t(kotak(0.86, 0.04, 0.4).translate(0, -0.36, -0.23), 0xd9d2c6);
    const gp = mergeGeometries(bagian);
    bagian.forEach((g) => g.dispose());
    catat("pintu", gPintu, l.i, gp);
    const pl = new THREE.PlaneGeometry(0.72, 0.135).translate(x, y + 0.1, z + PINTU.tebal / 2 + 0.003);
    const uv = pl.attributes.uv;
    const [u0, v0] = [(l.i % kolom) / kolom, 1 - (Math.floor(l.i / kolom) + 1) / baris];
    for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / kolom, v0 + uv.getY(k) / baris);
    catat("label", gLabel, l.i, warnai(pl, 0xffffff, true));
    catat("lampu", gLampu, l.i, warnai(new THREE.CircleGeometry(0.055, 16).translate(x + 0.32, y + 0.22, z + PINTU.tebal / 2 + 0.004), LAMPU_MATI));
  }
  yield;
  const pintu = new THREE.Mesh(mergeGeometries(gPintu), bahanToon);
  const label = new THREE.Mesh(mergeGeometries(gLabel), new THREE.MeshBasicMaterial({ map: atlas }));
  const lampu = new THREE.Mesh(mergeGeometries(gLampu), new THREE.MeshBasicMaterial({ vertexColors: true }));
  [...gPintu, ...gLabel, ...gLampu].forEach((g) => g.dispose());
  pintu.name = "pintu";
  label.name = "label";
  lampu.name = "lampu";
  scene.add(pintu, label, lampu);
  tanpaTepi.push(label, lampu);
  const asli = { pintu: pintu.geometry.attributes.position.array.slice(), label: label.geometry.attributes.position.array.slice(), lampu: lampu.geometry.attributes.position.array.slice() };
  const mesh = { pintu, label, lampu };

  yield;
  // Lembar cetak biru menyembul tiga perempat dari loker kontak (keputusan Farrez 20 Nov).
  const kontak = S.loker[n - 1];
  const cetak = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.44),
    new THREE.MeshBasicMaterial({
      map: kanvas(256, 182, (g, w, h) => {
        g.fillStyle = "#2f5e9e";
        g.fillRect(0, 0, w, h);
        g.strokeStyle = "rgba(255,255,255,0.35)";
        g.lineWidth = 1;
        for (let x = 0; x < w; x += 16) g.strokeRect(x, 0, 0, h);
        for (let y = 0; y < h; y += 16) g.strokeRect(0, y, w, 0);
        g.strokeStyle = "#f6efe3";
        g.lineWidth = 3;
        [[30, 40], [100, 40], [170, 40], [100, 110]].forEach(([x, y]) => g.strokeRect(x, y, 56, 36));
        g.beginPath();
        g.moveTo(86, 58);
        g.lineTo(100, 58);
        g.moveTo(156, 58);
        g.lineTo(170, 58);
        g.moveTo(128, 76);
        g.lineTo(128, 110);
        g.stroke();
      }),
      side: THREE.DoubleSide,
    }),
  );
  cetak.position.set(kontak.pusat[0] + 0.04, kontak.pusat[1] + 0.34, kontak.pusat[2] + 0.05);
  cetak.rotation.set(-0.5, 0.08, 0.06);
  cetak.name = "cetak";
  scene.add(cetak);
  tanpaTepi.push(cetak);

  // ---- Kaca jendela dari dalam: bumi malam di tepi bawah --------------------------------------
  const kaca = new THREE.Mesh(
    new THREE.CircleGeometry(JENDELA_LAB.r + 0.03, 32),
    new THREE.MeshBasicMaterial({
      map: kanvas(256, 256, (g, w, h) => {
        g.fillStyle = "#121a30";
        g.fillRect(0, 0, w, h);
        const r = g.createRadialGradient(w / 2, h * 2.1, h * 1.2, w / 2, h * 2.1, h * 1.75);
        r.addColorStop(0, "#22325c");
        r.addColorStop(0.9, "#3d5a9a");
        r.addColorStop(1, "rgba(120,160,230,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#f2d27a";
        for (let i = 0; i < 26; i++) g.fillRect((i * 97) % w, h * 0.82 + ((i * 37) % 40), 2, 2);
        g.fillStyle = "#fff1d6";
        for (let i = 0; i < 18; i++) g.fillRect((i * 53) % w, (i * 71) % (h * 0.6), 1.5, 1.5);
      }),
    }),
  );
  kaca.position.set(JENDELA_LAB.pusat[0], JENDELA_LAB.pusat[1], RUANG.z[1] + 0.02);
  kaca.rotation.y = Math.PI;
  kaca.name = "kaca";
  scene.add(kaca);
  tanpaTepi.push(kaca);

  // ---- Lampu plafon bernapas -------------------------------------------------------------------
  const gStrip = [];
  for (let m = 0; m < S.modul; m++) for (const dx of [-3, -1, 1, 3]) gStrip.push(new THREE.BoxGeometry(1.2, 0.02, 0.3).translate(pusatModul(m) + dx, y1 - 0.01, 0));
  const strip = new THREE.Mesh(mergeGeometries(gStrip), new THREE.MeshBasicMaterial({ color: 0xfffaf0 }));
  gStrip.forEach((g) => g.dispose());
  strip.name = "lampu-plafon";
  scene.add(strip);
  tanpaTepi.push(strip);

  yield;
  // ---- Gerak latar: robot di rel plafon, astronot di ceruk rak kosong, tas kargo tertambat ------
  const robot = new THREE.Mesh(geoRobot(), bahanToon);
  robot.name = "robot";
  robot.scale.setScalar(0.7);
  const astro = new THREE.Mesh(geoAstronot(), bahanToon);
  astro.name = "astronot";
  astro.scale.setScalar(1.05);
  // ceruk rak kosong di modul terakhir (tanpa loker pengisi), atau di node bila semua ceruk terisi
  const sisa = S.modul * 4 - S.rak.length;
  // di node bila semua ceruk terisi: dekat palka masuk, jauh dari tas kargo di tengah node
  const xAstro = sisa > 0 ? pusatModul(S.modul - 1) + 1.8 : NODE[0] + 0.65;
  const bagTas = [warnai(kotak(0.44, 0.26, 0.34, 0.06), 0xece4d2), warnai(kotak(0.46, 0.05, 0.36, 0.02).translate(0, 0.02, 0), 0x9fb3e0)];
  const tas = new THREE.Mesh(mergeGeometries(bagTas), bahanToon);
  bagTas.forEach((g) => g.dispose());
  tas.name = "tas";
  const xTas = S.modul > 1 ? (NODE[0] + NODE[1]) / 2 : 2.6;
  const tali = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(xTas, y1, -0.7), new THREE.Vector3(xTas, 0.86, -0.7)]), new THREE.LineBasicMaterial({ color: 0x847e75 }));
  scene.add(robot, astro, tas, tali);
  tanpaTepi.push(tali);

  const atur = (d) => {
    const w = d * 0.11;
    robot.position.set(-2.4 + 5.2 * (0.5 - 0.5 * Math.cos(w)), y1 - 0.42, 0.78);
    robot.rotation.set(0, Math.PI + 0.6 * Math.sin(w), Math.sin(d * 2.2) * 0.04);
    astro.position.set(xAstro, 0.02 + Math.sin(d * 0.7) * 0.05, -0.62);
    astro.rotation.set(0.12, -0.5 + Math.sin(d * 0.12) * 0.4, Math.sin(d * 0.5) * 0.1);
    tas.position.set(xTas, 0.72 + Math.sin(d * 0.9) * 0.04, -0.7);
    tas.rotation.set(0, Math.sin(d * 0.3) * 0.2, Math.sin(d * 0.6) * 0.08);
    strip.material.color.setScalar(0.9 + 0.1 * Math.sin(d * 0.8));
  };
  atur(0);

  // ---- Lampu loker: memudar ke sasaran dalam 0,2 s ---------------------------------------------
  const nilaiNyala = new Float32Array(n);
  let sasaranNyala = -1;
  const warnaLampu = lampu.geometry.attributes.color;
  const c = new THREE.Color();
  const tulisLampu = (i) => {
    c.copy(LAMPU_MATI).lerp(LAMPU_NYALA, nilaiNyala[i]);
    const [a, k] = rentang.lampu[i];
    for (let j = a; j < a + k; j++) warnaLampu.setXYZ(j, c.r, c.g, c.b);
    warnaLampu.needsUpdate = true;
  };
  // Kembali true bila masih memudar (adegan perlu digambar lagi).
  const nyala = (i, dt, langsung = false) => {
    sasaranNyala = i;
    let jalan = false;
    for (let j = 0; j < n; j++) {
      const s = j === i ? 1 : 0;
      if (nilaiNyala[j] === s) continue;
      nilaiNyala[j] = langsung ? s : s > nilaiNyala[j] ? Math.min(s, nilaiNyala[j] + dt / 0.2) : Math.max(s, nilaiNyala[j] - dt / 0.2);
      tulisLampu(j);
      jalan = true;
    }
    return jalan;
  };

  // ---- Loker meluncur keluar --------------------------------------------------------------------
  let tarikan = { i: -1, u: 0 };
  const geser = (i, dz) => {
    for (const jenis of ["pintu", "label", "lampu"]) {
      const pos = mesh[jenis].geometry.attributes.position;
      const [a, k] = rentang[jenis][i];
      for (let j = a; j < a + k; j++) pos.array[j * 3 + 2] = asli[jenis][j * 3 + 2] + dz;
      pos.addUpdateRange(a * 3, k * 3);
      pos.needsUpdate = true;
    }
  };
  const tarik = (i, u) => {
    if (tarikan.i === i && tarikan.u === u) return false;
    if (tarikan.i >= 0 && tarikan.i !== i) geser(tarikan.i, 0);
    if (i >= 0) geser(i, TARIK * u);
    tarikan = { i, u };
    return true;
  };

  return { scene, susunan: S, atur, nyala, tarik, get nyalaKini() {
    return sasaranNyala;
  } };
}
