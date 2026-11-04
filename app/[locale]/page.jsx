import { setRequestLocale } from "next-intl/server";
import Gerbang from "@/components/gerbang/Gerbang";
import Rak from "@/components/rak/Rak";
import Contact from "@/components/contact/Contact";
import PanggungMode from "@/components/imersif/PanggungMode";

export default async function Beranda({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Gerbang />
      <Rak />
      <Contact />
      <PanggungMode />
    </>
  );
}
