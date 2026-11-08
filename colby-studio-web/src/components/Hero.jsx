import React from 'react';
import { NavLink } from 'react-router-dom';
import RippleCanvas from './RippleCanvas';
import Logo from '../assets/combined.svg';
import '../styles/Hero.css';

/**
 * 
 * @returns The hero section
 */
export default function Hero() {
  return (
    <section className="hero">
      {/* Background layers */}
      <div className="hero-bg" aria-hidden="true">
        <RippleCanvas
          colors={{ color1: '#2E3192', color2: '#4A4EAA', color3: '#f47b5f', color4: '#ef4136' }}
        />
      </div>

      {/* Main content */}
      <div className="hero-inner">
        <div className="hero-copy">


          <h1 className="hero-title hero-reveal" style={{ '--d': '0.15s' }}>
            Record Your <span className="hero-accent">Audio Vision</span>
          </h1>


          <div className="hero-actions hero-reveal" style={{ '--d': '0.45s' }}>
            <NavLink to="/booking" className="hero-btn">
              Book a session
            </NavLink>
            <a href="#our-work" className="hero-link">
              Hear our work
            </a>
          </div>
        </div>

        <div className="hero-visual hero-reveal" style={{ '--d': '0.25s' }}>
          <div className="hero-disc">
            <img src={Logo} alt="Studio at Colby" className="hero-logo" />
          </div>
        </div>
      </div>


    </section>
  );
}
