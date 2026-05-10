import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ── GET /api/handymen/[id]/services ────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const services = await prisma.handymanService.findMany({
      where: { handymanId: params.id },
      include: {
        service: {
          select: { id: true, name: true, category: true, description: true, icon: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('GET /api/handymen/[id]/services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/handymen/[id]/services ───────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the handyman profile belongs to the current user (or is admin)
    const profile = await prisma.handymanProfile.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Handyman profile not found' }, { status: 404 })
    }

    if (profile.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 })
    }

    // Check service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check not already assigned
    const existing = await prisma.handymanService.findUnique({
      where: { handymanId_serviceId: { handymanId: params.id, serviceId } }
    })
    if (existing) {
      return NextResponse.json({ error: 'Service already assigned' }, { status: 409 })
    }

    const hs = await prisma.handymanService.create({
      data: { handymanId: params.id, serviceId },
      include: {
        service: {
          select: { id: true, name: true, category: true, description: true, icon: true }
        }
      }
    })

    return NextResponse.json({ service: hs }, { status: 201 })
  } catch (error) {
    console.error('POST /api/handymen/[id]/services error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── DELETE /api/handymen/[id]/services ─────────────────────────────────────

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
      select: { userId: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Handyman profile not found' }, { status: 404 })
    }

    if (profile.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId query param is required' }, { status: 400 })
    }

    await prisma.handymanService.delete({
      where: { handymanId_serviceId: { handymanId: params.id, serviceId } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/handymen/[id]/services error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
