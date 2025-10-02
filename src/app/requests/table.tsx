'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Booking } from '@/lib/types'

export default function RequestsTable() {
  const [rows, setRows] = useState<Booking[]>([])
  const s = supabase()
  const load = async () => {
    const { data: user } = await s.auth.getUser()
    const uid = user.user?.id; if (!uid) return
    const { data } = await s.from('bookings').select().eq('creator_user_id', uid).order('created_at', { ascending: false })
    setRows(data || [])
  }
  useEffect(() => {
    load()
    const ch = s.channel('reqs').on('postgres_changes', { event:'*', schema:'public', table:'bookings' }, () => load()).subscribe()
    return () => { s.removeChannel(ch) }
  }, [])
  const cancel = async (id: number) => {
    const { error } = await s.from('bookings').update({ status: 'CANCELLED' }).eq('id', id)
    if (error) alert(error.message)
  }
  return (
    <div className="card">
      <div className="card-header"><h2 className="font-semibold">My Requests</h2></div>
      <div className="card-body overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2">Warehouse/Dock</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.date}  {r.start_time.slice(0,5)}{r.end_time.slice(0,5)}</td>
                <td className="px-3 py-2 text-center">W#{r.warehouse_id}{r.dock_id?`/D${r.dock_id}`:''}</td>
                <td className="px-3 py-2 text-center">{r.status}</td>
                <td className="px-3 py-2 text-right">
                  {['PENDING','APPROVED'].includes(r.status) && <button onClick={()=>cancel(r.id)} className="btn btn-outline">Cancel</button>}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="px-3 py-4 text-neutral-500" colSpan={4}>No requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
