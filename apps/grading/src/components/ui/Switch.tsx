'use client'

import * as React from 'react'

interface SwitchProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({ 
  id, 
  checked = false, 
  onCheckedChange, 
  disabled = false,
  className = ''
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}