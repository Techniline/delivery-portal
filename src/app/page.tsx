'use client'
import AuthGate from '@/components/AuthGate'
import CalendarView from '@/components/CalendarView'
import LegendChips from '@/components/LegendChips'
export default function Page() {
  return (
    <AuthGate>
      <section className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Techniline Delivery Schedule</h1>
            <p className="text-sm opacity-70">Plan, approve, and manage delivery slots.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/requests" className="btn btn-outline">My Requests</a>
            <a href="/approvals" className="btn btn-outline">Approvals</a>
            <a href="/admin" className="btn btn-primary">Admin</a>
          </div>
        </div>
      </section>
      <CalendarView />
    </AuthGate>
  )
}
