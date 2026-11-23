// Cerita v5 dibangun di rute ini sampai semua fasenya lolos (ADR 0026); sejak 24 Nov 2026 ia jadi
// beranda, jadi alamat lama /v5 (termasuk tautan ?proyek=) dialihkan ke sana.
import { permanentRedirect } from "next/navigation";

export default async function V5({ params, searchParams }) {
  const { locale } = await params;
  const q = new URLSearchParams(await searchParams).toString();
  permanentRedirect(`/${locale}${q ? `?${q}` : ""}`);
}
