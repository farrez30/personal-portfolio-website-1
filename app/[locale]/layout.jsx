import "../globals.css";
import { Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import ThemeScript from "../ThemeScript";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ModeProvider from "@/components/mode/ModeProvider";
import Bilah from "@/components/bilah/Bilah";
import PemutarMusik from "@/components/musik/PemutarMusik";
import GulirHalus from "@/components/gulir/GulirHalus";

export const dynamicParams = false;

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-schibsted",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://farrez.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));
  languages["x-default"] = `/${routing.defaultLocale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "Farrez Al Hakim" }],
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      type: "website",
      locale,
      url: `/${locale}`,
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary", title: t("title"), description: t("description") },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#161514" },
    { media: "(prefers-color-scheme: light)", color: "#f2efe9" },
  ],
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("umum");

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ModeProvider>
              <GulirHalus />
              <a className="lewati" href="#isi">
                {t("lewati")}
              </a>
              <Bilah />
              <main id="isi">{children}</main>
              <PemutarMusik />
            </ModeProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
