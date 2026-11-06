import React from 'react'
import '../styles/PrivacyPolicy.css'

const CONTACT_EMAIL = 'recordingstudio@colby.edu'
const LAST_UPDATED = 'November 5, 2026'


const SECTIONS = [
  { id: 'collect', title: 'What we collect' },
  { id: 'use', title: 'How we use it' },
  { id: 'stored', title: 'Where it’s stored' },
  { id: 'emails', title: 'Emails we send' },
  { id: 'device', title: 'Saved on your device' },
  { id: 'services', title: 'Services we use' },
  { id: 'access', title: 'Who can see it' },
  { id: 'retention', title: 'How long we keep it' },
  { id: 'choices', title: 'Your choices' },
  { id: 'changes', title: 'Changes' },
]

const SERVICES = [
  {
    name: 'Amazon Web Services (Lightsail)',
    role: 'Hosts this website and the server that receives and stores your booking.',
  },
  {
    name: 'Google Sheets',
    role: 'Keeps a copy of each booking so studio managers can see their schedule.',
  },
  {
    name: 'Email delivery',
    role: (
      <>
        Sends your confirmation email and notifies studio managers.{' '}
        Gmail
      </>
    ),
  },
  {
    name: 'Google Fonts & Adobe Fonts',
    role: 'Load the fonts on this site. Your browser requests them from Google and Adobe, which can see your IP address.',
  },
]

function PrivacyPolicy() {
  return (
    <main className="pp">
      {/* ---------- Hero ---------- */}
      <header className="pp-hero">
        <p className="pp-kicker">Legal</p>
        <h1 className="pp-title">
          Privacy <span>policy</span>
        </h1>
        <p className="pp-updated">Last updated {LAST_UPDATED}</p>

        <div className="pp-summary">
          <h2>The short version</h2>
          <ul>
            <li>We only collect what you type into the booking form, plus the time slot you pick.</li>
            <li>It’s stored on our server (AWS Lightsail) and copied to a Google Sheet for studio managers.</li>
            <li>We email you to confirm your session. No marketing, and we never sell your information.</li>
            <li>Email us any time to see or delete your information.</li>
          </ul>
        </div>
      </header>

      <div className="pp-layout">
        {/* ---------- Table of contents ---------- */}
        <nav className="pp-toc" aria-label="On this page">
          <p className="pp-toc__label">On this page</p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ---------- Sections ---------- */}
        <div className="pp-body">
          <section id="collect" className="pp-section">
            <h2><span className="pp-num">01</span>What we collect</h2>
            <p>When you book a session, we collect:</p>
            <ul>
              <li><strong>Your name and email</strong>, so we know who’s coming and can confirm.</li>
              <li><strong>Whether you’re a music major or minor</strong>, so we understand who uses the studio.</li>
              <li><strong>Your session details</strong>: what you want to accomplish, any equipment you need, and reference tracks.</li>
              <li><strong>The date, time, and manager</strong> you booked.</li>
            </ul>
            <p>
              Like most websites, our server may also automatically log basic
              technical information such as your IP address, browser type, and
              the time of your visit. We use this only to keep the site running
              and secure.
            </p>
          </section>

          <section id="use" className="pp-section">
            <h2><span className="pp-num">02</span>How we use it</h2>
            <ul>
              <li>To schedule your session and stop two people from booking the same slot.</li>
              <li>To send you a confirmation and any updates about your booking.</li>
              <li>To let your student engineer prepare for the session.</li>
            </ul>
            <p>
              We don’t use your information for advertising, and we never sell
              or rent it to anyone.
            </p>
          </section>

          <section id="stored" className="pp-section">
            <h2><span className="pp-num">03</span>Where it’s stored</h2>
            <p>Your booking goes through two places:</p>
            <ol className="pp-flow">
              <li>
                <strong>Our server on AWS Lightsail.</strong> The form is sent to
                our backend, which runs on Amazon Web Services. Your booking is
                saved in a database file on that server (<code>bookings.db</code>).
              </li>
              <li>
                <strong>A Google Sheet.</strong> The same booking details are
                added to a private Google Sheet that studio managers use to see
                their schedule.
              </li>
            </ol>
            <p>
              Your information travels over an encrypted (HTTPS) connection.
              Access to the server and the sheet is limited to the people listed
              under <a href="#access">Who can see it</a>.
            </p>
          </section>

          <section id="emails" className="pp-section">
            <h2><span className="pp-num">04</span>Emails we send</h2>
            <p>
              When you book, our server automatically sends you a confirmation
              email with your session details. It may also notify the studio
              manager running your session. We only email you about bookings
              you made. You won’t be added to a mailing list.
            </p>
          </section>

          <section id="device" className="pp-section">
            <h2><span className="pp-num">05</span>Saved on your device</h2>
            <p>
              To save you retyping, the booking form remembers your answers and
              chosen date in your browser’s local storage. This stays on your
              device and isn’t sent anywhere until you submit. After you book,
              we clear the session-specific answers but keep your name, email,
              and major for next time.
            </p>
            <p>
              To remove it, clear this site’s data in your browser settings. We
              don’t use advertising or tracking cookies.
            </p>
          </section>

          <section id="services" className="pp-section">
            <h2><span className="pp-num">06</span>Services we use</h2>
            <p>
              These outside services handle some of your information on our
              behalf. Each has its own privacy policy.
            </p>
            <dl className="pp-services">
              {SERVICES.map((s) => (
                <div key={s.name} className="pp-service">
                  <dt>{s.name}</dt>
                  <dd>{s.role}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="access" className="pp-section">
            <h2><span className="pp-num">07</span>Who can see it</h2>
            <p>
              Only the people who run the studio: student managers and engineers,
              the site administrator, and the staff supervisor.
              We don’t share your information with anyone else unless the law
              requires it.
            </p>
          </section>

          <section id="retention" className="pp-section">
            <h2><span className="pp-num">08</span>How long we keep it</h2>
            <p>
              We keep booking records for e.g. one academic year so
              we can manage the schedule and see how the studio is used. After
              that, we delete them from the database and the Google Sheet.
            </p>
          </section>

          <section id="choices" className="pp-section">
            <h2><span className="pp-num">09</span>Your choices</h2>
            <p>You can ask us at any time to:</p>
            <ul>
              <li>Show you the information we have about you</li>
              <li>Correct anything that’s wrong</li>
              <li>Delete your information or cancel a booking</li>
            </ul>
            <p>
              Email {CONTACT_EMAIL} and we’ll respond within{' '} 7 days.
            </p>
          </section>

          <section id="changes" className="pp-section">
            <h2><span className="pp-num">10</span>Changes</h2>
            <p>
              If we change how we handle your information, we’ll update this page
              and the date at the top.
            </p>
          </section>

          <footer className="pp-contact">
            <p>Questions about your privacy?</p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy
