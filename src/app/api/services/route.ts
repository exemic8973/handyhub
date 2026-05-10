import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions, getServerSession } from '@/lib/auth'
import { ServiceCategory } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = { isActive: true }

    if (category && Object.values(ServiceCategory).includes(category as ServiceCategory)) {
      where.category = category as ServiceCategory
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        _count: {
          select: {
            handymen: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('GET /api/services error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { name, description, category, icon } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category' },
        { status: 400 }
      )
    }

    if (!Object.values(ServiceCategory).includes(category as ServiceCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${Object.values(ServiceCategory).join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await prisma.service.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        category: category as ServiceCategory,
        description: description || null,
        icon: icon || null
      }
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('POST /api/services error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
