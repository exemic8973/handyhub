import { NextResponse } from 'next/server'
import { authOptions, getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ── GET /api/bookings ────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = {}

    if (userRole === 'CUSTOMER') {
      where.customerId = userId
    } else if (userRole === 'HANDYMAN') {
      where.handymanId = userId
    }

    if (status) {
      where.status = status
    }

    const take = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : undefined

    const bookings = await prisma.booking.findMany({
      where: where as any,
      include: {
        service: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── POST /api/bookings ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { serviceId, handymanId, scheduledDate, scheduledTime, address, description, notes, duration } = body

    if (!serviceId || !scheduledDate || !scheduledTime || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, scheduledDate, scheduledTime, address' },
        { status: 400 },
      )
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    let assignedHandymanUserId: string

    if (handymanId) {
      // Customer selected a specific handyman — handymanId is the userId
      const profile = await prisma.handymanProfile.findUnique({
        where: { userId: handymanId },
        select: { id: true, userId: true, isAvailable: true },
      })
      if (!profile || !profile.isAvailable) {
        return NextResponse.json(
          { error: 'Selected handyman is not available' },
          { status: 400 },
        )
      }
      const hs = await prisma.handymanService.findUnique({
        where: { handymanId_serviceId: { handymanId: profile.id, serviceId } },
      })
      if (!hs || !hs.isActive) {
        return NextResponse.json(
          { error: 'Selected handyman does not offer this service' },
          { status: 400 },
        )
      }
      assignedHandymanUserId = profile.userId
    } else {
      // Auto-assign: find first available handyman
      const date = new Date(scheduledDate)
      const jsDay = date.getDay()
      const isoDay = jsDay === 0 ? 7 : jsDay

      const handymanService = await prisma.handymanService.findFirst({
        where: {
          serviceId,
          isActive: true,
          handyman: {
            isAvailable: true,
            availability: {
              some: {
                dayOfWeek: isoDay,
                isAvailable: true,
                startTime: { lte: scheduledTime },
                endTime: { gte: scheduledTime },
              },
            },
          },
        },
        include: { handyman: { include: { user: true } } },
        orderBy: { createdAt: 'asc' },
      })

      if (!handymanService) {
        return NextResponse.json(
          { error: 'No available handyman found for this service at the requested date and time' },
          { status: 404 },
        )
      }

      assignedHandymanUserId = handymanService.handyman.userId
    }

    // Get handyman profile to calculate rate
    const hp = await prisma.handymanProfile.findUnique({
      where: { userId: assignedHandymanUserId },
      select: { hourlyRate: true },
    })

    const bookingDuration = duration ?? 1
    const rate = hp?.hourlyRate ?? 0
    const totalPrice = rate * bookingDuration

    const booking = await prisma.booking.create({
      data: {
        customerId: userId,
        handymanId: assignedHandymanUserId,
        serviceId,
        scheduledDate: new Date(scheduledDate + 'T00:00:00'),
        scheduledTime,
        duration: bookingDuration,
        totalPrice,
        address,
        description: description ?? null,
        notes: notes ?? null,
        status: 'PENDING',
      },
      include: {
        service: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
    })

    // Notify the handyman
    await prisma.notification.create({
      data: {
        userId: assignedHandymanUserId,
        title: 'New Booking Request',
        message: `${booking.customer.firstName} ${booking.customer.lastName} booked ${booking.service.name} for ${scheduledDate} at ${scheduledTime}.`,
        type: 'new_booking',
        link: '/dashboard/bookings',
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
