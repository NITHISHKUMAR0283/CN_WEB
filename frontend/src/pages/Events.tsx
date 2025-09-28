import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import { Event, EventCategory } from '../types';
import EventCard from '../components/Events/EventCard';
import './Events.css';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '' as EventCategory | '',
    status: 'active'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0
  });

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.status]);

  const fetchEvents = async (page = 1, search = filters.search) => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvents({
        page,
        limit: 12,
        category: filters.category || undefined,
        search: search || undefined,
        status: filters.status,
        sortBy: 'eventDate',
        order: 'asc'
      });

      if (response.success && response.data) {
        setEvents(response.data.events);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalEvents: response.data.pagination.totalEvents || 0
        });
      }
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(1, filters.search);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    fetchEvents(page, filters.search);
  };

  const categories: EventCategory[] = [
    'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other'
  ];

  return (
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1>Discover Events</h1>
          <p>Find and register for amazing club events</p>
        </div>

        <div className="events-filters">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <div className="filter-controls">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="active">Upcoming Events</option>
              <option value="past">Past Events</option>
              <option value="all">All Events</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error">{error}</div>
        )}

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length > 0 ? (
          <>
            <div className="events-grid">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-btn ${
                      page === pagination.currentPage ? 'active' : ''
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            <div className="results-info">
              Showing {events.length} of {pagination.totalEvents} events
            </div>
          </>
        ) : (
          <div className="no-events">
            <h3>No events found</h3>
            <p>Try adjusting your search criteria or check back later for new events.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;