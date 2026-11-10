import React from 'react'
import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'
import Logo from '../assets/combined_white.svg'
import '../styles/Footer.css'



const INSTAGRAM = 'https://www.instagram.com/thestudioatcolby/' //instagram link

//these are the footer novigation columns with links 
const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/booking', label: 'Bookings' },
      { to: '/archive', label: 'Archive'},
    ],
  },
  {
    title: 'Book',
    links: [
      { to: '/studio-booking', label: 'Studio Bookings' },
      { to: '/special-request', label: 'Event Bookings' },
    ],
  },
]

/**
 * Site footer: logo + blurb, links to every page, studio info,
 * and a bottom bar with copyright, privacy policy, and Instagram.
 */
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* brand */}
        <div className="footer__brand">
          <Link to="/" aria-label="The Studio at Colby, home">
            <img src={Logo} alt="The Studio at Colby" className="footer__logo" />
          </Link>
        </div>

        {/* page links */}
        {COLUMNS.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <h2 className="footer__heading">{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* visit */}
        <div className="footer__col">
          <h2 className="footer__heading">Visit</h2>
          <address className="footer__address">
            Gordon Performance Arts Center,
            Colby College
            <br />
            Waterville, ME 04901
          </address>
          <p className="footer__note">Mix Club meets Mondays at 4:30&nbsp;p.m.</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">&copy; {year} The Studio at Colby</p>

        <div className="footer__meta">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social"
            aria-label="The Studio at Colby on Instagram"
          >
            <FaInstagram size={20} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
