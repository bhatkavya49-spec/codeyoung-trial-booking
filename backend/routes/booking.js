const express = require('express');
const { getAvailableSlots, createBooking } = require('../services/mentorService');
const Parent = require('../models/Parent');
const Notification = require('../models/Notification');
const { sendParentBookingConfirmationEmail, sendMentorBookingAssignmentEmail } = require('../services/emailService');

const router = express.Router();

router.get('/slots', async (req, res) => {
  try {
    const { date, timezone, subject, grade } = req.query;

    if (!date || !timezone || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: date, timezone, subject',
      });
    }

    const result = await getAvailableSlots(date, timezone, subject);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Get slots error:', error.message);
    if (error.message === 'Invalid timezone' || error.message === 'Invalid date') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch available slots' });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const {
      parentId,
      childName,
      grade,
      subject,
      date,
      time,
      parentTimezone,
    } = req.body;

    if (!parentId || !childName || !grade || !subject || !date || !time || !parentTimezone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    if (!parent.emailVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    const bookingResult = await createBooking({
      parentId,
      childName,
      grade,
      subject,
      date,
      time,
      parentTimezone,
    });

    // Prepare booking data with parent info for emails
    const bookingData = {
      ...bookingResult,
      parentName: parent.name,
      parentEmail: parent.email,
    };

    // Send emails and log notifications (don't fail booking if email fails)
    const notifications = {
      parentEmail: 'failed',
      mentorEmail: 'failed'
    };

    // Send parent confirmation email
    try {
      const info = await sendParentBookingConfirmationEmail(parent.email, parent.name, bookingData);
      notifications.parentEmail = 'sent';
      await Notification.create({
        bookingId: bookingResult.id,
        type: 'parent_class_confirmation',
        recipient: parent.email,
        status: 'sent',
        messageId: info.messageId,
        sentAt: new Date()
      });
    } catch (emailError) {
      console.error('Parent email failed:', emailError.message);
      await Notification.create({
        bookingId: bookingResult.id,
        type: 'parent_class_confirmation',
        recipient: parent.email,
        status: 'failed',
        error: emailError.message,
        sentAt: new Date()
      });
    }

    // Send mentor assignment email
    try {
      const info = await sendMentorBookingAssignmentEmail(bookingResult.mentorEmail, bookingResult.mentorName, bookingData);
      notifications.mentorEmail = 'sent';
      await Notification.create({
        bookingId: bookingResult.id,
        type: 'mentor_class_assignment',
        recipient: bookingResult.mentorEmail,
        status: 'sent',
        messageId: info.messageId,
        sentAt: new Date()
      });
    } catch (emailError) {
      console.error('Mentor email failed:', emailError.message);
      await Notification.create({
        bookingId: bookingResult.id,
        type: 'mentor_class_assignment',
        recipient: bookingResult.mentorEmail,
        status: 'failed',
        error: emailError.message,
        sentAt: new Date()
      });
    }

    res.status(201).json({ success: true, booking: bookingResult, notifications });
  } catch (error) {
    console.error('Create booking error:', error.message);
    if (error.code === 'NO_MENTOR_AVAILABLE') {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.message === 'Invalid parent timezone' || error.message === 'Invalid date/time') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

module.exports = router;