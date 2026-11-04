import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { proyek, cariProyek } from "@/content/proyek";
import AlbumIsi from "@/components/album/AlbumIsi";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => proyek.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const p = cariProyek(slug);
  if (!p) return {};
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}/proyek/${slug}`]));
  return {
    title: `${p.judul[locale]}: Farrez Al Hakim`,
    description: p.ringkas[locale],
    alternates: { canonical: `/${locale}/proyek/${slug}`, languages },
  };
}

// Halaman per proyek: tautan yang bisa dibagikan, dibaca Google, dan sama isinya
// dengan album di rak.
export default async function HalamanProyek({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = cariProyek(slug);
  if (!p) notFound();
  const t = await getTranslations("album");

  return (
    <div className="wadah" style={{ paddingBlock: "clamp(2rem, 6vh, 4rem)", maxWidth: "52rem" }}>
      <p style={{ marginBottom: "2rem" }}>
        <Link href="/#rak" className="tombol">
          {t("kembali")}
        </Link>
      </p>
      <AlbumIsi p={p} judulSebagai="h1" />
    </div>
  );
}
