// Migrasi skema CMS tanpa CLI `payload` (pemuat tsx-nya gagal di Node 26, dan pencari config-nya
// hanya membaca tsconfig). Perintahnya sama dengan `payload migrate:*`:
//   npm run cms:migrasi                      jalankan migrasi yang belum (dipakai build Vercel)
//   npm run cms:migrasi -- migrate:create nama
//   npm run cms:migrasi -- migrate:status
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { migrateCLI } from "payload";

const [perintah = "migrate", nama] = process.argv.slice(2);

// Build tanpa DB (preview Vercel, atau DB belum disetel) tetap jalan dengan isi berkas.
if (perintah !== "migrate:create" && !process.env.DATABASE_URI) {
  console.log(`${perintah} dilewati: DATABASE_URI kosong, situs memakai isi berkas.`);
  process.exit(0);
}

const { default: config } = await import("../../payload.config.js");
await migrateCLI({ config: await config, parsedArgs: { _: [perintah, nama].filter(Boolean) } });

// Payload menulis migrasi TypeScript, sedangkan repo ini JS dan Node tidak bisa memuat
// `import { MigrateUpArgs }` tanpa kompilasi. Ubah jadi .js dengan membuang anotasi tipe.
// index.ts hanya dipakai prodMigrations, yang tidak dipakai di sini.
if (perintah === "migrate:create") {
  const dir = new URL("../../cms/migrasi/", import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const asal = new URL(f, dir);
    if (f !== "index.ts") {
      const js = readFileSync(asal, "utf8")
        .replace(/^import \{[^}]*\} from '@payloadcms\/db-postgres'/m, "import { sql } from '@payloadcms/db-postgres'")
        .replace(/: Migrate(Up|Down)Args\)/g, ")")
        .replace(/: Promise<void>/g, "");
      writeFileSync(new URL(f.replace(/\.ts$/, ".js"), dir), js);
    }
    rmSync(asal);
  }
}
process.exit(0);
