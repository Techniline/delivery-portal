'use client'
import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'

const LOCATIONS = [
  'Al Shoala Showroom',
  'MusicMajlis',
  'Amazon Delivery',
  'B2B',
  'Soundline Main',
  'Other Delivery',
  'Showroom Delivery',
] as const

type Props = {
  defaultWarehouseId?: number
  prefill?: { date: string; start: string; end: string } | null
  onSubmitted?: () => void
}
export default function RequestForm({ defaultWarehouseId = 1, prefill, onSubmitted }: Props) {
  const today = new Date().toISOString().slice(0,10)
  const [date, setDate] = useState(prefill?.date ?? today)
  const [start, setStart] = useState(prefill?.start ?? '10:00')
  const [end, setEnd] = useState(prefill?.end ?? '11:00')
  const [warehouseId, setWarehouseId] = useState<number>(defaultWarehouseId)
  const [dockId, setDockId] = useState<number | undefined>()
  const [deliveryLocation, setDeliveryLocation] = useState<string>(LOCATIONS[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const timeOk = useMemo(() => start < end, [start, end])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!timeOk || submitting) return
    setSubmitting(true)
    try {
      const s = supabase()
      // we rely on RLS: creator_user_id must match auth.uid(), status must be PENDING, origin SHOWROOM_REQUEST
      const start_ts = `${date}T${start}:00+04:00`
      const end_ts   = `${date}T${end}:00+04:00`
      const payload = {
        origin: 'SHOWROOM_REQUEST',
        status: 'PENDING',
        date, start_time: `${start}:00`, end_time: `${end}:00`,
        start_ts, end_ts,
        warehouse_id: warehouseId,
        dock_id: dockId ?? null,
        delivery_location: deliveryLocation,
        notes
      }
      const { error } = await s.from('bookings').insert(payload)
      if (error) throw error
      onSubmitted?.()
    } catch (err:any) {
      alert(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Date</span>
          <input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Start</span>
            <input type="time" className="input" value={start} onChange={e=>setStart(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">End</span>
            <input type="time" className="input" value={end} onChange={e=>setEnd(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Warehouse</span>
          <input type="number" className="input" value={warehouseId} onChange={e=>setWarehouseId(parseInt(e.target.value||'1',10))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Dock (optional)</span>
          <input type="number" className="input" value={dockId ?? ''} onChange={e=>setDockId(e.target.value ? parseInt(e.target.value,10) : undefined)} />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Delivery location</span>
        <select className="input" value={deliveryLocation} onChange={e=>setDeliveryLocation(e.target.value)}>
          {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Notes</span>
        <textarea className="input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
      </label>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="submit" disabled={submitting || !timeOk} className={`btn btn-primary ${submitting ? 'opacity-60 cursor-not-allowed':''}`}>
          {submitting ? 'Requesting…' : 'Request Slot'}
        </button>
      </div>
    </form>
  )
}
