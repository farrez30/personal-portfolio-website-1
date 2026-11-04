import { useTranslations } from "next-intl";
import { situs } from "@/content/situs";
import Headline from "./Headline";
import "./gerbang.css";

export default function Gerbang() {
  const t = useTranslations("gerbang");

  return (
    <section className="gerbang" aria-labelledby="gerbang-judul">
      <div className="wadah">
        <p className="gerbang__peran mono">{t("peran")}</p>
        <h1 id="gerbang-judul" className="gerbang__judul">
          <Headline teks={t("headline")} />
        </h1>
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
    </section>
  );
}
