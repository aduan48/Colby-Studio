import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import Logo from '../assets/word_white.svg';
import { FaInstagram } from 'react-icons/fa'


function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHidden = location.pathname === '/projects/ephemeral';
  const isHome = location.pathname === '/';


  // --- SCROLL TO CONTACT LOGIC ---
  const handleContactClick = (e) => {
    e.preventDefault(); 

    if (location.pathname === '/home' || location.pathname === '/') {
      const contactSection = document.getElementById('contact-section');
      contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollToContact: true } });
    }
  };

  return (
    <div className={`navbar ${isHidden ? 'hidden-nav' : ''}`}>
      <div className='leftSide'> 
        <div className="logoContainer"><Link to="/"><img src={Logo} alt="Logo" /></Link></div>
      </div>
      
     <div className='center' >
        <NavLink to="/" className={() => (isHome ? 'active' : '')}> HOME </NavLink>
        <NavLink to="/about"> ABOUT </NavLink>
        <NavLink to="/booking"> BOOK US </NavLink>
     </div>
            
      <div className='rightSide'> 
        <button className="toggle-btn">
          <FaInstagram size={30} />
        </button>
      </div>
    </div>
  );
}

export default Navbar;