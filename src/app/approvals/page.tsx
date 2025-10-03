'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

type Row = {
  id:number; creator_user_id:string; date:string; start_time:string; end_time:string;
  warehouse_id:number; dock_id:number|null; status:string; delivery_location:string|null;
  driver_photo_url:string|null; driver_name:string|null; vehicle_plate:string|null;
  created_at:string;
}

export default function ApprovalsPage() {
  const s = supabase()
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState<number|null>(null)

  async function load() {
    // PENDING showroom requests first
    const { data } = await s.from('bookings')
      .select('*')
      .in('status',['PENDING'])
      .order('created_at', { ascending: true })
    setRows(data||[])
  }
  useEffect(()=>{ load() }, [])

  async function update(id:number, status:'APPROVED'|'REJECTED') {
    setBusy(id)
    try {
      // Enforced by SQL trigger/policy: first pending must be decided before next
      const { error } = await s.from('bookings').update({ status }).eq('id', id)
      if (error) return alert(error.message)
      await load()
    } finally { setBusy(null) }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">Approvals</div>
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
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const when = `${format(new Date(`${r.date}T${r.start_time}`), 'dd MMM yyyy, HH:mm')}–${r.end_time.slice(0,5)}`
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
                    <td className="py-3 pr-3">{r.delivery_location ?? '—'}</td>
                    <td className="py-3 pr-3"><span className="tag pending">PENDING</span></td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-outline" disabled={busy===r.id} onClick={()=>update(r.id,'REJECTED')}>
                          {busy===r.id? '…' : 'Reject'}
                        </button>
                        <button className="btn btn-primary" disabled={busy===r.id} onClick={()=>update(r.id,'APPROVED')}>
                          {busy===r.id? '…' : 'Approve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length===0 && (
                <tr><td colSpan={7} className="py-6 text-center text-neutral-500">No pending requests 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
