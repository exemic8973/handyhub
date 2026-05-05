'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/lib/toast'
import { WrenchIcon, CalendarIcon, MapPinIcon } from '@/lib/icons'

interface Booking {
  id: string
  status: string
  scheduledDate: string
  scheduledTime: string
  totalPrice: number
  duration: number
  address: string
  description: string | null
  notes: string | null
  service: { name: string }
  handyman: { firstName: string; lastName: string }
  customer: { firstName: string; lastName: string }
}

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function BookingsPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchBookings = useCallback(async (status?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = status && status !== 'ALL' ? `?status=${status}` : ''
      const res = await fetch(`/api/bookings${params}`)
      if (!res.ok) throw new Error('Failed to load bookings')
      const data = await res.json()
      setBookings(data.bookings ?? [])
      setFilteredBookings(data.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'ALL') {
      setFilteredBookings(bookings)
    } else {
      const filtered = bookings.filter((b) => b.status === tab)
      setFilteredBookings(filtered)
    }
  }

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel')
      }
      addToast('Booking cancelled', 'success')
      fetchBookings(activeTab !== 'ALL' ? activeTab : undefined)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to cancel', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-purple-100 text-purple-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const canCancel = (status: string) => status === 'PENDING' || status === 'CONFIRMED'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-10 h-10" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => fetchBookings()} className="btn btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-primary-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
            {tab !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                {bookings.filter((b) => b.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            {activeTab === 'ALL' ? 'No bookings yet.' : `No ${activeTab.replace('_', ' ').toLowerCase()} bookings.`}
          </p>
          {activeTab === 'ALL' && (
            <Link href="/book" className="btn btn-primary">Book a Service</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <WrenchIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{booking.service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {booking.handyman.firstName} {booking.handyman.lastName}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-400">
                        <span className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                        </span>
                        <span className="flex items-center">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          {booking.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">${booking.totalPrice}</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {expandedId === booking.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {canCancel(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="text-sm text-red-500 hover:text-red-700 ml-auto"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <Link
                      href={`/review?booking=${booking.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 ml-auto"
                    >
                      Leave Review
                    </Link>
                  )}
                </div>

                {/* Expandable Details */}
                {expandedId === booking.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                    <p><span className="font-medium">Duration:</span> {booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                    {booking.description && <p><span className="font-medium">Description:</span> {booking.description}</p>}
                    {booking.notes && <p><span className="font-medium">Notes:</span> {booking.notes}</p>}
                    <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
