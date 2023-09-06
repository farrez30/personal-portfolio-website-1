import React from "react";
import "./header.css";
import CTA from "./CTA";
import ME from "../../assets/me.png";
import HeaderSocial from "./HeaderSocial";

const Header = () => {
  return (
    <header id="home">
      <div className="container header__container">
        <h5>Hello I'm</h5>
        <h1>Farrez Al Hakim</h1>
        <h5 className="text-light">Full Stack Developer</h5>
        <CTA />
        <HeaderSocial />
        <div className="me">
          {/* <img src={ME} alt="me" /> */}
          <iframe src="https://giphy.com/embed/qgQUggAC3Pfv687qPC" alt="me" style={{ pointerEvents: "none" }} />
        </div>
        <a href="#contact" className="scroll__down">
          Scroll Down
        </a>
        <div className="spotify__container">
          <iframe
            src="https://open.spotify.com/embed/track/5OGtEYIYqGD9rasNWLGczi?utm_source=generator&theme=0"
            width="100%"
            height="100"
            frameBorder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </header>
  );
};

export default Header;
