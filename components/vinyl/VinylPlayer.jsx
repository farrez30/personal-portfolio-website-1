"use client";
import React, { useEffect, useRef, useState } from "react";
import "./vinyl.css";
import { useTranslations } from "next-intl";
import { FiPlay, FiPause, FiX, FiMusic } from "react-icons/fi";

// --- Hardcoded preview (swap these for the real 30s preview + cover art) ---
const PREVIEW_SRC = "/assets/audio/ES_Despite_Such_a_Trustworthy_Appearance-Ludvig_Moulin.mp3";
const ALBUM_ART = "/assets/webp/me.webp";
const TRACK_TITLE = "Despite Such a Trustworthy Appearance";
const TRACK_ARTIST = "Ludvig Moulin";

const VinylPlayer = () => {
  const t = useTranslations("player");
  const audioRef = useRef(null);
  const hasUserInteracted = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true); // starts spinning (muted) per autoplay policy
  const [hidden, setHidden] = useState(false);

  // Browser autoplay policy: begin muted + spinning, then unmute on first gesture.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.muted = true;
    el.play().catch(() => setIsPlaying(false));

    const enableAudio = async () => {
      if (hasUserInteracted.current) return;
      hasUserInteracted.current = true;
      try {
        if (audioRef.current) {
          audioRef.current.muted = false;
          if (audioRef.current.paused) {
            await audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } catch (e) {
        /* user can press play manually */
      }
    };

    const events = ["click", "touchstart", "keydown"];
    events.forEach((ev) => document.addEventListener(ev, enableAudio, { once: true }));
    return () => events.forEach((ev) => document.removeEventListener(ev, enableAudio));
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    // Claim the interaction so the one-time auto-unmute handler doesn't fight
    // an explicit pause on the very first click.
    hasUserInteracted.current = true;
    if (el.paused) {
      el.muted = false;
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={PREVIEW_SRC} loop preload="auto" />

      <div
        className={`vinyl-player ${hidden ? "is-hidden" : ""}`}
        aria-hidden={hidden}
      >
        <div className="vinyl-stage">
          <span className={`tonearm ${isPlaying ? "tonearm--on" : ""}`} aria-hidden="true" />
          <div className={`vinyl ${isPlaying ? "playing" : ""}`}>
            <span className="vinyl__label">
              <img src={ALBUM_ART} alt={`${TRACK_TITLE} — ${TRACK_ARTIST}`} />
              <span className="vinyl__hole" />
            </span>
          </div>
        </div>

        <div className="vinyl-panel">
          <div className="vinyl-meta">
            <small className="vinyl-meta__now">{t("nowPlaying")}</small>
            <strong className="vinyl-meta__title">{TRACK_TITLE}</strong>
            <span className="vinyl-meta__artist">{TRACK_ARTIST}</span>
          </div>
          <div className="vinyl-controls">
            <button
              type="button"
              className="vinyl-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? t("pause") : t("play")}
              title={isPlaying ? t("pause") : t("play")}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            <button
              type="button"
              className="vinyl-btn"
              onClick={() => setHidden(true)}
              aria-label={t("hide")}
              title={t("hide")}
            >
              <FiX />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`vinyl-reopen ${hidden ? "is-shown" : ""}`}
        onClick={() => setHidden(false)}
        aria-label={t("show")}
        title={t("show")}
        aria-hidden={!hidden}
      >
        <FiMusic />
      </button>
    </>
  );
};

export default VinylPlayer;
