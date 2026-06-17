"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  FiGithub,
  FiMonitor,
  FiSmartphone,
  FiX,
  FiExternalLink,
  FiImage,
  FiPlay,
} from "react-icons/fi";
import { getTech } from "./techStack";

const ShowroomModal = ({ project, onClose }) => {
  const t = useTranslations("portfolio");
  const lenis = useLenis();
  const [view, setView] = useState("desktop");
  const [closing, setClosing] = useState(false);
  const [liveMode, setLiveMode] = useState(false); // screenshot first; iframe is opt-in
  const [frameLoaded, setFrameLoaded] = useState(false);

  const requestClose = () => setClosing(true);

  // Lock scroll + Escape-to-close while the modal is open.
  useEffect(() => {
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [lenis]);

  // Reset the iframe loading state whenever the live embed (re)mounts.
  useEffect(() => {
    if (liveMode) setFrameLoaded(false);
  }, [liveMode, view, project.id]);

  const handleAnimationEnd = (e) => {
    if (closing && e.animationName === "showroom-out") onClose();
  };

  const externalLinks = (project.links || []).filter((l) => l.href);
  const tech = project.tech || [];

  return (
    <div
      className={`showroom ${closing ? "is-closing" : ""}`}
      onClick={requestClose}
      onAnimationEnd={handleAnimationEnd}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className="showroom__dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="showroom__close" onClick={requestClose} aria-label={t("close")}>
          <FiX />
        </button>

        <header className="showroom__head">
          <h3 className="showroom__title">{project.title}</h3>
          <div className="showroom__chips">
            {project.year && <span className="showroom__chip">{project.year}</span>}
            {project.role && <span className="showroom__chip">{project.role}</span>}
          </div>
        </header>

        {project.type === "web" && (
          <div className="showroom__viewport">
            <div className="showroom__toolbar">
              <button
                type="button"
                className={!liveMode ? "active" : ""}
                onClick={() => setLiveMode(false)}
              >
                <FiImage /> {t("preview")}
              </button>
              <button
                type="button"
                className={liveMode ? "active" : ""}
                onClick={() => setLiveMode(true)}
              >
                <FiPlay /> {t("livePreview")}
              </button>
              {liveMode && (
                <>
                  <button
                    type="button"
                    className={view === "desktop" ? "active" : ""}
                    onClick={() => setView("desktop")}
                  >
                    <FiMonitor /> {t("desktop")}
                  </button>
                  <button
                    type="button"
                    className={view === "mobile" ? "active" : ""}
                    onClick={() => setView("mobile")}
                  >
                    <FiSmartphone /> {t("mobile")}
                  </button>
                </>
              )}
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="showroom__toolbar-link"
              >
                <FiExternalLink /> {t("openNewTab")}
              </a>
            </div>

            {!liveMode ? (
              <div className="showroom__frame showroom__frame--shot">
                <span className={`showroom__shot-poster accent-${project.accent ?? 0}`}>
                  <span>{project.title}</span>
                </span>
                {project.thumbnail && (
                  <img
                    className="showroom__shot-img"
                    src={project.thumbnail}
                    alt={project.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary showroom__shot-cta"
                >
                  {t("visitSite")} <FiExternalLink />
                </a>
              </div>
            ) : (
              <div className={`showroom__frame showroom__frame--${view}`}>
                <iframe
                  key={view}
                  src={project.demoUrl}
                  title={project.title}
                  loading="lazy"
                  onLoad={() => setFrameLoaded(true)}
                />
                {!frameLoaded && (
                  <div className="showroom__skeleton" aria-hidden="true">
                    <span className="showroom__spinner" />
                  </div>
                )}
              </div>
            )}
            <small className="showroom__hint">{t("previewNote")}</small>
          </div>
        )}

        {project.type === "media" &&
          (project.media && project.media.length > 0 ? (
            <Swiper
              className="showroom__swiper"
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop
              grabCursor
              spaceBetween={20}
            >
              {project.media.map((m, i) => (
                <SwiperSlide key={i} className="showroom__slide">
                  {m.kind === "video" ? (
                    <video src={m.src} controls />
                  ) : (
                    <img src={m.src} alt={`${project.title} ${i + 1}`} loading="lazy" />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className={`showroom__placeholder accent-${project.accent ?? 0}`}>
              <span>{t("uiuxCase")}</span>
            </div>
          ))}

        {project.type === "soon" && (
          <div className={`showroom__soon accent-${project.accent ?? 0}`}>
            <span className="showroom__badge">{t("soon")}</span>
          </div>
        )}

        {tech.length > 0 && (
          <div className="showroom__tech">
            <h4>{t("builtWith")}</h4>
            <ul className="tech-list">
              {tech.map((key) => {
                const { Icon, label } = getTech(key);
                return (
                  <li key={key} className="tech-chip">
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="showroom__content">
          {project.concept && (
            <section>
              <h4>{t("concept")}</h4>
              <p>{project.concept}</p>
            </section>
          )}
          {project.impact && (
            <section>
              <h4>{t("impact")}</h4>
              <p>{project.impact}</p>
            </section>
          )}
          {project.learnings && (
            <section>
              <h4>{t("learnings")}</h4>
              <p>{project.learnings}</p>
            </section>
          )}
        </div>

        <footer className="showroom__links">
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t("visitSite")} <FiExternalLink />
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn">
              {t("github")} <FiGithub />
            </a>
          )}
          {externalLinks.map((l, i) => (
            <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className="btn">
              {l.label} <FiExternalLink />
            </a>
          ))}
        </footer>
      </div>
    </div>
  );
};

export default ShowroomModal;
