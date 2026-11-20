// Benda modul lab dengan bentuk baru (riset-bentuk-prop.md, lembar look-dev 20 Nov 2026):
// benda keras berbevel 8-15% sisi terpendek, benda ramah 25-50%, bagian yang disentuh tangan 1,5-2x,
// 1 bentuk primer, 2-4 sekunder, 3-8 tersier, sekitar 70% permukaan polos.
// Setiap fungsi menerima THREE, `bahan(warna)` (material toon adegan), dan `tekstur(w, h, gambar)`.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const kotakBulat = (THREE, w, h, d, r, mat, s = 3) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, s, Math.min(r, Math.min(w, h, d) / 2 - 1e-4)), mat);
const taruh = (m, x, y, z, par) => { m.position.set(x, y, z); par.add(m); return m; };

// Layar bergaya penjelasan visual bertahap (designed-to-scale): simpul, panah, paket yang sedang lewat,
// penanda "langkah n dari 6", tombol step. `langkah` 0..5 memilih simpul dan panah yang menyala.
export const SIMPUL = ["Pengguna", "CDN", "Server", "Antrean", "Database", "Cadangan"];
export function gambarDiagram(g, w, h, langkah = 2, judul = "Satu pesanan masuk") {
  g.fillStyle = "#f6efe3"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#2a2836"; g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = "#f6efe3"; g.font = `600 ${Math.round(h * 0.055)}px system-ui`; g.textBaseline = "middle"; g.fillText(judul, w * 0.03, h * 0.06);
  g.font = `600 ${Math.round(h * 0.04)}px ui-monospace, monospace`; g.textAlign = "right"; g.fillText(`LANGKAH ${langkah + 1}/6`, w * 0.97, h * 0.06); g.textAlign = "left";
  const pos = [[0.12, 0.38], [0.36, 0.38], [0.6, 0.38], [0.84, 0.38], [0.6, 0.72], [0.84, 0.72]], sambung = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]];
  g.lineWidth = Math.max(3, w * 0.005);
  sambung.forEach(([a, b], i) => { const nyala = i < langkah; g.strokeStyle = nyala ? "#e0574b" : "#b8b0a4"; g.setLineDash(nyala ? [] : [10, 8]); g.beginPath(); g.moveTo(pos[a][0] * w, pos[a][1] * h); g.lineTo(pos[b][0] * w, pos[b][1] * h); g.stroke(); });
  g.setLineDash([]);
  pos.forEach(([x, y], i) => { const aktif = i === Math.min(langkah, 5), lewat = i < langkah; g.fillStyle = aktif ? "#e0574b" : lewat ? "#b9dcb0" : "#e9e4da"; g.strokeStyle = "#2a2836"; const bw = w * 0.17, bh = h * 0.14; g.beginPath(); g.roundRect(x * w - bw / 2, y * h - bh / 2, bw, bh, bh * 0.25); g.fill(); g.stroke();
    g.fillStyle = aktif ? "#fff" : "#2a2836"; g.font = `600 ${Math.round(h * 0.042)}px system-ui`; g.textAlign = "center"; g.fillText(SIMPUL[i], x * w, y * h); g.textAlign = "left"; });
  if (langkah > 0 && langkah <= sambung.length) { const [a, b] = sambung[langkah - 1], px = (pos[a][0] + pos[b][0]) / 2, py = (pos[a][1] + pos[b][1]) / 2; g.fillStyle = "#f2d27a"; g.strokeStyle = "#2a2836"; g.beginPath(); g.arc(px * w, py * h, h * 0.03, 0, 7); g.fill(); g.stroke(); }
  // tombol mundur, putar, maju
  const by = h * 0.9; ["<", ">", ">|"].forEach((t, i) => { g.fillStyle = i === 1 ? "#2a2836" : "#e9e4da"; g.beginPath(); g.roundRect(w * (0.03 + i * 0.09), by - h * 0.045, w * 0.075, h * 0.09, 8); g.fill(); g.strokeStyle = "#2a2836"; g.stroke(); g.fillStyle = i === 1 ? "#f6efe3" : "#2a2836"; g.font = `700 ${Math.round(h * 0.045)}px ui-monospace, monospace`; g.textAlign = "center"; g.fillText(t, w * (0.0675 + i * 0.09), by); g.textAlign = "left"; });
}

// Tablet prosedur: cangkang tebal, empat bumper sudut, layar tertanam, tali tangan dan kotak Velcro di punggung, cincin tether.
export function tabletProsedur(THREE, bahan, tekstur, { langkah = 2, judul } = {}) {
  const g = new THREE.Group(), W = 0.86, H = 0.62, T = 0.07;
  g.add(kotakBulat(THREE, W, H, T, 0.07, bahan(0x4b4a5c)));
  for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) taruh(kotakBulat(THREE, 0.16, 0.16, T * 1.5, 0.06, bahan(0xf2d27a), 2), (sx * (W - 0.1)) / 2, (sy * (H - 0.1)) / 2, 0, g);
  const kanvas = document.createElement("canvas"); kanvas.width = 960; kanvas.height = 640; const gg = kanvas.getContext("2d"); gambarDiagram(gg, 960, 640, langkah, judul);
  const tex = new THREE.CanvasTexture(kanvas); tex.colorSpace = THREE.SRGBColorSpace;
  const layar = taruh(new THREE.Mesh(new THREE.PlaneGeometry(W * 0.82, H * 0.76), new THREE.MeshBasicMaterial({ map: tex })), 0, 0, T / 2 + 0.002, g); layar.userData.outlineParameters = { visible: false };
  g.userData.layar = { tex, gg, judul };
  g.userData.setLangkah = (n) => { gambarDiagram(gg, 960, 640, n, judul); tex.needsUpdate = true; };
  // punggung: tali dan Velcro
  taruh(kotakBulat(THREE, W * 0.55, 0.11, 0.035, 0.03, bahan(0x847e75), 2), 0, 0.05, -T / 2 - 0.02, g);
  taruh(kotakBulat(THREE, 0.18, 0.12, 0.012, 0.02, bahan(0xd4c7ae), 1), -0.22, -0.16, -T / 2 - 0.006, g);
  const cincin = taruh(new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 20), bahan(0x847e75)), W / 2 + 0.02, H / 2 + 0.02, 0, g); cincin.rotation.x = Math.PI / 2;
  // tombol samping besar dan lampu status
  taruh(kotakBulat(THREE, 0.05, 0.12, 0.05, 0.02, bahan(0xe0574b), 1), W / 2 + 0.02, -0.05, 0, g);
  return g;
}

// Satu rak loker: rangka, 2 x 1 pintu tiap baris, pegangan setengah torus besar, dua kancing, plat label.
export function rakLoker(THREE, bahan, tekstur, { pintu = 2, warna = [], label = [], buka = -1 } = {}) {
  const g = new THREE.Group(), W = 1.05, H = 2.0, D = 0.45;
  taruh(kotakBulat(THREE, W, H, D, 0.08, bahan(0xe9e4da)), 0, 0, 0, g);
  taruh(kotakBulat(THREE, W * 0.96, 0.08, 0.05, 0.02, bahan(0xd9d2c6), 1), 0, 0, D / 2, g); // sekat tengah
  g.userData.pintu = [];
  for (let i = 0; i < pintu; i++) {
    const y = 0.5 - i, p = new THREE.Group(); p.position.set(0, y, D / 2 + 0.01); g.add(p);
    p.add(kotakBulat(THREE, 0.9, 0.82, 0.06, 0.07, bahan(0xf6efe3)));
    taruh(kotakBulat(THREE, 0.9, 0.12, 0.07, 0.04, bahan(warna[i] ?? 0xa9c4ec), 2), 0, 0.33, 0.005, p);
    const pg = taruh(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 20, Math.PI), bahan(0x847e75)), 0, -0.22, 0.04, p); pg.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) { const k = taruh(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 14), bahan(0x4b4a5c)), sx * 0.34, -0.22, 0.04, p); k.rotation.x = Math.PI / 2; }
    if (label[i]) { const t = tekstur(512, 96, (gg, w, h) => { gg.fillStyle = "#fffaf0"; gg.fillRect(0, 0, w, h); gg.fillStyle = "#2a2836"; gg.font = "600 46px system-ui"; gg.textBaseline = "middle"; gg.fillText(label[i], 22, h / 2); }); const pl = taruh(new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.135), new THREE.MeshBasicMaterial({ map: t })), 0, 0.1, 0.032, p); pl.userData.outlineParameters = { visible: false }; }
    if (i === buka) p.position.z += 0.38;
    g.userData.pintu.push(p);
  }
  return g;
}

// Robot: kepala bulat ala TV ramah (radius 35%), layar mata, badan telur, antena, lengan kapsul bersendi, bola kamera.
export function robot(THREE, bahan, tekstur, { mata = "senyum" } = {}) {
  const g = new THREE.Group();
  const kepala = taruh(kotakBulat(THREE, 0.42, 0.34, 0.3, 0.11, bahan(0xf6efe3)), 0, 0.18, 0, g);
  const wajah = tekstur(256, 192, (gg, w, h) => { gg.fillStyle = "#2a2836"; gg.beginPath(); gg.roundRect(0, 0, w, h, 40); gg.fill(); gg.strokeStyle = "#f2d27a"; gg.fillStyle = "#f2d27a"; gg.lineWidth = 12; gg.lineCap = "round";
    if (mata === "senyum") { gg.beginPath(); gg.arc(84, 92, 22, Math.PI, 0); gg.stroke(); gg.beginPath(); gg.arc(172, 92, 22, Math.PI, 0); gg.stroke(); } else { gg.beginPath(); gg.ellipse(84, 90, 14, 24, 0, 0, 7); gg.fill(); gg.beginPath(); gg.ellipse(172, 90, 14, 24, 0, 0, 7); gg.fill(); } });
  const l = taruh(new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), new THREE.MeshBasicMaterial({ map: wajah, transparent: true })), 0, 0.18, 0.152, g); l.userData.outlineParameters = { visible: false };
  const profil = [[0, -0.32], [0.12, -0.3], [0.17, -0.2], [0.16, -0.08], [0.11, 0.0], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profil, 22), bahan(0xd9d2c6)));
  taruh(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), bahan(0x847e75)), 0, 0.42, 0, g);
  taruh(new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), bahan(0xe0574b)), 0, 0.5, 0, g);
  taruh(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), bahan(0x4b4a5c)), 0.14, 0.03, 0.12, g);
  for (const sx of [-1, 1]) { taruh(new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), bahan(0x847e75)), sx * 0.19, -0.08, 0, g); const t = taruh(new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), bahan(0xf6efe3)), sx * 0.24, -0.17, 0.02, g); t.rotation.z = sx * 0.4; }
  return g;
}

// Astronot: helm besar (sekitar 45% tinggi), visor, cincin leher tebal, badan kapsul gemuk, ransel, tangan dan sepatu besar, patch bahu.
export function astronot(THREE, bahan, tekstur) {
  const g = new THREE.Group(), putih = bahan(0xf6efe3);
  taruh(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.28, 6, 14), putih), 0, -0.12, 0, g);
  taruh(new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 16), putih), 0, 0.33, 0, g);
  const visor = taruh(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), bahan(0xf2b8a0)), 0, 0.34, 0.08, g); visor.scale.set(1.05, 0.78, 0.7);
  const leher = taruh(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 24), bahan(0xa9c4ec)), 0, 0.14, 0, g); leher.rotation.x = Math.PI / 2;
  taruh(kotakBulat(THREE, 0.3, 0.36, 0.14, 0.06, bahan(0xd9d2c6)), 0, 0.0, -0.2, g);
  for (const sx of [-1, 1]) { const t = taruh(new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.2, 4, 10), putih), sx * 0.26, -0.05, 0.02, g); t.rotation.z = sx * 0.55; taruh(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), bahan(0xd9d2c6)), sx * 0.35, -0.16, 0.05, g);
    taruh(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.12, 4, 10), putih), sx * 0.1, -0.45, 0, g); taruh(kotakBulat(THREE, 0.14, 0.08, 0.2, 0.035, bahan(0x847e75), 2), sx * 0.1, -0.56, 0.03, g); }
  const pb = taruh(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 20), bahan(0xe0574b)), 0.21, 0.02, 0.03, g); pb.rotation.z = Math.PI / 2;
  return g;
}

// Patch misi: badan pipih, tepi bordir torus tebal, isi datar dari tekstur.
export function patch(THREE, bahan, peta, r = 0.16) {
  const g = new THREE.Group();
  const badan = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.09, 40), bahan(0xf6efe3)); badan.rotation.x = Math.PI / 2; g.add(badan);
  const muka = taruh(new THREE.Mesh(new THREE.CircleGeometry(r * 0.93, 40), new THREE.MeshBasicMaterial({ map: peta })), 0, 0, r * 0.046, g); muka.userData.outlineParameters = { visible: false };
  taruh(new THREE.Mesh(new THREE.TorusGeometry(r * 0.97, r * 0.075, 8, 40), bahan(0x2a2836)), 0, 0, r * 0.03, g);
  return g;
}

// Konsol kokpit: bezel tebal, tudung anti-silau miring, deret tombol besar, lengan dudukan. Layar berisi peta tekstur.
export function konsol(THREE, bahan, peta, { W = 1.6, H = 1.0 } = {}) {
  const g = new THREE.Group();
  g.add(kotakBulat(THREE, W + 0.2, H + 0.2, 0.12, 0.08, bahan(0x2a2836)));
  const isi = taruh(new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: peta })), 0, 0, 0.062, g); isi.userData.outlineParameters = { visible: false };
  const tudung = taruh(kotakBulat(THREE, W + 0.26, 0.06, 0.28, 0.025, bahan(0x4b4a5c), 2), 0, H / 2 + 0.12, 0.1, g); tudung.rotation.x = 0.22;
  taruh(kotakBulat(THREE, W * 0.8, 0.22, 0.42, 0.06, bahan(0x4b4a5c)), 0, -H / 2 - 0.25, 0.2, g);
  [0xe0574b, 0xf2d27a, 0xb9dcb0, 0xa9c4ec, 0xf6efe3].forEach((c, i) => taruh(kotakBulat(THREE, 0.13, 0.07, 0.13, 0.03, bahan(c), 2), -0.5 + i * 0.25, -H / 2 - 0.12, 0.3, g));
  return { g, isi };
}
