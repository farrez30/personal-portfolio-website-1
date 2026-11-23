// Versi rak CD (beranda sampai 24 Nov 2026), dipertahankan utuh di rute arsip ADR 0026.
import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import RakSesuaiMode from "@/components/rak/RakSesuaiMode";
import CeritaKerja from "@/components/cerita/CeritaKerja";
import Contact from "@/components/contact/Contact";
import Klien from "@/components/klien/Klien";
import Dunia from "@/components/dunia/Dunia";
import { ambilIsi } from "@/lib/isi/ambil";

export const metadata = { robots: { index: false, follow: true } };

export default async function BerandaCD({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { situs } = await ambilIsi();

  return (
    <>
      <Dunia />
      <Gerbang cv={situs.cv} />
      <CeritaKerja />
      <RakSesuaiMode />
      <Klien />
      <Contact />
    </>
  );
}
