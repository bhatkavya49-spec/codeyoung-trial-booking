import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOTP } from '../services/api'

const SUBJECTS = [
  { value: 'English', label: 'English' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'Coding', label: 'Coding' },
]

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email'
      case 'phone':
        return value.trim().length >= 7 ? '' : 'Please enter a valid phone number'
      case 'subject':
        return value ? '' : 'Please select a subject'
      case 'terms':
        return value ? '' : 'You must agree to the terms and conditions'
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: newValue }))

    const error = validateField(name, newValue)
    setErrors((prev) => ({ ...prev, [name]: error }))

    if (apiError) setApiError('')
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setApiError('')

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        timezone,
      }

      await sendOTP(payload)

      sessionStorage.setItem('codeyoung_registration', JSON.stringify(payload))

      navigate('/verify-otp')
    } catch (error) {
      setIsLoading(false)
      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="marketing-section">
          <h1 className="marketing-headline">Give Your Child a Better Learning Experience</h1>
          <p className="marketing-text">
            Book a free trial class and see how personalized 1-on-1 tutoring can help your child
            build confidence and excel in their studies.
          </p>
          <ul className="benefits">
            <li><span className="benefit-icon" aria-hidden="true">✓</span> Personalized Learning</li>
            <li><span className="benefit-icon" aria-hidden="true">✓</span> Experienced Mentors</li>
            <li><span className="benefit-icon" aria-hidden="true">✓</span> Flexible Scheduling</li>
            <li><span className="benefit-icon" aria-hidden="true">✓</span> Live Online Classes</li>
          </ul>
        </div>

        <div className="register-card">
          <div className="card-header">
            <h2>Book a FREE Class</h2>
            <p className="card-subtitle">Enter your details to get started.</p>
          </div>

          {apiError && <div className="api-error" role="alert">{apiError}</div>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <div className="form-group">
              <label htmlFor="name">Parent Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
                disabled={isLoading}
                autoComplete="name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="parent@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+91 XXXXXXXXXX"
                disabled={isLoading}
                autoComplete="tel"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkbox-text">I agree to the terms and conditions.</span>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Sending verification code...' : 'Verify Email & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register