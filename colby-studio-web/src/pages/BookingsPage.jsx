import React from 'react'
import { NavLink } from 'react-router-dom';

function BookingsPage() {
  return (
    <div>

        <NavLink to="/studio-booking"> BOOK A STUIO TIME </NavLink>
        <NavLink to="/special-request"> BOOK US FOR YOUR EVENT </NavLink>



    </div>
  )
}

export default BookingsPage