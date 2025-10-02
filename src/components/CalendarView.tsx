'use client'
import '@fullcalendar/common/main.css'
import '@fullcalendar/timegrid/main.css'
import '@fullcalendar/timegrid/main.css'
import { supabase } from '@/lib/supabaseClient'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Booking } from '@/lib/types'

export default function CalendarView() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const s = supabase()

  const load = async () => {
    const { data: u } = await s.auth.getUser()
    const uid = u.user?.id ?? null
    const { data: approved } = await s.from('bookings').select().eq('status', 'APPROVED')
    let mine: Booking[] = []
    if (uid) {
      const { data } = await s.from('bookings').select().eq('creator_user_id', uid)
      mine = data || []
    }
    const merged = [...(approved || []), ...mine].reduce((acc: Record<number, Booking>, b) => (acc[b.id]=b, acc), {})
    setBookings(Object.values(merged))
  }

  useEffect(() => {
    load()
    const ch = s.channel('bookings-calendar')
      .on('postgres_changes', { event:'*', schema:'public', table:'bookings' }, () => load())
      .subscribe()
    return () => { s.removeChannel(ch) }
  }, [])

  const events = useMemo(() => bookings.map(b => ({
    id: String(b.id),
    title: b.status==='PENDING'
      ? `PENDING • ${b.delivery_location ?? 'Delivery'}`
      : `${b.driver_name ?? 'Driver TBC'} • ${b.vehicle_plate ?? 'Vehicle TBC'}`,
    start: b.start_ts, end: b.end_ts,
    backgroundColor: colorFor(b.status, b.origin),
    borderColor: borderFor(b.status, b.origin),
  })), [bookings])

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold">Schedule</h2>
      </div>
      <div className="card-body">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          nowIndicator
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          height="auto"
          timeZone="Asia/Dubai"
          events={events}
        />
        <Legend />
      </div>
    </div>
  )
}

const colorFor = (status: string, origin: string) => {
  if (status==='APPROVED') return origin==='WAREHOUSE_BOOKING' ? '#F0FDF4' : '#DCFCE7'
  if (status==='PENDING')  return '#E5E7EB'
  if (status==='REJECTED') return '#FECACA'
  return '#E5E7EB'
}
const borderFor = (status: string, origin: string) =>
  status==='APPROVED' && origin==='WAREHOUSE_BOOKING' ? '#C0101A' : '#9CA3AF'

function Legend() {
  return (
    <div className="mt-3 flex gap-4 text-sm">
      <Badge bg="#DCFCE7" label="Approved (Showroom)" />
      <Badge bg="#F0FDF4" border="#C0101A" label="Approved (Warehouse Direct)" />
      <Badge bg="#E5E7EB" label="Pending (creator+warehouse)" />
      <Badge bg="#FECACA" label="Rejected (creator+warehouse)" />
    </div>
  )
}
function Badge({ bg, border, label }: { bg: string; border?: string; label: string }) {
  return <span className="badge"><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: bg, border: border?`2px solid ${border}`:undefined }} />{label}</span>
}
