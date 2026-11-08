import React from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/HowItWorks.css'

//the steps needed to make it work
const STEPS = [
  {
    title: 'Come up with an idea',
    body: 'Whether you\'re a beginner or an experienced musician, think about what you want to create.',
  },
  {
    title: 'Fill out our booking form',
    body: 'Visit our booking page to select a time slot and provide details about your project. Our team will review your request and confirm your session.',
  },
  {
    title: 'Create your audio vision',
    body: 'Your engineer runs the board and mixes your audio. We\'ll help you capture your ideas and make them sound their best.',
  },
]

/**
 * 
 * @returns the steps mapped out into 1 2 and 3 with a heading and a link to bookings
 */
function HowItWorks() {
  return (
    <section className="hiw" aria-labelledby="hiw-title">
      <div className="hiw__head">
        <div>
          <p className="hiw__kicker">How it works</p>
          <h2 id="hiw-title" className="hiw__title">
            From idea to realization in <span>three steps</span>
          </h2>
        </div>
        <NavLink to="/booking" className="hiw__link">
          Book a session <span aria-hidden="true">→</span>
        </NavLink>
      </div>

      <ol className="hiw__steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className="hiw__step">
            <span className="hiw__num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default HowItWorks
