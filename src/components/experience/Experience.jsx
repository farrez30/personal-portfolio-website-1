import React from "react";
import "./experience.css";
import { SiHtml5 } from "react-icons/si";
import { SiCss3 } from "react-icons/si";
import { DiJsBadge } from "react-icons/di";
import { SiBootstrap } from "react-icons/si";
import { SiTailwindcss } from "react-icons/si";
import { SiReact } from "react-icons/si";
import { SiNodedotjs } from "react-icons/si";
import { SiMongodb } from "react-icons/si";
import { SiPhp } from "react-icons/si";
import { SiMysql } from "react-icons/si";
import { SiJest } from "react-icons/si";
import { SiAxios } from "react-icons/si";
import { SiRedux } from "react-icons/si";
import { SiChakraui } from "react-icons/si";
import { SiExpress } from "react-icons/si";
import { SiSequelize } from "react-icons/si";
import { SiNodemon } from "react-icons/si";
import { BsPatchCheckFill } from "react-icons/bs";

const Experience = () => {
  return (
    <section id="experience">
      <h5>What Skills I Have</h5>
      <h2>My Experiences</h2>

      <div class="container experience__container">
        <div class="experience__frontend">
          <h3>Frontend Development</h3>
          <div class="experience__content">
            <article class="experience__details">
              <SiHtml5 />
              <h4>HTML</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiCss3 />
              <h4>CSS</h4>
              <small className="text-light">intermediate</small>
            </article>

            <article class="experience__details">
              <DiJsBadge />
              <h4>Javascript</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiBootstrap />
              <h4>Bootstrap</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiTailwindcss />
              <h4>Tailwind</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiReact />
              <h4>React</h4>
              <small className="text-light">Experienced</small>
            </article>
          </div>
        </div>
        {/* END OF FRONTEND */}

        <div class="experience__backend">
          <h3>Backend Development</h3>
          <div class="experience__content">
            <article class="experience__details">
              <SiNodedotjs />
              <h4>Node JS</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiMongodb />
              <h4>MongoDB</h4>
              <small className="text-light">intermediate</small>
            </article>

            <article class="experience__details">
              <SiRedux />
              <h4>Redux</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiMysql />
              <h4>MySQL</h4>
              <small className="text-light">Experienced</small>
            </article>

            <article class="experience__details">
              <SiSequelize />
              <h4>Sequelize</h4>
              <small className="text-light">Experienced</small>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
