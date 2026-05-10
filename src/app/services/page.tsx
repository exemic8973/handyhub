'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ServiceGridSkeleton } from '@/lib/skeleton'
import {
  WrenchIcon, BoltIcon, HomeIcon, PaintBrushIcon, SparklesIcon,
  WrenchScrewdriverIcon, ArrowRightIcon, ExclamationCircleIcon,
  SearchIcon, UserGroupIcon
} from '@/lib/icons'

// ── Category definitions ────────────────────────────────────────

const CATEGORIES = [
  'PLUMBING',
  'ELECTRICAL',
  'CARPENTRY',
  'PAINTING',
  'CLEANING',
  'HVAC',
  'APPLIANCE_REPAIR',
  'LOCKSMITH',
  'MOVING',
  'GENERAL_REPAIR',
] as const

type Category = (typeof CATEGORIES)[number]

// ── Category colour map (matches homepage design system) ────────

const categoryColors: Record<string, { gradient: string; bg: string; text: string }> = {
  PLUMBING:         { gradient: 'from-blue-500 to-blue-600',       bg: 'bg-blue-50',       text: 'text-blue-600' },
  ELECTRICAL:       { gradient: 'from-yellow-500 to-orange-500',   bg: 'bg-yellow-50',     text: 'text-yellow-600' },
  CARPENTRY:        { gradient: 'from-amber-600 to-amber-700',     bg: 'bg-amber-50',      text: 'text-amber-600' },
  PAINTING:         { gradient: 'from-purple-500 to-purple-600',   bg: 'bg-purple-50',     text: 'text-purple-600' },
  CLEANING:         { gradient: 'from-green-500 to-emerald-600',   bg: 'bg-green-50',      text: 'text-green-600' },
  HVAC:             { gradient: 'from-cyan-500 to-teal-600',       bg: 'bg-cyan-50',       text: 'text-cyan-600' },
  APPLIANCE_REPAIR: { gradient: 'from-red-500 to-rose-600',        bg: 'bg-red-50',        text: 'text-red-600' },
  LOCKSMITH:        { gradient: 'from-indigo-500 to-indigo-600',   bg: 'bg-indigo-50',     text: 'text-indigo-600' },
  MOVING:           { gradient: 'from-orange-500 to-orange-600',   bg: 'bg-orange-50',     text: 'text-orange-600' },
  GENERAL_REPAIR:   { gradient: 'from-slate-500 to-slate-600',     bg: 'bg-slate-50',      text: 'text-slate-600' },
}

// ── Format helpers ──────────────────────────────────────────────

function formatCategory(cat: string) {
  return cat
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ── Icon picker from icon name string ───────────────────────────

function resolveIcon(iconName: string | null | undefined, category: string, className = 'w-8 h-8') {
  const name = (iconName || '').toLowerCase()

  switch (name) {
    case 'wrench':              return <WrenchIcon className={className} />
    case 'bolt':                return <BoltIcon className={className} />
    case 'home':                return <HomeIcon className={className} />
    case 'paint-brush':         return <PaintBrushIcon className={className} />
    case 'sparkles':            return <SparklesIcon className={className} />
    case 'wrench-screwdriver':  return <WrenchScrewdriverIcon className={className} />
    // Emoji fallbacks for icon names without a matching SVG component
    case 'thermometer':         return <span className={className}>🌡️</span>
    case 'key':                 return <span className={className}>🔑</span>
    case 'truck':               return <span className={className}>🚚</span>
    case 'tool':                return <span className={className}>🛠️</span>
    default: {
      // Fallback emoji per category
      const catEmojis: Record<string, string> = {
        PLUMBING: '🔧', ELECTRICAL: '⚡', CARPENTRY: '🪵', PAINTING: '🎨',
        CLEANING: '✨', HVAC: '🌡️', APPLIANCE_REPAIR: '🔌', LOCKSMITH: '🔑',
        MOVING: '🚚', GENERAL_REPAIR: '🛠️',
      }
      return <span className={className}>{catEmojis[category] || '🔧'}</span>
    }
  }
}

import type { ServiceItem } from '@/lib/types'

// ── Page component ──────────────────────────────────────────────

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const fetchServices = useCallback(async (category?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/services', window.location.origin)
      if (category && category !== 'All') {
        url.searchParams.set('category', category)
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to load services (${res.status})`)
      const data = await res.json()
      setServices(data.services as ServiceItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices(activeCategory === 'All' ? undefined : activeCategory)
  }, [activeCategory, fetchServices])

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Our Services
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Professional Services
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            From quick fixes to major renovations, our verified professionals handle it all.
            Browse by category to find the right expert for your job.
          </p>
        </div>
      </section>

      {/* ── Category Filters ───────────────────────────────── */}
      <section className="pb-8 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === 'All'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Services
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? `bg-gradient-to-r ${categoryColors[cat].gradient} text-white shadow-md`
                    : `bg-gray-100 text-gray-600 hover:bg-gray-200`
                }`}
              >
                {formatCategory(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Grid ───────────────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading state */}
          {loading && <ServiceGridSkeleton />}

          {/* Error state */}
          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load services</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => fetchServices(activeCategory === 'All' ? undefined : activeCategory)}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500 mb-6">
                {activeCategory === 'All'
                  ? 'There are no services available right now. Please check back later.'
                  : `No services found in the ${formatCategory(activeCategory)} category.`}
              </p>
              {activeCategory !== 'All' && (
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="btn btn-secondary"
                >
                  View All Services
                </button>
              )}
            </div>
          )}

          {/* Data state */}
          {!loading && !error && services.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
              {services.map(service => {
                const colors = categoryColors[service.category] || categoryColors.GENERAL_REPAIR
                const handymanCount = service._count?.handymen ?? 0
                return (
                  <div
                    key={service.id}
                    className="group bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 card-hover flex flex-col"
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      {resolveIcon(service.icon, service.category, 'w-6 h-6')}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4 flex-1">
                      {service.description || `Professional ${formatCategory(service.category)} services`}
                    </p>

                    {/* Handyman count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>
                        {handymanCount === 0
                          ? 'No handymen available'
                          : `${handymanCount} handymen available`}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/handymen?service=${service.category}`}
                      className={`inline-flex items-center font-semibold ${colors.text} hover:opacity-80 transition-opacity group/link`}
                    >
                      Browse Handymen
                      <ArrowRightIcon className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
