// Halaman Architecture di buklet: tercetak ilustrasi orang yang memakai aplikasinya,
// dan di atasnya ada "tinta tak terlihat" berisi sistem di balik layar. Tinta itu
// hanya menyala di bawah senter UV yang mengikuti kursor, seperti tanda rahasia
// di uang kertas. Kanvasnya digambar ulang tiap bingkai selama senter menyala.
import * as THREE from "three";
import { gambarArsitektur } from "./gambar";

// Digambar di 1536 px supaya tajam saat buklet mengisi layar; koordinat ditulis
// untuk 1024 lalu dikali S.
const UK = 1536;
const S = UK / 1024;
const KERTAS = "#efe9df";

function fontKeluarga() {
  return getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
}
function fontMono() {
  return getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
}

// Siluet orang sederhana bergaya cetak dua warna; dipakai sampai ilustrasi asli ada.
function siluet(g, x, y, s, alat) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.fillStyle = "#2f3b4a";
  g.beginPath();
  g.arc(0, -150, 34, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(-58, 40);
  g.quadraticCurveTo(-62, -100, 0, -108);
  g.quadraticCurveTo(62, -100, 58, 40);
  g.closePath();
  g.fill();
  g.fillStyle = "#b3322a";
  if (alat === "laptop") g.fillRect(-46, -40, 92, 54);
  else g.fillRect(16, -70, 24, 42);
  g.restore();
}

export function buatHalamanUV(p, locale, ilustrasi) {
  const c = document.createElement("canvas");
  c.width = c.height = UK;
  const g = c.getContext("2d");
  const dasar = document.createElement("canvas");
  dasar.width = dasar.height = UK;
  const gd = dasar.getContext("2d");
  const tinta = gambarArsitektur(
    p.arsitektur,
    { latar: null, garis: "#7dffcf", kotak: "rgba(10,30,24,0.6)", teks: "#d8fff4", aksen: "#d9ff6b", huruf: 30 * S },
    900 * S,
    640 * S,
  );

  const gambarDasar = () => {
    gd.setTransform(1, 0, 0, 1, 0, 0);
    gd.fillStyle = KERTAS;
    gd.fillRect(0, 0, UK, UK);
    gd.setTransform(S, 0, 0, S, 0, 0);
    gd.fillStyle = "#b3322a";
    gd.font = `500 24px ${fontMono()}`;
    gd.textBaseline = "top";
    gd.fillText("ARCHITECTURE", 80, 80);
    gd.fillStyle = "#1d1b19";
    gd.font = `650 44px ${fontKeluarga()}`;
    gd.fillText(p.judul[locale], 80, 120);
    if (ilustrasi?.complete && ilustrasi.naturalWidth) {
      const sk = Math.min(864 / ilustrasi.naturalWidth, 640 / ilustrasi.naturalHeight);
      const w = ilustrasi.naturalWidth * sk;
      const h = ilustrasi.naturalHeight * sk;
      gd.drawImage(ilustrasi, (1024 - w) / 2, 220 + (640 - h) / 2, w, h);
    } else {
      const n = Math.max(3, Math.min(5, p.arsitektur.simpul.length));
      for (let i = 0; i < n; i++) siluet(gd, 180 + i * (664 / (n - 1)), 700, 1.15, i % 2 ? "laptop" : "hp");
    }
    gd.fillStyle = "#6f695f";
    gd.font = `400 20px ${fontMono()}`;
    gd.fillText(`${p.katalog}  ${p.periode}`, 80, 930);
    gd.setTransform(1, 0, 0, 1, 0, 0);
  };
  gambarDasar();
  ilustrasi?.addEventListener?.("load", () => {
    gambarDasar();
    salin();
  });

  const tekstur = new THREE.CanvasTexture(c);
  tekstur.colorSpace = THREE.SRGBColorSpace;

  let titik = null;
  let nyala = 0;
  const lapis = document.createElement("canvas");
  lapis.width = lapis.height = UK;
  const gl = lapis.getContext("2d");
  const salin = () => {
    g.drawImage(dasar, 0, 0);
    tekstur.needsUpdate = true;
  };
  salin();

  return {
    tekstur,
    // u, v dalam 0..1 di halaman, atau null bila senter di luar halaman.
    setTitik(t) {
      titik = t;
    },
    gambar(senter, dt) {
      const tujuan = senter && titik ? 1 : 0;
      const lama = nyala;
      nyala += (tujuan - nyala) * Math.min(1, dt * 8);
      if (lama < 0.002 && nyala < 0.002) return;
      g.drawImage(dasar, 0, 0);
      if (nyala > 0.002 && titik) {
        const x = titik.u * UK;
        const y = titik.v * UK;
        const r = 0.34 * UK;
        // Cahaya ungunya datang dari lampu sorot di adegan; di sini hanya tinta yang
        // berpendar, meluruh seperti Gauss dari titik senter.
        const pudar = (grad, warna, kuat, lebar = 2.2) => {
          for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            grad.addColorStop(t, `rgba(${warna}, ${(kuat * Math.exp(-lebar * t * t) * (1 - t * t)).toFixed(4)})`);
          }
          return grad;
        };
        // Tinta hanya menyala di dalam sorot, meredup halus ke tepinya.
        gl.globalCompositeOperation = "source-over";
        gl.clearRect(0, 0, UK, UK);
        gl.shadowColor = "rgba(125, 255, 207, 0.9)";
        gl.shadowBlur = 14 * S;
        gl.drawImage(tinta, 62 * S, 230 * S);
        gl.shadowBlur = 0;
        gl.globalCompositeOperation = "destination-in";
        gl.fillStyle = pudar(gl.createRadialGradient(x, y, 0, x, y, r), "0, 0, 0", Math.min(1, 1.2 * nyala), 1.4);
        gl.fillRect(0, 0, UK, UK);
        g.drawImage(lapis, 0, 0);
      }
      tekstur.needsUpdate = true;
    },
    dispose() {
      tekstur.dispose();
    },
  };
}
