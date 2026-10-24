import './env.js'; // must stay first so process.env is set before other files run
import express from 'express';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import eventBookingRoutes from './routes/eventBookings.js';

const app = express();
app.use(express.json());

app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/eventbookings', eventBookingRoutes);

app.listen(3001, () => console.log('API on :3001'));