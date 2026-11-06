import React from 'react';
import { NavLink } from 'react-router-dom';
import RippleCanvas from './RippleCanvas';
import Logo from '../assets/combined.svg';
import '../styles/Hero2.css';


export default function Hero2() {
  return (
    <section className="hero2">
      {/* Background layers */}
      <div className="hero2-bg" aria-hidden="true">
        <RippleCanvas
          colors={{ color1: '#2E3192', color2: '#4A4EAA', color3: '#f47b5f', color4: '#ef4136' }}
        />
      </div>
      <div className="hero2-shade" aria-hidden="true" />
      <div className="hero2-grain" aria-hidden="true" />

      {/* Main content */}
      <div className="hero2-inner">
        <div className="hero2-copy">


          <h1 className="hero2-title hero2-reveal" style={{ '--d': '0.15s' }}>
            Record Your <span className="hero2-accent">Audio Vision</span>
          </h1>


          <div className="hero2-actions hero2-reveal" style={{ '--d': '0.45s' }}>
            <NavLink to="/booking" className="hero2-btn">
              Book a session
            </NavLink>
            <a href="#our-work" className="hero2-link">
              Hear our work
            </a>
          </div>
        </div>

        <div className="hero2-visual hero2-reveal" style={{ '--d': '0.25s' }}>
          <div className="hero2-disc">
            <img src={Logo} alt="Studio at Colby" className="hero2-logo" />
          </div>
        </div>
      </div>


    </section>
  );
}
