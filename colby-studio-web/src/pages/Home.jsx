import React from 'react'
import MusicCarousel from '../components/MusicCarousel';
import InfoSection from '../components/InfoSection';
import Contact from '../components/Contact';

function Home() {
  return (
    <div className='home'>
      Hello World
      <InfoSection />
      <MusicCarousel />
      <Contact />
    </div>
  )
}

export default Home


