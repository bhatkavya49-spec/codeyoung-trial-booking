const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOtpEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"CodeYoung Trial Booking" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your CodeYoung Trial Class OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">CodeYoung Trial Class Registration</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your OTP for trial class registration is:</p>
        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 4px;">${otp}</span>
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 14px;">CodeYoung Trial Booking System</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendParentBookingConfirmationEmail = async (parentEmail, parentName, booking) => {
  const parentLocalStart = booking.parentLocalStart
    ? new Date(booking.parentLocalStart).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: booking.parentTimezone,
      })
    : 'Unknown';

  const mentorLocalStart = booking.mentorLocalStart
    ? new Date(booking.mentorLocalStart).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: booking.mentorTimezone,
      })
    : 'Unknown';

  const mailOptions = {
    from: `"CodeYoung Trial Booking" <${process.env.SMTP_USER}>`,
    to: parentEmail,
    subject: 'Your CodeYoung FREE Trial Class is Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Your FREE Trial Class is Confirmed</h2>
        <p>Hello <strong>${parentName}</strong>,</p>
        <p>Your child's CodeYoung FREE trial class has been confirmed.</p>

        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Class Details</h3>
          <p><strong>Child:</strong> ${booking.childName}</p>
          <p><strong>Grade:</strong> ${booking.grade}</p>
          <p><strong>Subject:</strong> ${booking.subject}</p>
          <p><strong>Mentor:</strong> ${booking.mentorName}</p>
          <p><strong>Class Time (Your Timezone):</strong> ${parentLocalStart} (${booking.parentTimezone})</p>
          <p><strong>Mentor's Time:</strong> ${mentorLocalStart} (${booking.mentorTimezone})</p>
        </div>

        <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0;"><strong>Class Link:</strong></p>
          <p style="word-break: break-all; margin: 0;"><a href="${booking.classLink}" style="color: #e74c3c;">${booking.classLink}</a></p>
        </div>

        <p>Please use the class link to join the trial class.</p>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 14px;">CodeYoung Trial Booking System</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const sendMentorBookingAssignmentEmail = async (mentorEmail, mentorName, booking) => {
  const mentorLocalStart = booking.mentorLocalStart
    ? new Date(booking.mentorLocalStart).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: booking.mentorTimezone,
      })
    : 'Unknown';

  const parentLocalStart = booking.parentLocalStart
    ? new Date(booking.parentLocalStart).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: booking.parentTimezone,
      })
    : 'Unknown';

  const mailOptions = {
    from: `"CodeYoung Trial Booking" <${process.env.SMTP_USER}>`,
    to: mentorEmail,
    subject: 'New CodeYoung Trial Class Assigned to You',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">New Trial Class Assigned</h2>
        <p>Hello <strong>${mentorName}</strong>,</p>
        <p>A new CodeYoung trial class has been assigned to you.</p>

        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Class Details</h3>
          <p><strong>Student:</strong> ${booking.childName}</p>
          <p><strong>Grade:</strong> ${booking.grade}</p>
          <p><strong>Subject:</strong> ${booking.subject}</p>
          <p><strong>Parent:</strong> ${booking.parentName || 'Parent'}</p>
          <p><strong>Parent Email:</strong> ${booking.parentEmail || 'N/A'}</p>
          <p><strong>Class Time (Your Timezone):</strong> ${mentorLocalStart} (${booking.mentorTimezone})</p>
          <p><strong>Parent's Local Time:</strong> ${parentLocalStart} (${booking.parentTimezone})</p>
        </div>

        <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0;"><strong>Class Link:</strong></p>
          <p style="word-break: break-all; margin: 0;"><a href="${booking.classLink}" style="color: #e74c3c;">${booking.classLink}</a></p>
        </div>

        <p>Please use the class link to join the trial class.</p>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 14px;">CodeYoung Trial Booking System</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
  sendParentBookingConfirmationEmail,
  sendMentorBookingAssignmentEmail
};