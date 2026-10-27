import React from 'react'
import { NavLink } from 'react-router-dom';
import '../styles/BookingsPage.css'

function BookingsPage() {
  return (
    <div className='bookings-page'>
        <div className='booking-content'>
          <div className='booking-container studio-time'>
            <NavLink to="/studio-booking"> 
                  <button> BOOK A STUDIO TIME </button>
            </NavLink>
            <div className='booking-text'>
              <p>
                Schedule a time to use our studio. We're located on the bottom floor of the
                Gordon Center for Creative and Performing Arts. Our team of talented engineers
                can help with everything from raw recording to full production.
              </p>
            </div>
          </div>
          <div className='booking-container event-booking'>
            <NavLink to="/special-request"> 
                  <button> BOOK US FOR YOUR EVENT </button>
            </NavLink>
            <div className='booking-text'>
              <p>
                Request our services for your special event. We offer live recording: we'll
                set up professional microphones to capture your performance, then mix the
                recordings into a keepsake that preserves your shows for years to come.
              </p>
            </div>
          </div>
        </div>



    </div>
  )
}

export default BookingsPage