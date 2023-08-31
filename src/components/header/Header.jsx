import React from "react";
import "./header.css";
import CTA from "./CTA";
import ME from "../../assets/me.png";
import HeaderSocial from "./HeaderSocial";

const Header = () => {
  return (
    <header>
      <div class="container header__container">
        <h5>Hello I'm</h5>
        <h1>Farrez Al Hakim</h1>
        <h5 class="text-light">Full Stack Developer</h5>
        <CTA />
        <HeaderSocial />

        <div class="me">
          <img src={ME} alt="me" />
        </div>

        <a href="#contact" className="scroll__down">
          Scroll Down
        </a>
      </div>
    </header>
  );
};

export default Header;
