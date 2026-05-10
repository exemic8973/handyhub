'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { UserIcon, EnvelopeIcon, BellIcon, SunIcon, MoonIcon } from '@/lib/icons'
import { LoadingSpinner, ErrorState } from '@/lib/utils'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setProfile(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const applied = stored === 'dark' ? 'dark' : 'light'
    setTheme(applied)
    document.documentElement.classList.toggle('dark', applied === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />
  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-400" />
          Profile Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Name</p>
            <p className="font-medium text-gray-900">{profile.firstName} {profile.lastName}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Email</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
              {profile.email}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Role</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {profile.role}
            </span>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Member Since</p>
            <p className="font-medium text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-gray-400" />
          Preferences
        </h2>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Theme</p>
            <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors bg-gray-200"
            aria-label="Toggle theme"
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform ${theme === 'dark' ? 'translate-x-7' : ''}`}>
              {theme === 'light' ? (
                <SunIcon className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-3.5 h-3.5 text-indigo-500" />
              )}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive booking updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
          </label>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          Manage your account settings and security preferences.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Go to Profile
        </Link>
      </section>
    </div>
  )
}
