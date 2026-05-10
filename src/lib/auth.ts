const { default: CredentialsProvider } = require('next-auth/providers/credentials')
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { checkRateLimit } from './rate-limit'

// getServerSession wrapper — works around next-auth v4 type export issue with TS 6
const { getServerSession: _getServerSession } = require('next-auth')
export async function getServerSession(_opts?: any) {
  return _getServerSession(authOptions)
}

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // 10 login attempts per email per 15 minutes
        const { allowed } = checkRateLimit(`login:${credentials.email.toLowerCase()}`, 10, 15 * 60 * 1000)
        if (!allowed) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}
