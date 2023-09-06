import React from "react";
import "./portfolio.css";
import IMG1 from "../../assets/portfolio1.jpg";
import IMG2 from "../../assets/portfolio2.jpg";
import IMG3 from "../../assets/portfolio3.jpg";
import IMG4 from "../../assets/portfolio4.jpg";
import IMG5 from "../../assets/portfolio5.jpg";
import IMG6 from "../../assets/portfolio6.jpg";
import { FiGithub } from "react-icons/fi";
import { MdOpenInNew } from "react-icons/md";

// DO NOT USE THE IMAGES IN PRODUCTION

const data = [
  {
    id: 1,
    image: IMG1,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
  {
    id: 2,
    image: IMG2,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
  {
    id: 3,
    image: IMG3,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
  {
    id: 4,
    image: IMG4,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
  {
    id: 5,
    image: IMG5,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
  {
    id: 6,
    image: IMG6,
    title: "Crypto Currency Dashboard & Financial Visualization",
    github: "https://github.com",
    demo: "https://dribbble.com/shots/22396214-Tree-chart-Hyper-charts-UI-Kit",
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio">
      <h5>My Recent Work</h5>
      <h2>Portfolio</h2>

      <div className="container portfolio__container">
        {data.map(({ id, image, title, github, demo }) => {
          return (
            <article key={id} className="portfolio__item">
              <div className="portfolio__item-image">
                <img src={image} alt={title} />
              </div>
              <h3>{title}</h3>
              <div className="portfolio__item-cta">
                <a href={github} className="btn portfolio__details">
                  Github
                  <FiGithub className="portfolio__details-icon"/>
                </a>
                <a href={demo} className="btn btn-primary portfolio__details" target="_blank">
                  Live Demo
                  <MdOpenInNew className="portfolio__details-icon" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Portfolio;
