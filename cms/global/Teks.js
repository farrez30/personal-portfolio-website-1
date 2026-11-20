import messagesId from "../../messages/id.json" with { type: "json" };
import { hanyaAdmin, kaitSegarkan } from "../akses.js";
import { kolomTeks } from "../teks.js";

// Teks UI (messages/*.json), dua bahasa, satu global per bagian situs. Satu global untuk semua
// kunci tidak bisa: Postgres menolak query dengan lebih dari 100 kolom per fungsi, dan teks
// situs punya 187. Kolom kosong memakai teks berkas.
export const slugTeks = (bagian) => `teks-${bagian}`;
export const BAGIAN_TEKS = Object.keys(messagesId);

export const Teks = BAGIAN_TEKS.map((bagian) => ({
  slug: slugTeks(bagian),
  label: `Teks: ${bagian}`,
  access: { read: hanyaAdmin, update: hanyaAdmin },
  hooks: { afterChange: kaitSegarkan.afterChange },
  admin: {
    group: "Teks situs",
    description: "Untuk versi Inggris, ganti Locale di pojok kanan atas ke English. Kolom kosong memakai teks bawaan.",
  },
  fields: kolomTeks(messagesId[bagian], [bagian]),
}));
