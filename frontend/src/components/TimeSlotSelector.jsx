function TimeSlotSelector({ slots, selectedSlot, onSelectSlot, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="time-slots-loading">
        <div className="spinner-small"></div>
        <span>Checking available mentors...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="time-slots-error">
        <p>{error}</p>
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="time-slots-empty">
        <p>No mentors are currently available on this date. Please choose another date.</p>
      </div>
    )
  }

  return (
    <div className="time-slot-selector">
      <label className="section-label">Choose a time slot</label>
      <div className="time-slots-grid" role="radiogroup" aria-label="Available time slots">
        {slots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            className={`time-slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
            onClick={() => onSelectSlot(slot)}
            disabled={isLoading}
            role="radio"
            aria-checked={selectedSlot?.start === slot.start}
            aria-label={`${slot.label} to ${slot.end}`}
          >
            <span className="slot-time">{slot.label}</span>
            <span className="slot-duration">{slot.start} - {slot.end}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeSlotSelector