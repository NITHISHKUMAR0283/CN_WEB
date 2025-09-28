const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    // Check if event exists and is active
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not active'
      });
    }

    // Check if registration is still open
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    if (new Date(event.eventDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'Event has already occurred'
      });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    const currentRegistrations = await Registration.countDocuments({
      event: eventId,
      status: { $in: ['confirmed', 'waitlist'] }
    });

    const status = currentRegistrations >= event.maxParticipants ? 'waitlist' : 'confirmed';

    // Create registration
    const registration = new Registration({
      user: userId,
      event: eventId,
      status,
      notes: notes || '',
      paymentAmount: event.registrationFee,
      paymentStatus: event.registrationFee > 0 ? 'pending' : 'not_required'
    });

    await registration.save();

    // Update user's registrations array
    await User.findByIdAndUpdate(userId, {
      $push: { registrations: registration._id }
    });

    // Update event's registrations array
    await Event.findByIdAndUpdate(eventId, {
      $push: { registrations: registration._id }
    });

    // Populate the registration for response
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'firstName lastName email studentId')
      .populate('event', 'title eventDate venue organizer registrationFee');

    res.status(201).json({
      success: true,
      message: status === 'confirmed'
        ? 'Registration successful'
        : 'Added to waitlist - event is currently full',
      data: { registration: populatedRegistration }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findById(registrationId)
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    // Check if registration can be cancelled
    if (!registration.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Registration cannot be cancelled after the deadline'
      });
    }

    // Update registration status
    registration.status = 'cancelled';
    await registration.save();

    // Remove from user's registrations
    await User.findByIdAndUpdate(userId, {
      $pull: { registrations: registrationId }
    });

    // Remove from event's registrations
    await Event.findByIdAndUpdate(registration.event._id, {
      $pull: { registrations: registrationId }
    });

    // If this was a confirmed registration, promote someone from waitlist
    if (registration.status === 'confirmed') {
      const waitlistRegistration = await Registration.findOne({
        event: registration.event._id,
        status: 'waitlist'
      }).sort({ createdAt: 1 });

      if (waitlistRegistration) {
        waitlistRegistration.status = 'confirmed';
        await waitlistRegistration.save();

        // You could send notification here
      }
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
};

// Get user's registrations
const getMyRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all'
    } = req.query;

    const userId = req.user._id;

    // Build query
    const query = { user: userId };

    if (status !== 'all') {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(query)
      .populate('event', 'title description eventDate venue organizer category registrationFee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(query);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRegistrations: total
        }
      }
    });

  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

// Get registrations for a specific event (for event creators/admins)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized to view registrations
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event'
      });
    }

    // Build query
    const query = { event: eventId };

    if (status !== 'all') {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(query)
      .populate('user', 'firstName lastName email studentId phone department year')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(query);

    // Get registration statistics
    const stats = await Registration.getEventStats(eventId);

    res.json({
      success: true,
      data: {
        registrations,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRegistrations: total
        }
      }
    });

  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations'
    });
  }
};

// Update registration status (for event creators/admins)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status, notes } = req.body;

    if (!['confirmed', 'waitlist', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: confirmed, waitlist, or cancelled'
      });
    }

    const registration = await Registration.findById(registrationId)
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user is authorized
    if (registration.event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this registration'
      });
    }

    // Update registration
    registration.status = status;
    if (notes) {
      registration.notes = notes;
    }

    await registration.save();

    const populatedRegistration = await Registration.findById(registrationId)
      .populate('user', 'firstName lastName email studentId')
      .populate('event', 'title eventDate venue');

    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: { registration: populatedRegistration }
    });

  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status'
    });
  }
};

// Submit feedback for an event
const submitFeedback = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const registration = await Registration.findById(registrationId)
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this registration'
      });
    }

    // Check if event has occurred
    const now = new Date();
    if (new Date(registration.event.eventDate) >= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit feedback before the event occurs'
      });
    }

    // Update feedback
    registration.feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      submittedAt: new Date()
    };

    await registration.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { registration }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  updateRegistrationStatus,
  submitFeedback
};