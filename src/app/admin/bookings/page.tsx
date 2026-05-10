'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatusBadge, formatDate, formatCurrency, ConfirmDialog } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { CheckIcon, XIcon, PlayIcon, TrashIcon } from '@/lib/icons'
import type { Booking } from '@/lib/types'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function AdminBookingsPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/bookings?${params}`)
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      addToast(`Booking ${status.toLowerCase().replace('_', ' ')}`, 'success')
      fetchBookings()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      addToast('Booking cancelled', 'success')
      setCancelTarget(null)
      fetchBookings()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  const canTransition = (current: string, next: string) => {
    const transitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
    }
    return transitions[current]?.includes(next) ?? false
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all service bookings</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchBookings} className="btn btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handyman</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No bookings found.</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {b.customer.firstName} {b.customer.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {b.handyman.firstName} {b.handyman.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(b.scheduledDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(b.totalPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canTransition(b.status, 'CONFIRMED') && (
                          <button onClick={() => updateStatus(b.id, 'CONFIRMED')} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Confirm">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        {canTransition(b.status, 'IN_PROGRESS') && (
                          <button onClick={() => updateStatus(b.id, 'IN_PROGRESS')} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Start">
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                        {canTransition(b.status, 'COMPLETED') && (
                          <button onClick={() => updateStatus(b.id, 'COMPLETED')} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Complete">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button onClick={() => setCancelTarget(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Cancel">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message={`Cancel booking for ${cancelTarget?.customer.firstName} ${cancelTarget?.customer.lastName}?`}
        confirmLabel="Cancel Booking"
        destructive
      />
    </div>
  )
}
