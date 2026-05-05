'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { StarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, CalendarIcon } from '@/lib/icons'

interface HandymanDetail {
  id: string
  user: { firstName: string; lastName: string }
  businessName: string | null
  bio: string | null
  experience: number
  hourlyRate: number | null
  serviceRadius: number
  rating: number
  totalReviews: number
  totalJobs: number
  city: string | null
  state: string | null
  address: string | null
  services: { service: { id: string; name: string; category: string; description: string | null }; customPrice: number | null }[]
  certifications: { name: string; issuer: string | null }[]
  availability: { dayOfWeek: number; startTime: string; endTime: string }[]
  reviews: { id: string; rating: number; comment: string | null; author: { firstName: string; lastName: string }; createdAt: string }[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HandymanDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [handyman, setHandyman] = useState<HandymanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [allReviews, setAllReviews] = useState<any[]>([])

  const fetchHandyman = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/handymen/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Handyman not found')
        throw new Error('Failed to load')
      }
      const data = await res.json()
      setHandyman(data.handyman)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchHandyman() }, [fetchHandyman])

  const loadMoreReviews = async () => {
    try {
      const res = await fetch(`/api/handymen/${id}/reviews?page=${reviewsPage + 1}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setAllReviews((prev) => [...prev, ...(data.reviews ?? [])])
        setReviewsPage((p) => p + 1)
      }
    } catch { /* ignore */ }
  }

  const getInitials = () =>
    `${handyman?.user.firstName?.[0] || ''}${handyman?.user.lastName?.[0] || ''}`

  const renderStars = (rating: number, size = 'w-5 h-5') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${size} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !handyman) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Not Found'}</h1>
        <Link href="/handymen" className="btn btn-primary">Back to Handymen</Link>
      </div>
    )
  }

  const displayReviews = allReviews.length > 0 ? allReviews : (handyman.reviews ?? [])
  const hasMoreReviews = (handyman.totalReviews || 0) > displayReviews.length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link href="/handymen" className="text-sm text-gray-500 hover:text-primary-600 mb-6 inline-block">
        ← Back to Handymen
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {handyman.user.firstName} {handyman.user.lastName}
                </h1>
                {handyman.businessName && (
                  <p className="text-gray-500">{handyman.businessName}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {renderStars(handyman.rating)}
                  <span className="text-sm text-gray-600">{handyman.rating.toFixed(1)} ({handyman.totalReviews} reviews)</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{handyman.totalJobs} jobs</span>
                </div>
                {(handyman.city || handyman.state) && (
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {[handyman.city, handyman.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons - mobile */}
            <div className="flex gap-3 mt-6 lg:hidden">
              <Link href={`/book?handyman=${handyman.id}`} className="btn btn-primary flex-1">
                Book Now
              </Link>
            </div>
          </div>

          {/* About */}
          {handyman.bio && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{handyman.bio}</p>
              <div className="flex gap-6 mt-4 text-sm text-gray-500">
                <span><span className="font-medium text-gray-700">{handyman.experience}</span> years experience</span>
                <span>Service radius: <span className="font-medium text-gray-700">{handyman.serviceRadius} mi</span></span>
              </div>
            </div>
          )}

          {/* Services & Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {handyman.services.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.service.name}</p>
                    <p className="text-xs text-gray-400">{s.service.category.replace('_', ' ')}</p>
                  </div>
                  <p className="font-semibold text-primary-600 text-sm">
                    ${s.customPrice ?? handyman.hourlyRate ?? '—'}/hr
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <ClockIcon className="w-5 h-5 inline mr-2" />Availability
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {handyman.availability.map((a, i) => (
                <div key={i} className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700">{DAYS[a.dayOfWeek]}</p>
                  <p className="text-xs text-green-600">
                    {a.startTime} – {a.endTime}
                  </p>
                </div>
              ))}
              {handyman.availability.length === 0 && (
                <p className="text-gray-400 text-sm col-span-full">Availability not set.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          {handyman.certifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
              <div className="space-y-3">
                {handyman.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cert.name}</p>
                      {cert.issuer && <p className="text-xs text-gray-400">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Reviews ({handyman.totalReviews})</h2>
            {displayReviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {displayReviews.map((review: any) => (
                  <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-semibold">
                          {review.author?.firstName?.[0]}{review.author?.lastName?.[0]}
                        </div>
                        <p className="font-medium text-gray-900 text-sm">
                          {review.author?.firstName} {review.author?.lastName}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="ml-11">
                      {renderStars(review.rating, 'w-4 h-4')}
                      {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
                    </div>
                  </div>
                ))}
                {hasMoreReviews && (
                  <button onClick={loadMoreReviews} className="text-primary-600 text-sm font-medium hover:text-primary-700">
                    Load More Reviews
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar CTA — Desktop sticky */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="text-center">
              {handyman.hourlyRate && (
                <>
                  <p className="text-3xl font-bold text-gray-900">${handyman.hourlyRate}<span className="text-lg font-normal text-gray-400">/hr</span></p>
                  <p className="text-sm text-gray-500 mt-1">{handyman.serviceRadius} mile service radius</p>
                </>
              )}
            </div>
            <Link
              href={`/book?handyman=${handyman.id}`}
              className="btn btn-primary w-full btn-lg"
            >
              <CalendarIcon className="w-5 h-5" />
              Book this Handyman
            </Link>
            <div className="text-center space-y-1 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">{handyman.totalJobs} jobs completed</p>
              <p className="text-xs text-gray-400">{handyman.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
