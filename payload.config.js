import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { Users } from "./cms/koleksi/Users.js";
import { Klien } from "./cms/koleksi/Klien.js";
import { Proyek } from "./cms/koleksi/Proyek.js";
import { KodeBank } from "./cms/koleksi/KodeBank.js";
import { Situs } from "./cms/global/Situs.js";
import { Teks } from "./cms/global/Teks.js";

// CMS portofolio di /admin (ADR 0026), tumpukan yang sama dengan coderoach.id.
const dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URI && !process.env.PAYLOAD_SECRET) {
  throw new Error("PAYLOAD_SECRET wajib diisi di produksi.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: " · Portofolio Farrez" },
    components: {
      providers: ["/components/admin/PasswordReveal.jsx"],
      afterLogin: ["/components/admin/MasukGoogle.jsx"],
    },
  },
  collections: [Proyek, Klien, Users, KodeBank],
  globals: [Situs, ...Teks],
  localization: {
    locales: [
      { code: "id", label: "Indonesia" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "id",
    fallback: false,
  },
  graphQL: { disable: true },
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Skema hanya lewat migrasi (npm run cms:migrasi), juga saat dev, supaya skrip yang
    // diarahkan ke DB produksi tidak pernah mendorong skema sendiri.
    push: false,
    migrationDir: path.resolve(dirname, "cms/migrasi"),
  }),
  telemetry: false,
});
