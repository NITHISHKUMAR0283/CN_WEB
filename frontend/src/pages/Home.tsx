import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { Event } from '../types';
import EventCard from '../components/Events/EventCard';
import './Home.css';

const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvents({
        limit: 6,
        status: 'active',
        sortBy: 'eventDate',
        order: 'asc'
      });

      if (response.success && response.data) {
        setFeaturedEvents(response.data.events);
      }
    } catch (err) {
      setError('Failed to load featured events');
      console.error('Error fetching featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to EventHub</h1>
          <p>
            Discover and register for amazing club events. Connect with your peers,
            learn new skills, and be part of something great.
          </p>
          <div className="hero-buttons">
            <Link to="/events" className="btn-hero-primary">
              Browse Events
            </Link>
            <Link to="/register" className="btn-hero-secondary">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose EventHub?</h2>
          <p className="features-subtitle">
            The most trusted platform for event management and registration
          </p>
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">01</div>
              <h3>Easy Registration</h3>
              <p>Register for events with just a few clicks. Track your registrations and get updates instantly.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">02</div>
              <h3>Event Management</h3>
              <p>Create and manage events with our intuitive interface. Handle registrations effortlessly.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">03</div>
              <h3>Real-time Updates</h3>
              <p>Get notified about event updates, registration confirmations, and important announcements.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">04</div>
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security. Trust EventHub for all your events.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <Link to="/events" className="view-all-link">
              View All Events →
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : featuredEvents.length > 0 ? (
            <div className="events-grid">
              {featuredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="no-events">
              <p>No upcoming events at the moment.</p>
              <Link to="/create-event" className="btn btn-primary">
                Create the First Event
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join our community and never miss an exciting event again!</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;