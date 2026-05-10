'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CalendarIcon, ClockIcon, CheckCircleIcon, StarIcon,
  ArrowRightIcon, WrenchIcon, TrendingUpIcon,
  CurrencyIcon, BriefcaseIcon,
} from '@/lib/icons'
import { useToast } from '@/lib/toast'
import { StatusBadge, formatDate, formatCurrency } from '@/lib/utils'
import type { Booking } from '@/lib/types'

export default function DashboardPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('CUSTOMER')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) throw new Error('Failed to load bookings')
      const data = await response.json()
      setBookings(data.bookings ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => { if (d?.user?.role) setUserRole(d.user.role) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      addToast(`Booking ${status.toLowerCase().replace('_', ' ')}`, 'success')
      fetchBookings()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  const requestCompletion = async (booking: Booking) => {
    try {
      // Get full booking details to find customer ID
      const detailRes = await fetch(`/api/bookings/${booking.id}`)
      if (!detailRes.ok) throw new Error('Failed to get booking details')
      const detail = await detailRes.json()

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: detail.booking?.customer?.id || detail.booking?.customerId,
          title: 'Job Completed — Please Confirm',
          message: `${booking.handyman.firstName} ${booking.handyman.lastName} has completed ${booking.service.name}. Please confirm the job is done.`,
          type: 'completion_requested',
          link: '/dashboard/bookings',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      addToast('Customer notified — awaiting confirmation', 'success')
    } catch (err) {
      addToast('Failed to request confirmation', 'error')
    }
  }

  const isHandyman = userRole === 'HANDYMAN'

  // ── Derived stats ──────────────────────────────────────────────────────
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING')
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const inProgressBookings = bookings.filter((b) => b.status === 'IN_PROGRESS')
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED')
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED')

  const stats = isHandyman ? {
    pendingRequests: pendingBookings.length,
    activeJobs: confirmedBookings.length + inProgressBookings.length,
    completedJobs: completedBookings.length,
    earnings: completedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
  } : {
    totalBookings: bookings.length,
    pendingBookings: pendingBookings.length,
    completedBookings: completedBookings.length,
    totalSpent: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
  }

  const recentBookings = bookings.slice(0, 5)

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button onClick={fetchBookings} className="btn btn-primary">Retry</button>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // HANDYMAN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════
  if (isHandyman) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your bookings and jobs</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.activeJobs}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.completedJobs}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <CurrencyIcon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Earnings</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.earnings)}</p>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
              <p className="text-sm text-gray-500 mt-0.5">Review and respond to new booking requests</p>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingBookings.map((b) => (
                <div key={b.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <WrenchIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{b.service.name}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          Customer: {b.customer.firstName} {b.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(b.scheduledDate)} at {b.scheduledTime || 'TBD'} • {formatCurrency(b.totalPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateBookingStatus(b.id, 'CONFIRMED')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                        className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50 hover:border-red-200"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        {[...confirmedBookings, ...inProgressBookings].length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
              <p className="text-sm text-gray-500 mt-0.5">Jobs in progress or confirmed</p>
            </div>
            <div className="divide-y divide-gray-100">
              {[...confirmedBookings, ...inProgressBookings].map((b) => (
                <div key={b.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <WrenchIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">{b.service.name}</h4>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          Customer: {b.customer.firstName} {b.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(b.scheduledDate)} at {b.scheduledTime || 'TBD'} • {formatCurrency(b.totalPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                          className="btn btn-primary btn-sm"
                        >
                          Start Job
                        </button>
                      )}
                      {b.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => requestCompletion(b)}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Job Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completed */}
        {completedBookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recently Completed</h2>
                <p className="text-sm text-gray-500 mt-0.5">Jobs you've finished</p>
              </div>
              <Link href="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {completedBookings.slice(0, 5).map((b) => (
                <Link key={b.id} href="/dashboard/bookings" className="px-6 py-4 hover:bg-gray-50 transition-colors block">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{b.service.name}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          Customer: {b.customer.firstName} {b.customer.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                        <p className="text-sm text-gray-500">{formatDate(b.scheduledDate)}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <CalendarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6">When customers book your services, they'll appear here.</p>
            <Link href="/dashboard/profile" className="btn btn-primary">
              <WrenchIcon className="w-4 h-4 mr-2" />
              Manage Your Profile
            </Link>
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER DASHBOARD
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your bookings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pendingBookings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.completedBookings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
            <StarIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">${stats.totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions & Rating */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a Service?</h3>
              <p className="text-gray-500 text-sm mb-4">Book a handyman for your next project</p>
              <Link href="/book" className="btn btn-primary">
                Book Now
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <WrenchIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rating</h3>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-6 h-6 ${star <= 4 ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-3 text-gray-600 font-medium">4.0 out of 5</span>
          </div>
          <p className="text-sm text-gray-500">Based on {stats.completedBookings} completed bookings</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Response rate</span>
              <span className="font-medium text-green-600">98%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <Link href="/book" className="btn btn-primary btn-sm">
                Book a Service
              </Link>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id}>
                <Link href="/dashboard/bookings" className="px-6 py-4 hover:bg-gray-50 transition-colors block">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <WrenchIcon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{booking.service.name}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          with {booking.handyman.firstName} {booking.handyman.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                        <p className="text-sm text-gray-500">{formatDate(booking.scheduledDate)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                </Link>
                {booking.status === 'IN_PROGRESS' && (
                  <div className="px-6 pb-4">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                      className="btn btn-success btn-sm"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Confirm Completion
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
