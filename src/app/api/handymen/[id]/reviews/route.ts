import { NextRequest, NextResponse } from 'next/server'
import { authOptions, getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getServerSession(authOptions)

    const { id } = params
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const skip = (page - 1) * limit

    // Verify handyman exists and get userId
    const handyman = await prisma.handymanProfile.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!handyman) {
      return NextResponse.json(
        { error: 'Handyman not found' },
        { status: 404 }
      )
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          targetId: handyman.userId
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          booking: {
            select: {
              id: true,
              service: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: {
          targetId: handyman.userId
        }
      })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
