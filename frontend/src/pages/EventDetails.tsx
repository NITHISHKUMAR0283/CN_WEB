import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../services/api';
import { Event } from '../types';
import { isAuthenticated } from '../utils/auth';
import { formatDate, formatTime, formatCurrency, getEventStatusColor } from '../utils/formatters';
import './EventDetails.css';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [notes, setNotes] = useState('');
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventById(id!);

      if (response.success && response.data) {
        setEvent(response.data.event);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!event) return;

    try {
      setRegistering(true);
      setRegistrationError('');

      const response = await registrationsAPI.registerForEvent(event._id, notes);

      if (response.success) {
        setRegistrationSuccess(true);
        setNotes('');
        // Refresh event data to update registration count
        await fetchEvent();
      } else {
        setRegistrationError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setRegistrationError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="container">
          <div className="loading">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="container">
          <div className="error">{error}</div>
          <Link to="/events" className="btn btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getEventStatusColor(event.eventStatus);

  return (
    <div className="event-details-page">
      <div className="container">
        <div className="event-details">
          {event.imageUrl && (
            <div className="event-hero-image">
              <img src={event.imageUrl} alt={event.title} />
            </div>
          )}

          <div className="event-header">
            <div className="event-meta">
              <span className="event-category">{event.category}</span>
              <span
                className="event-status"
                style={{ backgroundColor: statusColor }}
              >
                {event.eventStatus.replace('_', ' ')}
              </span>
            </div>

            <h1>{event.title}</h1>
            <p className="event-organizer">Organized by {event.organizer}</p>
          </div>

          <div className="event-content">
            <div className="event-main">
              <div className="event-description">
                <h2>About This Event</h2>
                <p>{event.description}</p>
              </div>

              {event.requirements.length > 0 && (
                <div className="event-requirements">
                  <h3>Requirements</h3>
                  <ul>
                    {event.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {event.tags.length > 0 && (
                <div className="event-tags">
                  <h3>Tags</h3>
                  <div className="tags">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="event-sidebar">
              <div className="event-info-card">
                <h3>Event Details</h3>

                <div className="info-item">
                  <span className="info-label">Date:</span>
                  <div>
                    <strong>Date</strong>
                    <p>{formatDate(event.eventDate)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Time:</span>
                  <div>
                    <strong>Time</strong>
                    <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Venue:</span>
                  <div>
                    <strong>Venue</strong>
                    <p>{event.venue}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Fee:</span>
                  <div>
                    <strong>Registration Fee</strong>
                    <p>{formatCurrency(event.registrationFee)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Capacity:</span>
                  <div>
                    <strong>Participants</strong>
                    <p>{event.registrationCount} / {event.maxParticipants} registered</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(event.registrationCount / event.maxParticipants) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Deadline:</span>
                  <div>
                    <strong>Registration Deadline</strong>
                    <p>{formatDate(event.registrationDeadline)}</p>
                  </div>
                </div>
              </div>

              {authenticated && event.isRegistrationOpen && (
                <div className="registration-card">
                  <h3>Register for Event</h3>

                  {registrationSuccess ? (
                    <div className="success">
                      Registration successful! You will receive a confirmation email shortly.
                    </div>
                  ) : (
                    <>
                      {registrationError && (
                        <div className="error">{registrationError}</div>
                      )}

                      <div className="form-group">
                        <label htmlFor="notes">Notes (Optional)</label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any additional information or special requirements..."
                          rows={3}
                        />
                      </div>

                      <button
                        onClick={handleRegistration}
                        disabled={registering}
                        className="btn btn-primary register-btn"
                      >
                        {registering ? 'Registering...' : 'Register Now'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {!authenticated && event.isRegistrationOpen && (
                <div className="auth-prompt">
                  <p>Please sign in to register for this event</p>
                  <Link to="/login" className="btn btn-primary">
                    Sign In
                  </Link>
                </div>
              )}

              {!event.isRegistrationOpen && (
                <div className="registration-closed">
                  <p>Registration is currently closed for this event.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="back-link">
          <Link to="/events">← Back to Events</Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;