import { APIError } from "payload";

// Akun admin. Masuk dengan username atau email plus sandi (seperti coderoach.id, ADR 0011 di
// sana), atau Google untuk email yang sudah terdaftar di sini (cms/google.js).
export const Users = {
  slug: "users",
  labels: { singular: "Akun", plural: "Akun" },
  admin: { useAsTitle: "email", group: "Sistem" },
  auth: {
    loginWithUsername: { allowEmailLogin: true, requireEmail: true, requireUsername: false },
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" },
  },
  hooks: {
    beforeChange: [
      // Halaman "buat akun pertama" Payload melewati aturan akses selama tabel kosong. Di
      // produksi siapa pun bisa mendahului pemiliknya, jadi akun baru hanya lewat admin yang
      // sudah masuk atau skrip npm run cms:akun.
      ({ operation, req, data }) => {
        if (operation === "create" && !req.user && !req.context?.izinkanAkunBaru) {
          throw new APIError("Akun baru dibuat lewat npm run cms:akun.", 403);
        }
        return data;
      },
    ],
  },
  fields: [{ name: "name", label: "Nama", type: "text" }],
};
