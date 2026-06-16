"use client";
import React, { useState, useEffect } from "react";
import "./nav.css";
import { useTranslations } from "next-intl";
import { AiOutlineHome } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { BiBook } from "react-icons/bi";
// import { RiServiceLine } from "react-icons/ri";
import { VscCode } from "react-icons/vsc";
import { BiMessageSquareDetail } from "react-icons/bi";

const Nav = () => {
  const t = useTranslations("nav");
  const [activeNav, setActiveNav] = useState("#");

  // Fungsi untuk memantau posisi scroll
  const handleScroll = () => {
    const sections = ["#home", "#about", "#experience", "#portfolio", "#contact"];

    // Menentukan bagian mana yang sedang aktif berdasarkan posisi scroll
    for (const section of sections) {
      const elem = document.querySelector(section);
      if (elem) {
        const rect = elem.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveNav(section);
          break; // Keluar dari loop setelah menemukan bagian yang aktif
        }
      }
    }
  };

  // Menjalankan handleScroll saat komponen dimuat dan ketika scrolling terjadi
  useEffect(() => {
    handleScroll(); // Memastikan kondisi awal saat komponen dimuat
    window.addEventListener("scroll", handleScroll);

    // Membersihkan event listener saat komponen unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav>
      <a href="#home" onClick={() => setActiveNav("#home")} className={activeNav === "#home" ? "active" : ""} aria-label={t("home")} title={t("home")}>
        <AiOutlineHome />
      </a>
      <a href="#about" onClick={() => setActiveNav("#about")} className={activeNav === "#about" ? "active" : ""} aria-label={t("about")} title={t("about")}>
        <AiOutlineUser />
      </a>
      <a
        href="#experience"
        onClick={() => setActiveNav("#experience")}
        className={activeNav === "#experience" ? "active" : ""}
        aria-label={t("experience")}
        title={t("experience")}
      >
        <BiBook />
      </a>
      {/* <a
        href="#services"
        onClick={() => setActiveNav("#services")}
        className={activeNav === "#services" ? "active" : ""}
      >
        <RiServiceLine />
      </a> */}
      <a
        href="#portfolio"
        onClick={() => setActiveNav("#portfolio")}
        className={activeNav === "#portfolio" ? "active" : ""}
        aria-label={t("portfolio")}
        title={t("portfolio")}
      >
        <VscCode />
      </a>
      <a href="#contact" onClick={() => setActiveNav("#contact")} className={activeNav === "#contact" ? "active" : ""} aria-label={t("contact")} title={t("contact")}>
        <BiMessageSquareDetail />
      </a>
    </nav>
  );
};

export default Nav;
