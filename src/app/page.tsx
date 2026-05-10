'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/lib/toast'
import { BackToTop } from '@/lib/back-to-top'
import { SearchBar } from '@/lib/search-bar'
import { StarRating } from '@/lib/utils'
import {
  WrenchIcon, BoltIcon, HomeIcon, PaintBrushIcon, SparklesIcon,
  WrenchScrewdriverIcon, StarIcon, CheckCircleIcon, ShieldCheckIcon,
  ClockIcon, UserGroupIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
  PlayIcon, MenuIcon, XIcon, ArrowRightIcon, SearchIcon
} from '@/lib/icons'

const services = [
  {
    icon: <WrenchIcon className="w-6 h-6" />,
    name: 'Plumbing',
    description: 'Expert plumbing services for leaks, installations, and repairs',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    icon: <BoltIcon className="w-6 h-6" />,
    name: 'Electrical',
    description: 'Licensed electricians for all your electrical needs',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  {
    icon: <HomeIcon className="w-6 h-6" />,
    name: 'Carpentry',
    description: 'Custom woodwork, repairs, and installations',
    color: 'from-amber-600 to-amber-700',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
  {
    icon: <PaintBrushIcon className="w-6 h-6" />,
    name: 'Painting',
    description: 'Interior and exterior painting with premium finishes',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    name: 'Cleaning',
    description: 'Professional cleaning services for homes and offices',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
    name: 'Appliance Repair',
    description: 'Fast and reliable appliance repair services',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  }
]

const features = [
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Verified Professionals',
    description: 'All handymen undergo thorough background checks and verification'
  },
  {
    icon: <ClockIcon className="w-6 h-6" />,
    title: 'Same-Day Service',
    description: 'Get help fast with our same-day booking option'
  },
  {
    icon: <StarIcon filled className="w-6 h-6 text-yellow-500" />,
    title: 'Quality Guaranteed',
    description: '100% satisfaction guarantee on all completed work'
  },
  {
    icon: <UserGroupIcon className="w-6 h-6" />,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for your peace of mind'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    content: 'HandyHub made finding a reliable plumber so easy! The service was professional and the pricing was transparent.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    content: 'We use HandyHub for all our office maintenance. The handymen are skilled and always on time.',
    rating: 5,
    avatar: 'MC'
  },
  {
    name: 'Emily Davis',
    role: 'Property Manager',
    content: 'Managing multiple properties is a breeze with HandyHub. Their admin dashboard makes scheduling effortless.',
    rating: 5,
    avatar: 'ED'
  }
]

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Verified Handymen' },
  { value: '50K+', label: 'Jobs Completed' },
  { value: '4.9', label: 'Average Rating' }
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToast('Message sent successfully! We\'ll get back to you soon.', 'success')
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
                <WrenchIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">HandyHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Reviews</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Contact</a>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                {showSearch ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72">
                    <SearchBar onClose={() => setShowSearch(false)} />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Search"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Link href="/login" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="lg:hidden pb-4">
              <SearchBar onClose={() => setShowSearch(false)} />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="glass border-t border-gray-200/50 px-4 py-4 space-y-3">
            <a href="#services" className="block text-gray-600 hover:text-primary-600 py-2">Services</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-primary-600 py-2">How It Works</a>
            <a href="#testimonials" className="block text-gray-600 hover:text-primary-600 py-2">Reviews</a>
            <a href="#contact" className="block text-gray-600 hover:text-primary-600 py-2">Contact</a>
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Link href="/login" className="block text-center text-gray-600 hover:text-primary-600 font-medium py-2">
                Sign In
              </Link>
              <Link href="/register" className="block text-center btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-100/50 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Trusted by 10,000+ homeowners
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Expert Home Repairs,{' '}
                <span className="gradient-text">Just a Click Away</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with verified, skilled handymen in your area. From plumbing to painting, 
                we&apos;ve got all your home maintenance needs covered with transparent pricing and guaranteed quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Book a Service
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <a href="#how-it-works" className="btn btn-secondary btn-lg group">
                  <PlayIcon className="w-5 h-5 mr-2 text-primary-600 group-hover:text-primary-700" />
                  How It Works
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white shadow-sm" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">10K+ Customers</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} filled className="w-5 h-5 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 font-medium ml-2">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative animate-float hidden lg:block">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {services.slice(0, 4).map((service, index) => (
                    <div key={index} className={`${service.bgColor} rounded-2xl p-6 text-center group cursor-pointer transition-all hover:scale-105`}>
                      <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg`}>
                        {service.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description.split(' ').slice(0, 3).join(' ')}...</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-200 rounded-full opacity-60 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-200 rounded-full opacity-60 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-100 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Professional Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              From quick fixes to major renovations, our verified professionals handle it all
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 card-hover"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  href={`/services/${service.name.toLowerCase().replace(' ', '-')}`}
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 group/link"
                >
                  Learn More
                  <ArrowRightIcon className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent-100 text-accent-700 rounded-full text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Getting help is easy. Three simple steps to get your home repairs done.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Describe Your Job',
                description: 'Tell us what you need fixed. Upload photos and get an instant quote.',
                icon: <WrenchIcon className="w-6 h-6" />
              },
              {
                step: '2',
                title: 'Choose Your Pro',
                description: 'Browse verified handymen, read reviews, and pick the best fit.',
                icon: <UserGroupIcon className="w-6 h-6" />
              },
              {
                step: '3',
                title: 'Get It Done',
                description: 'Your handyman arrives, completes the job, and you pay securely.',
                icon: <CheckCircleIcon className="w-6 h-6" />
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 text-center card-hover border border-gray-200 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <ArrowRightIcon className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose HandyHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;re not just another handyman service. We&apos;re your trusted partner for all home maintenance needs.
              </p>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop"
                  alt="Professional handyman at work"
                  className="rounded-2xl shadow-lg w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">100% Satisfaction</p>
                    <p className="text-sm text-gray-600">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied homeowners who trust HandyHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 card-hover border border-gray-200">
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} size="md" />
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join HandyHub today and experience the easiest way to maintain your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=customer" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all inline-flex items-center justify-center shadow-lg hover:shadow-xl">
              Find a Handyman
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/register?role=handyman" className="bg-primary-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-900 transition-all inline-flex items-center justify-center border border-primary-500">
              Become a Handyman
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                Contact Us
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions? We&apos;re here to help. Reach out to our friendly team.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <div className="text-gray-600">1-800-HANDYHUB</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">support@handyhub.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600">Available nationwide</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" id="firstName" className="input-field" placeholder="John" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" id="lastName" className="input-field" placeholder="Doe" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" id="email" className="input-field" placeholder="john@example.com" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea id="message" rows={4} className="input-field" placeholder="How can we help?" required />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <WrenchIcon className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">HandyHub</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your trusted partner for all home repair and maintenance needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Plumbing</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Electrical</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Carpentry</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Painting</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2026 HandyHub. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}