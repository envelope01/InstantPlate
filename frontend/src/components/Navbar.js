import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import '../App.css';

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state on render and path change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  const handleCloseLogin = () => setShowLogin(false);
  const handleShowLogin = () => setShowLogin(true);
  const handleCloseSignup = () => setShowSignup(false);
  const handleShowSignup = () => setShowSignup(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Do not show standard navbar on the mobile Customer Menu page
  if (location.pathname.startsWith('/menu')) {
    return null;
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg glassmorphism-navbar fixed-top" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">{title}</a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">About Us</a>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              {isLoggedIn ? (
                <>
                  <button className="btn-glass-primary me-2 py-1 px-3" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </button>
                  <button className="btn-glass-secondary py-1 px-3" onClick={handleLogout}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-glass-secondary me-2 py-1 px-3" onClick={handleShowLogin}>
                    Log In
                  </button>
                  <button className="btn-glass-primary py-1 px-3" onClick={handleShowSignup}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Login show={showLogin} handleClose={handleCloseLogin} />
      <Signup show={showSignup} handleClose={handleCloseSignup} />
    </>
  );
}

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
};

Navbar.defaultProps = {
  title: "InstantPlate",
};
