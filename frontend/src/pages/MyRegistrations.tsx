import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationsAPI } from '../services/api';
import { Registration, RegistrationStatus } from '../types';
import { formatDate, formatTime } from '../utils/formatters';
import './MyRegistrations.css';

const MyRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<RegistrationStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await registrationsAPI.getMyRegistrations(params);

      if (response.success && response.data) {
        setRegistrations(response.data.registrations);
      } else {
        setError(response.message || 'Failed to load registrations');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      setCancellingId(registrationId);
      const response = await registrationsAPI.cancelRegistration(registrationId);

      if (response.success) {
        // Update the registration status in the local state
        setRegistrations(prev =>
          prev.map(reg =>
            reg._id === registrationId
              ? { ...reg, status: 'cancelled' as RegistrationStatus }
              : reg
          )
        );
      } else {
        setError(response.message || 'Failed to cancel registration');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const statusClasses = {
      confirmed: 'status-confirmed',
      waitlist: 'status-waitlist',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (eventDate < now) return 'completed';
    if (registrationDeadline < now) return 'registration_closed';
    return 'upcoming';
  };

  const canCancelRegistration = (registration: Registration) => {
    const now = new Date();
    const registrationDeadline = new Date(registration.event.registrationDeadline);
    return registration.status === 'confirmed' && registrationDeadline > now;
  };

  if (loading) {
    return (
      <div className="my-registrations-container">
        <div className="loading-spinner">Loading your registrations...</div>
      </div>
    );
  }

  return (
    <div className="my-registrations-container">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>Manage your event registrations</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="filters">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({registrations.length})
        </button>
        <button
          className={filter === 'confirmed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={filter === 'waitlist' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('waitlist')}
        >
          Waitlist
        </button>
        <button
          className={filter === 'cancelled' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <h3>No registrations found</h3>
          <p>
            {filter === 'all'
              ? "You haven't registered for any events yet."
              : `No ${filter} registrations found.`}
          </p>
          <Link to="/events" className="browse-events-btn">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="registrations-grid">
          {registrations.map((registration) => (
            <div key={registration._id} className="registration-card">
              <div className="card-header">
                <div className="event-info">
                  <h3>
                    <Link to={`/events/${registration.event._id}`}>
                      {registration.event.title}
                    </Link>
                  </h3>
                  <p className="event-organizer">{registration.event.organizer}</p>
                </div>
                {getStatusBadge(registration.status)}
              </div>

              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span>{formatDate(registration.event.eventDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span>
                    {formatTime(registration.event.startTime)} - {formatTime(registration.event.endTime)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Venue:</span>
                  <span>{registration.event.venue}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registered:</span>
                  <span>{formatDate(registration.registrationDate)}</span>
                </div>
                {registration.registrationNumber && (
                  <div className="detail-item">
                    <span className="detail-label">Reg ID:</span>
                    <span className="registration-number">{registration.registrationNumber}</span>
                  </div>
                )}
              </div>

              {registration.notes && (
                <div className="registration-notes">
                  <strong>Notes:</strong> {registration.notes}
                </div>
              )}

              <div className="card-actions">
                <Link
                  to={`/events/${registration.event._id}`}
                  className="view-event-btn"
                >
                  View Event
                </Link>

                {canCancelRegistration(registration) && (
                  <button
                    onClick={() => handleCancelRegistration(registration._id)}
                    className="cancel-registration-btn"
                    disabled={cancellingId === registration._id}
                  >
                    {cancellingId === registration._id ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                )}
              </div>

              <div className="event-status-indicator">
                <span className={`event-status ${getEventStatus(registration.event)}`}>
                  {getEventStatus(registration.event).replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;