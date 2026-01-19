import React, { useRef } from "react";
import "./contact.css";
import { MdOutlineEmail } from "react-icons/md";
// import { RiMessengerLine } from "react-icons/ri";
import { BsWhatsapp } from "react-icons/bs";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const Contact = () => {
  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    const form = formRef.current;

    // Validate form fields before sending the email
    if (form.name.value === null || form.email.value === null || form.message.value === null) {
      // Display an error message or handle the validation as needed
      Swal.fire({
        icon: "error",
        title: "Please fill in all the required fields.",
      });
    } else {
      emailjs.sendForm("service_n9r4x8p", "template_s50v8c4", form, "sHLzgGlimFe2gylV8");

      // Reset the form after successful submission
      form.reset();

      // Display success message
      handleClick();
    }
  };

  const handleClick = () => {
    Swal.fire({
      icon: "success",
      title: "Your message has been sent",
      showConfirmButton: false,
      timer: 1500,
    });
  };
  return (
    <section id="contact">
      <h5>Get In Touch</h5>
      <h2>Contact Me</h2>

      <div className="container contact__container">
        <div className="contact__options">
          <article className="contact__option">
            <MdOutlineEmail className="contact__option-icon" />
            <h2>Email</h2>
            <h5>You could directly email me 📨</h5>
            <a href="mailto:farrezalhakim@gmail.com" target="_blank" rel="noopener noreferrer">
              📧 SEND NOW 📧
            </a>
          </article>
          {/* <article className="contact__option">
            <RiMessengerLine className="contact__option-icon" />
            <h4>Messenger</h4>
            <h5>brobro</h5>
            <a href="https://m.me/brobro" target="_blank">
              Send a message
            </a>
          </article> */}
          <article className="contact__option">
            <BsWhatsapp className="contact__option-icon" />
            <h2>WhatsApp</h2>
            <h5>or use WA to reach me 😉</h5>
            <a href="https://api.whatsapp.com/send?phone=6285884061543" target="_blank" rel="noopener noreferrer">
              💬 CONTACT ME 💬
            </a>
          </article>
        </div>
        {/* END OF CONTACT OPTIONS */}
        <form ref={formRef} onSubmit={sendEmail}>
          <input type="text" name="name" placeholder="Your Full Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" rows="7" placeholder="Your Message" required></textarea>
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
