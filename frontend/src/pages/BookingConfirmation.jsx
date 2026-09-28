import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DateTime } from 'luxon'
import { useToast } from '../context/ToastContext'
import BookingSuccessModal from '../components/BookingSuccessModal'

function BookingConfirmation() {
  const location = useLocation()
  const { showToast } = useToast()
  const [booking, setBooking] = useState(null)
  const [notifications, setNotifications] = useState({ parentEmail: 'unknown', mentorEmail: 'unknown' })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (location.state?.booking) {
      setBooking(location.state.booking)
      if (location.state.notifications) {
        setNotifications(location.state.notifications)
      }
      // Show success modal only when BOTH booking and showSuccessToast exist
      if (location.state.booking && location.state.showSuccessToast) {
        setShowModal(true)
      }
    } else {
      const stored = sessionStorage.getItem('codeyoung_booking')
      if (stored) {
        try {
          const storedData = JSON.parse(stored)
          setBooking(storedData.booking)
          if (storedData.notifications) {
            setNotifications(storedData.notifications)
          }
        } catch {
          // ignore
        }
      }
    }
  }, [location.state])

  const handleModalClose = () => {
    setShowModal(false)
  }

  const formatBookingTime = (utcISO, timezone) => {
    try {
      if (!utcISO || !timezone) return 'Invalid time'
      return DateTime.fromISO(utcISO, { zone: 'utc' }).setZone(timezone).toFormat('EEEE, MMMM d, yyyy \'at\' h:mm a')
    } catch {
      return 'Invalid time'
    }
  }

  const formatTimeOnly = (isoString) => {
    try {
      return DateTime.fromISO(isoString).toFormat('h:mm a')
    } catch {
      return isoString
    }
  }

  const getNotificationStatus = (status) => {
    if (status === 'sent') return { icon: '✓', label: 'Sent', className: 'notification-sent' }
    if (status === 'failed') return { icon: '⚠', label: 'Failed', className: 'notification-failed' }
    return { icon: '○', label: 'Unknown', className: 'notification-unknown' }
  }

  const parentEmailStatus = getNotificationStatus(notifications.parentEmail)
  const mentorEmailStatus = getNotificationStatus(notifications.mentorEmail)

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="success-icon">✓</div>
            <h2>Your FREE class is confirmed!</h2>
          </div>
          <p className="confirmation-message">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const hasMentorContact = booking.mentorEmail && booking.mentorPhone

  return (
    <div className="confirmation-page">
      {showModal && (
        <BookingSuccessModal
          booking={booking}
          notifications={notifications}
          onClose={handleModalClose}
        />
      )}

      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="success-icon">✓</div>
            <h2>Your FREE class is confirmed!</h2>
            <p className="confirmation-message">
              {notifications.parentEmail === 'sent'
                ? 'A confirmation email has been sent to your inbox'
                : notifications.parentEmail === 'failed'
                ? 'Confirmation email could not be sent. Please check your email address.'
                : 'Confirmation email status unknown'}
            </p>
          </div>

          {notifications.mentorEmail !== 'unknown' && (
            <div className="notification-status">
              <h3>Notification Status</h3>
              <div className="notification-row">
                <span className={`notification-icon ${parentEmailStatus.className}`}>{parentEmailStatus.icon}</span>
                <span className="notification-label">Confirmation email to parent</span>
                <span className={`notification-badge ${parentEmailStatus.className}`}>{parentEmailStatus.label}</span>
              </div>
              <div className="notification-row">
                <span className={`notification-icon ${mentorEmailStatus.className}`}>{mentorEmailStatus.icon}</span>
                <span className="notification-label">Class assignment sent to mentor</span>
                <span className={`notification-badge ${mentorEmailStatus.className}`}>{mentorEmailStatus.label}</span>
              </div>
              {notifications.mentorEmail === 'failed' && (
                <p className="notification-warning">
                  ⚠ Mentor notification could not be sent. The booking is still confirmed.
                </p>
              )}
            </div>
          )}

          <div className="booking-summary">
            <div className="summary-section">
              <h3>Class Details</h3>
              <div className="detail-row">
                <span className="detail-label">Child</span>
                <span className="detail-value">{booking.childName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Grade</span>
                <span className="detail-value">{booking.grade}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subject</span>
                <span className="detail-value">{booking.subject}</span>
              </div>
            </div>

            <div className="summary-section mentor-section">
              <h3>Your Mentor</h3>
              <div className="mentor-info">
                <div className="mentor-avatar">
                  <span>{booking.mentorName.charAt(0)}</span>
                </div>
                <div className="mentor-details">
                  <span className="mentor-name">{booking.mentorName}</span>
                  <span className="mentor-timezone">{booking.mentorTimezone}</span>
                </div>
              </div>
              {hasMentorContact ? (
                <div className="mentor-contact">
                  <div className="contact-row">
                    <span className="contact-label">Email</span>
                    <a href={`mailto:${booking.mentorEmail}`} className="contact-value">
                      {booking.mentorEmail}
                    </a>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Phone</span>
                    <a href={`tel:${booking.mentorPhone}`} className="contact-value">
                      {booking.mentorPhone}
                    </a>
                  </div>
                  <div className="contact-actions">
                    <a
                      href={`mailto:${booking.mentorEmail}`}
                      className="btn-secondary btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Email Mentor
                    </a>
                    <a
                      href={`tel:${booking.mentorPhone}`}
                      className="btn-secondary btn-sm"
                    >
                      Call Mentor
                    </a>
                  </div>
                </div>
              ) : (
                <p className="contact-unavailable">Contact details unavailable</p>
              )}
            </div>

            <div className="summary-section time-section">
              <h3>Class Time</h3>
              <div className="time-comparison">
                <div className="time-column parent-time">
                  <span className="time-column-label">Your Time</span>
                  <span className="time-column-value">
                    {formatBookingTime(booking.startTimeUTC, booking.parentTimezone)}
                    <br />
                    <small>{booking.parentTimezone}</small>
                  </span>
                </div>
                <div className="time-divider">
                  <span className="divider-icon">↔</span>
                </div>
                <div className="time-column mentor-time">
                  <span className="time-column-label">Mentor's Time</span>
                  <span className="time-column-value">
                    {formatBookingTime(booking.startTimeUTC, booking.mentorTimezone)}
                    <br />
                    <small>{booking.mentorTimezone}</small>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <a
            href={booking.classLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-large join-class-btn"
          >
            Join Class
          </a>

          <Link to="/dashboard" className="btn-secondary btn-large">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation