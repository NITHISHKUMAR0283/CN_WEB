import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EventHub</h3>
            <p>Your premier platform for club event registration and management.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/events">Browse Events</a></li>
              <li><a href="/create-event">Create Event</a></li>
              <li><a href="/my-registrations">My Registrations</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@eventhub.edu</p>
            <p>Phone: +1 555 123 4567</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;