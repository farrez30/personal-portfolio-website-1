"use client";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { scroll } from "motion";
import { PiArrowDownBold } from "react-icons/pi";
import { Link } from "@/i18n/navigation";
import { BAB } from "@/content/cerita";
import { cariProyek } from "@/content/proyek";
import Benda from "./Benda";
import "./cerita.css";

// Cerita gulir di antara hero dan rak. Tiap bab punya satu variabel --p (0 sampai 1)
// yang selesai saat bab itu ada di tengah layar; semua gerak di CSS membaca angka itu.
// Tanpa JS atau dengan gerak dikurangi, --p tetap 1 dan bab tampil utuh.
export default function CeritaKerja() {
  const t = useTranslations("cerita");
  const locale = useLocale();
  const akar = useRef(null);

  useEffect(() => {
    const el = akar.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.gerak = "1";
    const lepas = [...el.querySelectorAll(".bab")].map((bab) =>
      scroll((p) => bab.style.setProperty("--p", p.toFixed(4)), {
        target: bab,
        offset: ["start end", "center center"],
      }),
    );
    return () => lepas.forEach((f) => f());
  }, []);

  return (
    <section id="cerita" ref={akar} className="cerita-kerja" aria-labelledby="cerita-judul">
      <div className="wadah cerita-kerja__kepala">
        <h2 id="cerita-judul" className="mono cerita-kerja__judul">
          {t("judul")}
        </h2>
        <a href="#rak" className="cerita-kerja__lewati">
          {t("lewati")}
        </a>
      </div>

      <ol className="cerita-kerja__daftar">
        {BAB.map((b, i) => (
          <li key={b.id} className={`bab bab--${b.id}`} aria-labelledby={`bab-${b.id}`}>
            <div className="wadah bab__isi">
              <div className="bab__teks">
                <p className="mono bab__label">
                  <span className="sr-only">{t("bab", { n: i + 1, total: BAB.length })} </span>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")} </span>
                  {b.label}
                </p>
                <h3 id={`bab-${b.id}`} className="bab__judul">
                  {b.judul[locale]}
                </h3>
                <p className="bab__teks-isi">{b.isi[locale]}</p>

                {b.keluhan && (
                  <ul className="bab__keluhan">
                    {b.keluhan.map((k, j) => (
                      <li key={k.slug} style={{ "--j": j }}>
                        <Link href={`/proyek/${k.slug}`}>{k[locale]}</Link>
                      </li>
                    ))}
                  </ul>
                )}

                {b.bukti && (
                  <p className="bab__bukti">
                    <span className="mono">{t("bukti")}:</span>{" "}
                    {b.bukti.map((slug, j) => (
                      <span key={slug}>
                        {j > 0 && ", "}
                        <Link href={`/proyek/${slug}`}>{cariProyek(slug)?.judul[locale] ?? slug}</Link>
                      </span>
                    ))}
                  </p>
                )}

                {b.id === "rak" && (
                  <a href="#rak" className="tombol tombol--utama bab__ke-rak">
                    {t("keRak")} <PiArrowDownBold aria-hidden="true" />
                  </a>
                )}
              </div>
              <Benda id={b.id} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
