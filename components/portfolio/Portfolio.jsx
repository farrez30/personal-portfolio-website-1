"use client";
import React, { useState } from "react";
import "./portfolio.css";
import { useTranslations } from "next-intl";
import { FiArrowUpRight } from "react-icons/fi";
import portfolioData from "./portfolioData";
import ShowroomModal from "./ShowroomModal";
import { getTech } from "./techStack";

const Portfolio = () => {
  const t = useTranslations("portfolio");
  const [active, setActive] = useState(null);

  return (
    <section id="portfolio">
      <h5>{t("subtitle")}</h5>
      <h2>{t("title")}</h2>

      <div className="container portfolio__container">
        {portfolioData.map((project) => (
          <button
            key={project.id}
            type="button"
            className="showroom-card"
            onClick={() => setActive(project)}
            aria-label={`${project.title} — ${t("viewCase")}`}
          >
            <div className="showroom-card__media">
              {/* Gradient poster is the always-present base layer; a screenshot
                  (if the file exists) overlays it and hides itself on error. */}
              <span className={`showroom-card__poster accent-${project.accent ?? 0}`}>
                <span className="showroom-card__poster-title">{project.title}</span>
              </span>
              {project.thumbnail && (
                <img
                  className="showroom-card__shot"
                  src={project.thumbnail}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              {project.type === "soon" && <span className="showroom-card__flag">{t("soon")}</span>}
              <span className="showroom-card__view">
                {t("viewCase")} <FiArrowUpRight />
              </span>
            </div>
            <div className="showroom-card__meta">
              <h3>{project.title}</h3>
              {project.role && <small className="text-light">{project.role}</small>}
              {project.tech && project.tech.length > 0 && (
                <span className="showroom-card__tech" aria-hidden="true">
                  {project.tech.slice(0, 5).map((key) => {
                    const { Icon, label } = getTech(key);
                    return <Icon key={key} title={label} />;
                  })}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {active && <ShowroomModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
};

export default Portfolio;
