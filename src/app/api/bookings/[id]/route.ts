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

// ── GET /api/bookings/[id] ───────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const userRole = (session.user as any).role as string
    const bookingId = params.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { name: true, category: true } },
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        handyman: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Must belong to the authenticated user OR user is ADMIN
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

// ── PUT /api/bookings/[id] ───────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const userRole = (session.user as any).role as string
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

    // ── Fetch the booking ─────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ── Role-based status transition validation ───────────────────────────
    if (userRole === 'CUSTOMER') {
      // CUSTOMER can only cancel their own bookings
      if (booking.customerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Customers can only cancel bookings' },
          { status: 403 },
        )
      }
    } else if (userRole === 'HANDYMAN') {
      // HANDYMAN can only update bookings assigned to them
      if (booking.handymanId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const allowed: BookingStatus[] = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
      if (!allowed.includes(status as BookingStatus)) {
        return NextResponse.json(
          { error: `Handymen can only set status to: ${allowed.join(', ')}` },
          { status: 403 },
        )
      }
    }
    // ADMIN: any status allowed, no ownership check required

    // ── Update ────────────────────────────────────────────────────────────
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
      include: {
        service: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('PUT /api/bookings/[id] error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
