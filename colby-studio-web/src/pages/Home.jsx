import React from 'react'
import MusicCarousel from '../components/MusicCarousel';
import InfoSection from '../components/InfoSection';
import Contact from '../components/Contact';
import Hero from "../components/Hero2";
import '../styles/Home.css';

function Home() {
  return (
    <div className='home'>
      <Hero />
      <InfoSection />
      <MusicCarousel />
      <Contact />
    </div>
  )
}

export default Home


