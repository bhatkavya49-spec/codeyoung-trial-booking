import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAvailableSlots, createBooking } from '../services/api'
import ProgressSteps from '../components/ProgressSteps'
import DateSelector from '../components/DateSelector'
import TimeSlotSelector from '../components/TimeSlotSelector'
import TimezoneSelector from '../components/TimezoneSelector'
import CustomDropdown from '../components/CustomDropdown'

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
]

const SUBJECTS = [
  { value: 'English', label: 'English' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'Coding', label: 'Coding' },
]

const gradeOptions = [
  { value: '', label: 'Select grade' },
  ...GRADES.map(g => ({ value: g, label: g }))
]

const subjectOptions = [
  { value: '', label: 'Select subject' },
  ...SUBJECTS
]

function Booking() {
  const { parent } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(1)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [timezone, setTimezone] = useState(parent?.timezone || 'Asia/Kolkata')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [nextAvailableSlot, setNextAvailableSlot] = useState(null)

  const registrationData = location.state?.registrationData
  const initialSubject = registrationData?.subject || ''

  useEffect(() => {
    if (initialSubject && !subject) {
      setSubject(initialSubject)
    }
  }, [initialSubject])

  useEffect(() => {
    if (!selectedDate || !timezone || !subject) return

    const fetchSlots = async () => {
      setIsLoading(true)
      setError('')
      setSlots([])
      setSelectedSlot(null)
      setNextAvailableSlot(null)

      try {
        const data = await getAvailableSlots({
          date: selectedDate,
          timezone,
          subject,
          grade,
        })
        setSlots(data.slots || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load available slots')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate, timezone, subject, grade])

  const validateStep1 = () => {
    const errors = {}
    if (!childName.trim()) errors.childName = 'Child\'s name is required'
    if (!grade) errors.grade = 'Please select a grade'
    if (!subject) errors.subject = 'Please select a subject'
    return errors
  }

  const handleContinue = () => {
    const errors = validateStep1()
    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setStep(2)
    if (!selectedDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setSelectedDate(tomorrow.toISOString().split('T')[0])
    }
  }

  const handleBack = () => {
    setStep(Math.max(1, step - 1))
    setError('')
    setNextAvailableSlot(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    // Validate all required fields before sending
    const missingFields = []
    if (!parent?.parentId) missingFields.push('parentId')
    if (!childName.trim()) missingFields.push('childName')
    if (!grade) missingFields.push('grade')
    if (!subject) missingFields.push('subject')
    if (!selectedDate) missingFields.push('date')
    if (!selectedSlot?.start) missingFields.push('time')
    if (!timezone) missingFields.push('parentTimezone')

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await createBooking({
        parentId: parent.parentId,
        childName: childName.trim(),
        grade,
        subject,
        date: selectedDate,
        time: selectedSlot.start,
        parentTimezone: timezone,
      })

      // Show success toast before navigation
      showToast('Class booked successfully.', 'success')

      // Pass booking data and a flag for confirmation page to show toast
      navigate('/booking-confirmation', { 
        state: { 
          booking: result.booking,
          notifications: result.notifications,
          showSuccessToast: true
        } 
      })
    } catch (err) {
      if (err.response?.status === 409) {
        const message = err.response.data.message || 'No mentor is available for this time slot. Please choose another time.'
        const nextSlot = err.response.data.nextAvailableSlot || null
        setError(message)
        setNextAvailableSlot(nextSlot)
        if (nextSlot) {
          showToast(`No mentor is available at ${selectedSlot.label}. Next available time: ${nextSlot.label}`, 'warning')
        } else {
          showToast(message, 'warning')
        }
      } else {
        const message = err.response?.data?.message || 'Failed to confirm booking. Please try again.'
        setError(message)
        setNextAvailableSlot(null)
        showToast('Unable to book this class. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!parent) {
    return null
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <ProgressSteps currentStep={step} />

        {step === 1 && (
          <div className="booking-card">
            <div className="card-header">
              <h2>Let's get your child ready for class</h2>
              <p className="card-subtitle">Enter your child's details to continue</p>
            </div>

            {error && <div className="api-error" role="alert">{error}</div>}

            <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
              <div className="form-group">
                <label htmlFor="childName">Child's Name</label>
                <input
                  type="text"
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter your child's name"
                  autoComplete="off"
                />
              </div>

              <CustomDropdown
                id="grade"
                label="Grade"
                options={gradeOptions}
                value={grade}
                onChange={setGrade}
              />

              <CustomDropdown
                id="subject"
                label="Subject"
                options={subjectOptions}
                value={subject}
                onChange={setSubject}
              />

              <button type="submit" className="btn-primary btn-large">
                Continue to Schedule
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="booking-card">
            <div className="card-header">
              <h2>Choose a convenient time</h2>
              <p className="card-subtitle">Subject: <strong>{subject}</strong></p>
            </div>

            {error && <div className="api-error" role="alert">{error}</div>}

            <TimezoneSelector
              value={timezone}
              onChange={setTimezone}
              disabled={isLoading}
            />

            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              isLoading={isLoading}
            />

            <TimeSlotSelector
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot)
                setNextAvailableSlot(null)
                setError('')
              }}
              isLoading={isLoading}
              error={slots.length === 0 && selectedDate && !isLoading ? 'No mentors are currently available on this date. Please choose another date.' : null}
            />

            {nextAvailableSlot && selectedSlot && (
              <div className="next-slot-recommendation">
                <p className="recommendation-message">
                  No mentor is available at <strong>{selectedSlot.label}</strong>.
                  Next available time: <strong>{nextAvailableSlot.label}</strong>
                </p>
                <button
                  type="button"
                  className="btn-secondary btn-recommend"
                  onClick={() => {
                    const slotToSelect = slots.find(s => s.start === nextAvailableSlot.start)
                    if (slotToSelect) {
                      setSelectedSlot(slotToSelect)
                    }
                    setNextAvailableSlot(null)
                    setError('')
                  }}
                  disabled={isLoading}
                >
                  Select {nextAvailableSlot.label}
                </button>
              </div>
            )}

            {nextAvailableSlot && !selectedSlot && (
              <div className="next-slot-recommendation">
                <p className="recommendation-message">
                  Next available time: <strong>{nextAvailableSlot.label}</strong>
                </p>
                <button
                  type="button"
                  className="btn-secondary btn-recommend"
                  onClick={() => {
                    const slotToSelect = slots.find(s => s.start === nextAvailableSlot.start)
                    if (slotToSelect) {
                      setSelectedSlot(slotToSelect)
                    }
                    setNextAvailableSlot(null)
                    setError('')
                  }}
                  disabled={isLoading}
                >
                  Select {nextAvailableSlot.label}
                </button>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={isLoading}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-primary btn-large"
                onClick={handleConfirmBooking}
                disabled={isLoading || !selectedSlot}
              >
                {isLoading ? 'Confirming your class...' : 'Confirm My Slot'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Booking