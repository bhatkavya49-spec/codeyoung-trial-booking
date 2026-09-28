import { useState, useRef, useEffect } from 'react'

function CustomDropdown({ label, options, value, onChange, id, error, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const optionsRef = useRef([])

  const filteredOptions = options.filter(opt => opt.value !== '')
  const emptyOption = options.find(opt => opt.value === '')

  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          listRef.current && !listRef.current.contains(event.target)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => {
            const next = prev + 1
            return next >= filteredOptions.length ? 0 : next
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => {
            const next = prev - 1
            return next < 0 ? filteredOptions.length - 1 : next
          })
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0) {
            onChange(filteredOptions[focusedIndex].value)
            setIsOpen(false)
            setFocusedIndex(-1)
            buttonRef.current?.focus()
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          buttonRef.current?.focus()
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(filteredOptions.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredOptions, focusedIndex, onChange])

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex, isOpen])

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : (emptyOption ? emptyOption.label : 'Select')

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setFocusedIndex(value ? filteredOptions.findIndex(opt => opt.value === value) : -1)
    }
  }

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setFocusedIndex(-1)
    buttonRef.current?.focus()
  }

  const handleOptionKeyDown = (event, optionValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOptionClick(optionValue)
    }
  }

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="custom-dropdown" role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" aria-controls={`${id}-listbox`}>
        <button
          ref={buttonRef}
          type="button"
          id={`${id}-button`}
          className={`custom-dropdown-button ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleButtonClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
              e.preventDefault()
              setIsOpen(true)
              setFocusedIndex(value ? filteredOptions.findIndex(opt => opt.value === value) : -1)
            }
          }}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-expanded={isOpen}
          disabled={disabled}
        >
          <span className="custom-dropdown-value">{displayValue}</span>
          <span className="custom-dropdown-arrow" aria-hidden="true">▼</span>
        </button>
        {isOpen && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            className="custom-dropdown-list"
            aria-label={label}
          >
            {emptyOption && (
              <li
                role="option"
                aria-selected={value === ''}
                className="custom-dropdown-option"
                onClick={() => handleOptionClick('')}
                onKeyDown={(e) => handleOptionKeyDown(e, '')}
                tabIndex={-1}
              >
                {emptyOption.label}
              </li>
            )}
            {filteredOptions.map((option, index) => (
              <li
                key={option.value}
                ref={(el) => { optionsRef.current[index] = el }}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={disabled}
                className={`custom-dropdown-option ${value === option.value ? 'selected' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                onClick={() => handleOptionClick(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                tabIndex={-1}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
        {error && <span className="error-message">{error}</span>}
      </div>
    </div>
  )
}

export default CustomDropdown