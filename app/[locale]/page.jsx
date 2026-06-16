import { setRequestLocale } from "next-intl/server";
import Header from "@/components/header/Header";
import Nav from "@/components/nav/Nav";
import About from "@/components/about/About";
import Experience from "@/components/experience/Experience";
// import Services from "@/components/services/Services";
import Portfolio from "@/components/portfolio/Portfolio";
// import Testimonials from "@/components/testimonials/Testimonials";
import Contact from "@/components/contact/Contact";
import Footer from "@/components/footer/Footer";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Home({ params: { locale } }) {
  setRequestLocale(locale);

  return (
    <>
      <LanguageSwitcher />
      <ThemeToggle />
      <Header />
      <Nav />
      <About />
      <Experience />
      {/* <Services /> */}
      <Portfolio />
      {/* <Testimonials /> */}
      <Contact />
      <Footer />
    </>
  );
}
