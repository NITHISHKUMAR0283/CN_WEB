const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Get all events with filters and pagination
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      status = 'active',
      sortBy = 'eventDate',
      order = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.eventDate = { $gte: new Date() };
    } else if (status === 'past') {
      query.eventDate = { $lt: new Date() };
    } else if (status === 'all') {
      // No additional filters
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('registrations')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEvents: total,
          hasNext: skip + events.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'registrations',
        populate: {
          path: 'user',
          select: 'firstName lastName email studentId'
        }
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      organizer,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      registrationFee,
      requirements,
      tags,
      imageUrl
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'category', 'organizer', 'venue',
      'eventDate', 'startTime', 'endTime', 'registrationDeadline', 'maxParticipants'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Create event
    const event = new Event({
      title,
      description,
      category,
      organizer,
      venue,
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      registrationDeadline: new Date(registrationDeadline),
      maxParticipants: parseInt(maxParticipants),
      registrationFee: registrationFee || 0,
      requirements: requirements || [],
      tags: tags || [],
      imageUrl,
      createdBy: req.user._id
    });

    await event.save();

    // Populate the created event
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: populatedEvent }
    });

  } catch (error) {
    console.error('Create event error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Filter allowed updates
    const allowedUpdates = [
      'title', 'description', 'category', 'organizer', 'venue',
      'eventDate', 'startTime', 'endTime', 'registrationDeadline',
      'maxParticipants', 'registrationFee', 'requirements', 'tags', 'imageUrl'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Special handling for dates
    if (updates.eventDate) {
      updates.eventDate = new Date(updates.eventDate);
    }
    if (updates.registrationDeadline) {
      updates.registrationDeadline = new Date(updates.registrationDeadline);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });

  } catch (error) {
    console.error('Update event error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Check if event has registrations
    const registrationCount = await Registration.countDocuments({ event: id });

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations. Please cancel all registrations first.'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// Toggle event active status
const toggleEventStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event'
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.json({
      success: true,
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { event }
    });

  } catch (error) {
    console.error('Toggle event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status'
    });
  }
};

// Get events created by current user
const getMyEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all'
    } = req.query;

    // Build query
    const query = { createdBy: req.user._id };

    if (status === 'active') {
      query.isActive = true;
      query.eventDate = { $gte: new Date() };
    } else if (status === 'past') {
      query.eventDate = { $lt: new Date() };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(query)
      .populate('registrations')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEvents: total
        }
      }
    });

  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getMyEvents
};