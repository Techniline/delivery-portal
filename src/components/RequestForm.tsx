'use client'
import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const LOCATIONS = [
  'Al Shoala Showroom',
  'MusicMajlis',
  'Amazon Delivery',
  'B2B',
  'Soundline Main',
  'Other Delivery',
  'Showroom Delivery',
]

type Props = {
  defaultWarehouseId?: number
  initialDate?: string  // 'YYYY-MM-DD'
  initialStart?: string // 'HH:mm'
  initialEnd?: string   // 'HH:mm'
  onSubmitted?: () => void
}

export default function RequestForm({
  defaultWarehouseId = 1,
  initialDate,
  initialStart,
  initialEnd,
  onSubmitted,
}: Props) {
  // form state
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10))
  const [start, setStart] = useState(initialStart ?? '10:00')
  const [end, setEnd] = useState(initialEnd ?? '11:00')
  const [warehouseId, setWarehouseId] = useState<number>(defaultWarehouseId)
  const [dockId, setDockId] = useState<number | ''>('')
  const [location, setLocation] = useState<string>(LOCATIONS[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // quick duration buttons
  const durations = [30, 60, 90, 120]
  const timeOk = useMemo(() => {
    return /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end) && end > start
  }, [start, end])

  function applyDuration(mins: number) {
    if (!/^\d{2}:\d{2}$/.test(start)) return
    const [h, m] = start.split(':').map(Number)
    const t = h * 60 + m + mins
    const eh = Math.floor(t / 60)
    const em = t % 60
    setEnd(String(eh).padStart(2, '0') + ':' + String(em).padStart(2, '0'))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!timeOk) return
    setSubmitting(true)
    try {
      const s = supabase()
      const payload = {
        origin: 'SHOWROOM_REQUEST',
        status: 'PENDING',
        date,
        start_time: start + ':00',
        end_time: end + ':00',
        start_ts: `${date}T${start}:00+04:00`,
        end_ts: `${date}T${end}:00+04:00`,
        warehouse_id: warehouseId,
        dock_id: dockId === '' ? null : Number(dockId),
        delivery_location: location,
        notes,
      }
      const { error } = await s.from('bookings').insert(payload)
      if (error) throw error
      // toast-lite
      try { (window as any).alert?.('Request submitted') } catch {}
      onSubmitted?.() // <-- closes the modal
    } catch (err: any) {
      alert(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {durations.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => applyDuration(d)}
            className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
          >
            {d}m
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2">
          <div className="text-xs mb-1">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label>
          <div className="text-xs mb-1">Start</div>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label>
          <div className="text-xs mb-1">End</div>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label>
          <div className="text-xs mb-1">Warehouse</div>
          <input
            type="number"
            min={1}
            value={warehouseId}
            onChange={(e) => setWarehouseId(Number(e.target.value || 1))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label>
          <div className="text-xs mb-1">Dock (optional)</div>
          <input
            placeholder="e.g. 1"
            value={dockId}
            onChange={(e) => setDockId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="col-span-2">
          <div className="text-xs mb-1">Location</div>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="col-span-2">
          <div className="text-xs mb-1">Notes</div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Anything the warehouse should know..."
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-xs ${timeOk ? 'text-emerald-600' : 'text-red-600'}`}>
          {timeOk ? 'Time OK' : 'End must be after Start'}
        </div>
        <button
          disabled={submitting || !timeOk}
          className={`rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 ${
            submitting || !timeOk ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Requesting…' : 'Request Slot'}
        </button>
      </div>
    </form>
  )
}
