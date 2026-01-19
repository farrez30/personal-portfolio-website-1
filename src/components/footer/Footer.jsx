import React, { useState, useEffect } from "react";
import "./footer.css";
import { FaFacebookF } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";
import { IoLogoTwitter } from "react-icons/io";

const Footer = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <a href="#" className="footer__logo" target="_blank" rel="noopener noreferrer">
        Farrez
      </a>

      <ul className="permalinks">
        <li>
          <a href="#" target="_blank" rel="noopener noreferrer">Home</a>
        </li>
        <li>
          <a href="#about" target="_blank" rel="noopener noreferrer">About</a>
        </li>
        <li>
          <a href="#experience" target="_blank" rel="noopener noreferrer">Experience</a>
        </li>
        {/* <li>
          <a href="#services">Services</a>
        </li> */}
        <li>
          <a href="#portfolio" target="_blank" rel="noopener noreferrer">Portfolio</a>
        </li>
        {/* <li>
          <a href="#testimonials">Testimonials</a>
        </li> */}
        <li>
          <a href="#contact" target="_blank" rel="noopener noreferrer">Contact</a>
        </li>
      </ul>

      <div className="footer__socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FiInstagram />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <IoLogoTwitter />
        </a>
      </div>

      <div className="footer__copyright">
        <small>&copy; Farrez. All rights reserved {year}.</small>
      </div>
    </footer>
  );
};

export default Footer;
