// ── Shared types used across pages and API routes ──────────────────────

export interface ServiceItem {
  id: string
  name: string
  description: string | null
  category: string
  icon: string | null
  _count?: { handymen: number }
}

export interface HandymanUser {
  id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string | null
}

export interface HandymanProfile {
  id: string
  businessName: string | null
  bio: string | null
  experience: number
  hourlyRate: number | null
  serviceRadius: number
  isAvailable: boolean
  rating: number
  totalReviews: number
  totalJobs: number
  city: string | null
  state: string | null
  services: {
    customPrice: number | null
    service: {
      id: string
      name: string
      category: string
      icon: string | null
    }
  }[]
}

export interface HandymanItem {
  id: string
  user: HandymanUser
  businessName: string | null
  bio: string | null
  rating: number
  totalReviews: number
  totalJobs: number
  hourlyRate: number | null
  city: string | null
  state: string | null
  services: { service: { name: string; category: string }; customPrice: number | null }[]
}

export interface Booking {
  id: string
  service: { name: string }
  handyman: { firstName: string; lastName: string }
  customer: { firstName: string; lastName: string }
  status: string
  scheduledDate: string
  scheduledTime?: string
  totalPrice: number
  duration?: number
  description?: string | null
  createdAt?: string
}

export interface DashboardStats {
  totalUsers: number
  totalHandymen: number
  totalBookings: number
  totalRevenue: number
  userGrowth: number
  handymanGrowth: number
  bookingGrowth: number
  revenueGrowth: number
}

export interface RecentBooking {
  id: string
  customer: string
  handyman: string
  service: string
  status: string
  amount: number
  date: string
}

export interface TopHandyman {
  id: string
  name: string
  rating: number
  jobs: number
  revenue: number
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatar: string | null
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}
