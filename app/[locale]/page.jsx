import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import RakSesuaiMode from "@/components/rak/RakSesuaiMode";
import CeritaKerja from "@/components/cerita/CeritaKerja";
import Contact from "@/components/contact/Contact";

export default async function Beranda({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Gerbang />
      <CeritaKerja />
      <RakSesuaiMode />
      <Contact />
    </>
  );
}
