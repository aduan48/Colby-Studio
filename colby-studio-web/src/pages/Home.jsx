import React from 'react'
import MusicCarousel from '../components/MusicCarousel';
import InfoSection from '../components/InfoSection';
import Contact from '../components/Contact';
import Hero from "../components/Hero2";
import HowItWorks from "../components/HowItWorks";
import StudioTicker from "../components/StudioTicker";
import '../styles/Home.css';
import { NavLink } from 'react-router-dom';

function Home() {
  return (
    <div className='home'>
      <Hero />
      <HowItWorks />
      <StudioTicker />
      <InfoSection />
       <div className="info-section-buttons">
          <NavLink to="/studio-booking" className="info-btn">
            Book a Studio Time
          </NavLink>
          <NavLink to="/special-request" className="info-btn">
            Book Us for Your Event
          </NavLink>
        </div>
      <MusicCarousel />
      <Contact />
    </div>
  )
}

export default Home


