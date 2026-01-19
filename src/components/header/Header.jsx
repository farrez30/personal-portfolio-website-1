import React from "react";
import "./header.css";
import CTA from "./CTA";
import HeaderSocial from "./HeaderSocial";
import audio from "../../assets/audio/ES_Despite_Such_a_Trustworthy_Appearance-Ludvig_Moulin.mp3";
import { useRef, useEffect } from "react";

const Header = () => {
  const audioRef = useRef(null);
  const hasUserInteracted = useRef(false);

  // Set autoplay directly on DOM element and enable audio after first user interaction
  useEffect(() => {
    if (audioRef.current) {
      // Set autoplay attribute directly on DOM (may work better than React prop)
      audioRef.current.setAttribute('autoplay', '');
      audioRef.current.setAttribute('muted', '');
    }

    const enableAudio = async () => {
      if (audioRef.current && !hasUserInteracted.current) {
        hasUserInteracted.current = true;
        
        try {
          // Unmute and play after user interaction
          audioRef.current.muted = false;
          if (audioRef.current.paused) {
            await audioRef.current.play();
          }
        } catch (error) {
          // Silently handle error - user can manually play if needed
        }
      }
    };

    // Listen for any user interaction on the page
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
    };
  }, []);

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
          <iframe src="https://giphy.com/embed/qgQUggAC3Pfv687qPC" alt="me" style={{ pointerEvents: "none" }} loading="lazy" title="me" />
        </div>
        <a href="#contact" className="scroll__down">
          Scroll Down
        </a>
        <div className="spotify__container">
          {/* <iframe 
          title="spotify"
          data-testid="embed-iframe" 
          style={{ borderRadius: "12px" }} 
          src="https://open.spotify.com/embed/track/0iIcuwia47B5bzjVpyUwyI?utm_source=generator&theme=0"
           width="100%" 
          //  height="152" 
           allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
           loading="lazy"
           autoplay></iframe> */}

          <audio
            src={audio}
            title="theme song"
            controls
            autoPlay
            loop
            muted
            preload="auto"
            ref={(el) => {
              audioRef.current = el;
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
