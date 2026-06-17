"use client";
import React, { useState } from "react";
import "./portfolio.css";
import { useTranslations } from "next-intl";
import { FiArrowUpRight } from "react-icons/fi";
import portfolioData from "./portfolioData";
import ShowroomModal from "./ShowroomModal";

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
              {project.thumbnail ? (
                <picture>
                  {project.thumbnailWebp && <source srcSet={project.thumbnailWebp} type="image/webp" />}
                  <img src={project.thumbnail} alt={project.title} loading="lazy" decoding="async" />
                </picture>
              ) : (
                <span className={`showroom-card__poster accent-${project.accent ?? 0}`}>
                  <span className="showroom-card__poster-title">{project.title}</span>
                </span>
              )}
              {project.type === "soon" && <span className="showroom-card__flag">{t("soon")}</span>}
              <span className="showroom-card__view">
                {t("viewCase")} <FiArrowUpRight />
              </span>
            </div>
            <div className="showroom-card__meta">
              <h3>{project.title}</h3>
              {project.role && <small className="text-light">{project.role}</small>}
            </div>
          </button>
        ))}
      </div>

      {active && <ShowroomModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
};

export default Portfolio;
