// Kota cerita v5 (F4) sebagai mesh three.js. Data dari kota.js; di sini semua benda diam digabung
// jadi satu geometri berwarna titik (satu draw call per pass), plus dua InstancedMesh yang bergerak:
// mobil di jalan inti dan titik pesanan amber yang terbang ke gedung klien. Pohon memakai ikosahedron
// tanpa pembagian dengan normal halus: dari ratusan meter bentuknya tetap bulat dan garis tinta
// tidak muncul di sisi dalamnya (anggaran segitiga kota di lembar look-dev).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { susunKota, kulitGedung, dataMobil, posisiMobil, jumlahTampak, posisiPesan, pesanTampak, MOBIL, PESAN } from "./kota.js";

// Geometri cetakan non-indexed (ukuran 1), lalu digandakan per benda: digeser dan diskalakan,
// normal ikut skala tak seragam (dibagi skala, lalu dinormalkan).
function cetakan(g, halus = false) {
  const n = g.index ? g.toNonIndexed() : g;
  if (halus) {
    const p = n.attributes.position;
    const nm = n.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).normalize();
      nm.setXYZ(i, v.x, v.y, v.z);
    }
  }
  return { pos: n.attributes.position.array, nor: n.attributes.normal.array };
}

function gandakan(c, data, ubah) {
  const per = c.pos.length;
  const pos = new Float32Array(per * data.length);
  const nor = new Float32Array(per * data.length);
  const war = new Float32Array(per * data.length);
  const w = new THREE.Color();
  data.forEach((d, k) => {
    const { t, s, warna } = ubah(d);
    w.set(warna);
    const o = k * per;
    for (let i = 0; i < per; i += 3) {
      pos[o + i] = c.pos[i] * s[0] + t[0];
      pos[o + i + 1] = c.pos[i + 1] * s[1] + t[1];
      pos[o + i + 2] = c.pos[i + 2] * s[2] + t[2];
      const nx = c.nor[i] / s[0];
      const ny = c.nor[i + 1] / s[1];
      const nz = c.nor[i + 2] / s[2];
      const j = Math.hypot(nx, ny, nz) || 1;
      nor[o + i] = nx / j;
      nor[o + i + 1] = ny / j;
      nor[o + i + 2] = nz / j;
      war[o + i] = w.r;
      war[o + i + 1] = w.g;
      war[o + i + 2] = w.b;
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.BufferAttribute(war, 3));
  return g;
}

// Pita datar (jalan, sungai, tol) dari garis tengah: dua segitiga per ruas, normal ke atas.
function pita({ titik, lebar, y, warna }) {
  const pos = [];
  for (let i = 0; i + 1 < titik.length; i++) {
    const [a, b] = [titik[i], titik[i + 1]];
    const d = [b[0] - a[0], b[1] - a[1]];
    const j = Math.hypot(...d);
    const n = [(-d[1] / j) * (lebar / 2), (d[0] / j) * (lebar / 2)];
    const q = [[a[0] + n[0], a[1] + n[1]], [a[0] - n[0], a[1] - n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]]];
    for (const k of [0, 2, 1, 1, 2, 3]) pos.push(q[k][0], y, q[k][1]);
  }
  return datar(pos, warna);
}
function datar(pos, warna) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const n = pos.length / 3;
  const w = new THREE.Color(warna);
  g.setAttribute("normal", new THREE.Float32BufferAttribute(new Array(n).fill([0, 1, 0]).flat(), 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(new Array(n).fill([w.r, w.g, w.b]).flat(), 3));
  return g;
}

export function buatKota({ bahanToon, bahanPesan, hp }) {
  const k = susunKota();
  const kotak = cetakan(new THREE.BoxGeometry(1, 1, 1));
  const limas = new THREE.ConeGeometry(0.72, 1, 4);
  limas.rotateY(Math.PI / 4);
  const atap = cetakan(limas);
  const bola = cetakan(new THREE.IcosahedronGeometry(0.5, 0), true);
  const bagian = [
    gandakan(kotak, k.kotak, ([x, y, z, sx, sy, sz, warna]) => ({ t: [x, y, z], s: [sx, sy, sz], warna })),
    gandakan(atap, k.atap, ([x, y, z, sx, sy, sz, warna]) => ({ t: [x, y, z], s: [sx, sy, sz], warna })),
    gandakan(bola, k.pohon, ([x, y, z, d, warna]) => ({ t: [x, y, z], s: [d, d, d], warna })),
    ...k.pita.map(pita),
  ];
  // petak sawah: yang pertama tanah seluas cakrawala, sisanya sedikit di atasnya
  const petak = [];
  k.petak.forEach(([x, z, w, d], i) => {
    const y = i ? -3.58 : -3.6;
    petak.push(x - w / 2, y, z - d / 2, x - w / 2, y, z + d / 2, x + w / 2, y, z - d / 2, x + w / 2, y, z - d / 2, x - w / 2, y, z + d / 2, x + w / 2, y, z + d / 2);
  });
  const tanah = datar(petak, 0xffffff);
  const warnaTanah = tanah.attributes.color;
  const w = new THREE.Color();
  k.petak.forEach(([, , , , c], i) => {
    w.set(c);
    for (let v = 0; v < 6; v++) warnaTanah.setXYZ(i * 6 + v, w.r, w.g, w.b);
  });
  bagian.push(tanah);
  const { bawah, atas } = kulitGedung();
  const benda = (daftar) =>
    gandakan(kotak, daftar, (o) => ({ t: o.m.slice(12, 15), s: o.ukuran, warna: o.warna }));
  bagian.push(benda(bawah));

  const diam = new THREE.Mesh(mergeGeometries(bagian), bahanToon);
  bagian.forEach((g) => g.dispose());
  diam.name = "kota";

  // Pelat di atas kantor, lantai 3, dan atap: disembunyikan selama kamera di dalam gedung.
  const kulitAtas = new THREE.Mesh(benda(atas), bahanToon);
  kulitAtas.name = "kulit-atas";


  // Mobil: kotak putih berwarna instance (warna titik putih dikali warna instance).
  const nMobil = hp ? MOBIL.jumlah / 2 : MOBIL.jumlah;
  // badan bawah dan kabin di atasnya, tinggi total tetap MOBIL.ukuran[1]
  const [pj, tg, lb] = MOBIL.ukuran;
  const badan = new THREE.BoxGeometry(pj, tg * 0.55, lb).translate(0, -tg * 0.225, 0);
  const kabin = new THREE.BoxGeometry(pj * 0.55, tg * 0.45, lb * 0.9).translate(-pj * 0.08, tg * 0.275, 0);
  const gMobil = mergeGeometries([badan.toNonIndexed(), kabin.toNonIndexed()]);
  gMobil.setAttribute("color", new THREE.Float32BufferAttribute(new Array(gMobil.attributes.position.count * 3).fill(1), 3));
  const mobil = new THREE.InstancedMesh(gMobil, bahanToon, nMobil);
  mobil.name = "mobil";
  // batas bola instance tidak dihitung ulang tiap bingkai; kota hanya digambar saat terlihat
  mobil.frustumCulled = false;
  const dMobil = Array.from({ length: nMobil }, (_, j) => dataMobil(j));
  dMobil.forEach((m, j) => mobil.setColorAt(j, w.set(m.warna)));


  const nPesan = hp ? PESAN.jumlah / 2 : PESAN.jumlah;
  const pesan = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(PESAN.jari, 0), bahanPesan, nPesan);
  pesan.name = "pesan";
  pesan.frustumCulled = false;


  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sumbuY = new THREE.Vector3(0, 1, 0);
  const v = new THREE.Vector3();
  const satu = new THREE.Vector3(1, 1, 1);
  const nol = new THREE.Vector3(0, 0, 0);
  // Lalu lintas dan pesanan pada waktu t detik dengan kepadatan 0..1.
  const atur = (t, padat) => {
    const tampak = jumlahTampak(nMobil, padat);
    dMobil.forEach((m, j) => {
      const p = posisiMobil(m, t);
      q.setFromAxisAngle(sumbuY, p.ry);
      m4.compose(v.set(...p.posisi), q, j < tampak ? satu : nol);
      mobil.setMatrixAt(j, m4);
    });
    mobil.instanceMatrix.needsUpdate = true;
    const np = pesanTampak(nPesan, padat);
    q.identity();
    for (let j = 0; j < nPesan; j++) {
      m4.compose(v.set(...posisiPesan(j, t)), q, j < np ? satu : nol);
      pesan.setMatrixAt(j, m4);
    }
    pesan.instanceMatrix.needsUpdate = true;
  };
  atur(0, 0.35);
  return { mesh: [diam, kulitAtas, mobil, pesan], diam, kulitAtas, mobil, pesan, atur };
}
