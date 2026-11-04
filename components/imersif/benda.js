// Benda-benda 3D: kotak CD, cakram, pemutar top-loader, dan proyektor.
// Ukuran mengikuti benda asli (satu unit sekitar 100 mm). Ditulis sendiri.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { gambarSampul, gambarCakram, gambarSisipan, gambarHalaman } from "./gambar";

export const KOTAK = { w: 1.42, h: 1.25, d: 0.1 };
export const CAKRAM_R = 0.6;
export const BUKLET = 1.2;

export function tekstur(canvas, renderer) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

const plastik = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });

export function buatCakram(p, renderer) {
  const muka = tekstur(gambarCakram(p), renderer);
  muka.center.set(0.5, 0.5);
  muka.rotation = Math.PI / 2;
  const cakram = new THREE.Mesh(new THREE.CylinderGeometry(CAKRAM_R, CAKRAM_R, 0.012, 128), [
    new THREE.MeshStandardMaterial({ color: 0xc9c5bd, metalness: 0.95, roughness: 0.22 }),
    new THREE.MeshStandardMaterial({ map: muka, metalness: 0.25, roughness: 0.38 }),
    new THREE.MeshPhysicalMaterial({
      color: 0xe8e8ea,
      metalness: 1,
      roughness: 0.12,
      iridescence: 0.9,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [200, 700],
    }),
  ]);
  cakram.rotation.x = Math.PI / 2;
  return cakram;
}

// Kotak CD: nampan hitam, sisipan belakang, cakram, engsel, tutup bening dengan
// sampul buklet di dalamnya. Engsel di tepi kiri; tutup berayun ke kiri.
export function buatKotak(p, locale, renderer) {
  const grup = new THREE.Group();
  const isi = new THREE.Group();
  grup.add(isi);

  const sisipan = new THREE.Mesh(
    new THREE.PlaneGeometry(KOTAK.w * 0.98, KOTAK.h * 0.98),
    new THREE.MeshStandardMaterial({ map: tekstur(gambarSisipan(p, locale), renderer), roughness: 0.6 }),
  );
  sisipan.rotation.y = Math.PI;
  sisipan.position.z = -KOTAK.d * 0.5 + 0.002;
  isi.add(sisipan);

  const nampan = new THREE.Mesh(
    new RoundedBoxGeometry(KOTAK.w * 0.96, KOTAK.h * 0.97, KOTAK.d * 0.45, 2, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.55, metalness: 0.1 }),
  );
  nampan.position.z = -KOTAK.d * 0.22;
  isi.add(nampan);

  const dasar = new THREE.Mesh(new THREE.BoxGeometry(KOTAK.w, KOTAK.h, KOTAK.d * 0.5), plastik());
  dasar.position.z = -KOTAK.d * 0.25;
  isi.add(dasar);

  const cakram = buatCakram(p, renderer);
  cakram.position.set(0.05, 0, 0.012);
  isi.add(cakram);

  const engsel = new THREE.Group();
  engsel.position.set(-KOTAK.w / 2, 0, 0.012);
  const tutup = new THREE.Group();
  tutup.position.x = KOTAK.w / 2;
  const sampul = new THREE.Mesh(
    new THREE.PlaneGeometry(BUKLET, BUKLET),
    new THREE.MeshStandardMaterial({ map: tekstur(gambarSampul(p, locale), renderer), roughness: 0.5 }),
  );
  sampul.position.set(0.06, 0, 0.012);
  const belakangBuklet = new THREE.Mesh(
    new THREE.PlaneGeometry(BUKLET, BUKLET),
    new THREE.MeshStandardMaterial({
      map: tekstur(gambarHalaman({ label: p.katalog, catatan: `${p.judul[locale]}  ${p.periode}` }, 512), renderer),
      roughness: 0.7,
    }),
  );
  belakangBuklet.rotation.y = Math.PI;
  belakangBuklet.position.set(0.06, 0, 0.008);
  const lembar = new THREE.Mesh(new THREE.BoxGeometry(KOTAK.w, KOTAK.h, 0.02), plastik());
  lembar.position.z = 0.02;
  tutup.add(sampul, belakangBuklet, lembar);
  engsel.add(tutup);
  grup.add(engsel);

  const tulang = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, KOTAK.h, KOTAK.d),
    new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.4 }),
  );
  tulang.position.set(-KOTAK.w / 2 - 0.015, 0, -0.01);
  grup.add(tulang);

  grup.traverse((o) => {
    if (o.isMesh) o.userData.slug = p.slug;
  });
  cakram.userData.bagian = "cakram";
  return { grup, isi, engsel, cakram, sampul, belakangBuklet };
}

// Layar pemutar: judul berjalan, digambar ulang paling banyak 30 kali per detik.
function layarPemutar(renderer) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d");
  const t = tekstur(c, renderer);
  let teks = "";
  let mulai = 0;
  let lalu = 0;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
  return {
    tekstur: t,
    setel(s, now) {
      teks = s;
      mulai = now;
    },
    gambar(now, nyala) {
      if (now - lalu < 33) return;
      lalu = now;
      g.fillStyle = "#07090a";
      g.fillRect(0, 0, 512, 96);
      if (nyala && teks) {
        g.font = `500 40px ${mono}`;
        g.fillStyle = "#cfe8dc";
        const lebar = g.measureText(teks).width;
        let x = 20;
        if (lebar > 470) {
          // Diam 1,5 detik, berjalan sekali, diam lagi.
          const jalan = (lebar - 450) / 60;
          const siklus = 1.5 + jalan + 1.5;
          const d = ((now - mulai) / 1000) % siklus;
          x = 20 - Math.max(0, Math.min(jalan, d - 1.5)) * 60;
        }
        g.fillText(teks, x, 62);
        g.globalAlpha = 0.18;
        g.fillStyle = "#000";
        for (let y = 0; y < 96; y += 3) g.fillRect(0, y, 512, 1);
        for (let xx = 0; xx < 512; xx += 3) g.fillRect(xx, 0, 1, 96);
        g.globalAlpha = 1;
      }
      t.needsUpdate = true;
    },
  };
}

export function buatPemutar(renderer) {
  const grup = new THREE.Group();
  const grafit = new THREE.MeshPhysicalMaterial({
    color: 0x2a2c2e,
    roughness: 0.32,
    metalness: 0.4,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
  });
  const badan = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.18, 1.5, 4, 0.08), grafit);
  grup.add(badan);
  const sumur = new THREE.Mesh(
    new THREE.CylinderGeometry(0.66, 0.66, 0.02, 96),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.85 }),
  );
  sumur.position.y = 0.081;
  const cincin = new THREE.Mesh(
    new THREE.TorusGeometry(0.665, 0.008, 12, 128),
    new THREE.MeshStandardMaterial({ color: 0x3a3c40, metalness: 1, roughness: 0.25 }),
  );
  cincin.rotation.x = Math.PI / 2;
  cincin.position.y = 0.092;
  const poros = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.04, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.3 }),
  );
  poros.position.y = 0.1;
  grup.add(sumur, cincin, poros);

  const layar = layarPemutar(renderer);
  const muka = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.11),
    new THREE.MeshBasicMaterial({ map: layar.tekstur, toneMapped: false }),
  );
  muka.position.set(-0.22, 0, 0.751);
  grup.add(muka);

  const tombol = ["prev", "play", "pause", "next"].map((nama, i) => {
    const b = new THREE.Mesh(
      new RoundedBoxGeometry(0.1, 0.07, 0.03, 2, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.45, metalness: 0.3 }),
    );
    b.position.set(0.2 + i * 0.13, 0, 0.755);
    b.userData.tombol = nama;
    grup.add(b);
    return b;
  });

  const lampu = new THREE.Mesh(
    new THREE.CircleGeometry(0.012, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0574b, toneMapped: false }),
  );
  lampu.position.set(0.66, 0.05, 0.752);
  grup.add(lampu);

  return { grup, layar, tombol, lampu, puncakY: 0.1 };
}

// Proyektor sci-fi retro: badan krem membulat, sirip, lensa yang menyala.
export function buatProyektor() {
  const grup = new THREE.Group();
  const krem = new THREE.MeshPhysicalMaterial({ color: 0xe6dccb, roughness: 0.45, clearcoat: 0.4 });
  const badan = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.42, 0.6, 5, 0.14), krem);
  grup.add(badan);
  for (let i = 0; i < 5; i++) {
    const sirip = new THREE.Mesh(
      new RoundedBoxGeometry(0.04, 0.3, 0.5, 2, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.5 }),
    );
    sirip.position.set(-0.3 + i * 0.07, 0.23, 0);
    grup.add(sirip);
  }
  const laras = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.17, 0.22, 48),
    new THREE.MeshStandardMaterial({ color: 0x2a2826, metalness: 0.6, roughness: 0.3 }),
  );
  laras.rotation.z = Math.PI / 2;
  laras.position.set(0.52, 0.02, 0);
  const lensa = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 48),
    new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false }),
  );
  lensa.rotation.y = Math.PI / 2;
  lensa.position.set(0.635, 0.02, 0);
  const kaki = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.5 }),
  );
  kaki.position.y = -0.3;
  grup.add(laras, lensa, kaki);
  return { grup, lensa };
}

export { gambarHalaman };
