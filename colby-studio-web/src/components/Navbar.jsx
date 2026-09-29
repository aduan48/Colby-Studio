import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const [openLinks, setOpenLinks] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isHidden = location.pathname === '/projects/ephemeral';
  const isHome = location.pathname === '/';

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

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
    <div className={`navbar ${!openLinks ? 'menu-closed' : ''} ${isHidden ? 'hidden-nav' : ''}`}>
      <div className='leftSide'> 
        <Link to="/home"> COLBY STUDIO </Link>
      </div>
      
     <div className='center' id={openLinks ? "open" : "close"}>
        <NavLink to="/" className={() => (isHome ? 'active' : '')}> HOME </NavLink>
        <NavLink to="/about"> ABOUT </NavLink>
        <NavLink to="/projects"> PROJECTS </NavLink>
     </div>
            
      <div className='rightSide'> 
        <button onClick={toggleNavbar} className="toggle-btn">
          {openLinks ? 'HIDE' : 'EXPAND'}
        </button>
      </div>
    </div>
  );
}

export default Navbar;