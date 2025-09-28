import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { CreateEventData, EventCategory } from '../types';
import './CreateEvent.css';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    category: 'Technical' as EventCategory,
    organizer: '',
    venue: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    maxParticipants: 50,
    registrationFee: 0,
    requirements: [],
    tags: [],
    imageUrl: ''
  });

  const categories: EventCategory[] = [
    'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleArrayInput = (field: 'requirements' | 'tags', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate dates
      const eventDate = new Date(formData.eventDate);
      const registrationDeadline = new Date(formData.registrationDeadline);
      const now = new Date();

      if (eventDate <= now) {
        setError('Event date must be in the future');
        setLoading(false);
        return;
      }

      if (registrationDeadline > eventDate) {
        setError('Registration deadline must be before or on event date');
        setLoading(false);
        return;
      }

      const response = await eventsAPI.createEvent(formData);

      if (response.success && response.data) {
        navigate(`/events/${response.data.event._id}`);
      } else {
        setError(response.message || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <div className="create-event-header">
          <h1>Create New Event</h1>
          <p>Fill in the details to create your event</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                placeholder="Enter event title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              maxLength={2000}
              rows={4}
              placeholder="Describe your event..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="organizer">Organizer *</label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                required
                placeholder="Organization or person name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue *</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                placeholder="Event location"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate">Event Date *</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationDeadline">Registration Deadline *</label>
              <input
                type="date"
                id="registrationDeadline"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxParticipants">Max Participants *</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                required
                min={1}
                max={10000}
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationFee">Registration Fee (₹)</label>
              <input
                type="number"
                id="registrationFee"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleInputChange}
                min={0}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Event Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <input
              type="text"
              id="requirements"
              placeholder="Separate with commas (e.g., Laptop, ID Card, Prior registration)"
              onChange={(e) => handleArrayInput('requirements', e.target.value)}
            />
            <small>Optional requirements for participants</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              placeholder="Separate with commas (e.g., programming, workshop, beginner)"
              onChange={(e) => handleArrayInput('tags', e.target.value)}
            />
            <small>Tags to help people find your event</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;