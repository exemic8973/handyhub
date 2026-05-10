'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/lib/toast'
import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, StarIcon, MapPinIcon, PlusIcon, XIcon } from '@/lib/icons'

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
    id: string
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
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    businessName: '', bio: '', hourlyRate: '', experience: '', city: '', state: '',
  })

  // Services management (handyman only)
  const [myServices, setMyServices] = useState<{ id: string; serviceId: string; service: { id: string; name: string; category: string; description: string | null } }[]>([])
  const [allServices, setAllServices] = useState<{ id: string; name: string; category: string }[]>([])
  const [addingService, setAddingService] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState('')

  // Availability management (handyman only)
  const DAYS = [
    { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
  ]
  const [availability, setAvailability] = useState<Record<number, { startTime: string; endTime: string; isAvailable: boolean }>>({})
  const [savingDay, setSavingDay] = useState<number | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setProfile(data.user)
      const hp = data.user?.handymanProfile
      setForm({
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        phone: data.user?.phone || '',
        businessName: hp?.businessName || '',
        bio: hp?.bio || '',
        hourlyRate: hp?.hourlyRate?.toString() || '',
        experience: hp?.experience?.toString() || '',
        city: hp?.city || '',
        state: hp?.state || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Fetch services for handyman
  useEffect(() => {
    if (profile?.role === 'HANDYMAN' && profile?.handymanProfile) {
      const fetchServices = async () => {
        try {
          const [myRes, allRes] = await Promise.all([
            fetch(`/api/handymen/${profile.handymanProfile!.id}/services`),
            fetch('/api/services'),
          ])
          if (myRes.ok) {
            const data = await myRes.json()
            setMyServices(data.services ?? [])
          }
          if (allRes.ok) {
            const data = await allRes.json()
            setAllServices(data.services ?? [])
          }
        } catch { /* non-critical */ }
      }
      fetchServices()

      // Fetch availability
      const fetchAvailability = async () => {
        try {
          const res = await fetch(`/api/handymen/${profile.handymanProfile!.id}/availability`)
          if (res.ok) {
            const data = await res.json()
            const map: Record<number, any> = {}
            for (const s of data.availability ?? []) {
              map[s.dayOfWeek] = { startTime: s.startTime, endTime: s.endTime, isAvailable: s.isAvailable }
            }
            setAvailability(map)
          }
        } catch { /* non-critical */ }
      }
      fetchAvailability()
    }
  }, [profile])

  const saveAvailability = async (dayOfWeek: number) => {
    if (!profile?.handymanProfile) return
    setSavingDay(dayOfWeek)
    const slot = availability[dayOfWeek]
    try {
      const res = await fetch(`/api/handymen/${profile.handymanProfile.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, startTime: slot?.startTime || '09:00', endTime: slot?.endTime || '17:00' }),
      })
      if (!res.ok) throw new Error('Failed')
      addToast(`${DAYS.find(d => d.value === dayOfWeek)?.label} saved`, 'success')
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSavingDay(null)
    }
  }

  const removeAvailability = async (dayOfWeek: number) => {
    if (!profile?.handymanProfile) return
    try {
      const res = await fetch(`/api/handymen/${profile.handymanProfile.id}/availability?dayOfWeek=${dayOfWeek}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setAvailability((prev) => {
        const next = { ...prev }
        delete next[dayOfWeek]
        return next
      })
      addToast('Day removed', 'success')
    } catch {
      addToast('Failed to remove', 'error')
    }
  }

  const addService = async () => {
    if (!selectedServiceId || !profile?.handymanProfile) return
    setAddingService(true)
    try {
      const res = await fetch(`/api/handymen/${profile.handymanProfile.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedServiceId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      const data = await res.json()
      setMyServices((prev) => [...prev, data.service])
      setSelectedServiceId('')
      addToast('Service added!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to add service', 'error')
    } finally {
      setAddingService(false)
    }
  }

  const removeService = async (serviceId: string) => {
    if (!profile?.handymanProfile) return
    try {
      const res = await fetch(
        `/api/handymen/${profile.handymanProfile.id}/services?serviceId=${serviceId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed')
      setMyServices((prev) => prev.filter((s) => s.serviceId !== serviceId))
      addToast('Service removed', 'success')
    } catch (err) {
      addToast('Failed to remove service', 'error')
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const body: Record<string, any> = {
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
      }
      if (profile.role === 'HANDYMAN') {
        body.businessName = form.businessName
        body.bio = form.bio
        body.hourlyRate = form.hourlyRate
        body.experience = form.experience
        body.city = form.city
        body.state = form.state
      }
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

                {profile.role === 'HANDYMAN' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} className="input-field" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                        <input type="number" min="0" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} className="input-field" placeholder="75" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                        <input type="number" min="0" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} className="input-field" placeholder="5" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field" placeholder="Austin" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="input-field" placeholder="TX" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="input-field" rows={3} placeholder="Tell customers about your skills and experience..." />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); const hp = profile.handymanProfile; setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '', businessName: hp?.businessName || '', bio: hp?.bio || '', hourlyRate: hp?.hourlyRate?.toString() || '', experience: hp?.experience?.toString() || '', city: hp?.city || '', state: hp?.state || '' }) }} className="btn btn-secondary">
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

          {/* Availability */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Availability Hours</p>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const slot = availability[day.value]
                const enabled = slot?.isAvailable !== false
                return (
                  <div key={day.value} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium text-gray-700">{day.label}</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!slot && enabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailability((prev) => ({
                              ...prev,
                              [day.value]: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                            }))
                          } else {
                            removeAvailability(day.value)
                          }
                        }}
                        className="checkbox-field"
                      />
                      <span className="text-xs text-gray-500">Available</span>
                    </label>
                    {slot && enabled && (
                      <>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => setAvailability((prev) => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], startTime: e.target.value },
                          }))}
                          className="input-field w-28 text-xs py-1"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => setAvailability((prev) => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], endTime: e.target.value },
                          }))}
                          className="input-field w-28 text-xs py-1"
                        />
                        <button
                          onClick={() => saveAvailability(day.value)}
                          disabled={savingDay === day.value}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {savingDay === day.value ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* My Services */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">My Services</p>
            {myServices.length === 0 ? (
              <p className="text-sm text-gray-500">No services added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {myServices.map((ms) => (
                  <span key={ms.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    {ms.service.name}
                    <button
                      onClick={() => removeService(ms.serviceId)}
                      className="p-0.5 rounded-full hover:bg-primary-100 transition-colors"
                      title="Remove"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Service */}
            <div className="flex gap-2">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Select a service to add...</option>
                {allServices
                  .filter((s) => !myServices.some((ms) => ms.serviceId === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
              <button
                onClick={addService}
                disabled={!selectedServiceId || addingService}
                className="btn btn-primary btn-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                {addingService ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
