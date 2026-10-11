import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
  variant: 'error' | 'success'
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const isError = toast.variant === 'error'

  return (
    <div className="fixed top-4 right-4 left-4 z-50 flex justify-center sm:left-auto sm:justify-end">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
          isError
            ? 'border-red-500/40 bg-red-950/80 text-red-100'
            : 'border-emerald-500/40 bg-emerald-950/80 text-emerald-100'
        } max-w-md animate-[toast-in_0.2s_ease-out]`}
      >
        {isError ? (
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
        ) : (
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
        )}
        <p className="text-sm leading-snug">{toast.text}</p>
        <button
          onClick={onDismiss}
          className="ml-2 shrink-0 rounded-full p-0.5 text-current opacity-60 transition hover:opacity-100"
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
