import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendLoginOTP, verifyLoginOTP } from '../services/api'
import { useAuth } from '../context/AuthContext'

function LoginVerifyOTP() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('codeyoung_login_email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      navigate('/login')
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
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyLoginOTP({ email, code: otp })

      const parentData = {
        parentId: result.parentId,
        name: result.parent.name,
        email: result.parent.email,
        phone: result.parent.phone,
        timezone: result.parent.timezone,
        emailVerified: result.parent.emailVerified
      }

      login(parentData)
      sessionStorage.removeItem('codeyoung_login_email')
      navigate('/dashboard')
    } catch (err) {
      setIsLoading(false)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to verify code. Please try again.')
      }
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return

    setError('')
    setIsLoading(true)

    try {
      await sendLoginOTP({ email })
      setResendCooldown(30)
      setOtp('')
    } catch (err) {
      setIsLoading(false)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to resend code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          <div className="card-header">
            <h2>Verify your email</h2>
            <p className="card-subtitle">
              We sent a 6-digit code to <strong>{maskEmail(email)}</strong>
            </p>
          </div>

          {error && <div className="api-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="verify-form" noValidate>
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className={error ? 'error' : ''}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Login'}
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
            <button type="button" onClick={() => navigate('/login')} className="link-button">
              ← Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginVerifyOTP