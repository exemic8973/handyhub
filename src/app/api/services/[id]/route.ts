import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ServiceCategory } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        handymen: {
          where: { isActive: true },
          include: {
            handyman: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const handymenWithDetails = service.handymen.map((hs) => ({
      id: hs.handyman.id,
      userId: hs.handyman.userId,
      businessName: hs.handyman.businessName,
      bio: hs.handyman.bio,
      experience: hs.handyman.experience,
      hourlyRate: hs.handyman.hourlyRate,
      rating: hs.handyman.rating,
      totalReviews: hs.handyman.totalReviews,
      totalJobs: hs.handyman.totalJobs,
      city: hs.handyman.city,
      state: hs.handyman.state,
      user: {
        firstName: hs.handyman.user.firstName,
        lastName: hs.handyman.user.lastName
      },
      customPrice: hs.customPrice
    }))

    return NextResponse.json({
      service: {
        ...service,
        handymen: handymenWithDetails
      }
    })
  } catch (error) {
    console.error('GET /api/services/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { name, description, icon, isActive, category } = body

    const existing = await prisma.service.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.service.findUnique({
        where: { name }
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'A service with this name already exists' },
          { status: 400 }
        )
      }
    }

    if (category && !Object.values(ServiceCategory).includes(category as ServiceCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${Object.values(ServiceCategory).join(', ')}` },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (icon !== undefined) data.icon = icon
    if (isActive !== undefined) data.isActive = isActive
    if (category !== undefined) data.category = category

    const service = await prisma.service.update({
      where: { id },
      data
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('PUT /api/services/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = params

    const existing = await prisma.service.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const service = await prisma.service.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Service deactivated successfully',
      service
    })
  } catch (error) {
    console.error('DELETE /api/services/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
