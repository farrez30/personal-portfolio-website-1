import { hanyaAdmin, kaitSegarkan } from "../akses.js";
import { tautanHttps } from "../aturan.js";

// Tautan pribadi di gerbang dan seksi kontak (content/situs.js).
export const Situs = {
  slug: "situs",
  label: "Tautan pribadi",
  access: { read: hanyaAdmin, update: hanyaAdmin },
  hooks: { afterChange: kaitSegarkan.afterChange },
  admin: { group: "Isi" },
  fields: [
    { name: "email", type: "email" },
    {
      name: "whatsapp",
      label: "WhatsApp",
      type: "text",
      validate: (v) => (!v || /^62\d{8,13}$/.test(v) ? true : "Tulis dengan kode negara tanpa +, mis. 62812xxxx."),
    },
    { name: "linkedin", label: "LinkedIn", type: "text", validate: tautanHttps },
    { name: "github", label: "GitHub", type: "text", validate: tautanHttps },
    {
      name: "cv",
      label: "Berkas CV",
      type: "text",
      validate: (v) => (!v || /^\/assets\/[\w.-]+\.pdf$/.test(v) ? true : "Jalur PDF di public, mis. /assets/FarrezCV.pdf"),
    },
  ],
};
