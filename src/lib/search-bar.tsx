'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchIcon, XIcon } from './icons'

const services = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Appliance Repair',
  'HVAC',
  'Locksmith',
  'Moving',
  'General Repair'
]

interface SearchBarProps {
  onClose?: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredServices, setFilteredServices] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length > 0) {
      const filtered = services.filter(service =>
        service.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredServices(filtered)
      setIsOpen(true)
    } else {
      setFilteredServices([])
      setIsOpen(false)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = (service: string) => {
    setQuery(service)
    setIsOpen(false)
    // In a real app, this would navigate to the service page
    console.log('Selected service:', service)
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredServices.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-slide-down">
          <ul className="py-2">
            {filteredServices.map((service, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSelect(service)}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center gap-3"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <span>{service}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results */}
      {isOpen && query && filteredServices.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 text-center text-gray-500 z-50 animate-slide-down">
          No services found for "{query}"
        </div>
      )}
    </div>
  )
}
