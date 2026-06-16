"use client";
import React, { useRef } from "react";
import "./contact.css";
import { useTranslations } from "next-intl";
import { MdOutlineEmail } from "react-icons/md";
import { BsWhatsapp } from "react-icons/bs";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const Contact = () => {
  const t = useTranslations("contact");
  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    const form = formRef.current;

    // Validate form fields before sending the email
    if (form.name.value === null || form.email.value === null || form.message.value === null) {
      Swal.fire({
        icon: "error",
        title: t("alertErrorTitle"),
      });
    } else {
      emailjs.sendForm("service_n9r4x8p", "template_s50v8c4", form, "sHLzgGlimFe2gylV8");

      form.reset();
      handleClick();
    }
  };

  const handleClick = () => {
    Swal.fire({
      icon: "success",
      title: t("alertSuccessTitle"),
      showConfirmButton: false,
      timer: 1500,
    });
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
            <a href="https://api.whatsapp.com/send?phone=6285884061543" target="_blank" rel="noopener noreferrer">
              {t("whatsappCta")}
            </a>
          </article>
        </div>
        {/* END OF CONTACT OPTIONS */}
        <form ref={formRef} onSubmit={sendEmail}>
          <input type="text" name="name" placeholder={t("namePlaceholder")} required />
          <input type="email" name="email" placeholder={t("emailPlaceholder")} required />
          <textarea name="message" rows="7" placeholder={t("messagePlaceholder")} required></textarea>
          <button type="submit" className="btn btn-primary">
            {t("send")}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
