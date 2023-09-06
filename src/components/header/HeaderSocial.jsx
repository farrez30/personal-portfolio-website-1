import React from "react";
import { BsLinkedin } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { FaCodepen } from "react-icons/fa";

const HeaderSocial = () => {
  return (
    <div className="header__socials">
      <a href="https://www.linkedin.com/in/farrez/" target="_blank">
        <BsLinkedin />
      </a>
      <a href="https://github.com/farrez30" target="_blank">
        <FaGithub />
      </a>
      <a href="https://codepen.io/farrez30" target="_blank">
        <FaCodepen />
      </a>
    </div>
  );
};

export default HeaderSocial;
