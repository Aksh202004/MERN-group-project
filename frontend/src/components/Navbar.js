import React from 'react';
import { Link } from 'react-router-dom';
// TODO: Add logic to show different links based on auth state

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        {/* TODO: Add Logout link */}
        {/* TODO: Add link to create podcast (if logged in) */}
      </ul>
    </nav>
  );
};

export default Navbar;
