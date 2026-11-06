import React from 'react'
import '../styles/InfoSection.css'
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-day-picker';

function InfoSection() {
  return (
    <div className="info-section">
      <section className="about">
        <NavLink to="/about" className="about__link">
            <div className="about__card">
              <h1 className="about__title">A creative space for music and sound at Colby</h1>

              <p>
                The Studio at Colby is a student recording space in the Gordon Center for
                Creative and Performing Arts. Whether you're laying down your first demo or
                tracking a full ensemble, our team of student sound engineers will help you
                capture your ideas and make them sound their best.
              </p>

              <p>
                We specialize in recording acoustic instruments, but we're not limited to
                them. Bring us a band, a solo project, or an
                experimental sound piece, and we'll help you figure out how to bring it to
                life.
              </p>

            </div>
          </NavLink>
      </section>
      
      
    </div>
  )
}

export default InfoSection