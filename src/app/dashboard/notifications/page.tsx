'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BellIcon, CheckCircleIcon } from '@/lib/icons'
import { useToast } from '@/lib/toast'
import { LoadingSpinner, ErrorState, EmptyState, formatRelativeTime } from '@/lib/utils'
import type { NotificationItem } from '@/lib/types'

export default function NotificationsPage() {
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to load notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (!res.ok) throw new Error('Failed')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      addToast('All notifications marked as read', 'success')
    } catch (err) {
      addToast('Failed to mark as read', 'error')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      if (!res.ok) throw new Error('Failed')
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // silent fail for individual mark-read
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'No unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <BellIcon className="w-8 h-8 text-gray-400" />
            </div>
          }
          title="No notifications"
          message="You're all caught up! Notifications will appear here when something happens."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border transition-colors ${
                notification.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-primary-50/50 border-primary-200'
              }`}
            >
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 text-primary-600">
                  <BellIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-600" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                    {notification.link && (
                      <Link href={notification.link} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        View details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
