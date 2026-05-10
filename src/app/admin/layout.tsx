import { redirect } from 'next/navigation'
import { authOptions, getServerSession } from '@/lib/auth'
import AdminClient from './AdminClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }

  // Redirect to dashboard if not admin
  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN') {
    redirect('/dashboard?error=unauthorized')
  }

  const user = {
    id: (session.user as any).id,
    email: session.user.email || '',
    firstName: session.user.name?.split(' ')[0] || '',
    lastName: session.user.name?.split(' ')[1] || '',
    role: userRole
  }

  return <AdminClient user={user}>{children}</AdminClient>
}
