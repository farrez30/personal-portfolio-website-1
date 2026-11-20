// Cerita v5 dibangun di rute sendiri sampai semua fasenya lolos (ADR 0026); beranda tetap versi CD.
// F1: seksi HTML dan naskah kamera. F2: lantai kantor 3D (DuniaV5) di belakang seksi yang sama.
// Kota, peta, globe, dan modul lab menyusul di F4 sampai F6.
import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import RakSesuaiMode from "@/components/rak/RakSesuaiMode";
import Contact from "@/components/contact/Contact";
import Klien from "@/components/klien/Klien";
import CeritaV5 from "@/components/stasiun/CeritaV5";
import DuniaV5 from "@/components/stasiun/DuniaV5";

export const metadata = { robots: { index: false, follow: false } };

export default async function BerandaV5({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DuniaV5 />
      <Gerbang />
      <CeritaV5 locale={locale} />
      <section id="modul-lab" aria-label={locale === "en" ? "Projects" : "Proyek"}>
        <RakSesuaiMode />
      </section>
      <Klien />
      <Contact />
    </>
  );
}
