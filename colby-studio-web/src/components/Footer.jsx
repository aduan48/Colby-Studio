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
    
        <div className='top-footer'>
            <div className='short-blurb'>

            </div>

            <div className='sub-pages'>
                
            </div>
        </div>

        <div className='bottom-footer'>
            <div className='links'>    
                <p><Link to ='/privacy-policy'>Privacy Policy</Link> </p>
            </div>
            <div className='copyright'> 
                <p>&copy; {new Date().getFullYear()} East Coast Dragons</p>
                <a href="https://www.instagram.com/thestudioatcolby/?hl=en" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={24} />
                </a>
            </div>
        </div>
    </div>
  )
}

export default Footer