import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { proyek, cariProyek } from "@/content/proyek";
import JelajahArsitektur from "@/components/arsitektur/JelajahArsitektur";
import CeritaArsitektur from "@/components/arsitektur/CeritaArsitektur";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => proyek.filter((p) => p.arsitektur).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const p = cariProyek(slug);
  if (!p?.arsitektur) return {};
  const t = await getTranslations({ locale, namespace: "arsitektur" });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}/proyek/${slug}/arsitektur`]));
  return {
    title: `${t("judulHalaman", { judul: p.judul[locale] })}: Farrez Al Hakim`,
    description: p.arsitektur.alur.map((l) => l.judul[locale]).join(", "),
    alternates: { canonical: `/${locale}/proyek/${slug}/arsitektur`, languages },
  };
}

// Satu permintaan pengguna diikuti dari awal sampai akhir, langkah demi langkah.
export default async function HalamanArsitektur({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = cariProyek(slug);
  if (!p?.arsitektur) notFound();
  const t = await getTranslations("arsitektur");

  return (
    <div className="wadah" style={{ paddingBlock: "clamp(2rem, 6vh, 4rem)", maxWidth: "64rem", display: "grid", gap: "2rem" }}>
      <p>
        <Link href={`/proyek/${slug}`} className="tombol">
          {t("kembali", { judul: p.judul[locale] })}
        </Link>
      </p>
      <header style={{ display: "grid", gap: "0.5rem" }}>
        <p className="mono" style={{ color: "var(--ink-3)" }}>
          {p.katalog}
        </p>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>{t("judulHalaman", { judul: p.judul[locale] })}</h1>
        <p style={{ maxWidth: "60ch", color: "var(--ink-2)" }}>{p.ringkas[locale]}</p>
      </header>
      <JelajahArsitektur p={p} />
      <section aria-labelledby="teknologi" style={{ display: "grid", gap: "1rem", borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}>
        <h2 id="teknologi" className="album__label mono">
          {t("teknologi")}
        </h2>
        <CeritaArsitektur p={p} tanpaLangkah tautanDiagram={false} />
      </section>
    </div>
  );
}
