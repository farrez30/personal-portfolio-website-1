import React from "react";
import "./header.css";
import CTA from "./CTA";

const Header = () => {
  return (
    <header>
      <div class="container header__container">
        <h5>Hello I'm</h5>
        <h1>Farrez Al Hakim</h1>
        <h5 class="text-light">Full Stack Developer</h5>
        <CTA />
      </div>
    </header>
  );
};

export default Header;
