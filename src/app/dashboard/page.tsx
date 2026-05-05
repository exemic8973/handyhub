'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  StarIcon, 
  ArrowRightIcon, 
  WrenchIcon, 
  TrendingUpIcon 
} from '@/lib/icons'
import { useToast } from '@/lib/toast'

interface Booking {
  id: string
  service: { name: string }
  handyman: { firstName: string; lastName: string }
  customer: { firstName: string; lastName: string }
  status: string
  scheduledDate: string
  totalPrice: number
}

export default function DashboardPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }
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
    fetchBookings()
  }, [fetchBookings])

  // ── Derived stats ──────────────────────────────────────────────────────
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
    completedBookings: bookings.filter((b) => b.status === 'COMPLETED').length,
    totalSpent: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
  }

  const recentBookings = bookings.slice(0, 5)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' }
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
      case 'COMPLETED':
        return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
      case 'CANCELLED':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
        <button
          onClick={fetchBookings}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your bookings.</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <CalendarIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-6">Book your first service!</p>
          <Link
            href="/book"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse Handymen
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

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
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              12%
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pendingBookings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.completedBookings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">${stats.totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions & Rating */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Quick Action Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need a Service?</h3>
                <p className="text-primary-100 text-sm mb-4">Book a handyman for your next project</p>
                <Link href="/book" className="inline-flex items-center bg-white text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                  Book Now
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
              <div className="hidden sm:block w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <WrenchIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rating</h3>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${star <= 4 ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
          {recentBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status)
            return (
              <div key={booking.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
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
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Mobile: Show more details */}
        <div className="sm:hidden border-t border-gray-100 p-4 space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex justify-between text-sm">
              <span className="text-gray-500">{booking.service.name}</span>
              <span className="font-medium">${booking.totalPrice}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
