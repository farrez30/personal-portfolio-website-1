import React from "react";
import { BsLinkedin } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { FaCodepen } from "react-icons/fa";

const HeaderSocial = () => {
  return (
    <div className="header__socials">
      <a href="https://www.linkedin.com/in/farrez/" target="_blank" rel="noopener noreferrer">
        <BsLinkedin />
      </a>
      <a href="https://github.com/farrez30" target="_blank" rel="noopener noreferrer">
        <FaGithub />
      </a>
      <a href="https://codepen.io/farrez30" target="_blank" rel="noopener noreferrer">
        <FaCodepen />
      </a>
    </div>
  );
};

export default HeaderSocial;
