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
  const galat = PESAN[useSearchParams().get("google")];
  return (
    <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
      {galat && (
        <p role="alert" style={{ margin: 0, color: "var(--theme-error-500)" }}>
          {galat}
        </p>
      )}
      <a className="btn btn--style-secondary btn--size-large" href="/api/google/mulai" style={{ textAlign: "center" }}>
        Masuk dengan Google
      </a>
    </div>
  );
}
