import { aksesAdmin, kaitSegarkan, hanyaAdmin } from "../akses.js";
import { tautanHttps, teksProyekAman, warnaHex } from "../aturan.js";

// Album di rak (content/proyek.js). Album baru tetap lewat kode karena butuh sampul, buklet,
// dan adegan 3D; di sini yang disunting teks, tautan, status, tampil, dan urutan.
// Arsitektur dan buklet tetap di kode (aturan ADR 0008 dan audit klaim).
export const Proyek = {
  slug: "proyek",
  labels: { singular: "Proyek", plural: "Proyek" },
  orderable: true,
  access: { ...aksesAdmin, create: () => false, delete: () => false, update: hanyaAdmin },
  hooks: kaitSegarkan,
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "katalog", "tampil", "status"],
    group: "Isi",
    description: "Seret untuk mengubah urutan album di rak. Matikan Tampil untuk menyembunyikan album.",
  },
  fields: [
    { name: "tampil", label: "Tampil di situs", type: "checkbox", defaultValue: true },
    { name: "slug", type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: "katalog", type: "text", admin: { readOnly: true } },
    { name: "judul", type: "text", localized: true, required: true, validate: teksProyekAman },
    { name: "ringkas", label: "Ringkasan", type: "textarea", localized: true, required: true, validate: teksProyekAman },
    {
      name: "jenis",
      type: "select",
      options: [
        { label: "Kerja kantor", value: "kerja" },
        { label: "Studio", value: "studio" },
        { label: "Pribadi", value: "pribadi" },
      ],
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Dipakai", value: "dipakai" },
        { label: "Sedang berjalan", value: "berjalan" },
        { label: "Pilot", value: "pilot" },
      ],
    },
    { name: "periode", type: "text", admin: { description: "Mis. 2026 atau 2023 – 2026." } },
    { name: "warna", label: "Warna sampul", type: "text", validate: warnaHex },
    {
      name: "tautan",
      type: "group",
      admin: { description: "Kosongkan untuk mencabut tautan dari album." },
      fields: [
        { name: "situs", type: "text", validate: tautanHttps },
        { name: "repo", type: "text", validate: tautanHttps },
        { name: "kasus", label: "Studi kasus", type: "text", validate: tautanHttps },
      ],
    },
  ],
};
