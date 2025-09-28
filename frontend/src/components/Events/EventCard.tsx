import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types';
import { formatDate, formatCurrency, getEventStatusColor, getDaysUntilEvent } from '../../utils/formatters';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // quick calc for how many days left
  const daysLeft = getDaysUntilEvent(event.eventDate);
  const statusClr = getEventStatusColor(event.eventStatus);

  return (
    <div className="event-card">
      {event.imageUrl && (
        <div className="event-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-content">
        <div className="event-header">
          <div className="event-category">{event.category}</div>
          <div
            className="event-status"
            style={{ backgroundColor: statusClr }}
          >
            {event.eventStatus.replace('_', ' ')}
          </div>
        </div>

        <h3 className="event-title">
          <Link to={`/events/${event._id}`}>{event.title}</Link>
        </h3>

        <p className="event-description">
          {/* trim long descriptions */}
          {event.description.length > 120
            ? event.description.substring(0, 120) + '...'
            : event.description}
        </p>

        <div className="event-details">
          <div className="event-detail">
            <span className="detail-label">Date:</span>
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="event-detail">
            <span className="detail-label">Venue:</span>
            <span>{event.venue}</span>
          </div>

          <div className="event-detail">
            <span className="detail-label">Registered:</span>
            <span>{event.registrationCount}/{event.maxParticipants}</span>
          </div>

          <div className="event-detail">
            <span className="detail-label">Fee:</span>
            <span>{formatCurrency(event.registrationFee)}</span>
          </div>
        </div>

        {daysLeft > 0 && (
          <div className="days-until">
            {daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days to go`}
          </div>
        )}

        <div className="event-footer">
          <div className="organizer">
            By {event.organizer}
          </div>

          <Link
            to={`/events/${event._id}`}
            className="view-details-btn"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;