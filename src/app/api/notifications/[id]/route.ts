import { NextResponse } from 'next/server'
import { authOptions, getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ── PUT /api/notifications/[id] ────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('PUT /api/notifications/[id] error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
