import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// ── Helper ───────────────────────────────────────────────────────────

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

// ── PUT /api/reviews/[id] ────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const reviewId = params.id

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.authorId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rating, comment } = body

    // Validate rating if provided
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return NextResponse.json(
          { error: 'Rating must be an integer between 1 and 5' },
          { status: 400 }
        )
      }
    }

    // Check at least one field is provided
    if (rating === undefined && comment === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Build update data (only update provided fields)
    const updateData = {
      ...(rating !== undefined ? { rating } : {}),
      ...(comment !== undefined ? { comment } : {}),
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
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

    // Recalculate handyman rating if rating changed
    if (rating !== undefined) {
      await recalculateHandymanRating(review.targetId)
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review: {
        id: updated.id,
        bookingId: updated.bookingId,
        author: {
          id: updated.authorId,
          name: `${updated.author.firstName} ${updated.author.lastName}`
        },
        target: {
          id: updated.targetId,
          name: `${updated.target.firstName} ${updated.target.lastName}`
        },
        serviceName: updated.booking.service.name,
        rating: updated.rating,
        comment: updated.comment,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      }
    })
  } catch (error) {
    console.error('PUT /api/reviews/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ── DELETE /api/reviews/[id] ─────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role
    const reviewId = params.id

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Author or Admin can delete
    if (review.authorId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    const targetId = review.targetId

    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Recalculate handyman rating after deletion
    await recalculateHandymanRating(targetId)

    return NextResponse.json({
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/reviews/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
