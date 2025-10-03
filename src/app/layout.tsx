import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Techniline Delivery Schedule Portal',
  description: 'Vehicle slot scheduling with approvals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/index.global.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.15/index.global.min.css" />
      </head>
      <body>
        <header className="topbar">
          <div className="container-app py-3 flex items-center gap-6">
            <Link href="/" className="brand">Techniline Delivery Schedule Portal</Link>
            <nav className="flex items-center gap-4 ml-auto">
              <Link href="/" className="navlink">Calendar</Link>
              <Link href="/requests" className="navlink">My Requests</Link>
              <Link href="/approvals" className="navlink">Approvals</Link>
              <Link href="/admin" className="navlink">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  )
}
