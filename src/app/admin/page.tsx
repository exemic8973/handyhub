'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  UserGroupIcon as UsersIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  CurrencyIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  StarIcon 
} from '@/lib/icons'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface DashboardStats {
  totalUsers: number
  totalHandymen: number
  totalBookings: number
  totalRevenue: number
  userGrowth: number
  handymanGrowth: number
  bookingGrowth: number
  revenueGrowth: number
}

interface RecentBooking {
  id: string
  customer: string
  handyman: string
  service: string
  status: string
  amount: number
  date: string
}

interface TopHandyman {
  id: string
  name: string
  rating: number
  jobs: number
  revenue: number
}

// Static chart data (wired to real API in Phase 4)
const revenueData = [
  { month: 'Oct', revenue: 52000 },
  { month: 'Nov', revenue: 61000 },
  { month: 'Dec', revenue: 78000 },
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 83000 },
  { month: 'Mar', revenue: 95000 },
]

const categoryData = [
  { name: 'Plumbing', bookings: 1245 },
  { name: 'Electrical', bookings: 980 },
  { name: 'Carpentry', bookings: 756 },
  { name: 'Painting', bookings: 890 },
  { name: 'Cleaning', bookings: 1102 },
  { name: 'HVAC', bookings: 645 },
  { name: 'Appliance', bookings: 523 },
  { name: 'Locksmith', bookings: 312 },
]

const statusData = [
  { name: 'Completed', value: 5230 },
  { name: 'In Progress', value: 1245 },
  { name: 'Confirmed', value: 980 },
  { name: 'Pending', value: 756 },
  { name: 'Cancelled', value: 510 },
]

const STATUS_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-primary-600 font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

const BookingsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-accent-600 font-semibold">
          {payload[0].value.toLocaleString()} bookings
        </p>
      </div>
    )
  }
  return null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalHandymen: 0,
    totalBookings: 0,
    totalRevenue: 0,
    userGrowth: 0,
    handymanGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [topHandymen, setTopHandymen] = useState<TopHandyman[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [usersRes, handymenUsersRes, bookingsRes, handymenRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/users?role=HANDYMAN'),
        fetch('/api/bookings'),
        fetch('/api/handymen?sort=rating'),
      ])

      // Check all responses
      const responses = [usersRes, handymenUsersRes, bookingsRes, handymenRes]
      for (const res of responses) {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
      }

      const usersData = await usersRes.json()
      const handymenUsersData = await handymenUsersRes.json()
      const bookingsData = await bookingsRes.json()
      const handymenData = await handymenRes.json()

      // Stats
      const totalUsers = usersData.pagination?.total ?? usersData.users?.length ?? 0
      const totalHandymen = handymenUsersData.pagination?.total ?? handymenUsersData.users?.length ?? 0
      const bookings = bookingsData.bookings ?? []
      const totalBookings = bookings.length
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)

      setStats({
        totalUsers,
        totalHandymen,
        totalBookings,
        totalRevenue,
        userGrowth: 0,
        handymanGrowth: 0,
        bookingGrowth: 0,
        revenueGrowth: 0,
      })

      // Recent bookings (first 5)
      const recent = bookings.slice(0, 5).map((b: any) => ({
        id: b.id,
        customer: `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`,
        handyman: `${b.handyman?.firstName ?? ''} ${b.handyman?.lastName ?? ''}`,
        service: b.service?.name ?? 'Unknown',
        status: b.status,
        amount: b.totalPrice ?? 0,
        date: b.scheduledDate ?? b.createdAt,
      }))
      setRecentBookings(recent)

      // Top handymen (first 5)
      const top = (handymenData.handymen ?? []).slice(0, 5).map((h: any) => ({
        id: h.id,
        name: `${h.user?.firstName ?? ''} ${h.user?.lastName ?? ''}`,
        rating: h.rating ?? 0,
        jobs: h.totalJobs ?? 0,
        revenue: (h.hourlyRate ?? 0) * (h.totalJobs ?? 0) * 1.5, // rough estimate
      }))
      setTopHandymen(top)
    } catch (err) {
      console.error('Admin dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // ── Error State ────────────────────────────────────────────
  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard</h2>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Main Dashboard ─────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with HandyHub.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <UsersIcon />
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <ArrowUpIcon />
              <span className="ml-1">—</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <BriefcaseIcon />
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <ArrowUpIcon />
              <span className="ml-1">—</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Handymen</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHandymen.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <CalendarIcon />
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <ArrowUpIcon />
              <span className="ml-1">—</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
              <CurrencyIcon />
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <ArrowUpIcon />
              <span className="ml-1">—</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Charts — Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#1d4ed8', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Service</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<BookingsTooltip />} />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? '#2563eb' : '#f97316'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 + Tables */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
                        <p className="text-sm text-gray-600">{payload[0].value.toLocaleString()} bookings</p>
                      </div>
                    )
                  }
                  return null
                }} />
                <Legend verticalAlign="bottom" height={36} formatter={(value: string) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handyman</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.handyman}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${booking.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Handymen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Handymen</h3>
        </div>
        <div className="p-6">
          {topHandymen.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No handymen yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topHandymen.map((handyman, index) => (
                <div key={handyman.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{handyman.name}</p>
                    <div className="flex items-center mt-0.5">
                      <StarIcon />
                      <span className="text-xs text-gray-600 ml-1">{handyman.rating}</span>
                      <span className="text-xs text-gray-400 mx-1.5">•</span>
                      <span className="text-xs text-gray-600">{handyman.jobs} jobs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(handyman.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
