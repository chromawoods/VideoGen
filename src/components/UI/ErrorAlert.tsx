import { AlertCircle, X } from 'lucide-react'

interface ErrorAlertProps {
  message: string | null
  onDismiss: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between space-x-3 animate-in fade-in duration-200">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-rose-200">Video Generation Notice</p>
          <p className="text-rose-300/90 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="text-rose-400 hover:text-rose-200 p-1 rounded transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
