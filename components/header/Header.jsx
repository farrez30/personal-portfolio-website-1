"use client";
import React from "react";
import "./header.css";
import CTA from "./CTA";
import HeaderSocial from "./HeaderSocial";
import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const audio = "/assets/audio/ES_Despite_Such_a_Trustworthy_Appearance-Ludvig_Moulin.mp3";

const Header = () => {
  const t = useTranslations("header");
  const audioRef = useRef(null);
  const hasUserInteracted = useRef(false);
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

  // Set autoplay directly on DOM element and enable audio after first user interaction
  useEffect(() => {
    if (audioRef.current) {
      // Set autoplay attribute directly on DOM (may work better than React prop)
      audioRef.current.setAttribute('autoplay', '');
      audioRef.current.setAttribute('muted', '');
    }

    const enableAudio = async () => {
      if (audioRef.current && !hasUserInteracted.current) {
        hasUserInteracted.current = true;

        try {
          // Unmute and play after user interaction
          audioRef.current.muted = false;
          if (audioRef.current.paused) {
            await audioRef.current.play();
          }
        } catch (error) {
          // Silently handle error - user can manually play if needed
        }
      }
    };

    // Listen for any user interaction on the page
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
    };
  }, []);

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

        <div className="spotify__container">
          <audio
            src={audio}
            title="theme song"
            controls
            autoPlay
            loop
            muted
            preload="auto"
            ref={(el) => {
              audioRef.current = el;
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
