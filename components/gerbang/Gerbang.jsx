import { useTranslations } from "next-intl";
import HeadlineGulir from "./HeadlineGulir";
import "./gerbang.css";

// `proyek`: jangkar seksi proyek (rak CD di /arsip/cd, modul lab di beranda v5).
export default function Gerbang({ cv, proyek = "#rak" }) {
  const t = useTranslations("gerbang");

  return (
    <section className="gerbang" aria-labelledby="gerbang-judul" data-gulir>
      <div className="gerbang__tempel">
        <div className="wadah">
          <p className="gerbang__peran mono">{t("peran")}</p>
          <HeadlineGulir a={t("headlineA")} b={t("headlineB")} sorot={t("sorot")} idJudul="gerbang-judul" />
          <div className="gerbang__aksi">
            <a href={proyek} className="tombol tombol--utama">
              {t("lihatProyek")}
            </a>
            <a href="#kontak" className="tombol">
              {t("hubungi")}
            </a>
            <a href={cv} className="tombol" download>
              {t("unduhCV")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
