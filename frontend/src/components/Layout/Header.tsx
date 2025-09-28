import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuthData, isAuthenticated } from '../../utils/auth';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    clearAuthData();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>EventHub</h1>
        </Link>

        <nav className="nav">
          <Link to="/events" className="nav-link">Events</Link>
          {authenticated && (
            <>
              <Link to="/my-registrations" className="nav-link">My Registrations</Link>
              <Link to="/create-event" className="nav-link">Create Event</Link>
            </>
          )}
        </nav>

        <div className="auth-section">
          {authenticated ? (
            <div className="user-menu">
              <span className="user-greeting">
                Hello, {user?.firstName}
              </span>
              <Link to="/profile" className="profile-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;