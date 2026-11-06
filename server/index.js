import './env.js'; // must stay first so process.env is set before other files run
import express from 'express';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import eventBookingRoutes from './routes/eventBookings.js';
import contactRoutes from './routes/contact.js';

const app = express();
app.set('trust proxy', 1); // behind Nginx: req.ip is the visitor, not 127.0.0.1
app.use(express.json());

app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/eventbookings', eventBookingRoutes);
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1'; // only reachable through Nginx

app.listen(PORT, HOST, () => console.log(`API on ${HOST}:${PORT}`));