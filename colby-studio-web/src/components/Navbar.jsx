import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import Logo from '../assets/word_white.svg';
import { FaInstagram } from 'react-icons/fa'

/**
 * 
 * @returns A simple nav bar with the logo on teh left, three main links in the middle, and instgarm link on the right
 */
function Navbar() {
  const location = useLocation();


  return (
    <div className='navbar'>
      <div className='leftSide'> 
        <div className="logoContainer"><Link to="/"><img src={Logo} alt="Logo" /></Link></div>
      </div>
      
     <div className='center' >
        <NavLink to="/" > HOME </NavLink>
        <NavLink to="/about"> ABOUT </NavLink>
        <NavLink to="/archive"> ARCHIVE </NavLink>
        <NavLink to="/booking"> BOOK </NavLink>
     </div>
            
      <div className='rightSide'> 
          <a 
            className="toggle-btn" 
            href="https://www.instagram.com/thestudioatcolby/?hl=en"
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaInstagram size={30} />
          </a>
      </div>
    </div>
  );
}

export default Navbar;