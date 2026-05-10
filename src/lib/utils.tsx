import type { ReactNode } from 'react'

// ── Date / currency formatters ────────────────────────────────────────

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Status helpers ────────────────────────────────────────────────────

export function getStatusConfig(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' }
    case 'PENDING':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
    case 'COMPLETED':
      return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
    case 'IN_PROGRESS':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' }
    case 'CANCELLED':
      return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' }
  }
}

// ── Reusable UI components ────────────────────────────────────────────

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const w = size === 'md' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${w} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// ── Reusable state wrappers ───────────────────────────────────────────

export function LoadingSpinner({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className={`spinner ${className}`} />
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-800">Failed to load</h3>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon || (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {action}
    </div>
  )
}

// ── Confirm Dialog ──────────────────────────────────────────────────

import { Modal } from '@/lib/modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={destructive ? 'btn btn-destructive' : 'btn btn-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
