const { DateTime } = require('luxon');
const Mentor = require('../models/Mentor');
const Booking = require('../models/Booking');

const CLASS_DURATION_MINUTES = 45;

const isValidTimezone = (timezone) => {
  try {
    return DateTime.now().setZone(timezone).isValid;
  } catch {
    return false;
  }
};

const getActiveMentorsBySubject = async (subject) => {
  return Mentor.find({ active: true, subjects: subject }).lean();
};

const getMentorLocalDayBounds = (mentor, utcDate) => {
  const mentorZone = mentor.timezone;
  const startOfDay = DateTime.fromJSDate(utcDate).setZone(mentorZone).startOf('day');
  const endOfDay = DateTime.fromJSDate(utcDate).setZone(mentorZone).endOf('day');
  return {
    startUTC: startOfDay.toUTC().toJSDate(),
    endUTC: endOfDay.toUTC().toJSDate(),
  };
};

const getMentorBookingsForDay = async (mentor, utcDate) => {
  const { startUTC, endUTC } = getMentorLocalDayBounds(mentor, utcDate);

  return Booking.find({
    mentorId: mentor._id,
    status: 'confirmed',
    startTimeUTC: { $gte: startUTC, $lt: endUTC },
  }).lean();
};

const hasOverlap = (existingStart, existingEnd, candidateStart, candidateEnd) => {
  return existingStart < candidateEnd && existingEnd > candidateStart;
};

const getAvailableSlots = async (dateStr, timezone, subject) => {
  if (!isValidTimezone(timezone)) {
    throw new Error('Invalid timezone');
  }

  const date = DateTime.fromISO(dateStr, { zone: timezone });
  if (!date.isValid) {
    throw new Error('Invalid date');
  }

  // Fetch mentors ONCE
  const mentors = await getActiveMentorsBySubject(subject);
  if (mentors.length === 0) {
    return {
      date: dateStr,
      timezone,
      durationMinutes: CLASS_DURATION_MINUTES,
      slots: [],
      nextAvailableSlot: null,
    };
  }

  // Use a representative UTC date (parent's date at noon) to compute each mentor's local day bounds
  const utcDateForBounds = date.set({ hour: 12 }).toUTC().toJSDate();

  // Build mentor day bounds map and collect mentor IDs
  const mentorBounds = new Map();
  const mentorIds = [];
  for (const mentor of mentors) {
    const { startUTC, endUTC } = getMentorLocalDayBounds(mentor, utcDateForBounds);
    mentorBounds.set(mentor._id.toString(), { startUTC, endUTC, mentor });
    mentorIds.push(mentor._id);
  }

  // Fetch ALL bookings for these mentors in a single query using $or for each mentor's local day range
  const orConditions = mentorIds.map((mentorId) => {
    const bounds = mentorBounds.get(mentorId.toString());
    return {
      mentorId,
      status: 'confirmed',
      startTimeUTC: { $gte: bounds.startUTC, $lt: bounds.endUTC },
    };
  });

  let allBookings = [];
  if (orConditions.length > 0) {
    allBookings = await Booking.find({ $or: orConditions }).lean();
  }

  // Group bookings by mentorId
  const bookingsByMentor = new Map();
  for (const booking of allBookings) {
    const mid = booking.mentorId.toString();
    if (!bookingsByMentor.has(mid)) {
      bookingsByMentor.set(mid, []);
    }
    bookingsByMentor.get(mid).push(booking);
  }

  // Generate candidate slots
  const candidateSlots = generateTimeSlots(date, timezone);
  const availableSlots = [];

  // For each slot, check availability using in-memory data
  for (const slot of candidateSlots) {
    let slotHasAvailableMentor = false;

    for (const mentor of mentors) {
      const mid = mentor._id.toString();
      const bookings = bookingsByMentor.get(mid) || [];

      // Check maxClassesPerDay (based on mentor's local day)
      if (bookings.length >= mentor.maxClassesPerDay) {
        continue;
      }

      // Check overlap with this slot
      const hasConflict = bookings.some((booking) =>
        hasOverlap(booking.startTimeUTC, booking.endTimeUTC, slot.startUTC, slot.endUTC)
      );

      if (!hasConflict) {
        slotHasAvailableMentor = true;
        break; // At least one mentor available for this slot
      }
    }

    if (slotHasAvailableMentor) {
      availableSlots.push({
        start: slot.startLocal,
        end: slot.endLocal,
        label: slot.label,
      });
    }
  }

  return {
    date: dateStr,
    timezone,
    durationMinutes: CLASS_DURATION_MINUTES,
    slots: availableSlots,
    nextAvailableSlot: availableSlots.length > 0 ? availableSlots[0] : null,
  };
};

const generateTimeSlots = (date, timezone) => {
  const slots = [];
  const startHour = 9;
  const endHour = 21;

  for (let hour = startHour; hour < endHour; hour++) {
    for (const minute of [0, 30]) {
      const slotStart = DateTime.fromObject(
        { year: date.year, month: date.month, day: date.day, hour, minute },
        { zone: timezone }
      );

      const slotEnd = slotStart.plus({ minutes: CLASS_DURATION_MINUTES });

      if (slotEnd.hour >= endHour && slotEnd.minute > 0) {
        continue;
      }

      slots.push({
        startLocal: slotStart.toFormat('HH:mm'),
        endLocal: slotEnd.toFormat('HH:mm'),
        label: slotStart.toFormat('h:mm a'),
        startUTC: slotStart.toUTC().toJSDate(),
        endUTC: slotEnd.toUTC().toJSDate(),
      });
    }
  }

  return slots;
};

const getAvailableMentorsForSlot = async (candidateStartUTC, candidateEndUTC, subject) => {
  const mentors = await getActiveMentorsBySubject(subject);
  const availableMentors = [];

  for (const mentor of mentors) {
    const bookings = await getMentorBookingsForDay(mentor, candidateStartUTC);

    if (bookings.length >= mentor.maxClassesPerDay) {
      continue;
    }

    const hasConflict = bookings.some((booking) =>
      hasOverlap(booking.startTimeUTC, booking.endTimeUTC, candidateStartUTC, candidateEndUTC)
    );

    if (!hasConflict) {
      availableMentors.push(mentor);
    }
  }

  return availableMentors;
};

const assignMentor = async (startUTC, endUTC, subject) => {
  const availableMentors = await getAvailableMentorsForSlot(startUTC, endUTC, subject);
  if (availableMentors.length === 0) {
    return null;
  }
  return availableMentors[0];
};

const createBooking = async (data) => {
  const {
    parentId,
    childName,
    grade,
    subject,
    date,
    time,
    parentTimezone,
  } = data;

  if (!isValidTimezone(parentTimezone)) {
    throw new Error('Invalid parent timezone');
  }

  const parentLocalStart = DateTime.fromISO(`${date}T${time}`, { zone: parentTimezone });
  if (!parentLocalStart.isValid) {
    throw new Error('Invalid date/time');
  }

  const startUTC = parentLocalStart.toUTC().toJSDate();
  const endUTC = parentLocalStart.plus({ minutes: CLASS_DURATION_MINUTES }).toUTC().toJSDate();

  const mentor = await assignMentor(startUTC, endUTC, subject);
  if (!mentor) {
    const slotsResult = await getAvailableSlots(date, parentTimezone, subject);
    const nextSlot = slotsResult.nextAvailableSlot;
    const error = new Error('No mentor is available for this time slot. Please choose another time.');
    error.code = 'NO_MENTOR_AVAILABLE';
    error.status = 409;
    error.nextAvailableSlot = nextSlot;
    throw error;
  }

  const classLink = `https://meet.example.com/codeyoung-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const booking = await Booking.create({
    parentId,
    mentorId: mentor._id,
    childName: childName.trim(),
    subject: subject.trim(),
    grade: grade.trim(),
    startTimeUTC: startUTC,
    endTimeUTC: endUTC,
    parentTimezone,
    mentorTimezone: mentor.timezone,
    status: 'confirmed',
    classLink,
  });

  const parentLocalEnd = parentLocalStart.plus({ minutes: CLASS_DURATION_MINUTES });
  const mentorLocalStart = DateTime.fromJSDate(startUTC).setZone(mentor.timezone);
  const mentorLocalEnd = DateTime.fromJSDate(endUTC).setZone(mentor.timezone);

  return {
    id: booking._id.toString(),
    childName: booking.childName,
    grade: booking.grade,
    subject: booking.subject,
    parentTimezone: booking.parentTimezone,
    mentorName: mentor.name,
    mentorEmail: mentor.email,
    mentorPhone: mentor.phone,
    mentorTimezone: booking.mentorTimezone,
    startTimeUTC: booking.startTimeUTC.toISOString(),
    endTimeUTC: booking.endTimeUTC.toISOString(),
    parentLocalStart: parentLocalStart.toISO(),
    parentLocalEnd: parentLocalEnd.toISO(),
    mentorLocalStart: mentorLocalStart.toISO(),
    mentorLocalEnd: mentorLocalEnd.toISO(),
    classLink: booking.classLink,
  };
};

module.exports = {
  getAvailableSlots,
  createBooking,
  CLASS_DURATION_MINUTES,
  isValidTimezone,
};