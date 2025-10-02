import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delivery Scheduling Portal',
  description: 'Vehicle slot scheduling with approvals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
