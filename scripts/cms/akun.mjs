// Membuat akun admin CMS, atau mengganti sandinya. Sandi dibaca dari stdin, tidak pernah dari
// argumen atau log. Dipanggil scripts/cms/akun.ps1, yang mengambil sandi dari Bitwarden.
//   bw get password <id> | node --env-file-if-exists=.env.local scripts/cms/akun.mjs --email a@b.c --username farrez
import { getPayload } from "payload";

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const email = arg("email")?.trim().toLowerCase();
const username = arg("username")?.trim().toLowerCase();
if (!email || !process.env.DATABASE_URI) {
  console.error("Perlu --email dan DATABASE_URI.");
  process.exit(1);
}

let sandi = "";
for await (const c of process.stdin) sandi += c;
// Buang BOM dan baris baru dari pipe PowerShell 5.1.
sandi = sandi.replace(/^\uFEFF/, "").replace(/\r?\n$/, "");
if (sandi.length < 12) {
  console.error(`Sandi dari stdin terlalu pendek (${sandi.length} karakter).`);
  process.exit(1);
}

const { default: config } = await import("../../payload.config.js");
const payload = await getPayload({ config: await config });
const opsi = { overrideAccess: true, depth: 0, context: { izinkanAkunBaru: true } };
const { docs } = await payload.find({ collection: "users", where: { email: { equals: email } }, limit: 1, ...opsi });

if (docs[0]) {
  await payload.update({ collection: "users", id: docs[0].id, data: { password: sandi, ...(username && { username }) }, ...opsi });
  console.log(`Sandi akun ${email} diganti (panjang ${sandi.length}).`);
} else {
  await payload.create({ collection: "users", data: { email, username, password: sandi, name: "Farrez" }, ...opsi });
  console.log(`Akun ${email} dibuat (sandi ${sandi.length} karakter).`);
}
process.exit(0);
