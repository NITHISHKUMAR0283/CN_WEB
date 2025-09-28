const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  updateRegistrationStatus,
  submitFeedback
} = require('../controllers/registrationController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Register for an event
router.post('/events/:eventId', registerForEvent);

// Get user's registrations
router.get('/my', getMyRegistrations);

// Cancel registration
router.delete('/:registrationId', cancelRegistration);

// Submit feedback
router.post('/:registrationId/feedback', submitFeedback);

// Get registrations for a specific event (for event creators/admins)
router.get('/events/:eventId', getEventRegistrations);

// Update registration status (for event creators/admins)
router.patch('/:registrationId/status', updateRegistrationStatus);

module.exports = router;