function ProgressSteps({ currentStep }) {
  const steps = [
    { number: 1, label: 'Child Details' },
    { number: 2, label: 'Schedule' },
    { number: 3, label: 'Confirmation' },
  ]

  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div key={step.number} className="progress-step">
          <div className={`step-circle ${index + 1 < currentStep ? 'completed' : index + 1 === currentStep ? 'active' : ''}`}>
            {index + 1 < currentStep ? (
              <span className="check-icon">✓</span>
            ) : (
              step.number
            )}
          </div>
          <span className={`step-label ${index + 1 === currentStep ? 'active' : ''}`}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`step-line ${index + 1 < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default ProgressSteps