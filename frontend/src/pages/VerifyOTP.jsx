import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOTP } from '../services/api'
import { useAuth } from '../context/AuthContext'

function VerifyOTP() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('codeyoung_registration')
    if (stored) {
      try {
        setRegistration(JSON.parse(stored))
      } catch {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const maskEmail = (email) => {
    const [local, domain] = email.split('@')
    const masked = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local[0] + '*'
    return `${masked}@${domain}`
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setErrors((prev) => ({ ...prev, otp: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setApiError('')

    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' })
      return
    }

    setIsLoading(true)

    try {
      const { email } = registration
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP')
      }

      // Use the authoritative parent object returned by the backend
      const parentData = {
        parentId: data.parentId,
        ...data.parent,
      }

      login(parentData)
      sessionStorage.removeItem('codeyoung_registration')
      navigate('/dashboard')
    } catch (error) {
      setIsLoading(false)
      setApiError(error.message)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !registration) return

    setApiError('')
    setErrors({})

    try {
      await sendOTP(registration)
      setResendCooldown(30)
      setOtp('')
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  if (!registration) {
    return null
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          <div className="card-header">
            <h2>Verify your email</h2>
            <p className="card-subtitle">
              We sent a 6-digit code to <strong>{maskEmail(registration.email)}</strong>
            </p>
          </div>

          {apiError && <div className="api-error" role="alert">{apiError}</div>}

          <form onSubmit={handleSubmit} className="verify-form" noValidate>
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className={errors.otp ? 'error' : ''}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              {errors.otp && <span className="error-message">{errors.otp}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="resend-section">
            <p className="resend-text">
              Didn't receive the code?
              <button
                type="button"
                className="resend-link"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>
            </p>
          </div>

          <p className="back-link">
            <button type="button" onClick={() => navigate('/')} className="link-button">
              ← Back to registration
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP