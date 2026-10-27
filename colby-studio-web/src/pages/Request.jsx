import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';
import '../styles/Booking.css';


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

export default function Request() {

  const [dayStr, setDayStr] = useLocalStorage('request:day', null);
  const day = dayStr ? new Date(dayStr) : undefined;

  const [selected, setSelected] = useLocalStorage('request:selected', null);
  const [status, setStatus] = useState('');                       // ← was missing
  const [form, setForm] = useLocalStorage('request:form', {
    start_time: '',
    duration: '',
    name: '', 
    email: '', 
    group: '', 
    toAccomplish: '', 
    equipment: '', 
    referenceTracks: '',
  });

  useEffect(() => {
    const today = new Date(new Date().toDateString());
    if (day && day < today){
        setSelected(null);
        setDayStr(null);
    } 
  }, []);

  /** Only clear the chosen time when the user actually picks a new day */
  const pickDay = (d) => {
    console.log('picked', d);
    setDayStr(d ? d.toISOString() : null);
    setStatus('');
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const book = async (e) => {
    e.preventDefault();
    setStatus('Sending request…');

    const res = await fetch('/api/eventbookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: format(selected, 'yyyy-MM-dd'), ...form }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setStatus('Request sent! Check your email.');
      setDayStr(null);
      setSelected(null);
      setForm({
        start_time: '', duration: '', name: '', email: '',
        group: '', toAccomplish: '', equipment: '', referenceTracks: '',
      });
    } else {
      setStatus(data.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="booking-page">
      <div className="booking">
        <h2 className="booking__title">Request a live recording</h2>
        <p className="booking__subtitle">Pick a day, choose a time, and tell us about your session.</p>

        
        <div className="booking__calendar">
          <DayPicker
            mode="single"
            selected={day}
            onSelect={pickDay}
            defaultMonth={day}
            disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
          />
        </div>


          <form className="booking__form" onSubmit={book}>

            <div className="field">
                <label htmlFor="start_time">Start time</label>
                <input id="start_time" name="start_time" type="time" required value={form.start_time} onChange={handleChanges} />
            </div>

            <div className="field">
                <label htmlFor="duration">Duration (hrs)</label>
                <input id="duration" type="number" min="0" step="0.5" required value={form.duration} onChange={handleChanges} />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" placeholder="Your name" required value={form.name} onChange={handleChanges} />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" placeholder="you@colby.edu" required value={form.email} onChange={handleChanges} />
              </div>
            </div>

            <div className="field">
                <label htmlFor="group">Your Group</label>
                <input id="group" name="group" placeholder="Your group name" required value={form.group} onChange={handleChanges} />
            </div>



            <div className="field">
              <label htmlFor="toAccomplish">What would you like to accomplish in this session?</label>
              <span className="hint">Include the instrumentation we'll be recording and the size of your ensemble, if applicable.</span>
              <textarea id="toAccomplish" name="toAccomplish" rows={3} placeholder="Your response" required value={form.toAccomplish} onChange={handleChanges} />
            </div>

            <div className="field">
              <label htmlFor="equipment">Do you need any equipment that may not be in the studio?</label>
              <span className="hint">Optional. If so, please specify.</span>
              <input id="equipment" name="equipment" placeholder="Your response" value={form.equipment} onChange={handleChanges} />
            </div>

            <div className="field">
              <label htmlFor="referenceTracks">Reference tracks</label>
              <span className="hint">Optional. Links or song names that show the sound you're going for.</span>
              <textarea id="referenceTracks" name="referenceTracks" rows={2} placeholder="Your response" value={form.referenceTracks} onChange={handleChanges} />
            </div>

              <button type="submit" className="booking__submit" disabled={!day || !form.start_time}>
                {day && form.start_time
                  ? `Request ${format(day, 'MMM d')} at ${form.start_time}`
                  : 'Pick a day and time'}
              </button>
            </form>

        <p className="booking__status">{status}</p>
      </div>
    </div>
  );
}
