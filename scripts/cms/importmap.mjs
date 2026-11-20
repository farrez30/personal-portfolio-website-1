// Membuat app/(payload)/admin/importMap.js. Pengganti `payload generate:importmap`, yang gagal di
// Node 26 karena pemuat tsx-nya memuat undici dua kali. Jalankan setelah menambah komponen admin.
import { generateImportMap } from "payload";
import config from "../../payload.config.js";

await generateImportMap(await config, { log: true, force: true });
