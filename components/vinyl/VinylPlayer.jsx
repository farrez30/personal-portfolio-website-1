"use client";
import { useEffect, useRef, useState } from "react";
import { useMode } from "@/components/mode/ModeProvider";
import "./vinyl.css";
import { useTranslations } from "next-intl";
import { PiPlayFill, PiPauseFill, PiXBold, PiMusicNotesBold } from "react-icons/pi";

// --- Hardcoded preview (swap these for the real 30s preview + cover art) ---
const PREVIEW_SRC = "/assets/audio/ES_Despite_Such_a_Trustworthy_Appearance-Ludvig_Moulin.mp3";
const ALBUM_ART = "/assets/webp/me.webp"; // TODO: ganti dengan sampul trek berlisensi
const TRACK_TITLE = "Despite Such a Trustworthy Appearance";
const TRACK_ARTIST = "Ludvig Moulin";

const VinylPlayer = () => {
  const t = useTranslations("pemutar");
  const audioRef = useRef(null);
  // Suara selalu mati di awal; musik baru jalan saat pengunjung menekan putar.
  const [isPlaying, setIsPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { mode } = useMode();

  // Di mode Imersif musik dikendalikan tombol Play pada pemutar CD.
  useEffect(() => {
    const dengar = (e) => {
      const el = audioRef.current;
      if (!el) return;
      if (e.detail.jalan) el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      else {
        el.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("musik", dengar);
    return () => window.removeEventListener("musik", dengar);
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
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

  if (mode === "imersif") return <audio ref={audioRef} src={PREVIEW_SRC} loop preload="none" />;

  return (
    <>
      <audio ref={audioRef} src={PREVIEW_SRC} loop preload="none" />

      <div
        className={`vinyl-player ${hidden ? "is-hidden" : ""}`}
        aria-hidden={hidden}
      >
        <div className="vinyl-stage">
          <span className={`tonearm ${isPlaying ? "tonearm--on" : ""}`} aria-hidden="true" />
          <div className={`vinyl ${isPlaying ? "playing" : ""}`}>
            <span className="vinyl__label">
              <img src={ALBUM_ART} alt="" />
              <span className="vinyl__hole" />
            </span>
          </div>
        </div>

        <div className="vinyl-panel">
          <div className="vinyl-meta">
            <small className="vinyl-meta__now">{t("sedangDiputar")}</small>
            <strong className="vinyl-meta__title">{TRACK_TITLE}</strong>
            <span className="vinyl-meta__artist">{TRACK_ARTIST}</span>
          </div>
          <div className="vinyl-controls">
            <button
              type="button"
              className="vinyl-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? t("jeda") : t("putar")}
              title={isPlaying ? t("jeda") : t("putar")}
            >
              {isPlaying ? <PiPauseFill aria-hidden="true" /> : <PiPlayFill aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="vinyl-btn"
              onClick={() => setHidden(true)}
              aria-label={t("sembunyi")}
              title={t("sembunyi")}
            >
              <PiXBold aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`vinyl-reopen ${hidden ? "is-shown" : ""}`}
        onClick={() => setHidden(false)}
        aria-label={t("tampil")}
        title={t("tampil")}
        aria-hidden={!hidden}
      >
        <PiMusicNotesBold aria-hidden="true" />
      </button>
    </>
  );
};

export default VinylPlayer;
