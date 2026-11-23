// Satu sumber state untuk daftar proyek HTML (ModulLab.jsx) dan loker 3D (DuniaV5 ke adegan.js),
// storyboard-build.md §4: fokus, hover, posisi gulir, loker yang dibuka, jeda gerak (global untuk
// seluruh dunia v5, tombolnya di bilah: TombolJeda.jsx), dan apakah dunia v5 sedang terpasang.
// Tanpa React supaya bisa dites di Node dan dipakai dua komponen yang tidak bersarang.
import { lokerNyala } from "./lab.js";

export const AWAL = { fokus: -1, hover: -1, gulir: 0, buka: -1, jeda: false, dunia: false };

export function buatKendali(awal = AWAL) {
  let state = { ...awal };
  const dengar = new Set();
  return {
    get: () => state,
    // Loker yang menyala: buka > fokus > hover > gulir.
    nyala: () => lokerNyala(state),
    set(sebagian) {
      const baru = { ...state, ...sebagian };
      if (Object.keys(baru).every((k) => baru[k] === state[k])) return;
      state = baru;
      dengar.forEach((f) => f(state));
    },
    dengar(f) {
      dengar.add(f);
      return () => dengar.delete(f);
    },
  };
}

// Satu kendali per halaman (dua komponen di pohon berbeda memakai modul yang sama).
export const kendaliLab = buatKendali();
