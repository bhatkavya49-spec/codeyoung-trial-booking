import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getParentProfile } from '../services/api'

function Dashboard() {
  const { parent, logout } = useAuth()
  const navigate = useNavigate()
  const [parentDetails, setParentDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleBookClass = () => {
    navigate('/booking')
  }

  useEffect(() => {
    if (parent?.parentId) {
      const fetchProfile = async () => {
        try {
          const result = await getParentProfile(parent.parentId)
          if (result.success && result.parent) {
            setParentDetails(result.parent)
          }
        } catch (err) {
          console.error('Failed to fetch parent profile:', err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [parent?.parentId])

  if (!parent) {
    return null
  }

  const displayParent = parentDetails || parent

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome, {displayParent.name}</h1>
          <p className="welcome-subtitle">Your trial class journey starts here</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Personalized Learning</h3>
            <p>Customized lesson plans tailored to your child's learning style and pace.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Experienced Mentors</h3>
            <p>Hand-picked tutors with proven track records in their subjects.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Flexible Scheduling</h3>
            <p>Book sessions that fit your family's busy schedule.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Live Online Classes</h3>
            <p>Interactive 1-on-1 sessions from the comfort of home.</p>
          </div>
        </div>

        <button type="button" className="btn-primary btn-large" onClick={handleBookClass}>
          Book a FREE Class
        </button>

        <div className="parent-details-card">
          <h3>Your Details</h3>
          {isLoading ? (
            <div className="details-loading">Loading...</div>
          ) : (
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name</span>
                <span className="detail-value">{displayParent.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{displayParent.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{displayParent.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timezone</span>
                <span className="detail-value">{displayParent.timezone}</span>
              </div>
              <div className="detail-item verified">
                <span className="detail-label">Email Status</span>
                <span className="detail-value">
                  <span className="verified-badge">{displayParent.emailVerified ? 'Verified ✓' : 'Not Verified'}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard