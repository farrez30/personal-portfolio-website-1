// Lingkungan pantul rak: studio gelap dengan empat pita putih lembut. Plastik dan logam baru
// terlihat "nyata" karena memantulkan pita-pita ini, bukan karena warnanya sendiri.
//
// PMREM-nya dipanggang sekali (scripts/panggang-lingkungan.mjs) ke public/assets/rak/lingkungan.webp:
// enam muka kubus berdampingan, tiap tingkat mip satu baris. Dibuat di peramban, PMREMGenerator
// mengompilasi tiga shader secara sinkron saat rak dibuat (terukur sekitar 270 ms beku, 13 Nov 2026).
import * as THREE from "three";

export const PETA_LINGKUNGAN = "/assets/rak/lingkungan.webp";
const SISI = 256;
const TINGKAT = 6; // 256 sampai 8, sama dengan PMREMGenerator three 0.187 (LOD_MIN 3)

export function kanvasLingkungan() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const latar = g.createLinearGradient(0, 0, 0, 512);
  latar.addColorStop(0, "#25282f");
  latar.addColorStop(0.5, "#0e0f13");
  latar.addColorStop(1, "#020203");
  g.fillStyle = latar;
  g.fillRect(0, 0, 1024, 512);
  for (const [y, t, kuat] of [[0.14, 0.07, 1], [0.4, 0.049, 0.6], [0.26, 0.077, 0.85], [0.62, 0.035, 0.35]]) {
    const pita = g.createLinearGradient(0, (y - t) * 512, 0, (y + t) * 512);
    pita.addColorStop(0, "rgba(255,255,255,0)");
    pita.addColorStop(0.5, `rgba(255,255,255,${kuat})`);
    pita.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = pita;
    g.fillRect(0, (y - t) * 512, 1024, 2 * t * 512);
  }
  return c;
}

// Jalur lama, dipakai skrip panggang dan sebagai cadangan bila berkas gagal dimuat.
export function buatLingkungan(renderer) {
  const t = new THREE.CanvasTexture(kanvasLingkungan());
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(t).texture;
  t.dispose();
  pmrem.dispose();
  return env;
}

// Letak satu muka pada satu tingkat di atlas: muka berjajar ke kanan, tingkat bertumpuk ke bawah.
export const letakAtlas = (muka, tingkat) => {
  const s = SISI >> tingkat;
  let y = 0;
  for (let i = 0; i < tingkat; i++) y += SISI >> i;
  return { x: muka * s, y, s };
};
export const UKURAN_ATLAS = { w: 6 * SISI, h: letakAtlas(0, TINGKAT).y };

// Atlas sRGB 8 bit ke tekstur kubus PMREM siap pakai. CompressedCubeTexture dengan RGBAFormat
// diunggah sebagai data biasa, dan mip-nya termasuk tingkat dasar, persis seperti yang dibaca
// shader (ENVMAP_TYPE_PMREM, ENVMAP_MAX_LOD 5, ENVMAP_SIZE 256).
export async function muatLingkungan(url = PETA_LINGKUNGAN) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(bmp, 0, 0);
  bmp.close();
  const muka = [];
  for (let m = 0; m < 6; m++) {
    const mipmaps = [];
    for (let l = 0; l < TINGKAT; l++) {
      const { x, y, s } = letakAtlas(m, l);
      mipmaps.push({ data: new Uint8Array(g.getImageData(x, y, s, s).data.buffer), width: s, height: s });
    }
    muka.push({ width: SISI, height: SISI, mipmaps });
  }
  const t = new THREE.CompressedCubeTexture(muka, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.isPMREMTexture = true;
  t.name = "PMREM";
  t.needsUpdate = true;
  return t;
}
