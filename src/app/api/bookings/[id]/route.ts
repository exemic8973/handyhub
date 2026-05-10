import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

const ALL_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role
    const bookingId = params.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { name: true, category: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        handyman: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && booking.customerId !== userId && booking.handymanId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role
    const bookingId = params.id

    const body = await request.json()
    const { status } = body as { status?: string }

    if (!status) {
      return NextResponse.json({ error: 'Missing required field: status' }, { status: 400 })
    }

    if (!ALL_STATUSES.includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALL_STATUSES.join(', ')}` },
        { status: 400 },
      )
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (userRole === 'CUSTOMER') {
      if (booking.customerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Customers can cancel any active booking, or complete after handyman marks done
      if (status === 'CANCELLED') {
        // allowed
      } else if (status === 'COMPLETED' && booking.status === 'IN_PROGRESS') {
        // Check if handyman requested completion
        const requested = await prisma.notification.findFirst({
          where: { userId, type: 'completion_requested', createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
          orderBy: { createdAt: 'desc' },
        })
        if (!requested) {
          return NextResponse.json({ error: 'Wait for the handyman to mark the job as done first' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Customers can only cancel or confirm completion' }, { status: 403 })
      }
    } else if (userRole === 'HANDYMAN') {
      if (booking.handymanId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Handymen can't directly complete — must request customer confirmation
      const allowed: BookingStatus[] = ['CONFIRMED', 'IN_PROGRESS']
      if (!allowed.includes(status as BookingStatus)) {
        return NextResponse.json(
          { error: `Handymen can only set status to: ${allowed.join(', ')}` },
          { status: 403 },
        )
      }
    }

    const isCompletingNow = status === 'COMPLETED' && booking.status !== 'COMPLETED'

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
      include: {
        service: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
    })

    if (isCompletingNow) {
      await prisma.handymanProfile.update({
        where: { userId: booking.handymanId },
        data: { totalJobs: { increment: 1 } },
      })
    }

    // Notify the customer about status change
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your booking for ${updated.service.name} has been confirmed by ${updated.handyman.firstName}.`,
      CANCELLED: `Your booking for ${updated.service.name} was cancelled.`,
      IN_PROGRESS: `${updated.handyman.firstName} has started working on your ${updated.service.name} booking.`,
      COMPLETED: `Your ${updated.service.name} booking has been completed by ${updated.handyman.firstName}.`,
    }
    const msg = statusMessages[status]
    if (msg) {
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: `Booking ${status.toLowerCase().replace('_', ' ')}`,
          message: msg,
          type: `booking_${status.toLowerCase()}`,
          link: '/dashboard/bookings',
        },
      })
    }

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('PUT /api/bookings/[id] error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── DELETE /api/bookings/[id] ───────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' as BookingStatus },
      include: {
        service: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('DELETE /api/bookings/[id] error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
