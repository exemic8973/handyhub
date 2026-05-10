'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/lib/toast'
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CalendarIcon, ClockIcon, MapPinIcon, StarIcon } from '@/lib/icons'
import { StarRating } from '@/lib/utils'
import type { ServiceItem, HandymanItem } from '@/lib/types'

const STEPS = ['Service', 'Handyman', 'Schedule', 'Confirm']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const DURATIONS = [1, 2, 3, 4, 5, 6, 8]

function BookPage() {
  const searchParams = useSearchParams()
  const preSelectedHandymanId = searchParams.get('handyman') || ''
  const { addToast } = useToast()

  // Step
  const [step, setStep] = useState(1)

  // Step 1 data
  const [services, setServices] = useState<ServiceItem[]>([])
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  // Step 2 data
  const [handymen, setHandymen] = useState<HandymanItem[]>([])
  const [selectedHandyman, setSelectedHandyman] = useState<HandymanItem | null>(null)

  // Step 3 data
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data = await res.json()
          setServices(data.services ?? [])
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchServices()
  }, [])

  // Fetch handymen when service selected
  const fetchHandymen = useCallback(async (serviceCategory: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/handymen?service=${serviceCategory}&sort=rating`)
      if (!res.ok) throw new Error('Failed to load handymen')
      const data = await res.json()
      const list: HandymanItem[] = (data.handymen ?? []).map((h: any) => ({
        id: h.id,
        user: { firstName: h.firstName ?? '', lastName: h.lastName ?? '' },
        businessName: h.handymanProfile?.businessName ?? null,
        bio: h.handymanProfile?.bio ?? null,
        rating: h.handymanProfile?.rating ?? 0,
        totalReviews: h.handymanProfile?.totalReviews ?? 0,
        totalJobs: h.handymanProfile?.totalJobs ?? 0,
        hourlyRate: h.handymanProfile?.hourlyRate ?? null,
        city: h.handymanProfile?.city ?? null,
        state: h.handymanProfile?.state ?? null,
        services: h.handymanProfile?.services ?? [],
      }))

      // If handyman pre-selected from URL, auto-select
      if (preSelectedHandymanId) {
        const preSelected = list.find((h: HandymanItem) => h.id === preSelectedHandymanId)
        if (preSelected) {
          setSelectedHandyman(preSelected)
        }
      }
      setHandymen(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load handymen')
    } finally {
      setLoading(false)
    }
  }, [preSelectedHandymanId])

  const handleSelectService = (svc: ServiceItem) => {
    setSelectedService(svc)
    setSelectedHandyman(null)
    fetchHandymen(svc.category)
  }

  const handleContinue = () => {
    if (step === 1 && !selectedService) return
    if (step === 2 && !selectedHandyman) return
    if (step === 3) {
      if (!scheduledDate || !scheduledTime || !address) {
        addToast('Please fill in all required fields', 'error')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  const estimatedPrice = selectedHandyman?.hourlyRate
    ? selectedHandyman.hourlyRate * duration
    : 0

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedHandyman) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          handymanId: selectedHandyman.id,
          scheduledDate,
          scheduledTime,
          duration,
          address,
          description: description || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Booking failed')
      }
      const data = await res.json()
      setBookingSuccess(data.booking?.id || 'success')
      addToast('Booking confirmed!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
      addToast(err instanceof Error ? err.message : 'Booking failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  // ── Success State ──────────────────────────────────────────
  if (bookingSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-2">Your booking has been submitted successfully.</p>
        <p className="text-sm text-gray-400 mb-8">Booking ID: {bookingSuccess}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard/bookings" className="btn btn-primary">
            View My Bookings
          </Link>
          <Link href="/handymen" className="btn btn-secondary">
            Book Another
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book a Service</h1>
        <p className="text-gray-600 mt-1">Schedule a handyman in a few easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i + 1 <= step
                ? 'bg-primary-600 text-white shadow'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1 < step ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`hidden sm:block ml-2 text-sm font-medium ${i + 1 <= step ? 'text-primary-600' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-2 rounded ${i + 1 < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      )}

      {/* ── Step 1: Select Service ────────────────────────────── */}
      {!loading && step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What service do you need?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleSelectService(svc)}
                className={`text-left p-5 rounded-xl border-2 transition-all relative ${
                  selectedService?.id === svc.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {selectedService?.id === svc.id && (
                  <span className="absolute top-3 right-3 text-primary-600">
                    <CheckCircleIcon className="w-5 h-5" />
                  </span>
                )}
                <h3 className={`font-semibold ${selectedService?.id === svc.id ? 'text-primary-700' : 'text-gray-900'}`}>{svc.name}</h3>
                <p className={`text-sm mt-1 line-clamp-2 ${selectedService?.id === svc.id ? 'text-primary-700 font-medium' : 'text-gray-500'}`}>{svc.description}</p>
              </button>
            ))}
          </div>
          {services.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">No services available.</p>
          )}
        </div>
      )}

      {/* ── Step 2: Choose Handyman ───────────────────────────── */}
      {!loading && step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose your handyman</h2>
          <p className="text-gray-500 mb-6">for {selectedService?.name}</p>
          <div className="space-y-4">
            {handymen.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHandyman(h)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all relative ${
                  selectedHandyman?.id === h.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {selectedHandyman?.id === h.id && (
                  <span className="absolute top-3 right-3 text-primary-600">
                    <CheckCircleIcon className="w-5 h-5" />
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${selectedHandyman?.id === h.id ? 'text-primary-700' : 'text-gray-900'}`}>
                      {h.user.firstName} {h.user.lastName}
                    </h3>
                    {h.businessName && <p className="text-sm text-gray-500">{h.businessName}</p>}
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <StarRating rating={h.rating} />
                        <span className="ml-1">{h.rating?.toFixed(1)}</span>
                      </span>
                      <span>{h.totalJobs} jobs</span>
                      {(h.city || h.state) && (
                        <span className="flex items-center">
                          <MapPinIcon className="w-3 h-3 mr-0.5" />
                          {h.city}{h.state ? `, ${h.state}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {h.hourlyRate && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${h.hourlyRate}/hr</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {handymen.length === 0 && (
            <p className="text-center text-gray-500 py-8">No handymen available for this service. Try a different service.</p>
          )}
        </div>
      )}

      {/* ── Step 3: Schedule ──────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule & Details</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getTomorrow()}
                className="input-field"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setScheduledTime(t)}
                    className={`py-2 px-1 text-sm rounded-lg border transition-colors ${
                      scheduledTime === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 px-4 rounded-lg border text-sm transition-colors ${
                      duration === d
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {d}hr
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Service Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
                placeholder="Enter your address"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Describe the job..."
              />
            </div>

            {/* Price Estimate */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Estimated Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estimatedPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                {selectedHandyman?.hourlyRate ? `$${selectedHandyman.hourlyRate}/hr × ${duration}hr` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Confirm ───────────────────────────────────── */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Your Booking</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Handyman</span>
              <span className="font-medium text-gray-900">
                {selectedHandyman?.user.firstName} {selectedHandyman?.user.lastName}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(scheduledDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{scheduledTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">{duration} hour{duration > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-900 text-right max-w-[60%]">{address}</span>
            </div>
            {description && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Notes</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">{description}</span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-gray-900 font-semibold">Estimated Total</span>
              <span className="text-xl font-bold text-primary-600">${estimatedPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Buttons ────────────────────────────────── */}
      {!loading && (
        <div className="flex justify-between mt-8">
          <div>
            {step > 1 && (
              <button onClick={handleBack} className="btn btn-secondary">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>
          <div>
            {step < 4 && (
              <button
                onClick={handleContinue}
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 2 && !selectedHandyman) ||
                  (step === 3 && (!scheduledDate || !scheduledTime || !address))
                }
                className="btn btn-primary"
              >
                Continue
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="btn btn-primary btn-lg"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="spinner w-5 h-5 mr-2" />
                    Confirming...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="spinner w-10 h-10" /></div>}>
      <BookPage />
    </Suspense>
  )
}
