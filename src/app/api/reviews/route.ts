import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// ── Helpers ──────────────────────────────────────────────────────────

async function recalculateHandymanRating(handymanId: string) {
  const result = await prisma.review.aggregate({
    where: { targetId: handymanId },
    _avg: { rating: true },
    _count: { rating: true }
  })

  await prisma.handymanProfile.update({
    where: { userId: handymanId },
    data: {
      rating: result._avg.rating ?? 0,
      totalReviews: result._count.rating
    }
  })
}

// ── GET /api/reviews ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const targetId = searchParams.get('targetId')
    const authorId = searchParams.get('authorId')
    const bookingId = searchParams.get('bookingId')

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const sort = searchParams.get('sort') || 'recent'

    // Build WHERE clause
    const where = {
      ...(targetId ? { targetId } : {}),
      ...(authorId ? { authorId } : {}),
      ...(bookingId ? { bookingId } : {}),
    }

    // Build ORDER BY
    const orderBy =
      sort === 'rating'
        ? { rating: 'desc' as const }
        : { createdAt: 'desc' as const }

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: { select: { firstName: true, lastName: true } },
          target: { select: { firstName: true, lastName: true } },
          booking: {
            include: {
              service: { select: { name: true } }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // Flatten the response
    const flattened = reviews.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      author: {
        id: r.authorId,
        name: `${r.author.firstName} ${r.author.lastName}`
      },
      target: {
        id: r.targetId,
        name: `${r.target.firstName} ${r.target.lastName}`
      },
      serviceName: r.booking.service.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))

    return NextResponse.json({
      reviews: flattened,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('GET /api/reviews error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ── POST /api/reviews ────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    if (userRole !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Only customers can create reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { bookingId, rating, comment } = body

    // Validate required fields
    if (!bookingId || rating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, rating' },
        { status: 400 }
      )
    }

    // Validate rating 1-5
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== userId) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      )
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check no existing review for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'This booking already has a review' },
        { status: 409 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId,
        authorId: userId,
        targetId: booking.handymanId,
        rating,
        comment: comment || null
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        target: { select: { firstName: true, lastName: true } },
        booking: {
          include: {
            service: { select: { name: true } }
          }
        }
      }
    })

    // Recalculate handyman rating
    await recalculateHandymanRating(booking.handymanId)

    return NextResponse.json(
      {
        message: 'Review created successfully',
        review: {
          id: review.id,
          bookingId: review.bookingId,
          author: {
            id: review.authorId,
            name: `${review.author.firstName} ${review.author.lastName}`
          },
          target: {
            id: review.targetId,
            name: `${review.target.firstName} ${review.target.lastName}`
          },
          serviceName: review.booking.service.name,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
