import './globals.css'
import '@/styles/fc-core.css'
import '@/styles/fc-timegrid.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Techniline Delivery Schedule Portal',
  description: 'Modern slot scheduling, approvals, and admin controls',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning prevents browser-injected attributes (e.g., Grammarly) from causing hydration mismatches */}
      <body suppressHydrationWarning>
        <header className="topbar">
          <div className="container-app py-3 flex items-center gap-6">
            <Link href="/" className="brand" aria-label="Techniline Delivery Schedule Portal">
              <div className="brand-badge" />
              <div>
                <div className="text-base leading-tight">Techniline</div>
                <div className="text-xs opacity-70 -mt-0.5">Delivery Schedule Portal</div>
              </div>
            </Link>
            <nav className="nav ml-auto">
              <Link href="/" className="active">Calendar</Link>
              <Link href="/requests">My Requests</Link>
              <Link href="/approvals">Approvals</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/signout" className="btn btn-outline ml-2">Sign out</Link>
            </nav>
          </div>
        </header>
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  )
}
