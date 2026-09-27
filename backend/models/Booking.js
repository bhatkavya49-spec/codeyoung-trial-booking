const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  childName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  startTimeUTC: {
    type: Date,
    required: true
  },
  endTimeUTC: {
    type: Date,
    required: true
  },
  parentTimezone: {
    type: String,
    required: true
  },
  mentorTimezone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  classLink: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

bookingSchema.index({ mentorId: 1, startTimeUTC: 1, endTimeUTC: 1 });

module.exports = mongoose.model('Booking', bookingSchema);