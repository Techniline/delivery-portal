'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WarehouseBookingForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [start, setStart] = useState('12:00'); const [end, setEnd] = useState('13:00')
  const [warehouseId, setWarehouseId] = useState(1)
  const [dockId, setDockId] = useState<number | undefined>(undefined)
  const [vehicle, setVehicle] = useState(''); const [driver, setDriver] = useState('')
  const s = supabase()

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: user } = await s.auth.getUser()
    const uid = user.user?.id; if (!uid) return
    const { error } = await s.from('bookings').insert({
      origin:'WAREHOUSE_BOOKING', status:'APPROVED', creator_user_id: uid,
      warehouse_id: warehouseId, dock_id: dockId ?? null,
      date, start_time: `${start}:00`, end_time: `${end}:00`,
      vehicle_plate: vehicle || null, driver_name: driver || null
    })
    if (error) alert(error.message); else alert('Booking created.')
  }

  return (
    <form onSubmit={createBooking} className="card">
      <div className="card-header"><h2 className="font-semibold">Warehouse Direct Booking</h2></div>
      <div className="card-body grid grid-cols-2 gap-4">
        <div><label className="block text-sm">Date</label><input type="date" className="w-full border rounded-lg px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-sm">Start</label><input type="time" className="w-full border rounded-lg px-3 py-2" value={start} onChange={e=>setStart(e.target.value)} /></div>
          <div><label className="block text-sm">End</label><input type="time" className="w-full border rounded-lg px-3 py-2" value={end} onChange={e=>setEnd(e.target.value)} /></div>
        </div>
        <div><label className="block text-sm">Warehouse ID</label><input type="number" className="w-full border rounded-lg px-3 py-2" value={warehouseId} onChange={e=>setWarehouseId(Number(e.target.value))} /></div>
        <div><label className="block text-sm">Dock ID (opt)</label><input type="number" className="w-full border rounded-lg px-3 py-2" value={dockId ?? ''} onChange={e=>setDockId(e.target.value?Number(e.target.value):undefined)} /></div>
        <div><label className="block text-sm">Vehicle</label><input className="w-full border rounded-lg px-3 py-2" value={vehicle} onChange={e=>setVehicle(e.target.value)} /></div>
        <div><label className="block text-sm">Driver</label><input className="w-full border rounded-lg px-3 py-2" value={driver} onChange={e=>setDriver(e.target.value)} /></div>
        <div className="col-span-2"><button className="btn btn-primary">Create Booking</button></div>
      </div>
    </form>
  )
}
