import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import HubLab from "@/components/lab/HubLab";
import { TEKS_HUB } from "@/content/lab";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}/lab`]));
  return {
    title: "System Design Lab: Farrez Al Hakim",
    description: TEKS_HUB.intro[locale],
    alternates: { canonical: `/${locale}/lab`, languages },
  };
}

// Hub System Design Lab (ADR 0027): satu loker per eksperimen. Halaman eksperimennya sendiri
// disajikan zona Vercel repo masing-masing.
export default async function HalamanLab({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HubLab locale={locale} />;
}
