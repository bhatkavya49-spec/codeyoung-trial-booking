import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { parent, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isLoginPage = location.pathname === '/login' || location.pathname === '/login/verify'

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left" />
        <div className="header-center">
          <Link to="/" className="logo-link" aria-label="CodeYoung Home">
            <span className="brand-mark" aria-hidden="true" />
            <span className="logo">CodeYoung</span>
          </Link>
        </div>
        <div className="header-right">
          {isAuthenticated ? (
            <div className="auth-nav">
              <span className="welcome-text">Welcome, {parent?.name}</span>
              <button type="button" className="btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to={isLoginPage ? '/' : '/login'} className="login-link">
              {isLoginPage ? 'New here? Register' : 'Already booked? Login'}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header