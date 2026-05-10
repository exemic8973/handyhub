import { NextResponse } from 'next/server'
import { authOptions, getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        handymanProfile: true,
        _count: {
          select: {
            bookingsAsCustomer: true,
            bookingsAsHandyman: true,
            reviewsReceived: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Auto-create handymanProfile if user is HANDYMAN but missing profile
    if (user.role === 'HANDYMAN' && !user.handymanProfile) {
      await prisma.handymanProfile.create({
        data: { userId: user.id }
      })
      // Re-fetch with the new profile
      const refreshed = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          handymanProfile: true,
          _count: {
            select: {
              bookingsAsCustomer: true,
              bookingsAsHandyman: true,
              reviewsReceived: true
            }
          }
        }
      })
      // Use refreshed user going forward
      Object.assign(user, refreshed)
    }

    // Compute average rating from reviews if the user has any
    const reviews = await prisma.review.findMany({
      where: { targetId: user.id },
      select: { rating: true }
    })

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

    // Exclude sensitive fields
    const {
      passwordHash: _ph,
      resetToken: _rt,
      resetTokenExpiry: _rte,
      ...safeUser
    } = user

    return NextResponse.json({
      user: safeUser,
      stats: {
        averageRating,
        totalReviews: reviews.length,
        bookingsAsCustomer: user._count.bookingsAsCustomer,
        bookingsAsHandyman: user._count.bookingsAsHandyman
      }
    })
  } catch (error) {
    console.error('GET /api/users/me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
