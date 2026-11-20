// Teks UI di CMS: kolom global "teks" dibentuk dari struktur messages/id.json, jadi kunci
// baru di berkas langsung muncul di admin. Payload tidak menerima "-" di nama kolom, jadi
// "company-profile" disimpan sebagai "company_profile".

import { placeholderSama } from "./aturan.js";

export const namaKolom = (kunci) => kunci.replace(/-/g, "_");

/** Kolom Payload untuk satu cabang pesan. `dasar` dipakai untuk label, petunjuk, dan validasi. */
export function kolomTeks(dasar, jalur = []) {
  return Object.entries(dasar).map(([kunci, nilai]) => {
    const name = namaKolom(kunci);
    if (nilai && typeof nilai === "object") {
      return { name, label: kunci, type: "group", fields: kolomTeks(nilai, [...jalur, kunci]) };
    }
    return {
      name,
      label: kunci,
      type: String(nilai).length > 70 || String(nilai).includes("\n") ? "textarea" : "text",
      localized: true,
      admin: { description: `Isi berkas: ${String(nilai).slice(0, 120)}` },
      validate: (v) => placeholderSama(v, nilai),
    };
  });
}

/** Pesan dari berkas ditimpa nilai CMS yang tidak kosong, per locale. */
export function gabungPesan(dasar, dariCms) {
  if (!dariCms) return dasar;
  const keluar = {};
  for (const [kunci, nilai] of Object.entries(dasar)) {
    const cms = dariCms[namaKolom(kunci)];
    if (nilai && typeof nilai === "object") keluar[kunci] = gabungPesan(nilai, cms && typeof cms === "object" ? cms : null);
    else keluar[kunci] = typeof cms === "string" && cms.trim() ? cms : nilai;
  }
  return keluar;
}

/** Bentuk data global "teks" untuk satu locale dari isi berkas (dipakai seed). */
export function dataTeks(pesan) {
  return Object.fromEntries(
    Object.entries(pesan).map(([k, v]) => [namaKolom(k), v && typeof v === "object" ? dataTeks(v) : v]),
  );
}
