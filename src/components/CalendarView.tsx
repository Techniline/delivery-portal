'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '@/lib/supabaseClient'
import Modal from './Modal'
import RequestForm from './RequestForm'
import { format, parseISO } from 'date-fns'

type Booking = {
  id: number
  origin: 'SHOWROOM_REQUEST'|'WAREHOUSE_BOOKING'
  status: 'PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'
  date: string; start_time: string; end_time: string
  start_ts: string; end_ts: string
  warehouse_id: number; dock_id: number|null
  driver_name?: string|null; driver_photo_url?: string|null
  vehicle_plate?: string|null; vehicle_model?: string|null
  delivery_location?: string|null; notes?: string|null
  creator_user_id: string
}

export default function CalendarView() {
  const s = supabase()
  const calRef = useRef<any>(null)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [biz, setBiz] = useState<any[]>([])
  const [brk, setBrk] = useState<any[]>([])

  const [showModal, setShowModal] = useState(false)
  const [prefill, setPrefill] = useState<{date:string,start:string,end:string} | null>(null)
  const openModal = (slot?:{date:string,start:string,end:string}) => { setPrefill(slot ?? null); setShowModal(true) }
  const closeModal = () => setShowModal(false)

  async function loadAll() {
    const u = await s.auth.getUser()
    const uid = u.data.user?.id
    const [a1,a2,a3] = await Promise.all([
      s.from('bookings').select('*').or(`status.eq.APPROVED,creator_user_id.eq.${uid}`),
      s.from('business_hours').select('*'),
      s.from('business_breaks').select('*')
    ])
    setBookings(a1.data || [])
    setBiz(a2.data || [])
    setBrk(a3.data || [])
  }
  useEffect(()=>{ loadAll() },[])

  const businessHours = useMemo(() => {
    if (!biz?.length) return [{ daysOfWeek:[1,2,3,4,5,6], startTime:'09:00', endTime:'18:00' }]
    const map = new Map<number, {start:string,end:string}>()
    for (const r of biz) {
      const d = Number(r.weekday)
      const st = (r.start_time||'09:00:00').slice(0,5)
      const et = (r.end_time||'18:00:00').slice(0,5)
      map.set(d, { start: st, end: et })
    }
    const out:any[] = []
    for (let d=0; d<7; d++){
      if (map.has(d)) { const { start, end } = map.get(d)!; out.push({ daysOfWeek:[d], startTime:start, endTime:end }) }
    }
    return out.length ? out : [{ daysOfWeek:[1,2,3,4,5,6], startTime:'09:00', endTime:'18:00' }]
  }, [JSON.stringify(biz)])

  const hiddenDays = useMemo(() => {
    const openDays = new Set<number>()
    businessHours.forEach((b:any)=> (b.daysOfWeek||[]).forEach((d:number)=>openDays.add(d)))
    const out:number[] = []
    for (let d=0; d<7; d++) if (!openDays.has(d)) out.push(d)
    return out
  }, [JSON.stringify(businessHours)])

  const slotMinTime = useMemo(() => {
    const mins:number[] = []; businessHours.forEach((b:any)=>{ const [hh,mm]=(b.startTime||'09:00').split(':').map(Number); mins.push(hh*60+mm) })
    if (!mins.length) return '09:00:00'
    const v = Math.min(...mins); const hh=String(Math.floor(v/60)).padStart(2,'0'); const mm=String(v%60).padStart(2,'0'); return `${hh}:${mm}:00`
  }, [JSON.stringify(businessHours)])

  const slotMaxTime = useMemo(() => {
    const mins:number[] = []; businessHours.forEach((b:any)=>{ const [hh,mm]=(b.endTime||'18:00').split(':').map(Number); mins.push(hh*60+mm) })
    if (!mins.length) return '19:00:00'
    const v = Math.max(...mins); const hh=String(Math.floor(v/60)).padStart(2,'0'); const mm=String(v%60).padStart(2,'0'); return `${hh}:${mm}:00`
  }, [JSON.stringify(businessHours)])

  const events = useMemo(() => bookings.map(b => ({
    id: String(b.id),
    title: b.driver_name || (b.origin==='WAREHOUSE_BOOKING' ? 'Warehouse booking' : 'Request'),
    start: b.start_ts, end: b.end_ts, extendedProps: b
  })), [bookings])

  function renderEvent(arg:any){
    const b = arg.event.extendedProps as Booking
    const when = `${format(parseISO(arg.event.startStr),'HH:mm')}–${format(parseISO(arg.event.endStr),'HH:mm')}`
    const title = b.delivery_location || (b.origin==='WAREHOUSE_BOOKING' ? 'Warehouse' : 'Request')
    const driver = b.driver_name || 'Driver'
    const plate = b.vehicle_plate || ''
    const model = b.vehicle_model ? `• ${b.vehicle_model}` : ''
    const loc   = b.delivery_location ? ` • ${b.delivery_location}` : ''
    const status = b.status
    const chip = document.createElement('div')
    chip.className = 'event-chip'
    chip.innerHTML = `
      <div class="stripe" style="background:${status==='APPROVED' ? '#10B981' : status==='REJECTED' ? '#EF4444' : '#9CA3AF'}"></div>
      <div class="avatar">${b.driver_photo_url ? `<img src="${b.driver_photo_url}" alt="driver"/>` : ''}</div>
      <div class="meta">
        <div class="title">${title} • ${when}</div>
        <div class="driver-name">${driver}</div>
        <div class="sub">${plate} ${model} ${loc}</div>
      </div>`
    return { domNodes: [chip] }
  }

  function onSelect(info:any){
    const d = (x:Date)=> x.toISOString().slice(0,10)
    const hm = (x:Date)=> String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')
    openModal({ date: d(info.start), start: hm(info.start), end: hm(info.end) })
  }

  async function handleSubmitted(){
    setShowModal(false)
    await loadAll()
    if (prefill && calRef.current) {
      const api = calRef.current.getApi?.() || calRef.current
      api?.gotoDate?.(prefill.date)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Schedule</h2>
          <button className="btn btn-primary" onClick={()=>openModal(null)}>+ New Request</button>
        </div>
      </div>
      <div className="card-body">
        <div className="rounded-2xl overflow-hidden border" style={{borderColor:'var(--line)'}}>
          <FullCalendar
            ref={(r:any)=> (calRef.current = r)}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left:'', center:'', right:'today prev,next' }}
            nowIndicator
            timeZone="Asia/Dubai"
            selectable
            select={onSelect}
            businessHours={businessHours}
            hiddenDays={hiddenDays.length ? (hiddenDays as any) : undefined}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
            events={events}
            eventContent={renderEvent}
            height="auto"
          />
        </div>
      </div>

      {showModal && (
        <Modal title="New Request" onClose={closeModal}>
          <RequestForm prefill={prefill} onSubmitted={handleSubmitted} />
        </Modal>
      )}
    </div>
  )
}
