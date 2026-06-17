"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FiGithub, FiMonitor, FiSmartphone, FiX, FiExternalLink } from "react-icons/fi";

const ShowroomModal = ({ project, onClose }) => {
  const t = useTranslations("portfolio");
  const lenis = useLenis();
  const [view, setView] = useState("desktop");
  const [closing, setClosing] = useState(false);

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

  const handleAnimationEnd = (e) => {
    if (closing && e.animationName === "showroom-out") onClose();
  };

  const externalLinks = (project.links || []).filter((l) => l.href);

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
            </div>
            <div className={`showroom__frame showroom__frame--${view}`}>
              <iframe src={project.demoUrl} title={project.title} loading="lazy" />
            </div>
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
