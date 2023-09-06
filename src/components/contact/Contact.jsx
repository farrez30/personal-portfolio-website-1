import React from "react";
import "./contact.css";
import { MdOutlineEmail } from "react-icons/md";
import { RiMessengerLine } from "react-icons/ri";
import { BsWhatsapp } from "react-icons/bs";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Contact = () => {
  const handleClick = () => {
    Swal.fire({
      // position: 'top-end',
      icon: "success",
      title: "Your message has been sent",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const form = { useRef };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm("service_n9r4x8p", "template_s50v8c4", form.current, "sHLzgGlimFe2gylV8");

    e.target.reset();
  };
  return (
    <section id="contact">
      <h5>Get In Touch</h5>
      <h2>Contact Me</h2>

      <div className="container contact__container">
        <div className="contact__options">
          <article className="contact__option">
            <MdOutlineEmail className="contact__option-icon" />
            <h4>Email</h4>
            <h5>dimmyemail@gmail.com</h5>
            <a href="mailto:farrezalhakim@gmail.com" target="_blank">
              Send a message
            </a>
          </article>
          <article className="contact__option">
            <RiMessengerLine className="contact__option-icon" />
            <h4>Messenger</h4>
            <h5>brobro</h5>
            <a href="https://m.me/brobro" target="_blank">
              Send a message
            </a>
          </article>
          <article className="contact__option">
            <BsWhatsapp className="contact__option-icon" />
            <h4>WhatsApp</h4>
            <h5>+123456789</h5>
            <a href="https://api.whatsapp.com/send?phone=6285884061543" target="_blank">
              Send a message
            </a>
          </article>
        </div>
        {/* END OF CONTACT OPTIONS */}
        <form ref={form} onSubmit={sendEmail}>
          <input type="text" name="name" placeholder="Your Full Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" rows="7" placeholder="Your Message" required></textarea>
          <button type="submit" className="btn btn-primary" onClick={handleClick}>
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
