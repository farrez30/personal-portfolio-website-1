// Beranda: cerita v5 "yang ditimbang" (ADR 0019, 0026). Teks babak tetap HTML hasil server; dunia 3D
// (DuniaV5) di belakangnya hanya di mode Imersif. Versi rak CD sebelumnya ada di /arsip/cd.
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Gerbang from "@/components/gerbang/Gerbang";
import Contact from "@/components/contact/Contact";
import Klien from "@/components/klien/Klien";
import CeritaV5 from "@/components/stasiun/CeritaV5";
import DuniaV5 from "@/components/stasiun/DuniaV5";
import ModulLab from "@/components/stasiun/ModulLab";
import { ambilIsi } from "@/lib/isi/ambil";

const ARSIP = { id: "Versi lama: rak CD", en: "Previous version: the CD rack" };

export default async function Beranda({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { situs } = await ambilIsi();

  return (
    <>
      <DuniaV5 />
      <Gerbang cv={situs.cv} proyek="#modul-lab" />
      <CeritaV5 locale={locale} />
      <ModulLab locale={locale} />
      <Klien />
      <Contact />
      <p className="wadah mono arsip-cd">
        <Link href="/arsip/cd">{ARSIP[locale] ?? ARSIP.en}</Link>
      </p>
    </>
  );
}
