import "../globals.css";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import ThemeScript from "../ThemeScript";
import ThemeProvider from "@/components/providers/ThemeProvider";

// Only the locales returned by generateStaticParams are valid; any other
// first path segment yields Next's built-in 404.
export const dynamicParams = false;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://farrez.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: "meta" });

  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));
  languages["x-default"] = `/${routing.defaultLocale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "Farrez Al Hakim" }],
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      locale,
      url: `/${locale}`,
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
      images: [{ url: `/og/${locale}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`/og/${locale}.png`],
    },
    icons: {
      icon: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params: { locale } }) {
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={poppins.variable} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
