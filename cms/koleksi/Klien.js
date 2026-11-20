import messagesId from "../../messages/id.json" with { type: "json" };
import { proyek } from "../../content/proyek.js";
import { aksesAdmin, kaitSegarkan } from "../akses.js";
import { jalurAset, slugValid, tautanKlien } from "../aturan.js";

const KELOMPOK = [
  { label: "Coderoach", value: "coderoach" },
  { label: "Mitraplus", value: "mitraplus" },
  { label: "Proyek pribadi", value: "pribadi" },
];

// Seksi klien versi CD dan cerita v5 (content/klien.js). Urutan diatur dengan menyeret baris.
export const Klien = {
  slug: "klien",
  labels: { singular: "Klien", plural: "Klien" },
  orderable: true,
  access: aksesAdmin,
  hooks: kaitSegarkan,
  admin: {
    useAsTitle: "nama",
    defaultColumns: ["nama", "kelompok", "tampil", "tahun"],
    group: "Isi",
    description: "Seret untuk mengubah urutan. Matikan Tampil untuk menyembunyikan klien dari situs.",
  },
  fields: [
    { name: "tampil", label: "Tampil di situs", type: "checkbox", defaultValue: true },
    { name: "nama", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: slugValid,
      admin: { description: "Dipakai di nama berkas cakram dan tautan. Jangan diganti setelah tayang." },
    },
    { name: "kelompok", type: "select", required: true, options: KELOMPOK },
    {
      name: "induk",
      label: "Box set induk",
      type: "text",
      validate: (v) => (v ? slugValid(v) : true),
      admin: { description: "Slug klien induk bila klien ini satu merek di dalam box set, mis. masaya-food." },
    },
    { name: "tahun", label: "Tahun mulai", type: "number", min: 2015, max: 2100 },
    { name: "industri", type: "text", localized: true, required: true },
    {
      name: "kerja",
      label: "Pekerjaan",
      type: "textarea",
      localized: true,
      admin: { description: "Fakta tentang produknya. Kosongkan untuk proyek pribadi supaya ikut ringkasan albumnya." },
      validate: (v, { siblingData }) =>
        v || siblingData?.kelompok === "pribadi" ? true : "Klien studio dan kantor perlu keterangan pekerjaan.",
    },
    {
      name: "jenis",
      label: "Jenis kerja",
      type: "select",
      hasMany: true,
      options: Object.entries(messagesId.klien.jenis).map(([value, label]) => ({ label, value })),
    },
    { name: "tautan", label: "Studi kasus", type: "text", validate: tautanKlien },
    {
      name: "cakram",
      label: "Gambar cakram",
      type: "text",
      required: true,
      validate: jalurAset,
      admin: { description: "Berkas di public, asalnya dicatat di public/assets/klien/cakram/PROVENANCE.md." },
    },
    {
      // Teks, bukan pilihan: album baru di kode tidak perlu migrasi skema.
      name: "album",
      label: "Album di rak",
      type: "text",
      validate: (v) => (!v || proyek.some((p) => p.slug === v) ? true : `Slug album tidak dikenal. Pilihan: ${proyek.map((p) => p.slug).join(", ")}.`),
      admin: { description: "Untuk proyek pribadi: slug album yang dibuka kartu klien ini, mis. fifofun." },
    },
  ],
};
