import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import RakSesuaiMode from "@/components/rak/RakSesuaiMode";
import Contact from "@/components/contact/Contact";

export default async function Beranda({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Gerbang />
      <RakSesuaiMode />
      <Contact />
    </>
  );
}
