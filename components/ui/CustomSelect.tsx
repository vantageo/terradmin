'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  className?: string
}

export default function CustomSelect({ value, onChange, options, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 pr-10 text-white text-left focus:outline-none focus:border-accent-500 hover:border-navy-500 transition-colors cursor-pointer"
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-600 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                option.value === value
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'text-slate-300 hover:bg-navy-700'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check className="w-4 h-4 text-accent-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

