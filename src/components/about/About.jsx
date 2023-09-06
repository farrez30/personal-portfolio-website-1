import React from "react";
import "./about.css";
// import ME from "../../assets/me-about.jpg";
import ME from "../../assets/monkey.gif";
import { FaAward } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { VscFolderLibrary } from "react-icons/vsc";

const About = () => {
  return (
    <section id="about">
      <h5>Get To Know</h5>
      <h2>About Me</h2>

      <div className="container about__container">
        <div className="about__me">
          <div className="about__me-image">
            <img src={ME} alt="About Image" />
          </div>
        </div>

        <div className="about__content">
          {/* <div className="about__cards">
            <article className="about__card">
              <FaAward className="about__icon" />
              <h5>Experience</h5>
              <small>3+ Years Working</small>
            </article>

            <article className="about__card">
              <FiUsers className="about__icon" />
              <h5>Clients</h5>
              <small>200+ Worldwide</small>
            </article>

            <article className="about__card">
              <VscFolderLibrary className="about__icon" />
              <h5>Projects</h5>
              <small>80+ Completed projects</small>
            </article>
          </div> */}

          <p>
            A Business Management graduate who has decided to embark on a new career path in web development. I've
            always been fascinated by technology, so when I started learning more about web development, I was hooked
            right away.
            <br />
            <br />
            I began my web development journey in 2021 by learning on my own before finally enrolling in a Full Stack
            Web Development program at Purwadhika Digital Technology School, where I gained practical experience with a
            variety of front-end and back-end technologies that emphasize a practical approach and real-world projects
            simulating industry scenarios.
            <br />
            <br />
            Additionally, I gained hands-on experience in building robust and scalable web APIs, working with databases,
            handling authentication and security, implementing efficient server-side architecture, creating responsive
            and visually appealing user interfaces, integrating APIs, handling user interactions, and optimizing web
            performance.
          </p>

          <a href="#contact" className="btn btn-primary">
            Let's Talk
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
