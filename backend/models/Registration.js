const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlist', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'not_required'],
    default: function() {
      return 'not_required';
    }
  },
  paymentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Payment amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  attendanceStatus: {
    type: String,
    enum: ['not_attended', 'attended', 'partially_attended'],
    default: 'not_attended'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
    },
    submittedAt: Date
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate registration number before saving
registrationSchema.pre('save', async function(next) {
  if (!this.registrationNumber && this.isNew) {
    const count = await mongoose.model('Registration').countDocuments();
    const eventId = this.event.toString().slice(-4);
    const timestamp = Date.now().toString().slice(-6);
    this.registrationNumber = `REG${eventId}${timestamp}${count + 1}`;
  }
  next();
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Indexes for better performance
registrationSchema.index({ event: 1 });
registrationSchema.index({ user: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationDate: -1 });

// Static method to get registration stats for an event
registrationSchema.statics.getEventStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    confirmed: 0,
    waitlist: 0,
    cancelled: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    if (stat._id !== 'cancelled') {
      result.total += stat.count;
    }
  });

  return result;
};

// Instance method to check if registration can be cancelled
registrationSchema.methods.canBeCancelled = function() {
  const event = this.event;
  const now = new Date();

  if (typeof event.registrationDeadline === 'string') {
    return new Date(event.registrationDeadline) > now;
  }

  return event.registrationDeadline > now;
};

module.exports = mongoose.model('Registration', registrationSchema);