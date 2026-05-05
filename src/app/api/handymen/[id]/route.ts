import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getServerSession(authOptions)

    const { id } = params

    const handyman = await prisma.handymanProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        services: {
          select: {
            customPrice: true,
            service: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true,
                icon: true
              }
            }
          }
        },
        certifications: {
          select: {
            id: true,
            name: true,
            issuer: true,
            issueDate: true,
            expiryDate: true,
            documentUrl: true
          },
          orderBy: { createdAt: 'desc' }
        },
        availability: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isAvailable: true
          },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    if (!handyman) {
      return NextResponse.json(
        { error: 'Handyman not found' },
        { status: 404 }
      )
    }

    // Fetch recent reviews (last 5) with reviewer names
    const recentReviews = await prisma.review.findMany({
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
      take: 5
    })

    // Booking stats: totalJobs comes from the profile; compute completion rate
    const completedCount = await prisma.booking.count({
      where: {
        handymanId: handyman.userId,
        status: 'COMPLETED'
      }
    })

    const totalBookings = handyman.totalJobs
    const completionRate = totalBookings > 0
      ? Math.round((completedCount / totalBookings) * 100)
      : 0

    return NextResponse.json({
      handyman: {
        ...handyman,
        recentReviews,
        stats: {
          totalJobs: totalBookings,
          completionRate
        }
      }
    })
  } catch (error) {
    console.error('Error fetching handyman:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
