'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

type Row = {
  id:number; date:string; start_time:string; end_time:string;
  warehouse_id:number; dock_id:number|null; status:string;
  driver_photo_url:string|null; driver_name:string|null; vehicle_plate:string|null;
}

export default function RequestsPage() {
  const s = supabase()
  const [rows, setRows] = useState<Row[]>([])
  const [busyCancel, setBusyCancel] = useState<number|null>(null)

  async function load() {
    const { data:u } = await s.auth.getUser()
    const uid = u.user?.id
    if (!uid) return
    const { data } = await s.from('bookings')
      .select('id,date,start_time,end_time,warehouse_id,dock_id,status,driver_photo_url,driver_name,vehicle_plate')
      .eq('creator_user_id', uid)
      .order('date, start_time')
    setRows(data||[])
  }
  useEffect(()=>{ load() }, [])

  async function cancel(id:number) {
    setBusyCancel(id)
    try {
      const { error } = await s.from('bookings').update({ status:'CANCELLED' }).eq('id', id)
      if (error) return alert(error.message)
      await load()
    } finally { setBusyCancel(null) }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">My Requests</div>
        <a href="/" className="btn btn-outline">Back to calendar</a>
      </div>
      <div className="panel-body">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{borderColor:'var(--line)'}}>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Warehouse/Dock</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Vehicle</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const when = `${format(new Date(`${r.date}T${r.start_time}`), 'dd MMM yyyy, HH:mm')}–${r.end_time.slice(0,5)}`
                const tag = r.status.toLowerCase()
                return (
                  <tr key={r.id} className="border-b last:border-0" style={{borderColor:'var(--line)'}}>
                    <td className="py-3 pr-3">{when}</td>
                    <td className="py-3 pr-3">W#{r.warehouse_id}{r.dock_id ? ` / Dock ${r.dock_id}` : ''}</td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-2">
                        {r.driver_photo_url ? <img className="avatar" src={r.driver_photo_url} alt="d"/> : <span className="avatar" />}
                        {r.driver_name ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-3">{r.vehicle_plate ?? '—'}</td>
                    <td className="py-3 pr-3">
                      <span className={`tag ${tag}`}>{r.status}</span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        onClick={()=>cancel(r.id)}
                        disabled={busyCancel===r.id || r.status==='CANCELLED'}
                        className="btn btn-outline"
                      >
                        {busyCancel===r.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {rows.length===0 && (
                <tr><td colSpan={6} className="py-6 text-center text-neutral-500">No requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
