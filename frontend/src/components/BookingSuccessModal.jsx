import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { useToast } from '../context/ToastContext'

function BookingSuccessModal({ booking, notifications, onClose }) {
  const { showToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  if (!booking) return null

  const formatDate = (isoString) => {
    try {
      return DateTime.fromISO(isoString).toFormat('MMMM d, yyyy')
    } catch {
      return isoString
    }
  }

  const formatTime = (isoString) => {
    try {
      return DateTime.fromISO(isoString).toFormat('h:mm a')
    } catch {
      return isoString
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(booking.classLink)
      showToast('Link copied', 'success')
    } catch {
      showToast('Failed to copy link', 'error')
    }
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const close = () => {
    setIsExiting(true)
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getEmailStatusMessage = () => {
    if (notifications?.parentEmail === 'sent') {
      return 'A confirmation email has been sent.'
    }
    if (notifications?.parentEmail === 'failed') {
      return 'We couldn\'t send the confirmation email. Your booking is still confirmed.'
    }
    return 'Confirmation email status unknown.'
  }

  if (isExiting) return null

  return (
    <div
      className={`booking-success-modal-overlay ${isVisible ? 'visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
      onClick={close}
    >
      <div
        className={`booking-success-modal ${isVisible ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="booking-success-title" className="modal-title">Booking Confirmed!</h2>
          <button
            type="button"
            className="modal-copy-btn"
            onClick={handleCopyLink}
            aria-label="Copy class link to clipboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <p className="modal-subtitle">Your trial class is scheduled.</p>

        <div className="modal-details">
          <div className="detail-item">
            <span className="detail-value">{formatDate(booking.parentLocalStart)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-value">{formatTime(booking.parentLocalStart)} <span className="timezone-badge">{booking.parentTimezone}</span></span>
          </div>
        </div>

        <div className="modal-mentor">
          <span className="mentor-label">Mentor</span>
          <div className="mentor-info">
            <div className="mentor-avatar">
              <span>{booking.mentorName?.charAt(0) || '?'}</span>
            </div>
            <span className="mentor-name">{booking.mentorName}</span>
          </div>
        </div>

        <p className="modal-email-status">{getEmailStatusMessage()}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-copy-link-btn"
            onClick={handleCopyLink}
            aria-label="Copy class link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Link
          </button>
          <a
            href={booking.classLink}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-join-btn"
            aria-label="Join demo class"
          >
            Join Demo Class
          </a>
        </div>
      </div>
    </div>
  )
}

export default BookingSuccessModal