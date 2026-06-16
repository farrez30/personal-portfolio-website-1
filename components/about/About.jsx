import React from "react";
import "./about.css";
import { getTranslations } from "next-intl/server";

const ME = "/assets/monkey.gif";

const About = async () => {
  const t = await getTranslations("about");

  return (
    <section id="about">
      <h5>{t("subtitle")}</h5>
      <h2>{t("title")}</h2>

      <div className="container about__container">
        <div className="about__me">
          <div className="about__me-image">
            <img
              src={ME}
              alt={t("title")}
              title={t("title")}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="about__content">
          <p>{t("bio1")}</p>
          <p>{t("bio2")}</p>
          <p>{t("bio3")}</p>

          <a href="#contact" className="btn btn-primary">
            {t("letsTalk")}
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
