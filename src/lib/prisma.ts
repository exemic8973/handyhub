import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const url = raw.replace(/^["']|["']$/g, '')

  // SQLite / libSQL (local development)
  if (url.startsWith('file:') || url.startsWith('libsql:')) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    return new PrismaClient({ adapter: new PrismaLibSql({ url }) })
  }

  // PostgreSQL (production)
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: url })
    return new PrismaClient({ adapter: new PrismaPg(pool) })
  }

  // Fallback: no adapter (Prisma will use direct connection for supported DBs)
  return new PrismaClient({ datasourceUrl: url })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
