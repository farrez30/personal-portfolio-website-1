import { APIError } from "payload";
import { aksesAdmin } from "../akses.js";
import { kodeLayak, kunciBank, sidikKode } from "../../lib/bank/akses.js";

// Kode tamu untuk katalog /bank (ADR 0028). Satu kode per orang, supaya satu orang bisa dicabut
// tanpa mengganti kode yang lain. Kolom Kode hanya dipakai saat menyimpan: isinya diubah jadi
// sidik lalu dikosongkan, jadi kode yang sudah tersimpan tidak bisa dibaca lagi dari sini.
export const KodeBank = {
  slug: "kode-bank",
  labels: { singular: "Kode bank gerak", plural: "Kode bank gerak" },
  access: aksesAdmin,
  admin: {
    useAsTitle: "nama",
    defaultColumns: ["nama", "aktif", "kedaluwarsa", "terakhirMasuk"],
    group: "Sistem",
    description: "Kode tamu untuk farrez.vercel.app/bank. Matikan Aktif untuk mencabut satu orang. Kode baru dibuat Bitwarden lewat npm run bank:kode -- -Nama <nama>, lalu ditempel di kolom Kode baru",
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const kode = data.kode;
        delete data.kode;
        if (kode) {
          const layak = kodeLayak(kode);
          if (layak !== true) throw new APIError(layak, 400);
          data.sidik = sidikKode(kode, kunciBank(req.payload.secret));
        } else if (operation === "create" && !data.sidik) {
          throw new APIError("Isi kode untuk orang ini.", 400);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "nama", label: "Untuk siapa", type: "text", required: true },
    {
      name: "kode",
      label: "Kode baru",
      type: "text",
      virtual: true,
      admin: { description: "Minimal 12 karakter. Kosongkan bila tidak mengganti kode. Setelah disimpan, kode tidak bisa dilihat lagi." },
    },
    { name: "sidik", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "aktif", label: "Aktif", type: "checkbox", defaultValue: true },
    { name: "kedaluwarsa", label: "Berlaku sampai", type: "date", admin: { description: "Kosongkan bila tidak ada batas." } },
    { name: "terakhirMasuk", label: "Terakhir masuk", type: "date", admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } } },
    { name: "catatan", type: "textarea" },
  ],
};
