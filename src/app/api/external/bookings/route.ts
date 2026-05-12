import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function validateApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key')
  return !!key && key === process.env.HANDYHUB_EXTERNAL_API_KEY
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ── GET /api/external/bookings ───────────────────────────────────────────────
// Query params: customerEmail, leaseDocumentId
export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
  }

  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get('customerEmail')
    const leaseDocumentId = searchParams.get('leaseDocumentId')

    const where: Prisma.BookingWhereInput = {}

    if (customerEmail) {
      const customer = await prisma.user.findUnique({ where: { email: customerEmail } })
      if (!customer) return NextResponse.json({ bookings: [] }, { headers: corsHeaders() })
      where.customerId = customer.id
    }

    if (leaseDocumentId) {
      where.notes = { contains: `LeaseDoc:${leaseDocumentId}` }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: { select: { name: true, category: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings }, { headers: corsHeaders() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() })
  }
}

// ── POST /api/external/bookings ──────────────────────────────────────────────
// Creates a booking on behalf of a LeaseSign landlord.
// Auto-creates a guest CUSTOMER account if the email is not yet registered.
export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
  }

  try {
    const body = await request.json()
    const {
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      description,
      duration,
      leaseDocumentId,
    } = body

    if (!customerEmail || !customerFirstName || !customerLastName ||
        !serviceId || !scheduledDate || !scheduledTime || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, customerFirstName, customerLastName, serviceId, scheduledDate, scheduledTime, address' },
        { status: 400, headers: corsHeaders() },
      )
    }

    // Find or create guest customer
    let customer = await prisma.user.findUnique({ where: { email: customerEmail } })
    if (!customer) {
      const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12)
      customer = await prisma.user.create({
        data: {
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone ?? null,
          passwordHash,
          role: 'CUSTOMER',
          isVerified: true,
        },
      })
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404, headers: corsHeaders() })
    }

    // Auto-assign: first available handyman matching the day + time slot
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
        { status: 404, headers: corsHeaders() },
      )
    }

    const hp = await prisma.handymanProfile.findUnique({
      where: { userId: handymanService.handyman.userId },
      select: { hourlyRate: true },
    })

    const bookingDuration = duration ?? 1
    const totalPrice = (hp?.hourlyRate ?? 0) * bookingDuration

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        handymanId: handymanService.handyman.userId,
        serviceId,
        scheduledDate: new Date(`${scheduledDate}T00:00:00`),
        scheduledTime,
        duration: bookingDuration,
        totalPrice,
        address,
        description: description ?? null,
        notes: leaseDocumentId ? `LeaseDoc:${leaseDocumentId}` : null,
        status: 'PENDING',
      },
      include: {
        service: { select: { name: true, category: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
        handyman: { select: { firstName: true, lastName: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: handymanService.handyman.userId,
        title: 'New Booking via LeaseSign',
        message: `${booking.customer.firstName} ${booking.customer.lastName} booked ${booking.service.name} on ${scheduledDate} at ${scheduledTime} (via LeaseSign).`,
        type: 'new_booking',
        link: '/dashboard/bookings',
      },
    })

    return NextResponse.json({ booking }, { status: 201, headers: corsHeaders() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() })
  }
}
