'use client'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 flex justify-between items-start ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold">{icons[type]}</span>
        <p>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xl font-bold hover:opacity-70">
          ×
        </button>
      )}
    </div>
  )
}
