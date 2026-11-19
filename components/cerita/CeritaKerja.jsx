"use client";
import { useEffect, useRef, useState } from "react";
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
import "./cerita.css";

// Tinggi tiap blok dalam layar (Imersif): cukup lama untuk momen benda di dunia toko
// (components/dunia/props.js). Babak rilis paling panjang: kotak CD masuk satu per satu.
const BOBOT = { pembuka: 0.9, ide: 1.2, rencana: 1, bentuk: 1.4, fondasi: 1.2, bangun: 1.2, progres: 1.2, rapi: 1, andal: 1.2, aman: 1.2, rilis: 2.4 };


// Cerita gulir di antara hero dan rak (ADR 0011, v4 di ADR 0016 dan desain/cerita-v4).
// Imersif: kamera dunia toko (components/dunia) berhenti di satu benda per bab; tiap bab setinggi
// BOBOT dan teksnya menempel di kiri (atau di bawah pada HP).
// Ringan: render benda yang sama dari dunia 3D sebagai gambar yang bergerak pelan mengikuti --p.
// Gerak dikurangi: teks dan gambar dalam keadaan akhir, tanpa gulir halus.
export default function CeritaKerja() {
  const t = useTranslations("cerita");
  const locale = useLocale();
  const { mode } = useMode();
  const akar = useRef(null);
  const [dunia, setDunia] = useState(false);
  const [tampil, setTampil] = useState(false);
  const [aktif, setAktif] = useState(-1);

  // Seksi di layar: penanda bab muncul, dan pemutar musik menciut ke cakram (event "cerita")
  // supaya tidak menutupi judul bab.
  useEffect(() => {
    const el = akar.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setTampil(e.isIntersecting);
      window.dispatchEvent(new CustomEvent("cerita", { detail: { tampil: e.isIntersecting } }));
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.dispatchEvent(new CustomEvent("cerita", { detail: { tampil: false } }));
    };
  }, []);

  // Tinggi kotak teks tiap bab (--tinggi), supaya posisi tempelnya naik di layar pendek dan
  // kotak yang tinggi tidak terpotong di bawah (cerita.css).
  useEffect(() => {
    const el = akar.current;
    if (!el || !dunia) return;
    const ro = new ResizeObserver((isi) => {
      for (const e of isi) e.target.style.setProperty("--tinggi", `${Math.ceil(e.borderBoxSize[0].blockSize)}px`);
    });
    el.querySelectorAll(".bab__teks").forEach((t) => ro.observe(t));
    return () => ro.disconnect();
  }, [dunia, locale]);

  // Bab yang memuat garis tengah layar, untuk titik aktif di penanda bab.
  useEffect(() => {
    const el = akar.current;
    if (!el) return;
    const bab = [...el.querySelectorAll(".bab")];
    const io = new IntersectionObserver(
      (isi) => {
        // Di atas bab pertama (judul seksi dan pembuka) tidak ada bab aktif, dan penanda belum tampil.
        for (const e of isi) {
          const i = bab.indexOf(e.target);
          if (e.isIntersecting) setAktif(i);
          else setAktif((a) => (a === i ? -1 : a));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    bab.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [dunia]);

  // Lompat ke bab: ke posisi saat teksnya sudah utuh (Imersif: sekitar 40% bab di garis tengah,
  // seperti naskah membaca progres). Lompatan langsung; kamera menyusul dengan haluskannya sendiri.
  const keBab = (i) => {
    const bab = akar.current?.querySelectorAll(".bab")[i];
    if (!bab) return;
    const r = bab.getBoundingClientRect();
    const y = window.scrollY + r.top + (dunia ? r.height * 0.4 - innerHeight / 2 : -innerHeight * 0.12);
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    bab.querySelector(".bab__judul")?.focus({ preventScroll: true });
  };

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

  // Teks bab "sampul ditegakkan" (pilihan Farrez 19 Nov 2026, opsi C; rujukan Codrops "Creating
  // 3D Scroll-Driven Text Animations with CSS and GSAP", 2025): tiap baris judul berputar masuk
  // pada sumbu bawahnya seperti CD yang ditegakkan dari bak, nomor babak berputar seperti
  // penghitung pita lalu berhenti di nomornya, isi muncul kata demi kata. Digosok gulir.
  // SplitText memberi aria-label pada judul dan isi; angka nomor yang diacak sudah aria-hidden.
  useEffect(() => {
    const el = akar.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const pulih = [];
    const ctx = gsap.context(() => {
      for (const bab of el.querySelectorAll(".bab")) {
        const judul = bab.querySelector(".bab__judul");
        const teks = bab.querySelector(".bab__teks");
        const pecah = SplitText.create(judul, { type: "lines", aria: "auto" });
        const awal = dunia ? "top 58%" : "top 85%";
        const akhir = dunia ? "top 38%" : "top 55%";
        gsap.set(judul, { perspective: 600 });
        gsap.from(pecah.lines, {
          rotateX: -88,
          opacity: 0,
          transformOrigin: "50% 100% -20px",
          stagger: 0.09,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: dunia ? bab : teks, start: awal, end: akhir, scrub: 0.8 },
        });
        // Yang diacak hanya angka yang terlihat (span aria-hidden); kalimat untuk pembaca layar
        // ada di span sr-only di sebelahnya dan tidak disentuh.
        const nomor = bab.querySelector(".bab__nomor [aria-hidden='true']");
        if (nomor) {
          const asli = nomor.textContent;
          pulih.push(() => (nomor.textContent = asli));
          // Angka acak ditentukan oleh progres, jadi gulir maju dan mundur memberi urutan yang sama.
          const pita = { t: 0 };
          gsap.to(pita, {
            t: 1,
            ease: "none",
            scrollTrigger: { trigger: dunia ? bab : teks, start: awal, end: akhir, scrub: 0.8 },
            onUpdate() {
              const langkah = Math.floor(pita.t * 24);
              const isi = pita.t >= 0.75 || pita.t <= 0 ? asli : asli.replace(/\d/g, (_, i) => String((langkah * 7 + i * 3) % 10));
              // Tulis ke DOM hanya saat angkanya berganti (24 kali sepanjang rentang), bukan tiap
              // bingkai gulir: tiap penulisan textContent memicu tata letak ulang.
              if (nomor.textContent !== isi) nomor.textContent = isi;
            },
          });
        }
        const isi = bab.querySelector(".bab__teks-isi");
        if (isi) {
          const kata = SplitText.create(isi, { type: "words", aria: "auto" });
          gsap.from(kata.words, {
            opacity: 0,
            y: 6,
            stagger: 0.012,
            ease: "power2.out",
            scrollTrigger: { trigger: dunia ? bab : teks, start: dunia ? "top 50%" : "top 80%", end: dunia ? "top 24%" : "top 46%", scrub: 0.8 },
          });
        }
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
        gsap.from(teks.querySelectorAll(".bab__nomor, .bab__bukti, .bab__keluhan li, .bab__ke-rak"), {
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
      pulih.forEach((f) => f());
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

      <nav className={`cerita-rel ${tampil && aktif >= 0 ? "is-tampil" : ""}`} aria-label={t("rel")}>
        <ol>
          {BAB.map((b, i) => (
            <li key={b.id}>
              <button
                type="button"
                className="cerita-rel__titik"
                aria-current={i === aktif ? "step" : undefined}
                aria-label={t("keBab", { n: i + 1, judul: b.judul[locale] })}
                title={`${i + 1}. ${b.judul[locale]}`}
                tabIndex={tampil && aktif >= 0 ? 0 : -1}
                onClick={() => keBab(i)}
              />
            </li>
          ))}
        </ol>
      </nav>

      {dunia && (
        <div className="cerita-pembuka" data-babak="pembuka" style={{ "--bobot": BOBOT.pembuka }} aria-hidden="true">
          <p className="wadah cerita-pembuka__judul">{t("judul")}</p>
        </div>
      )}

      <ol className="cerita-kerja__daftar">
        {BAB.map((b, i) => {
          return (
            <li
              key={b.id}
              className={`bab bab--${b.id}`}
              aria-labelledby={`bab-${b.id}`}
              data-babak={b.id}
              style={dunia ? { "--bobot": BOBOT[b.id] } : undefined}
            >
              <div className="wadah bab__isi">
                <div className="bab__teks">
                  <p className="mono bab__nomor">
                    <span className="sr-only">{t("bab", { n: i + 1, total: BAB.length })}</span>
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, "0")} / {String(BAB.length).padStart(2, "0")}
                    </span>
                  </p>
                  <h3 id={`bab-${b.id}`} className="bab__judul" tabIndex={-1}>
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

                  {(b.bukti || b.luar) && (
                    <p className="bab__bukti">
                      <span className="mono">{t("bukti")}:</span>{" "}
                      {(b.bukti ?? []).map((slug, j) => (
                        <span key={slug}>
                          {j > 0 && ", "}
                          <Link href={`/proyek/${slug}`}>{cariProyek(slug)?.judul[locale] ?? slug}</Link>
                        </span>
                      ))}
                      {(b.luar ?? []).map((l, j) => (
                        <span key={l.href}>
                          {(b.bukti?.length || j > 0) && ", "}
                          <a href={l.href} target="_blank" rel="noopener noreferrer">
                            {l.nama}
                          </a>
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
                    <img src={`/assets/cerita/${b.id}.webp`} alt="" width={1376} height={774} loading="lazy" decoding="async" />
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
