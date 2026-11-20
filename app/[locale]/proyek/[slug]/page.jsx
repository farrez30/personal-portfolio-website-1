import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { proyek } from "@/content/proyek";
import { ambilIsi } from "@/lib/isi/ambil";
import AlbumIsi from "@/components/album/AlbumIsi";

// Proyek yang disembunyikan di CMS jadi 404 (ADR 0026).
const cariProyek = async (slug) => (await ambilIsi()).proyek.find((p) => p.slug === slug) ?? null;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => proyek.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const p = await cariProyek(slug);
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
  const p = await cariProyek(slug);
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
