const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  timezone: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  maxClassesPerDay: {
    type: Number,
    default: 2
  },
  subjects: {
    type: [String],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentor', mentorSchema);