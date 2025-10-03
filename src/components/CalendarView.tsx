'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from './Modal'
import RequestForm from './RequestForm'

type BizHour = {
  weekday: number        // 0..6 (Sun..Sat)
  open_time?: string     // "HH:MM:SS"
  close_time?: string    // "HH:MM:SS"
  openTime?: string
  closeTime?: string
  warehouse_id?: number
}

function parseHM(t?: string): { h: number, m: number } | null {
  if (!t) return null
  const m = t.match(/^(\d{2}):(\d{2})/)
  if (!m) return null
  return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) }
}


  // listen for top legend chip filter
  const [activeLocations, setActiveLocations] = useState<string[]|null>(null)
  useEffect(()=>{
    const on = (e:any)=> setActiveLocations(e.detail || [])
    window.addEventListener('location-filter', on as any)
    return ()=> window.removeEventListener('location-filter', on as any)
  },[])

const [holidays, setHolidays] = useState<any[]>([])

export default function CalendarView() {
  const calRef = useRef<any>(null)

  // Data
  const [events, setEvents] = useState<any[]>([])
  const [businessHours, setBusinessHours] = useState<BizHour[]>([])

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [prefill, setPrefill] = useState<{date:string,start:string,end:string}|null>(null)
  const openModal = (slot?: {date:string,start:string,end:string}) => {
    setPrefill(slot ?? null)
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  // Load business hours (server can later wire this to Supabase; compiles either way)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/hours').catch(() => null)
        if (!res?.ok) { if (alive) setBusinessHours([]); return }
        const data = await res.json()
        if (alive) setBusinessHours(Array.isArray(data) ? data : [])
      } catch {
        if (alive) setBusinessHours([])
      }
    })()
    return () => { alive = false }
  }, [])

  // ---- Derived: hiddenDays (fully closed) ----
  const hiddenDays: number[] = useMemo(() => {
    try {
      if (!businessHours.length) return []
      const seen = new Set<number>()
      const open = new Set<number>()
      for (const r of businessHours) {
        const wd = Number(r.weekday)
        if (Number.isFinite(wd)) {
          seen.add(wd)
          const o = r.open_time || r.openTime
          const c = r.close_time || r.closeTime
          if (o && c) open.add(wd)
        }
      }
      const out: number[] = []
      for (let d = 0; d < 7; d++) if (seen.has(d) && !open.has(d)) out.push(d)
      return out
    } catch { return [] }
  }, [JSON.stringify(businessHours)])

  // ---- Derived: slotMinTime / slotMaxTime from hours ----
  const slotMinTime: string = useMemo(() => {
    try {
      const vals: number[] = []
      for (const r of businessHours) {
        const hm = parseHM((r.open_time || r.openTime) ?? '')
        if (hm) vals.push(hm.h * 60 + hm.m)
      }
      if (!vals.length) return '08:00:00'
      const v = Math.min(...vals)
      const hh = String(Math.floor(v / 60)).padStart(2, '0')
      const mm = String(v % 60).padStart(2, '0')
      return `${hh}:${mm}:00`
    } catch { return '08:00:00' }
  }, [JSON.stringify(businessHours)])

  const slotMaxTime: string = useMemo(() => {
    try {
      const vals: number[] = []
      for (const r of businessHours) {
        const hm = parseHM((r.close_time || r.closeTime) ?? '')
        if (hm) vals.push(hm.h * 60 + hm.m)
      }
      if (!vals.length) return '19:00:00'
      const v = Math.max(...vals)
      const hh = String(Math.floor(v / 60)).padStart(2, '0')
      const mm = String(v % 60).padStart(2, '0')
      return `${hh}:${mm}:00`
    } catch { return '19:00:00' }
  }, [JSON.stringify(businessHours)])

  // ---- Render event pill (safe DOM) ----
  function renderEvent(arg: any) {
    const s = arg.event.extendedProps || {}
    const when = `${arg.timeText}`
    const driver = s.driver_name || s.driverName || ''
    const veh = [s.vehicle_plate, s.vehicle_model].filter(Boolean).join(' · ')
    const loc = s.delivery_location || ''

    const chip = document.createElement('div')
    chip.className = 'event-chip'
    chip.style.display = 'flex'
    chip.style.alignItems = 'center'
    chip.style.gap = '10px'
    chip.style.padding = '8px 10px'
    chip.style.borderRadius = '999px'
    chip.style.border = '1px solid var(--line)'
    chip.style.background = '#fff'
    chip.style.boxShadow = '0 1px 0 rgba(16,24,40,.04)'

    const left = document.createElement('div')
    left.style.display = 'flex'
    left.style.flexDirection = 'column'
    left.style.gap = '4px'
    left.style.minWidth = '0'

    const t1 = document.createElement('div')
    t1.className = 'title'
    t1.textContent = when
    t1.style.fontWeight = '800'
    t1.style.fontSize = '13px'

    const t2 = document.createElement('div')
    t2.className = 'driver-name'
    t2.textContent = driver || arg.event.title || ''
    t2.style.fontWeight = '800'
    t2.style.fontSize = '12px'

    const t3 = document.createElement('div')
    t3.className = 'sub'
    t3.style.display = 'flex'
    t3.style.flexWrap = 'wrap'
    t3.style.gap = '6px'
    t3.style.fontSize = '12px'
    if (veh) {
      const p = document.createElement('span')
      p.textContent = veh
      p.style.padding = '2px 8px'
      p.style.border = '1px solid var(--line)'
      p.style.borderRadius = '999px'
      p.style.background = '#F3F4F6'
      p.style.fontWeight = '700'
      t3.appendChild(p)
    }
    if (loc) {
      const p = document.createElement('span')
      p.textContent = String(loc)
      p.style.padding = '2px 8px'
      p.style.borderRadius = '999px'
      p.style.background = '#2563EB'
      p.style.color = '#fff'
      p.style.fontWeight = '800'
      t3.appendChild(p)
    }

    left.appendChild(t1)
    left.appendChild(t2)
    left.appendChild(t3)
    chip.appendChild(left)

    return { domNodes: [chip] }
  }

  // ---- Selection opens modal with slot prefilled ----
  function onSelect(info: any) {
    const d = (x: Date) => x.toISOString().slice(0, 10)
    const hm = (x: Date) =>
      String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0')
    openModal({ date: d(info.start), start: hm(info.start), end: hm(info.end) })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold">Schedule</h2>
      </div>
      <div className="card-body">
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
          <FullCalendar
              eventDidMount={(info:any)=>{
                try{const loc=(info.event.extendedProps?.delivery_location||'').toString(); const list=activeLocations||[]; if(list.length && (!loc || !list.includes(loc))){ info.el.style.display='none'; return; }}catch{}
              }}
            ref={(r: any) => (calRef.current = r)}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: '', center: '', right: '' }}
            timeZone="Asia/Dubai"
            selectable
              selectAllow={(info:any)=>{
                const d = info.start
                const iso = d.toISOString().slice(0,10)
                // holiday block
                const hit = (holidays||[]).some((h:any)=> iso >= h.start_date && iso <= h.end_date && h.is_closed)
                if (hit) return false
                return true
              }}
            selectMirror
            select={onSelect}
            eventSources={[
                { events },
                { events: (fetchInfo: any, success: any)=>{
                    const out = (holidays||[]).map((h:any)=>({
                      start: h.start_date,
                      end: (new Date(new Date(h.end_date).getTime()+24*3600*1000)).toISOString().slice(0,10),
                      display: 'background', className: 'holiday-bg'
                    })); success(out)
                  } }
              ]}
            eventContent={renderEvent}
            businessHours={businessHours as any}
            hiddenDays={hiddenDays.length ? (hiddenDays as any) : undefined}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
            height="auto"
          />
        </div>
      </div>

      {showModal && (
        <Modal title="New Request" onClose={closeModal}>
          <RequestForm
            defaultWarehouseId={1}
            onSubmitted={closeModal}
            {...(prefill ? { defaultDate: prefill.date, defaultStart: prefill.start, defaultEnd: prefill.end } : {})}
          />
        </Modal>
      )}
    </div>
  )
}
