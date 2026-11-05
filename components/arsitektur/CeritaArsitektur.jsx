import { useLocale, useTranslations } from "next-intl";
import { PiArrowRightBold } from "react-icons/pi";
import { Link } from "@/i18n/navigation";
import { KELOMPOK, teknologiDari } from "./teknologi";
import "./arsitektur.css";

// Cerita satu permintaan: langkah bernomor dengan ikon teknologinya, lalu teknologi
// dikelompokkan menurut peran. Tanpa skrip, jadi terbaca di mode mana pun dan saat dicetak.
export default function CeritaArsitektur({ p, tautanDiagram = true, tanpaLangkah = false }) {
  const t = useTranslations("arsitektur");
  const locale = useLocale();
  const { alur, teknologi } = p.arsitektur;

  return (
    <div className="cerita">
      {!tanpaLangkah && (
        <ol className="cerita__alur">
          {alur.map((l, i) => (
            <li key={i} className="cerita__langkah">
              <span className="cerita__nomor mono" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="cerita__judul">{l.judul[locale]}</p>
                <p className="cerita__rincian">{l.rincian[locale]}</p>
                <ul className="cerita__tek" aria-label={t("dipakai")}>
                  {teknologiDari(l.teknologi).map(({ kunci, nama, Ikon }) => (
                    <li key={kunci}>
                      <Ikon aria-hidden="true" /> {nama[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}

      <dl className="cerita__kelompok">
        {KELOMPOK.filter((k) => teknologi[k].length).map((k) => (
          <div key={k}>
            <dt className="mono">{t(`kelompok.${k}`)}</dt>
            <dd>
              <ul className="cerita__tek">
                {k === "fitur"
                  ? teknologi.fitur.map((f) => <li key={f.en}>{f[locale]}</li>)
                  : teknologiDari(teknologi[k]).map(({ kunci, nama, Ikon }) => (
                      <li key={kunci}>
                        <Ikon aria-hidden="true" /> {nama[locale]}
                      </li>
                    ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>

      {tautanDiagram && (
        <p>
          <Link href={`/proyek/${p.slug}/arsitektur`} className="tombol">
            {t("lihatDiagram")} <PiArrowRightBold aria-hidden="true" />
          </Link>
        </p>
      )}
    </div>
  );
}
