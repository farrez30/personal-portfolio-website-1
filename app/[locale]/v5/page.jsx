// Cerita v5 dibangun di rute sendiri sampai semua fasenya lolos (ADR 0026); beranda tetap versi CD.
// F1: seksi HTML dan naskah kamera. F2: lantai kantor 3D (DuniaV5) di belakang seksi yang sama.
// F4 sampai F6: kota, peta, globe, lalu modul lab dengan daftar proyek sebagai pengendalinya.
import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import Contact from "@/components/contact/Contact";
import Klien from "@/components/klien/Klien";
import CeritaV5 from "@/components/stasiun/CeritaV5";
import DuniaV5 from "@/components/stasiun/DuniaV5";
import ModulLab from "@/components/stasiun/ModulLab";

export const metadata = { robots: { index: false, follow: false } };

export default async function BerandaV5({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DuniaV5 />
      <Gerbang />
      <CeritaV5 locale={locale} />
      <ModulLab locale={locale} />
      <Klien />
      <Contact />
    </>
  );
}
