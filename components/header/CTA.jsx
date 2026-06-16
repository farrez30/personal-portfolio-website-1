import React from "react";
import { useTranslations } from "next-intl";

const CV = "/assets/FarrezCV.pdf";

const CTA = () => {
  const t = useTranslations("header");
  return (
    <div className="cta">
      <a href={CV} download className="btn">
        {t("downloadCV")}
      </a>
      <a href="#contact" className="btn btn-primary">
        {t("letsTalk")}
      </a>
    </div>
  );
};

export default CTA;
