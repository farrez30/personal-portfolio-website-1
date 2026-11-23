// Membuat kode tamu bank gerak untuk satu orang, atau mengganti kodenya (ADR 0028). Kode dibaca
// dari stdin, tidak pernah dari argumen atau log. Dipanggil scripts/cms/kode-bank.ps1, yang
// mengambil kodenya dari Bitwarden.
//   bw get password <id> | node --env-file-if-exists=.env.local scripts/cms/kode-bank.mjs --nama Zidni
import { getPayload } from "payload";
import { kodeLayak } from "../../lib/bank/akses.js";

const i = process.argv.indexOf("--nama");
const nama = i > 0 ? process.argv[i + 1]?.trim() : "";
if (!nama || !process.env.DATABASE_URI) {
  console.error("Perlu --nama dan DATABASE_URI.");
  process.exit(1);
}

let kode = "";
for await (const c of process.stdin) kode += c;
// Buang BOM dan baris baru dari pipe PowerShell 5.1.
kode = kode.replace(/^﻿/, "").replace(/\r?\n$/, "");
const layak = kodeLayak(kode);
if (layak !== true) {
  console.error(`${layak} (dari stdin: ${kode.length} karakter)`);
  process.exit(1);
}

const { default: config } = await import("../../payload.config.js");
const payload = await getPayload({ config: await config });
const opsi = { overrideAccess: true, depth: 0 };
const { docs } = await payload.find({ collection: "kode-bank", where: { nama: { equals: nama } }, limit: 1, ...opsi });

if (docs[0]) {
  await payload.update({ collection: "kode-bank", id: docs[0].id, data: { kode, aktif: true }, ...opsi });
  console.log(`Kode untuk ${nama} diganti dan diaktifkan lagi (panjang ${kode.length}).`);
} else {
  await payload.create({ collection: "kode-bank", data: { nama, kode }, ...opsi });
  console.log(`Kode untuk ${nama} dibuat (panjang ${kode.length}).`);
}
process.exit(0);
