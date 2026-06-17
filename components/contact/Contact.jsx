"use client";
import React, { useRef } from "react";
import "./contact.css";
import { useTranslations } from "next-intl";
import { MdOutlineEmail } from "react-icons/md";
import { BsWhatsapp } from "react-icons/bs";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

// IDs are overridable via env; literal fallbacks keep the form working out of the box.
const EMAILJS_SERVICE = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_n9r4x8p";
const EMAILJS_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_s50v8c4";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "sHLzgGlimFe2gylV8";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6285884061543";

const Contact = () => {
  const t = useTranslations("contact");
  const formRef = useRef();

  // SweetAlert2 themed to match the dark/glass UI.
  const themedSwal = (opts) =>
    Swal.fire({
      customClass: { popup: "swal-glass" },
      buttonsStyling: false,
      ...opts,
    });

  // FormData avoids the HTMLFormElement.name gotcha (form.name reflects the
  // element's name attribute, not the control named "name").
  const getFields = () => {
    const fd = new FormData(formRef.current);
    const g = (k) => (fd.get(k) || "").toString().trim();
    return { name: g("name"), email: g("email"), subject: g("subject"), message: g("message") };
  };

  const missingRequired = ({ name, email, message }) => !name || !email || !message;

  const sendEmail = async (e) => {
    e.preventDefault();
    if (missingRequired(getFields())) {
      themedSwal({ icon: "error", title: t("alertErrorTitle") });
      return;
    }
    try {
      await emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, formRef.current, EMAILJS_PUBLIC_KEY);
      formRef.current.reset();
      themedSwal({
        icon: "success",
        title: t("alertSuccessTitle"),
        showConfirmButton: false,
        timer: 1600,
      });
    } catch (err) {
      themedSwal({ icon: "error", title: t("alertErrorTitle"), text: t("alertErrorText") });
    }
  };

  const sendWhatsapp = () => {
    const { name, email, subject, message } = getFields();
    if (missingRequired({ name, email, message })) {
      themedSwal({ icon: "error", title: t("alertErrorTitle") });
      return;
    }
    const body = [
      subject ? `*${subject}*` : null,
      message,
      `— ${name}${email ? ` (${email})` : ""}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact">
      <h5>{t("subtitle")}</h5>
      <h2>{t("title")}</h2>

      <div className="container contact__container">
        <div className="contact__options">
          <article className="contact__option">
            <MdOutlineEmail className="contact__option-icon" />
            <h2>{t("emailTitle")}</h2>
            <h5>{t("emailDesc")}</h5>
            <a href="mailto:farrezalhakim@gmail.com" target="_blank" rel="noopener noreferrer">
              {t("emailCta")}
            </a>
          </article>
          <article className="contact__option">
            <BsWhatsapp className="contact__option-icon" />
            <h2>{t("whatsappTitle")}</h2>
            <h5>{t("whatsappDesc")}</h5>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              {t("whatsappCta")}
            </a>
          </article>
        </div>
        {/* END OF CONTACT OPTIONS */}

        <form ref={formRef} className="contact__form" onSubmit={sendEmail}>
          <div className="contact__row">
            <input type="text" name="name" placeholder={t("namePlaceholder")} required />
            <input type="email" name="email" placeholder={t("emailPlaceholder")} required />
          </div>
          <input
            type="text"
            name="subject"
            placeholder={t("subjectPlaceholder")}
            defaultValue={t("subjectTemplate")}
          />
          <textarea
            name="message"
            rows="7"
            placeholder={t("messagePlaceholder")}
            defaultValue={t("messageTemplate")}
            required
          ></textarea>
          <div className="contact__actions">
            <button type="submit" className="btn btn-primary contact__send">
              <MdOutlineEmail /> {t("sendEmail")}
            </button>
            <button
              type="button"
              className="btn contact__send contact__send--wa"
              onClick={sendWhatsapp}
            >
              <BsWhatsapp /> {t("sendWhatsapp")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
