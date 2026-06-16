"use client";
import React from "react";
import "./header.css";
import CTA from "./CTA";
import HeaderSocial from "./HeaderSocial";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const Header = () => {
  const t = useTranslations("header");
  const headerRef = useRef(null);
  const reduce = useReducedMotion();

  // Track scroll progress across the hero for the parallax layers.
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });

  // Each layer moves at a different rate to build depth.
  const meY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const meRotateX = useTransform(scrollYProgress, [0, 1], [0, 9]);
  const meScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const meStyle = reduce
    ? undefined
    : { y: meY, rotateX: meRotateX, scale: meScale, transformPerspective: 1000 };
  const textStyle = reduce ? undefined : { y: textY };

  return (
    <header id="home" ref={headerRef}>
      <div className="container header__container">
        <motion.div className="header__intro" style={textStyle}>
          <h5>{t("greeting")}</h5>
          <h1>{t("name")}</h1>
          <h5 className="text-light">{t("tagline")}</h5>
          <CTA />
        </motion.div>

        <HeaderSocial />

        <motion.div className="me" style={meStyle}>
          <iframe src="https://giphy.com/embed/qgQUggAC3Pfv687qPC" alt="me" style={{ pointerEvents: "none" }} loading="lazy" title="me" />
        </motion.div>

        <a href="#contact" className="scroll__down">
          {t("scrollDown")}
        </a>
      </div>
    </header>
  );
};

export default Header;
