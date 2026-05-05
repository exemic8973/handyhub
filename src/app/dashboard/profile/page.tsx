'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/lib/toast'
import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, StarIcon, MapPinIcon } from '@/lib/icons'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatar: string | null
  role: string
  isVerified: boolean
  createdAt: string
  handymanProfile?: {
    businessName: string | null
    bio: string | null
    experience: number
    hourlyRate: number | null
    city: string | null
    state: string | null
    rating: number
    totalJobs: number
    totalReviews: number
  } | null
}

export default function ProfilePage() {
  const { addToast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setProfile(data.user)
      setForm({
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        phone: data.user?.phone || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      const data = await res.json()
      setProfile(data.user)
      setEditing(false)
      addToast('Profile updated!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = () =>
    `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700', HANDYMAN: 'bg-blue-100 text-blue-700', CUSTOMER: 'bg-green-100 text-green-700'
    }
    return map[role] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="flex justify-center py-16"><div className="spinner w-10 h-10" /></div>
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchProfile} className="btn btn-primary">Retry</button>
    </div>
  )
  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold shadow">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-primary-100 text-sm">{profile.email}</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 ${roleBadge(profile.role)}`}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          {!editing ? (
            <>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">First Name</p>
                  <p className="font-medium text-gray-900">{profile.firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Name</p>
                  <p className="font-medium text-gray-900">{profile.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />{profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />{profile.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Verified</p>
                  <p className={`font-medium ${profile.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {profile.isVerified ? '✓ Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>

              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '' }) }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Handyman Section */}
      {profile.handymanProfile && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Handyman Profile</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {profile.handymanProfile.businessName && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Business Name</p>
                <p className="font-medium text-gray-900">{profile.handymanProfile.businessName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Experience</p>
              <p className="font-medium text-gray-900">{profile.handymanProfile.experience} years</p>
            </div>
            {profile.handymanProfile.hourlyRate && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hourly Rate</p>
                <p className="font-medium text-gray-900">${profile.handymanProfile.hourlyRate}/hr</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rating</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                {profile.handymanProfile.rating?.toFixed(1)} ({profile.handymanProfile.totalReviews} reviews)
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Jobs Completed</p>
              <p className="font-medium text-gray-900">{profile.handymanProfile.totalJobs}</p>
            </div>
            {(profile.handymanProfile.city || profile.handymanProfile.state) && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  {profile.handymanProfile.city}{profile.handymanProfile.state ? `, ${profile.handymanProfile.state}` : ''}
                </p>
              </div>
            )}
          </div>
          {profile.handymanProfile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Bio</p>
              <p className="text-gray-700">{profile.handymanProfile.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
