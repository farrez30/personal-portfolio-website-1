"use client";
import { createContext, useContext, useMemo } from "react";
import { proyek } from "@/content/proyek";
import { KLIEN } from "@/content/klien";
import { situs } from "@/content/situs";

// Isi situs dari server (lib/isi/ambil.js): proyek dan klien yang tampil, urut, dengan teks dari
// CMS. Nilai bawaan = berkas, untuk komponen yang dirender di luar provider.
const Isi = createContext({ proyek, klien: KLIEN, situs });

export default function IsiProvider({ isi, children }) {
  return <Isi.Provider value={isi}>{children}</Isi.Provider>;
}

export function useIsi() {
  const isi = useContext(Isi);
  return useMemo(() => ({ ...isi, cariProyek: (slug) => isi.proyek.find((p) => p.slug === slug) ?? null }), [isi]);
}
