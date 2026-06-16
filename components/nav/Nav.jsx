"use client";
import React, { useState, useEffect } from "react";
import "./nav.css";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AiOutlineHome } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { BiBook } from "react-icons/bi";
import { VscCode } from "react-icons/vsc";
import { BiMessageSquareDetail } from "react-icons/bi";

const LINKS = [
  { id: "#home", key: "home", Icon: AiOutlineHome },
  { id: "#about", key: "about", Icon: AiOutlineUser },
  { id: "#experience", key: "experience", Icon: BiBook },
  { id: "#portfolio", key: "portfolio", Icon: VscCode },
  { id: "#contact", key: "contact", Icon: BiMessageSquareDetail },
];

const Nav = () => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();
  const [activeNav, setActiveNav] = useState("#home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => l.id);

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      for (const section of sections) {
        const elem = document.querySelector(section);
        if (elem) {
          const rect = elem.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={scrolled ? "scrolled" : ""}
      style={{ x: "-50%" }}
      initial={reduce ? false : { y: 48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }}
    >
      {LINKS.map(({ id, key, Icon }) => {
        const isActive = activeNav === id;
        return (
          <a
            key={id}
            href={id}
            onClick={() => setActiveNav(id)}
            className={isActive ? "active" : ""}
            aria-label={t(key)}
            title={t(key)}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav__pill"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              />
            )}
            <Icon />
          </a>
        );
      })}
    </motion.nav>
  );
};

export default Nav;
