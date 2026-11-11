"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { BABAK } from "./naskah";
import "./cerita.css";

const PanggungCerita = dynamic(() => import("./PanggungCerita"), { ssr: false });

// Cerita gulir di antara hero dan rak (ADR 0011, v3 di ADR 0013 dan desain/cerita-v3).
// Imersif: soundstage 3D di panggung yang menempel di belakang bab; tiap bab setinggi bobotnya
// di naskah.js dan teksnya menempel di kiri (atau di bawah pada HP).
// Ringan: styleframe tiap bab sebagai gambar yang bergerak pelan mengikuti --p, tanpa kanvas.
// Gerak dikurangi: teks dan gambar dalam keadaan akhir, tanpa gulir halus atau 3D.
export default function CeritaKerja() {
  const t = useTranslations("cerita");
  const locale = useLocale();
  const { mode } = useMode();
  const akar = useRef(null);
  const [dunia, setDunia] = useState(false);
  const tanpaDunia = useCallback(() => setDunia(false), []);

  useEffect(() => {
    setDunia(mode === "imersif" && !matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [mode]);

  // Mode Ringan: --p per bab untuk gambar styleframe.
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
        const awal = dunia ? "top 58%" : "top 85%";
        gsap.from(pecah.words, {
          yPercent: 110,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: dunia ? bab : teks, start: awal, end: dunia ? "top 25%" : "top 45%", scrub: 0.8 },
        });
        if (dunia)
          gsap.from(teks, {
            opacity: 0,
            y: 48,
            ease: "power3.out",
            scrollTrigger: { trigger: bab, start: "top 60%", end: "top 32%", scrub: 0.8 },
          });
        // Di soundstage, teks bab pergi sebelum teks bab berikutnya datang, jadi dua bab tidak
        // pernah bertumpuk di atas panel. Bab terakhir tetap tinggal dan berganti warna mengikuti
        // layar yang memutih ke rak.
        // Pudar-keluar memakai pembungkus, bukan panel teks yang sama dengan pudar-masuk, supaya
        // dua tween tidak memperebutkan opacity yang sama.
        if (dunia && !bab.classList.contains("bab--rilis"))
          gsap.to(bab.querySelector(".bab__isi"), {
            opacity: 0,
            y: -32,
            ease: "power2.in",
            immediateRender: false,
            scrollTrigger: { trigger: bab, start: "bottom 92%", end: "bottom 64%", scrub: 0.8 },
          });
        gsap.from(teks.querySelectorAll(".bab__nomor, .bab__teks-isi, .bab__bukti, .bab__keluhan li, .bab__ke-rak"), {
          y: 28,
          opacity: 0,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: dunia ? bab : teks, start: dunia ? "top 50%" : "top 80%", end: dunia ? "top 18%" : "top 40%", scrub: 0.8 },
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

      {dunia && <PanggungCerita akar={akar} onGagal={tanpaDunia} />}

      {dunia && (
        <div className="cerita-pembuka" data-babak="pembuka" style={{ "--bobot": BABAK[0].bobot }} aria-hidden="true">
          <p className="wadah cerita-pembuka__judul">{t("judul")}</p>
        </div>
      )}

      <ol className="cerita-kerja__daftar">
        {BAB.map((b, i) => {
          const babak = BABAK[i + 1];
          return (
            <li
              key={b.id}
              className={`bab bab--${b.id}`}
              aria-labelledby={`bab-${b.id}`}
              data-babak={b.id}
              style={dunia ? { "--bobot": babak.bobot } : undefined}
            >
              <div className="wadah bab__isi">
                <div className="bab__teks">
                  <p className="mono bab__nomor">
                    <span className="sr-only">{t("bab", { n: i + 1, total: BAB.length })}</span>
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, "0")} / {String(BAB.length).padStart(2, "0")}
                    </span>
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

                  {b.id === "rilis" && (
                    <a href="#rak" className="tombol tombol--utama bab__ke-rak">
                      {t("keRak")} <PiArrowDownBold aria-hidden="true" />
                    </a>
                  )}
                </div>
                {!dunia && (
                  <figure className="bab__gambar">
                    <img src={`/assets/cerita/${babak.ringan ?? babak.gambar}.webp`} alt="" width={1376} height={768} loading="lazy" decoding="async" />
                  </figure>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
