import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';
import '../styles/Booking.css'

export default function Booking() {
  const [day, setDay] = useState();
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('');

  /**
   * sends a get function to the erever getting teh avaikaibity of set dat
   */
  const loadSlots = async (d) => {
    const res = await fetch(`/api/availability?date=${format(d, 'yyyy-MM-dd')}`);
    setSlots(await res.json());
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * reupdates whenever a new day is picked
   */
  useEffect(() => {
    if (day) { 
        setSelected(null); loadSlots(day); 
    }
  }, [day]);

  const book = async (e) => {
    e.preventDefault();
    setStatus('Booking…'); //shows the booking
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start: selected, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('Booked! Check your email.');
      setSelected(null);
    } else {
      setStatus(data.error);
    }
    loadSlots(day); // refresh so the taken slot greys out
  };

    return (
    <div className="booking">
        <h2 className="booking__title">Book a session</h2>

        <div className="booking__calendar">
        <DayPicker
            mode="single"
            selected={day}
            onSelect={setDay}
            disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
        />
        </div>

        {day && (
        <div className="booking__slots">
            {slots.map(s => (
            <button
                key={s.start}
                type="button"
                className={`slot ${selected === s.start ? 'slot--selected' : ''}`}
                disabled={!s.available}
                onClick={() => setSelected(s.start)}
            >
                {s.start.slice(11)}
            </button>
            ))}
        </div>
        )}

        {selected && (
        <form className="booking__form" onSubmit={book}>
            <input placeholder="Name" name="name" required value={form.name} onChange={handleChanges} />
            <input type="email" placeholder="Email" name="email" required value={form.email} onChange={handleChanges} />
            <button type="submit" className="booking__submit">
            Book {selected.replace('T', ' at ')}
            </button>
        </form>
        )}

        {status && <p className="booking__status">{status}</p>}
    </div>
    );

}