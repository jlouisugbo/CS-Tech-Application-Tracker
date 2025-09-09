import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GT CS Internship Portal',
  description: 'Find Summer 2026 Computer Science internships for Georgia Tech students',
  keywords: 'Georgia Tech, CS, Computer Science, Internships, Summer 2026, GT, Software Engineering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}