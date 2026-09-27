import { useEffect, useState } from 'react'

function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // Auto-remove after duration
    const timer = setTimeout(() => {
      close()
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration])

  const close = () => {
    setIsExiting(true)
    setIsVisible(false)
    // Wait for exit animation
    setTimeout(() => {
      onRemove(toast.id)
      if (toast.onClose) toast.onClose()
    }, 200)
  }

  const getRole = () => {
    if (toast.type === 'success' || toast.type === 'info') return 'status'
    return 'alert'
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  const baseClasses = 'toast'
  const typeClasses = `toast-${toast.type}`
  const visibilityClasses = `${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exiting' : ''}`

  return (
    <div
      role={getRole()}
      className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">{getIcon()}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={close}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}

export default Toast