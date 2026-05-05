import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HandyHub - Professional Handyman Services',
  description: 'Connect with skilled handymen for all your home repair and maintenance needs. Book trusted professionals for plumbing, electrical, carpentry, and more.',
  keywords: 'handyman, home repair, plumbing, electrical, carpentry, maintenance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}