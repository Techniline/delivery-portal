import AuthGate from '@/components/AuthGate'
import CalendarView from '@/components/CalendarView'
export default function Page() {
  return (
    <AuthGate>
      <h1 className="text-2xl font-semibold mb-4" style={{color:'#0B0B0C'}}>Calendar</h1>
      <CalendarView />
    </AuthGate>
  )
}
