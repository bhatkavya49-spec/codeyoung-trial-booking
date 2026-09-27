import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendLoginOTP } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
    return ''
  }

  const handleChange = (e) => {
    const value = e.target.value
    setEmail(value)
    const err = validateEmail(value)
    setError(err)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      await sendLoginOTP({ email: email.trim().toLowerCase() })
      sessionStorage.setItem('codeyoung_login_email', email.trim().toLowerCase())
      navigate('/login/verify')
    } catch (err) {
      setIsLoading(false)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome back</h2>
          <p className="card-subtitle">Login to manage your child's trial class booking.</p>
        </div>

        <div className="login-card">
          {error && <div className="api-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="parent@example.com"
                disabled={isLoading}
                autoComplete="email"
                className={error ? 'error' : ''}
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Sending verification code...' : 'Send Verification Code'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <button type="button" onClick={() => navigate('/')}>Register now</button></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login