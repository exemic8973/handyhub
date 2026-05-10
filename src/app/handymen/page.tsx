'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { StarIcon, MapPinIcon, SearchIcon, WrenchIcon } from '@/lib/icons'
import { StarRating } from '@/lib/utils'
import type { HandymanItem, ServiceItem } from '@/lib/types'

const SERVICE_CATEGORIES = [
  'ALL', 'PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'PAINTING',
  'CLEANING', 'HVAC', 'APPLIANCE_REPAIR', 'LOCKSMITH', 'MOVING', 'GENERAL_REPAIR'
]

function HandymenPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('service') || 'ALL'

  const [handymen, setHandymen] = useState<HandymanItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [minRating, setMinRating] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sort, setSort] = useState('rating')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const fetchHandymen = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (category !== 'ALL') params.set('service', category)
      if (search) params.set('search', search)
      if (minRating > 0) params.set('rating', String(minRating))
      if (availableOnly) params.set('available', 'true')
      params.set('sort', sort)

      const res = await fetch(`/api/handymen?${params}`)
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
      setHandymen(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [search, category, minRating, availableOnly, sort])

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.services ?? [])
      }
    } catch { /* non-critical */ }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    const timer = setTimeout(() => fetchHandymen(), 300)
    return () => clearTimeout(timer)
  }, [fetchHandymen])

  const getInitials = (h: HandymanItem) =>
    `${h.user.firstName?.[0] || ''}${h.user.lastName?.[0] || ''}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Find a Handyman</h1>
        <p className="text-gray-600 mt-2">Browse verified professionals for your home service needs</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, business, or specialty..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="btn btn-secondary lg:hidden"
        >
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 sticky top-24">
            {/* Category */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Service Category</h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Services' : cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Minimum Rating</h3>
              <div className="space-y-1.5">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      minRating === r ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r === 0 ? 'Any Rating' : `${r}+ Stars`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="checkbox-field"
                />
                <span className="text-sm text-gray-700 font-medium">Available Now</span>
              </label>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field"
              >
                <option value="rating">Highest Rated</option>
                <option value="jobs">Most Jobs</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Loading */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchHandymen} className="btn btn-primary">Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && handymen.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No handymen found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && handymen.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">{handymen.length} handyman{handymen.length !== 1 ? 's' : ''} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {handymen.map((h) => (
                  <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-6 card-hover flex flex-col">
                    {/* Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0 shadow">
                        {getInitials(h)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {h.user.firstName} {h.user.lastName}
                        </h3>
                        {h.businessName && (
                          <p className="text-sm text-gray-500 truncate">{h.businessName}</p>
                        )}
                      </div>
                    </div>

                    {/* Rating + Jobs */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <StarRating rating={h.rating} />
                        <span className="text-sm text-gray-500">({h.rating.toFixed(1)})</span>
                      </div>
                      <span className="text-xs text-gray-400">{h.totalReviews} reviews</span>
                    </div>

                    {/* Location */}
                    {(h.city || h.state) && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        {h.city}{h.city && h.state ? ', ' : ''}{h.state}
                      </div>
                    )}

                    {/* Rate */}
                    {h.hourlyRate && (
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-semibold">${h.hourlyRate}/hr</span>
                        <span className="text-gray-400 ml-1">• {h.totalJobs} jobs completed</span>
                      </p>
                    )}

                    {/* Services */}
                    <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                      {h.services?.slice(0, 4).map((s, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {s.service.name}
                        </span>
                      ))}
                      {(h.services?.length || 0) > 4 && (
                        <span className="inline-block px-2.5 py-1 text-gray-400 text-xs">+{h.services!.length - 4} more</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/handymen/${h.id}`}
                        className="btn btn-secondary flex-1 text-sm"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/book?handyman=${h.id}`}
                        className="btn btn-primary flex-1 text-sm"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HandymenPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="spinner w-10 h-10" /></div>}>
      <HandymenPage />
    </Suspense>
  )
}
