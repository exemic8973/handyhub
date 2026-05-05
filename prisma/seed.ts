// prisma/seed.ts
// Run with: npx tsx prisma/seed.ts
// Seeds the database with demo data for development and UAT.

import { PrismaClient, ServiceCategory, BookingStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Load .env for Prisma 7 (tsx doesn't auto-load it)
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envResult = config({ path: resolve(__dirname, '..', '.env') })
if (envResult.error) {
  console.error('Failed to load .env:', envResult.error.message)
  process.exit(1)
}
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'loaded' : 'MISSING')

function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL ?? ''
  const url = raw.replace(/^["']|["']$/g, '')
  console.log('  [prisma] adapter url:', JSON.stringify(url))

  if (url.startsWith('file:')) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    const adapter = new PrismaLibSql({ url })
    return new PrismaClient({ adapter })
  }

  return new PrismaClient()
}

const prisma = createPrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── 1. Services ─────────────────────────────────────────────
  console.log('  Creating services...')
  const services = await Promise.all([
    prisma.service.create({
      data: { name: 'Plumbing Repair', description: 'Leak repairs, pipe installation, drain cleaning, and all plumbing services', category: ServiceCategory.PLUMBING, icon: 'wrench' }
    }),
    prisma.service.create({
      data: { name: 'Electrical Work', description: 'Wiring, outlet installation, panel upgrades, and electrical troubleshooting', category: ServiceCategory.ELECTRICAL, icon: 'bolt' }
    }),
    prisma.service.create({
      data: { name: 'Carpentry', description: 'Custom woodwork, furniture assembly, deck building, and repairs', category: ServiceCategory.CARPENTRY, icon: 'home' }
    }),
    prisma.service.create({
      data: { name: 'Painting', description: 'Interior and exterior painting, drywall repair, and finishing', category: ServiceCategory.PAINTING, icon: 'paint-brush' }
    }),
    prisma.service.create({
      data: { name: 'Cleaning', description: 'Deep cleaning, move-in/move-out, office cleaning, and sanitization', category: ServiceCategory.CLEANING, icon: 'sparkles' }
    }),
    prisma.service.create({
      data: { name: 'HVAC Services', description: 'Heating, ventilation, and air conditioning installation and repair', category: ServiceCategory.HVAC, icon: 'thermometer' }
    }),
    prisma.service.create({
      data: { name: 'Appliance Repair', description: 'Washer, dryer, refrigerator, dishwasher, and oven repair', category: ServiceCategory.APPLIANCE_REPAIR, icon: 'wrench-screwdriver' }
    }),
    prisma.service.create({
      data: { name: 'Locksmith', description: 'Lock installation, key duplication, and emergency lockout services', category: ServiceCategory.LOCKSMITH, icon: 'key' }
    }),
    prisma.service.create({
      data: { name: 'Moving Help', description: 'Furniture moving, heavy lifting, and packing assistance', category: ServiceCategory.MOVING, icon: 'truck' }
    }),
    prisma.service.create({
      data: { name: 'General Repair', description: 'General home repairs, maintenance, and odd jobs around the house', category: ServiceCategory.GENERAL_REPAIR, icon: 'tool' }
    }),
  ])
  console.log(`    ✓ ${services.length} services created`)

  // ── 2. Users ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12)
  const customerHash = await bcrypt.hash('Customer123!', 12)
  const handymanHash = await bcrypt.hash('Handyman123!', 12)

  console.log('  Creating users...')

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@handyhub.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isVerified: true,
    }
  })

  // Customers
  const customer1 = await prisma.user.create({
    data: { email: 'sarah@example.com', passwordHash: customerHash, firstName: 'Sarah', lastName: 'Johnson', phone: '+1 555-0101', role: UserRole.CUSTOMER }
  })
  const customer2 = await prisma.user.create({
    data: { email: 'michael@example.com', passwordHash: customerHash, firstName: 'Michael', lastName: 'Chen', phone: '+1 555-0102', role: UserRole.CUSTOMER }
  })
  const customer3 = await prisma.user.create({
    data: { email: 'emily@example.com', passwordHash: customerHash, firstName: 'Emily', lastName: 'Davis', phone: '+1 555-0103', role: UserRole.CUSTOMER }
  })

  // Handymen
  const handyman1User = await prisma.user.create({
    data: { email: 'mike.johnson@handyhub.com', passwordHash: handymanHash, firstName: 'Mike', lastName: 'Johnson', phone: '+1 555-0201', role: UserRole.HANDYMAN, isVerified: true }
  })
  const handyman2User = await prisma.user.create({
    data: { email: 'david.brown@handyhub.com', passwordHash: handymanHash, firstName: 'David', lastName: 'Brown', phone: '+1 555-0202', role: UserRole.HANDYMAN, isVerified: true }
  })
  const handyman3User = await prisma.user.create({
    data: { email: 'james.wilson@handyhub.com', passwordHash: handymanHash, firstName: 'James', lastName: 'Wilson', phone: '+1 555-0203', role: UserRole.HANDYMAN, isVerified: true }
  })

  console.log(`    ✓ ${7} users created (1 admin, 3 customers, 3 handymen)`)

  // ── 3. Handyman Profiles ───────────────────────────────────
  console.log('  Creating handyman profiles...')

  // Create profiles inline
  const h1Profile = await prisma.handymanProfile.create({
    data: { userId: handyman1User.id, businessName: 'Mike\'s Plumbing & More', bio: 'Licensed plumber with 12 years of experience. Specializing in residential plumbing, drain cleaning, and water heater installation.', experience: 12, hourlyRate: 85, serviceRadius: 30, address: '123 Main St', city: 'Austin', state: 'TX', zipCode: '73301', rating: 4.9, totalReviews: 245, totalJobs: 312 }
  })
  const h2Profile = await prisma.handymanProfile.create({
    data: { userId: handyman2User.id, businessName: 'Brown Electrical Services', bio: 'Master electrician with 8 years in residential and commercial electrical work. Panel upgrades, rewiring, and lighting design.', experience: 8, hourlyRate: 95, serviceRadius: 25, address: '456 Oak Ave', city: 'Austin', state: 'TX', zipCode: '73301', rating: 4.8, totalReviews: 198, totalJobs: 256 }
  })
  const h3Profile = await prisma.handymanProfile.create({
    data: { userId: handyman3User.id, businessName: 'Wilson Home Services', bio: 'Experienced carpenter and general handyman. From custom bookshelves to complete kitchen remodels.', experience: 15, hourlyRate: 75, serviceRadius: 35, address: '789 Pine Rd', city: 'Austin', state: 'TX', zipCode: '73301', rating: 4.8, totalReviews: 187, totalJobs: 230 }
  })

  console.log('    ✓ 3 profiles created')

  // ── 4. Handyman Services ───────────────────────────────────
  console.log('  Assigning services to handymen...')
  const h1Services = [services[0], services[1], services[5], services[9]] // Plumbing, Electrical, HVAC, General
  const h2Services = [services[1], services[5], services[3]] // Electrical, HVAC, Painting
  const h3Services = [services[2], services[3], services[8], services[9]] // Carpentry, Painting, Moving, General

  for (const svc of h1Services) {
    await prisma.handymanService.create({ data: { handymanId: h1Profile.id, serviceId: svc.id, customPrice: svc.id === services[1].id ? 90 : null } })
  }
  for (const svc of h2Services) {
    await prisma.handymanService.create({ data: { handymanId: h2Profile.id, serviceId: svc.id } })
  }
  for (const svc of h3Services) {
    await prisma.handymanService.create({ data: { handymanId: h3Profile.id, serviceId: svc.id, customPrice: svc.id === services[2].id ? 70 : null } })
  }
  console.log('    ✓ Service assignments created')

  // ── 5. Availability ────────────────────────────────────────
  console.log('  Setting availability...')
  const profiles = [h1Profile, h2Profile, h3Profile]
  for (const profile of profiles) {
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: { handymanId: profile.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00' }
      })
    }
  }
  console.log('    ✓ Mon-Fri 9-5 availability set for all handymen')

  // ── 6. Certifications ──────────────────────────────────────
  console.log('  Adding certifications...')
  await prisma.certification.create({ data: { handymanId: h1Profile.id, name: 'Master Plumber License', issuer: 'Texas State Board of Plumbing Examiners', issueDate: new Date('2015-03-15') } })
  await prisma.certification.create({ data: { handymanId: h1Profile.id, name: 'EPA Lead-Safe Certification', issuer: 'EPA', issueDate: new Date('2018-06-01') } })
  await prisma.certification.create({ data: { handymanId: h2Profile.id, name: 'Master Electrician License', issuer: 'Texas Department of Licensing', issueDate: new Date('2017-01-10') } })
  await prisma.certification.create({ data: { handymanId: h2Profile.id, name: 'OSHA 30-Hour Safety', issuer: 'OSHA', issueDate: new Date('2019-05-20') } })
  await prisma.certification.create({ data: { handymanId: h3Profile.id, name: 'Certified Lead Carpenter', issuer: 'NAHB', issueDate: new Date('2014-08-22') } })
  console.log('    ✓ 5 certifications created')

  // ── 7. Bookings ────────────────────────────────────────────
  console.log('  Creating bookings...')
  const customers = [customer1, customer2, customer3]
  const handymenUsers = [handyman1User, handyman2User, handyman3User]

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000)

  const bookingData = [
    { customer: customer1, handyman: handyman1User, service: services[0], status: BookingStatus.COMPLETED, date: daysAgo(10), time: '10:00', duration: 2, price: 170, address: '456 Elm St, Austin, TX' },
    { customer: customer1, handyman: handyman2User, service: services[1], status: BookingStatus.COMPLETED, date: daysAgo(7), time: '14:00', duration: 3, price: 285, address: '456 Elm St, Austin, TX' },
    { customer: customer2, handyman: handyman3User, service: services[2], status: BookingStatus.COMPLETED, date: daysAgo(5), time: '09:00', duration: 4, price: 300, address: '789 Oak Dr, Austin, TX' },
    { customer: customer2, handyman: handyman1User, service: services[5], status: BookingStatus.COMPLETED, date: daysAgo(3), time: '11:00', duration: 1, price: 85, address: '789 Oak Dr, Austin, TX' },
    { customer: customer3, handyman: handyman2User, service: services[3], status: BookingStatus.COMPLETED, date: daysAgo(2), time: '08:00', duration: 5, price: 475, address: '321 Pine Ln, Austin, TX' },
    { customer: customer1, handyman: handyman3User, service: services[8], status: BookingStatus.CANCELLED, date: daysAgo(1), time: '13:00', duration: 3, price: 225, address: '456 Elm St, Austin, TX' },
    { customer: customer3, handyman: handyman1User, service: services[0], status: BookingStatus.IN_PROGRESS, date: now, time: '10:00', duration: 2, price: 170, address: '321 Pine Ln, Austin, TX' },
    { customer: customer2, handyman: handyman2User, service: services[1], status: BookingStatus.CONFIRMED, date: daysFromNow(2), time: '09:00', duration: 2, price: 190, address: '789 Oak Dr, Austin, TX' },
    { customer: customer3, handyman: handyman3User, service: services[9], status: BookingStatus.PENDING, date: daysFromNow(5), time: '14:00', duration: 1, price: 75, address: '321 Pine Ln, Austin, TX' },
    { customer: customer1, handyman: handyman1User, service: services[5], status: BookingStatus.CONFIRMED, date: daysFromNow(7), time: '11:00', duration: 3, price: 255, address: '456 Elm St, Austin, TX' },
  ]

  const bookings = []
  for (const b of bookingData) {
    const booking = await prisma.booking.create({
      data: {
        customerId: b.customer.id,
        handymanId: b.handyman.id,
        serviceId: b.service.id,
        status: b.status,
        scheduledDate: b.date,
        scheduledTime: b.time,
        duration: b.duration,
        totalPrice: b.price,
        address: b.address,
        description: `${b.service.name} at ${b.address}`,
      }
    })
    bookings.push(booking)
  }
  console.log(`    ✓ ${bookings.length} bookings created`)

  // ── 8. Reviews ─────────────────────────────────────────────
  console.log('  Creating reviews...')
  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED)
  const reviews = [
    { booking: completedBookings[0], rating: 5, comment: 'Mike did an amazing job fixing our leaky pipes. Very professional and quick!' },
    { booking: completedBookings[1], rating: 5, comment: 'David was thorough with the electrical inspection. Highly recommend.' },
    { booking: completedBookings[2], rating: 4, comment: 'James built beautiful custom shelves. Took a bit longer than expected but quality work.' },
    { booking: completedBookings[3], rating: 5, comment: 'Mike fixed our AC unit on a hot day. Life saver!' },
    { booking: completedBookings[4], rating: 5, comment: 'David painted our entire living room. Clean lines, no mess left behind.' },
  ]

  for (const r of reviews) {
    await prisma.review.create({
      data: {
        bookingId: r.booking.id,
        authorId: r.booking.customerId,
        targetId: r.booking.handymanId,
        rating: r.rating,
        comment: r.comment,
      }
    })
  }
  console.log(`    ✓ ${reviews.length} reviews created`)

  // ── 9. Notifications ───────────────────────────────────────
  console.log('  Creating notifications...')
  await prisma.notification.create({
    data: { userId: customer1.id, title: 'Booking Confirmed', message: 'Your plumbing repair with Mike Johnson has been confirmed for Friday.', type: 'booking_confirmed', link: '/dashboard/bookings' }
  })
  await prisma.notification.create({
    data: { userId: customer2.id, title: 'Booking Completed', message: 'Your carpentry job with James Wilson has been completed. Please leave a review!', type: 'booking_completed', link: '/dashboard/bookings' }
  })
  await prisma.notification.create({
    data: { userId: handyman1User.id, title: 'New Booking Request', message: 'You have a new booking request from Emily Davis for HVAC Services.', type: 'new_booking', link: '/dashboard/bookings' }
  })
  await prisma.notification.create({
    data: { userId: admin.id, title: 'New User Registered', message: 'Sarah Johnson has joined HandyHub as a customer.', type: 'new_user', link: '/admin/users' }
  })
  console.log('    ✓ 4 notifications created')

  console.log('\n✅ Seed complete!')
  console.log('\n   🔑 Demo Credentials:')
  console.log('   ─────────────────────────────────────')
  console.log('   Admin:     admin@handyhub.com / Admin123!')
  console.log('   Customer:  sarah@example.com   / Customer123!')
  console.log('   Handyman:  mike.johnson@handyhub.com / Handyman123!')
  console.log('   ─────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
