import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // 5 registrations per IP per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const { allowed, retryAfterMs } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName, phone, role } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Only CUSTOMER and HANDYMAN can self-register; ADMIN accounts are created by existing admins
    const userRole: UserRole = role === 'HANDYMAN' ? 'HANDYMAN' : 'CUSTOMER'

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: userRole
      }
    })

    // If registering as handyman, create handyman profile
    if (userRole === 'HANDYMAN') {
      await prisma.handymanProfile.create({
        data: {
          userId: user.id
        }
      })
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
