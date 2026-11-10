"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { scroll } from "motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PiArrowDownBold } from "react-icons/pi";
import { Link } from "@/i18n/navigation";
import { BAB } from "@/content/cerita";
import { cariProyek } from "@/content/proyek";
import { useMode } from "@/components/mode/ModeProvider";
import { BABAK, POSE } from "./naskah";
import Benda from "./Benda";
import "./cerita.css";

const PanggungCerita = dynamic(() => import("./PanggungCerita"), { ssr: false });

// Cerita gulir di antara hero dan rak (ADR 0011, storyboard v2 di docs/storyboard-gulir.md).
// Imersif: satu kotak CD 3D di panggung yang menempel di belakang bab, tiap bab setinggi
// bobotnya di naskah.js dan teksnya menempel di sisi yang tidak dipakai benda.
// Ringan: benda CSS per bab yang digerakkan --p (versi pertama), tanpa kanvas.
// Gerak dikurangi: teks dan benda dalam keadaan akhir, tanpa gulir halus atau 3D.
export default function CeritaKerja() {
  const t = useTranslations("cerita");
  const locale = useLocale();
  const { mode } = useMode();
  const akar = useRef(null);
  const [dunia, setDunia] = useState(false);

  useEffect(() => {
    setDunia(mode === "imersif" && !matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [mode]);

  // Mode Ringan: --p per bab untuk benda CSS.
  useEffect(() => {
    const el = akar.current;
    if (!el || dunia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.gerak = "1";
    const lepas = [...el.querySelectorAll(".bab")].map((bab) =>
      scroll((p) => bab.style.setProperty("--p", p.toFixed(4)), { target: bab, offset: ["start end", "center center"] }),
    );
    return () => {
      lepas.forEach((f) => f());
      delete el.dataset.gerak;
      for (const bab of el.querySelectorAll(".bab")) bab.style.removeProperty("--p");
    };
  }, [dunia]);

  // Judul bab naik kata demi kata (kinetic type), digosok gulir. SplitText memberi aria-label
  // pada judul, jadi pembaca layar tetap membaca kalimat utuh.
  useEffect(() => {
    const el = akar.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const ctx = gsap.context(() => {
      for (const bab of el.querySelectorAll(".bab")) {
        const judul = bab.querySelector(".bab__judul");
        const teks = bab.querySelector(".bab__teks");
        const pecah = SplitText.create(judul, { type: "words,lines", mask: "lines", aria: "auto" });
        const awal = dunia ? "top 70%" : "top 85%";
        gsap.from(pecah.words, {
          yPercent: 110,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: dunia ? bab : teks, start: awal, end: dunia ? "top 30%" : "top 45%", scrub: 0.8 },
        });
        if (dunia)
          gsap.from(teks, {
            autoAlpha: 0,
            y: 48,
            ease: "power3.out",
            scrollTrigger: { trigger: bab, start: "top 85%", end: "top 45%", scrub: 0.8 },
          });
        gsap.from(teks.querySelectorAll(".bab__label, .bab__teks-isi, .bab__bukti, .bab__keluhan li, .bab__ke-rak"), {
          y: 28,
          autoAlpha: 0,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: dunia ? bab : teks, start: dunia ? "top 55%" : "top 80%", end: dunia ? "top 20%" : "top 40%", scrub: 0.8 },
        });
      }
      const pembuka = el.querySelector(".cerita-pembuka__judul");
      if (pembuka) {
        const huruf = SplitText.create(pembuka, { type: "chars,words", mask: "chars", aria: "hidden" });
        gsap.from(huruf.chars, {
          yPercent: 120,
          rotate: 8,
          stagger: 0.025,
          ease: "power4.out",
          scrollTrigger: { trigger: pembuka, start: "top 85%", end: "top 35%", scrub: 0.6 },
        });
      }
    }, el);
    const segar = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(segar);
      ctx.revert();
    };
  }, [dunia, locale]);

  return (
    <section
      id="cerita"
      ref={akar}
      className={`cerita-kerja ${dunia ? "cerita-kerja--dunia" : ""}`}
      aria-labelledby="cerita-judul"
    >
      <div className="wadah cerita-kerja__kepala">
        <h2 id="cerita-judul" className="mono cerita-kerja__judul">
          {t("judul")}
        </h2>
        <a href="#rak" className="cerita-kerja__lewati">
          {t("lewati")}
        </a>
      </div>

      {dunia && <PanggungCerita akar={akar} />}

      {dunia && (
        <div className="cerita-pembuka" data-babak="pembuka" style={{ "--bobot": BABAK[0].bobot }} aria-hidden="true">
          <p className="wadah cerita-pembuka__judul">{t("judul")}</p>
        </div>
      )}

      <ol className="cerita-kerja__daftar">
        {BAB.map((b, i) => {
          const babak = BABAK[i + 1];
          const sisi = POSE[i + 1].sisi >= 0 ? "kiri" : "kanan";
          return (
            <li
              key={b.id}
              className={`bab bab--${b.id} bab--teks-${sisi}`}
              aria-labelledby={`bab-${b.id}`}
              data-babak={b.id}
              style={dunia ? { "--bobot": babak.bobot } : undefined}
            >
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
                {!dunia && <Benda id={b.id} />}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
