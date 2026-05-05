import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ServiceCategory, Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Optional session — these are public routes
    await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)

    const service = searchParams.get('service') as ServiceCategory | null
    const city = searchParams.get('city')
    const rating = searchParams.get('rating')
    const available = searchParams.get('available')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') // rating | jobs | price

    // Build profile-level filters
    const profileFilters: Record<string, unknown> = {}

    if (city) {
      profileFilters.city = city
    }

    if (rating) {
      const minRating = parseFloat(rating)
      if (!isNaN(minRating)) {
        profileFilters.rating = { gte: minRating }
      }
    }

    if (available === 'true') {
      profileFilters.isAvailable = true
    }

    if (service && Object.values(ServiceCategory).includes(service)) {
      profileFilters.services = {
        some: {
          service: {
            category: service
          }
        }
      }
    }

    // Build where conditions — always require a handyman profile
    const conditions: Prisma.UserWhereInput[] = [
      { handymanProfile: { isNot: null } }
    ]

    if (Object.keys(profileFilters).length > 0) {
      conditions.push({ handymanProfile: profileFilters })
    }

    if (search) {
      conditions.push({
        OR: [
          { handymanProfile: { businessName: { contains: search } } },
          { handymanProfile: { bio: { contains: search } } },
          { firstName: { contains: search } },
          { lastName: { contains: search } }
        ]
      })
    }

    const where: Prisma.UserWhereInput = { AND: conditions }

    // Build sort order
    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'rating') {
      orderBy = { handymanProfile: { rating: 'desc' } }
    } else if (sort === 'jobs') {
      orderBy = { handymanProfile: { totalJobs: 'desc' } }
    } else if (sort === 'price') {
      orderBy = { handymanProfile: { hourlyRate: 'asc' } }
    }

    const handymen = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        handymanProfile: {
          select: {
            id: true,
            businessName: true,
            bio: true,
            experience: true,
            hourlyRate: true,
            serviceRadius: true,
            isAvailable: true,
            rating: true,
            totalReviews: true,
            totalJobs: true,
            city: true,
            state: true,
            services: {
              select: {
                customPrice: true,
                service: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    icon: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy
    })

    return NextResponse.json({ handymen })
  } catch (error) {
    console.error('Error fetching handymen:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
