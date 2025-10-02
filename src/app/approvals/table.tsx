'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Booking } from '@/lib/types'

export default function ApprovalsTable() {
  const [rows, setRows] = useState<Booking[]>([])
  const s = supabase()
  const load = async () => {
    const { data } = await s.from('bookings').select()
      .eq('origin','SHOWROOM_REQUEST').eq('status','PENDING')
      .order('start_ts', { ascending: true })
    setRows(data || [])
  }
  useEffect(() => {
    load()
    const ch = s.channel('approvals').on('postgres_changes', { event:'*', schema:'public', table:'bookings' }, () => load()).subscribe()
    return () => { s.removeChannel(ch) }
  }, [])
  const earliestId = useMemo(() => rows[0]?.id ?? null, [rows])

  const approve = async (id: number) => {
    const { error } = await s.rpc('approve_booking', { p_booking_id: id, p_comment: null })
    if (error) alert(error.message)
  }
  const reject = async (id: number) => {
    const reason = prompt('Reason?') || null
    const { error } = await s.rpc('reject_booking', { p_booking_id: id, p_comment: reason })
    if (error) alert(error.message)
  }
  const nudge = () => alert('First-come, first-served:\nPlease process the earliest pending request before this one.')

  return (
    <div className="card">
      <div className="card-header">
        <div className="font-medium">Pending Requests (FCFS)</div>
        <div className="text-sm text-neutral-600">Approve/reject the topmost item first.</div>
      </div>
      <div className="card-body overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2">Warehouse/Dock</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isEarliest = r.id === earliestId
              return (
                <tr key={r.id} className={`border-t ${!isEarliest ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2">{r.date}  {r.start_time.slice(0,5)}{r.end_time.slice(0,5)}</td>
                  <td className="px-3 py-2 text-center">W#{r.warehouse_id}{r.dock_id?`/D${r.dock_id}`:''}</td>
                  <td className="px-3 py-2 text-center">{r.delivery_location ?? '-'}</td>
                  <td className="px-3 py-2 text-right">
                    {isEarliest ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>approve(r.id)} className="btn btn-success">Approve</button>
                        <button onClick={()=>reject(r.id)} className="btn btn-danger">Reject</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button onClick={nudge} className="btn btn-outline" title="Process earliest first">Approve</button>
                        <button onClick={nudge} className="btn btn-outline" title="Process earliest first">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {!rows.length && <tr><td className="px-3 py-4 text-neutral-500" colSpan={4}>No pending requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
