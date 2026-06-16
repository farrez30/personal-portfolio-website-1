import React from "react";
import "./experience.css";
import { getTranslations } from "next-intl/server";
import { SiHtml5 } from "react-icons/si";
import { SiCss3 } from "react-icons/si";
import { DiJsBadge } from "react-icons/di";
import { SiBootstrap } from "react-icons/si";
import { SiTailwindcss } from "react-icons/si";
import { SiReact } from "react-icons/si";
import { SiNodedotjs } from "react-icons/si";
import { SiMongodb } from "react-icons/si";
import { SiMysql } from "react-icons/si";
import { SiRedux } from "react-icons/si";
import { SiSequelize } from "react-icons/si";

const Experience = async () => {
  const t = await getTranslations("experience");
  const experienced = t("experienced");
  const intermediate = t("intermediate");

  return (
    <section id="experience">
      <h5>{t("subtitle")}</h5>
      <h2>{t("title")}</h2>

      <div className="container experience__container">
        <div className="experience__frontend">
          <h3>{t("frontend")}</h3>
          <div className="experience__content">
            <article className="experience__details">
              <SiHtml5 className="experience__details-icon" />
              <div>
                <h4>HTML</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiCss3 className="experience__details-icon" />
              <div>
                <h4>CSS</h4>
                <small className="text-light">{intermediate}</small>
              </div>
            </article>

            <article className="experience__details">
              <DiJsBadge className="experience__details-icon" />
              <div>
                <h4>Javascript</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiBootstrap className="experience__details-icon" />
              <div>
                <h4>Bootstrap</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiTailwindcss className="experience__details-icon" />
              <div>
                <h4>Tailwind</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiReact className="experience__details-icon" />
              <div>
                <h4>React</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>
          </div>
        </div>
        {/* END OF FRONTEND */}

        <div className="experience__backend">
          <h3>{t("backend")}</h3>
          <div className="experience__content">
            <article className="experience__details">
              <SiNodedotjs className="experience__details-icon" />
              <div>
                <h4>Node JS</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiMongodb className="experience__details-icon" />
              <div>
                <h4>MongoDB</h4>
                <small className="text-light">{intermediate}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiRedux className="experience__details-icon" />
              <div>
                <h4>Redux</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiMysql className="experience__details-icon" />
              <div>
                <h4>MySQL</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>

            <article className="experience__details">
              <SiSequelize className="experience__details-icon" />
              <div>
                <h4>Sequelize</h4>
                <small className="text-light">{experienced}</small>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
