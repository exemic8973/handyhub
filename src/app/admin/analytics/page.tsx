'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

interface RevenuePoint { month: string; revenue: number }
interface CategoryPoint { name: string; bookings: number }
interface StatusPoint { name: string; value: number }

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([])
  const [categoryData, setCategoryData] = useState<CategoryPoint[]>([])
  const [statusData, setStatusData] = useState<StatusPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, handymenRes, bookingsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/users?role=HANDYMAN'),
        fetch('/api/bookings'),
      ])

      if (!usersRes.ok || !handymenRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to load analytics data')
      }

      const usersData = await usersRes.json()
      const handymenData = await handymenRes.json()
      const bookingsData = await bookingsRes.json()
      const bookings: any[] = bookingsData.bookings ?? []

      setStats({
        totalUsers: usersData.pagination?.total ?? usersData.users?.length ?? 0,
        totalHandymen: handymenData.pagination?.total ?? handymenData.users?.length ?? 0,
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
        userGrowth: 0, handymanGrowth: 0, bookingGrowth: 0, revenueGrowth: 0,
      })

      // Revenue by month (last 6 months from current bookings)
      const monthMap = new Map<string, number>()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        monthMap.set(monthNames[d.getMonth()], 0)
      }
      for (const b of bookings) {
        const d = new Date(b.scheduledDate || b.createdAt)
        const key = monthNames[d.getMonth()]
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + (b.totalPrice || 0))
        }
      }
      setRevenueData(Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue })))

      // Category distribution
      const catMap = new Map<string, number>()
      for (const b of bookings) {
        const name = b.service?.name ?? 'Unknown'
        catMap.set(name, (catMap.get(name) || 0) + 1)
      }
      setCategoryData(Array.from(catMap.entries()).map(([name, bookings]) => ({ name, bookings })))

      // Status distribution
      const statusMap = new Map<string, number>()
      for (const b of bookings) {
        const s = b.status
        statusMap.set(s, (statusMap.get(s) || 0) + 1)
      }
      setStatusData(Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) return <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchAnalytics} className="btn btn-primary">Retry</button>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Detailed platform metrics and insights</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Handymen</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHandymen.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Service</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={48} fill="#2563eb" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="bookings" nameKey="name" stroke="none" label={({ name }) => name}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
