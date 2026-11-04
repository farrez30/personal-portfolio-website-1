import { useTranslations } from "next-intl";
import { situs } from "@/content/situs";
import HeadlineGulir from "./HeadlineGulir";
import "./gerbang.css";

export default function Gerbang() {
  const t = useTranslations("gerbang");

  return (
    <section className="gerbang" aria-labelledby="gerbang-judul" data-gulir>
      <div className="gerbang__tempel">
        <div className="wadah">
          <p className="gerbang__peran mono">{t("peran")}</p>
          <HeadlineGulir a={t("headlineA")} b={t("headlineB")} sorot={t("sorot")} idJudul="gerbang-judul" />
          <div className="gerbang__aksi">
            <a href="#rak" className="tombol tombol--utama">
              {t("lihatProyek")}
            </a>
            <a href="#kontak" className="tombol">
              {t("hubungi")}
            </a>
            <a href={situs.cv} className="tombol" download>
              {t("unduhCV")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
