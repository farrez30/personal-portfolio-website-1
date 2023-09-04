import React from "react";
import "./testimonials.css";
import AVTR1 from "../../assets/avatar1.png";
import AVTR2 from "../../assets/avatar2.png";
import AVTR3 from "../../assets/avatar3.png";
import AVTR4 from "../../assets/avatar4.png";

// import Swiper core and required modules
import { Pagination } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const data = [
  {
    avatar: AVTR1,
    name: "Tina Snow",
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eos deserunt expedita cumque iusto? Optio ducimus possimus voluptate autem voluptatem, quaerat magnam maiores temporibus architecto dolore. Dicta nulla ducimus repellendus!",
  },
  {
    avatar: AVTR2,
    name: "Shatta Wale",
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eos deserunt expedita cumque iusto? Optio ducimus possimus voluptate autem voluptatem, quaerat magnam maiores temporibus architecto dolore. Dicta nulla ducimus repellendus!",
  },
  {
    avatar: AVTR3,
    name: "Kwame Despite",
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eos deserunt expedita cumque iusto? Optio ducimus possimus voluptate autem voluptatem, quaerat magnam maiores temporibus architecto dolore. Dicta nulla ducimus repellendus!",
  },
  {
    avatar: AVTR4,
    name: "Nana Ama McBrown",
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eos deserunt expedita cumque iusto? Optio ducimus possimus voluptate autem voluptatem, quaerat magnam maiores temporibus architecto dolore. Dicta nulla ducimus repellendus!",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials">
      <h5>Review from clients</h5>
      <h2>Tesimonials</h2>

      <Swiper
        className="container testimonials__container"
        // install Swiper modules
        modules={[Pagination]}
        spaceBetween={40}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        {data.map(({ avatar, name, review }, index) => {
          return (
            <SwiperSlide key={index} className="testimonial">
              <div className="client__avatar">
                <img src={avatar} alt="Avatar One" />
              </div>
              <h5 className="client__name">{name}</h5>
              <small className="client__review">{review}</small>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default Testimonials;
