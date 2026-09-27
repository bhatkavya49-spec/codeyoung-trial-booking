import { DateTime } from 'luxon'

function DateSelector({ selectedDate, onSelectDate, isLoading }) {
  const today = DateTime.now()
  const dates = []

  for (let i = 0; i < 7; i++) {
    const date = today.plus({ days: i })
    dates.push({
      iso: date.toISODate(),
      label: date.toFormat('MMM d'),
      day: date.toFormat('EEE'),
      full: date.toFormat('EEEE, MMMM d, yyyy'),
    })
  }

  return (
    <div className="date-selector">
      <label className="section-label">Choose a date</label>
      <div className="date-cards" role="radiogroup" aria-label="Available dates">
        {dates.map((date) => (
          <button
            key={date.iso}
            type="button"
            className={`date-card ${selectedDate === date.iso ? 'selected' : ''}`}
            onClick={() => !isLoading && onSelectDate(date.iso)}
            disabled={isLoading}
            role="radio"
            aria-checked={selectedDate === date.iso}
            aria-label={date.full}
          >
            <span className="date-day">{date.day}</span>
            <span className="date-label">{date.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DateSelector