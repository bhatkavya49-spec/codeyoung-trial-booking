import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import ToastContainer from './components/ToastContainer'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import Login from './pages/Login'
import LoginVerifyOTP from './pages/LoginVerifyOTP'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/verify" element={<LoginVerifyOTP />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App