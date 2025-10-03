'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, parseISO } from 'date-fns'
import { computeCalendarProps } from '@/lib/hours'
import { supabase } from '@/lib/supabaseClient'

import Modal from './Modal'
import QuickSlotPicker from './QuickSlotPicker'
import RequestForm from './RequestForm'

type BookingRow = {
  id:number
  origin:'SHOWROOM_REQUEST'|'WAREHOUSE_BOOKING'
  status:'PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'
  creator_user_id:string
  date:string
  start_time:string
  end_time:string
  start_ts?:string
  end_ts?:string
  warehouse_id:number
  dock_id:number|null
  delivery_location?:string|null
  notes?:string|null
  driver_name?:string|null
  driver_photo_url?:string|null
  vehicle_plate?:string|null
  vehicle_model?:string|null
}

const LOCATION_COLORS: Record<string, string> = {
  'Al Shoala Showroom':'#2563EB',
  'MusicMajlis':'#9333EA',
  'Amazon Delivery':'#4F46E5',
  'B2B':'#0EA5E9',
  'Soundline Main':'#059669',
  'Other Delivery':'#6B7280',
  'Showroom Delivery':'#EF4444',
}
export default function CalendarView() {
  const [businessHours, setBusinessHours] = useState<any[]>([])
  const [hiddenDays, setHiddenDays] = useState<number[]>([])
  const [slotMinTime, setSlotMinTime] = useState<string>('08:00')
  const [slotMaxTime, setSlotMaxTime] = useState<string>('19:00')
  const [breaks, setBreaks] = useState<{weekday:number,start:string,end:string}[]>([])

  const [locFilter, setLocFilter] = useState<string>('All')
  const s = supabase()
  const calRef = useRef<any>(null)

  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [role, setRole] = useState<string>('')

  // Modal / slot state
  const [showModal, setShowModal] = useState(false)
  const [slot, setSlot] = useState<{date:string, start:string, end:string} | null>(null)

  // Helpers
  const pad = (n:number) => String(n).padStart(2,'0')
  const toISODate = (d:Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  const toHHMM = (d:Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

  // Load auth + role
  useEffect(() => {
    loadHoursFromApi();
    (async () => {
      const { data: { user } } = await s.auth.getUser()
      setUid(user?.id ?? null)
      if (user?.id) {
        const { data: prof } = await s.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
        setRole(prof?.role ?? '')
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load bookings (approved + mine)
  async function loadBookings() {
    const mineFilter = uid ? s.from('bookings').select('*').eq('creator_user_id', uid) : null
    const { data: approved } = await s.from('bookings').select('*').eq('status','APPROVED')
    let mine: BookingRow[] = []
    if (mineFilter) {
      const { data } = await mineFilter
      mine = data || []
    }
    // merge unique by id
    const map = new Map<number, BookingRow>()
    for (const b of (approved || [])) map.set(b.id, b)
    for (const b of mine) map.set(b.id, b)
    setBookings([...map.values()])
  }

  useEffect(() => { loadBookings() }, [uid]) // reload when we know uid

  // Build calendar events
  const events = useMemo(() => {
    return bookings.map(b => {
      const start = b.start_ts ?? `${b.date}T${b.start_time?.slice(0,5) || '00:00'}:00+04:00`
      const end   = b.end_ts   ?? `${b.date}T${b.end_time?.slice(0,5)   || '00:00'}:00+04:00`
      const title =
        b.status === 'APPROVED'
          ? (b.driver_name || b.vehicle_plate || 'Approved Slot')
          : 'Pending Request'
      return {
        id: String(b.id),
        title,
        start,
        end,
        extendedProps: {
          ...b
        }
      }
    })
  }, [bookings])

  // Pretty event pills
  function renderEvent(arg:any) {
    const s = arg.event.extendedProps as BookingRow
    const when = `${format(parseISO(arg.event.startStr), 'HH:mm')}–${format(parseISO(arg.event.endStr), 'HH:mm')}`
    const driver = s.driver_name || 'Driver TBC'
    const vehPlate = s.vehicle_plate ? `<span class="meta-pill">${s.vehicle_plate}</span>` : ''
    const vehModel = s.vehicle_model ? `<span class="meta-pill">${s.vehicle_model}</span>` : ''
    const locSlug = (s.delivery_location||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
    const locPill = s.delivery_location ? `<span class="loc-pill loc-${locSlug}">${s.delivery_location}</span>` : ''
    const status = (s.status || 'PENDING').toUpperCase()
    const stripeColor = status==='APPROVED' ? '#10B981' : status==='REJECTED' ? '#EF4444' : '#6B7280'
    const avatar = s.driver_photo_url
      ? `<img class="avatar" src="${s.driver_photo_url}" alt="driver">`
      : `<div class="avatar"></div>`
    const html =
      `<div class="event-chip">
         <div class="stripe" style="background:${stripeColor}"></div>
         ${avatar}
         <div style="display:flex; flex-direction:column; gap:4px; min-width:0">
           <div class="title">${when}</div>
           <div class="driver-name">${driver}</div>
           <div class="sub">${vehPlate} ${vehModel} ${locPill}</div>
         </div>
       </div>`
    return { html }
  }

  // Calendar interactions -> open modal
  const openNew = (start:Date, end?:Date) => {
    const s = new Date(start)
    const e = end ? new Date(end) : new Date(s.getTime() + 60*60000)
    setSlot({ date: toISODate(s), start: toHHMM(s), end: toHHMM(e) })
    setShowModal(true)
  }

  
  async function loadHoursFromApi(){
    try{
      const [hRes, bRes] = await Promise.all([
        fetch('/api/admin/hours?warehouse_id=1', { cache:'no-store' }),
        fetch('/api/admin/breaks?warehouse_id=1', { cache:'no-store' }),
      ])
      const { data: hours = [] }  = await hRes.json()
      const { data: breaks = [] } = await bRes.json()
      const cfg = computeCalendarProps(hours, breaks, 1)
      setBusinessHours(cfg.businessHours)
      setHiddenDays(cfg.hiddenDays)
      setSlotMinTime(cfg.slotMinTime)
      setSlotMaxTime(cfg.slotMaxTime)
      setBreaks(cfg.breaks)
    }catch(e){ console.error('hours load failed', e) }
  }
return (
    <div className="card">
      {/* top toolbar */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{color:'#0B0B0C'}}>Schedule</h2>
          <button
            className="btn btn-primary"
            onClick={() => openNew(new Date())}
            aria-label="New Request"
          >
            + New Request
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Legend (optional) */}
        <div className="legend mb-4">
          <span className="legend-title">Legend:</span>
          <span className="legend-chip loc-al-shoala-showroom">Al Shoala Showroom</span>
          <span className="legend-chip loc-musicmajlis">MusicMajlis</span>
          <span className="legend-chip loc-amazon-delivery">Amazon Delivery</span>
          <span className="legend-chip loc-b2b">B2B</span>
          <span className="legend-chip loc-soundline-main">Soundline Main</span>
          <span className="legend-chip loc-other-delivery">Other Delivery</span>
          <span className="legend-chip loc-showroom-delivery">Showroom Delivery</span>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="mr-2 text-gray-500">Legend:</span>
                {Object.entries(LOCATION_COLORS).map(([name,color])=>(
                  <span key={name} className="inline-flex items-center gap-2 mr-2 text-xs rounded-full px-2 py-1"
                        style={{background: color, color:'#fff'}}>
                    {name}
                  </span>
                ))}
              </div>
              <div>
                <select value={locFilter} onChange={(e)=>setLocFilter(e.target.value)}
                        className="rounded-full border px-3 py-1 text-sm">
                  <option>All</option>
                  {Object.keys(LOCATION_COLORS).map(n=> <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border"  style={{borderColor:'var(--line)'}}>
          <FullCalendar
              selectable
              select={(info:any)=
              timeZone="Asia/Dubai"
              businessHours={businessHours}
              hiddenDays={hiddenDays.length ? (hiddenDays as any) : undefined}
              slotMinTime={slotMinTime}
              slotMaxTime={slotMaxTime}>
{ const d=(x:Date)=>x.toISOString().slice(0,10); const hm=(x:Date)=>String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0'); openModal({date:d(info.start), start:hm(info.start), end:hm(info.end)}) }}
            ref={(r:any)=> (calRef.current = r)}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left:'', center:'', right:'' }}  // only Week + Today via our own UI if needed
            nowIndicator
            timeZone="Asia/Dubai"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            events={locFilter==='All' ? events : events.filter((e:any)=> (e.extendedProps?.delivery_location||'')===locFilter)}
            eventContent={renderEvent}
              selectAllow={(info:any)=>{
                const wd = info.start.getDay()
                const hhmm = (d:Date)=> String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')
                const si = hhmm(info.start), ei = hhmm(info.end)
                const overlap = breaks.some(b=> b.weekday===wd && si < b.end && b.start < ei)
                return !overlap
              }}
            selectable
            dateClick={(info:any)=> openNew(info.date)}
            select={(info:any)=>{ const d=(x:Date)=>x.toISOString().slice(0,10); const hm=(x:Date)=>String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0'); openModal({date:d(info.start), start:hm(info.start), end:hm(info.end)}) }}
            height="auto"
          />
        </div>
      </div>

      {/* Modal with form (auto-closes on submit via onSubmitted) */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} title="New Request">
        <div className="space-y-4">
          {/* quick duration chips */}
          <QuickSlotPicker onPick={(mins)=>{
            if (!slot) return
            const base = new Date(`${slot.date}T${slot.start}:00`)
            const e = new Date(base.getTime() + mins*60000)
            setSlot({ ...slot, end: `${pad(e.getHours())}:${pad(e.getMinutes())}` })
          }}/>
          {/* basic slot editors */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="label">Date</div>
              <input className="input" type="date" value={slot?.date||''}
                     onChange={e=> setSlot(v=> v ? { ...v, date:e.target.value } : v)} />
            </div>
            <div>
              <div className="label">Start</div>
              <input className="input" type="time" value={slot?.start||''}
                     onChange={e=> setSlot(v=> v ? { ...v, start:e.target.value } : v)} />
            </div>
            <div>
              <div className="label">End</div>
              <input className="input" type="time" value={slot?.end||''}
                     onChange={e=> setSlot(v=> v ? { ...v, end:e.target.value } : v)} />
            </div>
          </div>

          {/* The actual submit form; it reads from its own fields but will close this modal on success */}
          
        </div>
      </Modal>
    
      {showModal && (
        <Modal title="New Request" onClose={closeModal}>
          
        </Modal>
      )}
</div>
  )
}
