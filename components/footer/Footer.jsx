"use client";
import React, { useState, useEffect } from "react";
import "./footer.css";
import { useTranslations } from "next-intl";
import { FaFacebookF } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";
import { IoLogoTwitter } from "react-icons/io";

const Footer = () => {
  const t = useTranslations("footer");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <a href="#home" className="footer__logo">
        {t("logo")}
      </a>

      <ul className="permalinks">
        <li>
          <a href="#home">{t("home")}</a>
        </li>
        <li>
          <a href="#about">{t("about")}</a>
        </li>
        <li>
          <a href="#experience">{t("experience")}</a>
        </li>
        <li>
          <a href="#portfolio">{t("portfolio")}</a>
        </li>
        <li>
          <a href="#contact">{t("contact")}</a>
        </li>
      </ul>

      <div className="footer__socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FiInstagram />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <IoLogoTwitter />
        </a>
      </div>

      <div className="footer__copyright">
        <small>&copy; {year} {t("logo")}. {t("rights")}.</small>
      </div>
    </footer>
  );
};

export default Footer;
