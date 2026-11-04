import { useEffect, useState } from 'react';
import '../styles/Contact.css';

/** Like useState, but loads from and saves to localStorage */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function Contact() {
    const [status, setStatus] = useState('');  
    const [form, setForm] = useLocalStorage('contact:form', {
    name: '',
    email: '',
    message: 'undecided',
    });

    const handleChanges = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const book = async (e) => {
        e.preventDefault();
        setStatus('Sending request…');

        const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            setStatus('Request sent! Check your email.');
            setForm({
                name: '', email: '', message: '',
            });
        } else {
            setStatus(data.error || 'Something went wrong. Please try again.');
        }
    };

    return (
    <div className="contact-page">
      <div className="contact">
        <div className="contact__intro">
          <h2 className="contact__title">Contact Us</h2>
          <p className="contact__subtitle">
            Have questions or want to learn more? Send us a message and we'll
            get back to you as soon as possible.
          </p>

          <ul className="contact__details">
            <li><span>Where</span>Gordon Center, Colby College</li>
            <li><span>Email</span>recordingstudio@colby.edu</li>
          </ul>
        </div>

        <form className="contact__form" onSubmit={book}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" placeholder="Your name" required
                     value={form.name} onChange={handleChanges} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" placeholder="you@colby.edu" required
                     value={form.email} onChange={handleChanges} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" rows={5} placeholder="What's on your mind?" required
                      value={form.message} onChange={handleChanges} />
          </div>

          <button type="submit" className="contact__submit">Send Message</button>

          {status && <p className="contact__status">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default Contact