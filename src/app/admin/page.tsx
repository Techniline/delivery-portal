'use client'

import AdminGate from '@/components/AdminGate'
import UsersPanel from '@/components/UsersPanel'
import HoursPanel from '@/components/HoursPanel'
import BreaksPanel from '@/components/BreaksPanel'
import FleetPanel from '@/components/FleetPanel'
import HolidaysPanel from '@/components/HolidaysPanel'

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="container-app py-6 space-y-8">
        <section>
          <h2 className="page-title">Holidays & Closures</h2>
          <HolidaysPanel />
        </section>

        <section>
          <h2 className="page-title">Business Hours</h2>
          <HoursPanel />
        </section>

        <section>
          <h2 className="page-title">Breaks</h2>
          <BreaksPanel />
        </section>

        <section>
          <h2 className="page-title">Fleet</h2>
          <FleetPanel />
        </section>

        <section>
          <h2 className="page-title">Users</h2>
          <UsersPanel />
        </section>
      </div>
    </AdminGate>
  )
}
