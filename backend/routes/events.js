const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getMyEvents
} = require('../controllers/eventController');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

// Protected routes
router.post('/', authenticateToken, createEvent);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);
router.patch('/:id/toggle-status', authenticateToken, toggleEventStatus);
router.get('/my/events', authenticateToken, getMyEvents);

module.exports = router;