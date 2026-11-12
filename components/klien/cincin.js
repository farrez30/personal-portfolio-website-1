// Bentuk cincin cakram sebagai fungsi murni dari kemajuan gulir, jadi gulir balik memberi
// bingkai yang sama dan bisa dites tanpa browser (tests/klien.test.mjs).
import { cakramDepan } from "../../content/klien.js";

export const MEKAR = 0.18; // bagian awal pin: tumpukan mekar jadi cincin
export const PUTAR = 0.7; // bagian berikutnya: satu putaran penuh
const MIRING = 0.36; // cincin dilihat agak dari atas: cakram belakang naik

const batas = (x) => Math.min(1, Math.max(0, x));
const halus = (x) => 1 - (1 - x) ** 3;

/** Kemajuan 0..1 seksi yang dipin dari kotak seksi dan tinggi layar. */
export function kemajuanSeksi(kotak, tinggiLayar) {
  const jarak = kotak.height - tinggiLayar;
  if (jarak <= 0) return 0;
  return batas(-kotak.top / jarak);
}

/**
 * Posisi tiap cakram untuk kemajuan `p`, `n` cakram, putaran tambahan `geser` (dalam
 * putaran penuh), dan jari-jari `r` piksel. `putaran` = putaran total (0..1 = satu putaran).
 */
export function bentukCincin(p, n, geser, r) {
  const mekar = halus(batas(p / MEKAR));
  const putaran = batas((p - MEKAR) / PUTAR) + geser;
  const depan = cakramDepan(360 * putaran, n);
  const cakram = [];
  for (let i = 0; i < n; i++) {
    const sudut = 2 * Math.PI * (i / n - putaran);
    const z = Math.cos(sudut);
    const dekat = (z + 1) / 2;
    const tumpuk = (1 - mekar) * (n - i) * -4; // sebelum mekar: tumpukan, yang pertama di atas
    cakram.push({
      x: Math.sin(sudut) * r * mekar,
      y: z * r * MIRING * mekar + tumpuk,
      skala: (0.5 + 0.5 * dekat) * (i === depan && mekar > 0.9 ? 1.16 : 1),
      terang: mekar < 1 ? 1 : 0.4 + 0.6 * dekat,
      lapis: mekar < 1 ? 100 + (n - i) : Math.round(dekat * 100),
    });
  }
  return { putaran, depan, cakram };
}
