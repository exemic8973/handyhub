import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { ServiceCategory } from '@prisma/client'

export async function GET() {
  try {
    const results: string[] = []

    // Create admin user if not exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@handyhub.com' },
    })

    if (!existingAdmin) {
      const hash = await bcrypt.hash('Admin123!', 12)
      await prisma.user.create({
        data: {
          email: 'admin@handyhub.com',
          passwordHash: hash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isVerified: true,
        },
      })
      results.push('Admin user created')
    } else {
      results.push('Admin user already exists')
    }

    // Create default services if none exist
    const serviceCount = await prisma.service.count()
    if (serviceCount === 0) {
      const services = [
        { name: 'Plumbing Repair', description: 'Leak repairs, pipe installation, drain cleaning', category: ServiceCategory.PLUMBING, icon: 'wrench' },
        { name: 'Electrical Work', description: 'Wiring, outlet installation, panel upgrades', category: ServiceCategory.ELECTRICAL, icon: 'bolt' },
        { name: 'Carpentry', description: 'Custom woodwork, furniture assembly, deck building', category: ServiceCategory.CARPENTRY, icon: 'home' },
        { name: 'Painting', description: 'Interior and exterior painting, drywall repair', category: ServiceCategory.PAINTING, icon: 'paint-brush' },
        { name: 'Cleaning', description: 'Deep cleaning, move-in/move-out, office cleaning', category: ServiceCategory.CLEANING, icon: 'sparkles' },
        { name: 'HVAC Services', description: 'Heating, ventilation, and air conditioning', category: ServiceCategory.HVAC, icon: 'thermometer' },
        { name: 'Appliance Repair', description: 'Washer, dryer, refrigerator, dishwasher repair', category: ServiceCategory.APPLIANCE_REPAIR, icon: 'wrench-screwdriver' },
        { name: 'Locksmith', description: 'Lock installation, key duplication, emergency lockout', category: ServiceCategory.LOCKSMITH, icon: 'key' },
        { name: 'Moving Help', description: 'Furniture moving, heavy lifting, packing', category: ServiceCategory.MOVING, icon: 'truck' },
        { name: 'General Repair', description: 'General home repairs and maintenance', category: ServiceCategory.GENERAL_REPAIR, icon: 'tool' },
      ]
      for (const s of services) {
        await prisma.service.create({ data: s })
      }
      results.push(`${services.length} services created`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Setup error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
