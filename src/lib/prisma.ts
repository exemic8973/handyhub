import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Strip quotes that some .env parsers may leave on the value.
  const raw = process.env.DATABASE_URL ?? ''
  const url = raw.replace(/^["']|["']$/g, '')

  // SQLite via @libsql/client + @prisma/adapter-libsql
  // (local dev: "file:./prisma/dev.db", Docker: "file:/app/prisma/dev.db")
  if (url.startsWith('file:')) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')

    // PrismaLibSql constructor takes a Config (with url), not a pre-created client.
    const adapter = new PrismaLibSql({ url })
    return new PrismaClient({ adapter })
  }

  // PostgreSQL (production) — requires @prisma/adapter-pg
  // For now, assume the prisma.config.ts provides the datasource.
  return new PrismaClient()
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
