import React, { useState } from 'react'
import {NavLink} from 'react-router-dom'
import MusicCarousel from '../components/MusicCarousel'
import Contact from '../components/Contact'
import supervisor from '../assets/supervisor.webp'
import '../styles/About.css'

const FACTS = [
  { label: 'Where', value: 'Gordon Center, basement' },
  { label: 'Sessions', value: '2–4 hours' },
  { label: 'Run by', value: 'Colby Student engineers' },
  { label: 'Join Us for Mix Club', value: 'Mondays, 4:30' },
]

const STEPS = [
  {
    title: 'Bring your music',
    body: 'Whether you\'re a beginner or an experienced musician, think about what you want to create. It can be an EP, albulm or a recorded rehersal',
  },
  {
    title: 'Fill out our booking form',
    body: 'Visit our booking page to select a time slot and provide details about your project. Our team will review your request and confirm your session.',
  },
  {
    title: 'Create your tracks',
    body: 'Your engineer runs the board and mixes your audio. We\'ll help you capture your ideas and make them sound their best.',
  },
]

const ENGINEERS = [
  { name: 'Anna Nelson',
    year: '2029',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Henry Olson',
    year: '2027',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Sharvil Bijumalla',
    year: '2028',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Miles Romm',
    year: '2029',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Zoe Paley',
    year: '2028',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Alex Duan',
    year: '2029',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },
  { name: 'Rafi Aronson',
    year: '2027',
    bio: 'I\'ve been working in the recording studio since my freshman year, specializing in live music production. My favorite band is [Band Name].',
  },  
  
]

const SOFTWARE = [
  { name: 'Pro Tools' },
  { name: 'Ableton' },
  { name: 'Logic' },
]

function EngineerCarousel({ engineers }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState('next')
  const n = engineers.length
  const e = engineers[i]

  const go = (step) => {
    setDir(step > 0 ? 'next' : 'prev')
    setI((i + step + n) % n) // wraps around = infinite
  }

  return (
    <div className="ap-carousel">
      <button type="button" className="ap-carousel__btn" onClick={() => go(-1)} aria-label="Previous engineer">←</button>

      <div key={i} className={`ap-engineer ap-engineer--${dir}`}>
        <h3>{e.name}</h3>
        <p className="ap-engineer__year">Class of {e.year}</p>
        <p>{e.bio}</p>
      </div>

      <button type="button" className="ap-carousel__btn" onClick={() => go(1)} aria-label="Next engineer">→</button>
    </div>
  )
}


function About() {
  return (
    <div className="about-page-wrapper">
    <main className="about-page">
      {/* ---------- Hero ---------- */}
      <header className="ap-hero">
        <p className="ap-kicker">About The Studio</p>
        <h1 className="ap-title">
          WELCOME to <span>the studio at colby</span>
        </h1>
        <p className="ap-lede">
          A student-run recording studio in the basement of the Gordon Center,
          open to anyone at Colby.
        </p>

        <dl className="ap-facts">
          {FACTS.map((f) => (
            <div key={f.label} className="ap-fact">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ---------- 01 The space ---------- */}
      <section className="ap-section">
        <div className="ap-label">
          <span className="ap-num">01</span>
          <h2>The space</h2>
        </div>
        <div className="ap-body">
          <p className="ap-dropcap">
            The Gordon Center opened in late 2023, and the studio was finished
            in early 2024. It is open to every Colby student, with a member of the
            Mixing Club there to supervise. There’s plenty of room in the
            recording space to bring in just about any instrument or ensemble, and the
            managers will help you get it recorded.
          </p>
        </div>
      </section>

      <section className="ap-section">
        <div className="ap-label">
          <span className="ap-num">02</span>
          <h2>Meet the supervisor</h2>
        </div>
        <div className="ap-body">
          <img src={supervisor} alt="supervisor" />
          <p className="ap-dropcap">
            The Studio at Colby is supervised by Alex Fulton. Alex is a music producer, sound designer, and audio engineer. 
            He has produced original music and sound design for series on Showtime, Netflix, BET, and CBS, and for 
            brands including Google, Nike, Mazda, General Mills, GSK, and John Deere, among others.
             His company, Fulton Street Media Group, implements the science behind music’s ability to 
             encode and recall memory in custom executions for advertising, health, and education.
          </p>
          <p>
            In addition to his professional work, Fulton is an instructor of audio engineering and music production at Colby College,
             where he oversees the Gordon Center Mixdown Studio. His Jan Plan course, Studio Recording Techniques, trains students in 
             the use of the facility and immerses them in the processes of music production. Students who complete the course are eligible 
             to be hired as Studio Managers in the Mixdown Studio.
          </p>
          <p>
            Fulton also maintains a private recording studio and venue in downtown Waterville, where he produces records
             with local and visiting artists and hosts live immersive music and multimedia events.
          </p>
        </div>
      </section>

      {/* ---------- 02 How it works ---------- */}
      <section className="ap-section">
        <div className="ap-label">
          <span className="ap-num">03</span>
          <h2>How it works</h2>
        </div>
        <div className="ap-body">
          <ol className="ap-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="ap-step">
                <span className="ap-step__num">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- 03 The engineers ---------- */}
      <section className="ap-section">
        <div className="ap-label">
          <span className="ap-num">04</span>
          <h2>The engineers</h2>
        </div>
        <div className="ap-body">
          <p>
            Every session is run by a student engineer. Each one has taken a
            JanPlan course, been tested on every part of the studio, and is paid
            to run sessions for the Colby community.
          </p>
          <p>
            One might lean toward rap and hip hop beats, another toward folk and
            the blues. All of them can teach you the fundamentals of music
            production and performance.
          </p>
          
           <EngineerCarousel engineers={ENGINEERS} />
           <h3 className="ap-heading">Software</h3>

          <ul className="ap-tags" aria-label="Software the engineers know">
            {SOFTWARE.map((s) => (
              <li key={s.name} className={s.soon ? 'ap-tag ap-tag--soon' : 'ap-tag'}>
                {s.name}
                {s.soon && <small>coming</small>}
              </li>
            ))}
          </ul>
          <p className="ap-note">
            Use something else? The managers can request it through the music
            department. It’s usually approved within about a week.
          </p>

        </div>
      </section>


      {/* ---------- Pull quote ---------- */}
      <figure className="ap-quote">
        <blockquote>
          It’s really a hub for student artists to both work together and also
          learn from each other. And I think that’s very special to have that
          with institutional support.
        </blockquote>
        <figcaption>Rafi Aronson ’27, engineer</figcaption>
      </figure>

      {/* ---------- 04 Mix Club ---------- */}
      <section className="ap-section">
        <div className="ap-label">
          <span className="ap-num">05</span>
          <h2>Mix Club</h2>
        </div>
        <div className="ap-body">
          <div className="ap-when">
            <span className="ap-when__day">Mondays</span>
            <span className="ap-when__time">4:30 p.m.</span>
            <span className="ap-when__place">Film screening room, next to the studio</span>
          </div>
          <p>
            Mix Club happens alongside studio time. Alex Fulton, an instructor
            of audio engineering and music production, picks a track the room
            likes and the group takes it apart together. Join us to learn more!
          </p>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ap-cta">
        <h2>Book us today</h2>
        <p>
          The Studio is a place for growth and discovery. Book a session and see
          what you make.
        </p>
        <NavLink className="ap-cta__btn" to="/booking">Book a session</NavLink>
      </section>


    </main>
      <MusicCarousel />
      <Contact />
    </div>
  )
}

export default About
