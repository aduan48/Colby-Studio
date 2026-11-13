# Code Sample Guide — Booking Flow

This walks through one feature end to end: a user booking a studio session.

1. **Booking form (React):** `colby-studio-web/src/pages/Booking.jsx`
   Displays available session slots, collects session details, validates input, and calls the API.
2. **Availability route (Express):** `server/routes/availability.js`
   Validates the request and checks the requested time slot against the database for conflicts.
3. **Booking logic (Express + SQLite):** `server/routes/bookings.js`
   Once a booking is submitted, it sanitizes the input, saves the booking to the database, writes the information in a google sheet, and sends a confirmation email.

## Development Process

**The problem.** The Studio at Colby handled session bookings manually, which made it hard
to see availability at a glance and easy to double-book the space. The goal was a site where
students could see open slots and book a session themselves, with staff receiving the
details automatically.

**Requirements.** I worked with the studio team to define what the system needed to
handle: the types of sessions offered, the rules for valid bookings (no overlapping sessions,
only open hours), and the information staff needed from each request. Confirmation emails
needed to come from the studio's shared Google Group address so communication stayed in
one place.

**Design decisions.** I used React for the frontend and an Express API with a SQLite
database for the backend. SQLite fit the scale of a single studio while keeping the data
fully relational, and separating the API from the frontend means the server is the
single source of data to prevent double booking. Availability is always checked against the database on submission,
not just in the browser, so two people can't book the same slot.

**Building and iterating.** I built the booking flow first as the core feature, then
expanded based on feedback from the studio. That led to a second request type, live
event recordings, which reuses the same validation and email pipeline.

**Deployment.** The site runs on AWS Lightsail at thestudioatcolby.org.

**What I'd improve next.** The site already has an admin panel
(`colby-studio-web/src/pages/Admin.jsx`, backed by `server/routes/admin.js`) that lets
staff view every booking in the database and delete bookings. Next, I'd expand it so
staff can also create and edit bookings, and manage which studio managers are available and which time slots are available. That way, the studio could run day to day entirely from the admin panel, without anyone
needing to change the code.