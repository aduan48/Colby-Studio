import React from 'react'
import '../styles/Footer.css'
import { FaInstagram } from 'react-icons/fa'
import {Link} from 'react-router-dom';


/**
 * 
 * @returns My footer which includes the copyright and a social medio icon leading to our instagram
 */
function Footer() {
  return (
    <div className='footer'>

    <div className='copyright'>    
        <p><Link to ='/privacy-policy'>Privacy Policy</Link> &copy; {new Date().getFullYear()} East Coast Dragons</p>
      </div>
      <div className='socialMedia'> 
        <a href="https://www.instagram.com/eastcoastdragons/?hl=en" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={24} />
        </a>

      </div>

    </div>
  )
}

export default Footer