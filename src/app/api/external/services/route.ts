import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function validateApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key')
  return !!key && key === process.env.HANDYHUB_EXTERNAL_API_KEY
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category

    const services = await prisma.service.findMany({
      where,
      include: {
        _count: {
          select: {
            handymen: { where: { isActive: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ services }, { headers: corsHeaders() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() })
  }
}
