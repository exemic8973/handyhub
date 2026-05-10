import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]

// ── GET /api/handymen/[id]/availability ────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slots = await prisma.availability.findMany({
      where: { handymanId: params.id },
      orderBy: { dayOfWeek: 'asc' },
    })
    return NextResponse.json({ availability: slots })
  } catch (error) {
    console.error('GET availability error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/handymen/[id]/availability ───────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    const day = parseInt(dayOfWeek, 10)
    if (isNaN(day) || day < 1 || day > 7) {
      return NextResponse.json({ error: 'dayOfWeek must be 1-7' }, { status: 400 })
    }

    const slot = await prisma.availability.upsert({
      where: { handymanId_dayOfWeek: { handymanId: params.id, dayOfWeek: day } },
      update: { startTime, endTime, isAvailable: true },
      create: { handymanId: params.id, dayOfWeek: day, startTime, endTime, isAvailable: true },
    })

    return NextResponse.json({ availability: slot }, { status: 201 })
  } catch (error) {
    console.error('POST availability error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── DELETE /api/handymen/[id]/availability ─────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dayOfWeek = searchParams.get('dayOfWeek')

    if (!dayOfWeek) {
      return NextResponse.json({ error: 'dayOfWeek query param required' }, { status: 400 })
    }

    const day = parseInt(dayOfWeek, 10)

    // Soft-deactivate: set isAvailable to false
    await prisma.availability.update({
      where: { handymanId_dayOfWeek: { handymanId: params.id, dayOfWeek: day } },
      data: { isAvailable: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE availability error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
