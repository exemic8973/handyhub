import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const currentUserRole = session.user.role
    const targetId = params.id

    // Users can only view their own profile; Admin can view any
    if (currentUserId !== targetId && currentUserRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
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

    // Exclude sensitive fields
    const {
      passwordHash: _ph,
      resetToken: _rt,
      resetTokenExpiry: _rte,
      ...safeUser
    } = user

    // Use the cached rating/totalReviews from HandymanProfile (maintained by recalculateHandymanRating)
    const averageRating = user.handymanProfile?.rating ?? null
    const totalReviews = user.handymanProfile?.totalReviews ?? user._count.reviewsReceived

    return NextResponse.json({
      user: safeUser,
      stats: {
        averageRating,
        totalReviews,
        bookingsAsCustomer: user._count.bookingsAsCustomer,
        bookingsAsHandyman: user._count.bookingsAsHandyman
      }
    })
  } catch (error) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const currentUserRole = session.user.role
    const targetId = params.id

    // Users can only update their own profile; Admin can update any
    if (currentUserId !== targetId && currentUserRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const isAdmin = currentUserRole === 'ADMIN'

    // Build update data — only allow specific fields
    const updateData: any = {}

    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Admin-only fields
    if (isAdmin) {
      if (body.role !== undefined) {
        const validRoles = ['CUSTOMER', 'HANDYMAN', 'ADMIN']
        if (validRoles.includes(body.role)) {
          updateData.role = body.role
        }
      }
      if (body.isVerified !== undefined) {
        updateData.isVerified = Boolean(body.isVerified)
      }
      if (body.isActive !== undefined) {
        updateData.isActive = Boolean(body.isActive)
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        handymanProfile: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
