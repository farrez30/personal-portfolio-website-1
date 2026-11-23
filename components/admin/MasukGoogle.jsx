"use client";

import { useSearchParams } from "next/navigation";

// Tombol di bawah form masuk Payload. Galat dari /api/google/balik dikirim lewat ?google=.
const PESAN = {
  "belum-disetel": "Masuk dengan Google belum disetel di server. Pakai username dan sandi dulu.",
  ditolak: "Email Google itu belum punya akun di sini.",
  gagal: "Masuk dengan Google gagal. Coba lagi.",
  terkunci: "Akun ini dikunci 15 menit karena sandi salah terlalu sering.",
};

export default function MasukGoogle() {
  const sp = useSearchParams();
  const galat = PESAN[sp.get("google")];
  // ?redirect= milik form Payload ikut dibawa, jadi "Sign in as Farrez" dari /bank kembali ke /bank.
  const ke = sp.get("redirect");
  const href = ke ? `/api/google/mulai?ke=${encodeURIComponent(ke)}` : "/api/google/mulai";
  return (
    <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
      {galat && (
        <p role="alert" style={{ margin: 0, color: "var(--theme-error-500)" }}>
          {galat}
        </p>
      )}
      <a className="btn btn--style-secondary btn--size-large" href={href} style={{ textAlign: "center" }}>
        Masuk dengan Google
      </a>
    </div>
  );
}
