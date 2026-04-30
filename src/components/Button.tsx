'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ variant = 'primary', loading = false, children, ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'bg-transparent border border-current hover:bg-black/5',
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
