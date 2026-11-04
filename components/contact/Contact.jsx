"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  PiEnvelopeSimpleBold,
  PiWhatsappLogoBold,
  PiLinkedinLogoBold,
  PiGithubLogoBold,
} from "react-icons/pi";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { situs } from "@/content/situs";
import { useMode } from "@/components/mode/ModeProvider";
import "./contact.css";

const Helix = dynamic(() => import("@/components/imersif/Helix"), { ssr: false });

// ID EmailJS memang publik (dipakai dari browser); boleh ditimpa lewat env.
const EMAILJS_SERVICE = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_n9r4x8p";
const EMAILJS_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_s50v8c4";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "sHLzgGlimFe2gylV8";

export default function Contact() {
  const t = useTranslations("kontak");
  const { mode } = useMode();
  const formRef = useRef(null);

  const kabar = (opts) =>
    Swal.fire({ customClass: { popup: "kabar" }, buttonsStyling: false, ...opts });

  const ambil = () => {
    const fd = new FormData(formRef.current);
    const g = (k) => (fd.get(k) || "").toString().trim();
    return { name: g("name"), email: g("email"), subject: g("subject"), message: g("message") };
  };
  const kurang = ({ name, email, message }) => !name || !email || !message;

  const kirimEmail = async (e) => {
    e.preventDefault();
    if (kurang(ambil())) return kabar({ icon: "error", title: t("galatJudul") });
    try {
      await emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, formRef.current, EMAILJS_PUBLIC_KEY);
      formRef.current.reset();
      kabar({ icon: "success", title: t("terkirim"), showConfirmButton: false, timer: 1600 });
    } catch {
      kabar({ icon: "error", title: t("galatJudul"), text: t("galatKirim") });
    }
  };

  const kirimWa = () => {
    const { name, email, subject, message } = ambil();
    if (kurang({ name, email, message })) return kabar({ icon: "error", title: t("galatJudul") });
    const isi = [subject ? `*${subject}*` : null, message, `${name}${email ? ` (${email})` : ""}`]
      .filter(Boolean)
      .join("\n\n");
    window.open(`https://wa.me/${situs.whatsapp}?text=${encodeURIComponent(isi)}`, "_blank", "noopener,noreferrer");
  };

  const jalur = [
    { href: `mailto:${situs.email}`, label: t("email"), nilai: situs.email, Ikon: PiEnvelopeSimpleBold },
    { href: `https://wa.me/${situs.whatsapp}`, label: t("whatsapp"), nilai: `+${situs.whatsapp}`, Ikon: PiWhatsappLogoBold },
    { href: situs.linkedin, label: t("linkedin"), nilai: "linkedin.com/in/farrez", Ikon: PiLinkedinLogoBold },
    { href: situs.github, label: t("github"), nilai: "github.com/farrez30", Ikon: PiGithubLogoBold },
  ];

  return (
    <section id="kontak" className="kontak" aria-labelledby="kontak-judul">
      <div className="wadah kontak__isi">
        <div className="kontak__kiri">
          <h2 id="kontak-judul" className="kontak__judul">
            {t("judul")}
          </h2>
          <p className="kontak__teks">{t("teks")}</p>
          <ul className="kontak__jalur">
            {jalur.map(({ href, label, nilai, Ikon }) => (
              <li key={label}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  <Ikon aria-hidden="true" />
                  <span className="mono kontak__label">{label}</span>
                  <span>{nilai}</span>
                </a>
              </li>
            ))}
          </ul>
          {mode === "imersif" && <Helix label={t("helix")} />}
        </div>

        <form ref={formRef} className="kontak__form" onSubmit={kirimEmail}>
          <h3 className="mono kontak__label">{t("formJudul")}</h3>
          <label>
            <span>{t("nama")}</span>
            <input type="text" name="name" autoComplete="name" required />
          </label>
          <label>
            <span>{t("emailAnda")}</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            <span>{t("subjek")}</span>
            <input type="text" name="subject" defaultValue={t("subjekIsi")} />
          </label>
          <label>
            <span>{t("pesan")}</span>
            <textarea name="message" rows="6" defaultValue={t("pesanIsi")} required />
          </label>
          <div className="kontak__tombol">
            <button type="submit" className="tombol tombol--utama">
              <PiEnvelopeSimpleBold aria-hidden="true" /> {t("kirimEmail")}
            </button>
            <button type="button" className="tombol" onClick={kirimWa}>
              <PiWhatsappLogoBold aria-hidden="true" /> {t("kirimWa")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
