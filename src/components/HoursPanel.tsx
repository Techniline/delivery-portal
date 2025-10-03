'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Hours = { id:number; warehouse_id:number; weekday:number; open_time:string; close_time:string; closed:boolean }

export default function HoursPanel(){
  const s = supabase()
  const [rows,setRows] = useState<Hours[]>([])
  async function load(){ const { data } = await s.from('business_hours').select('*').order('warehouse_id').order('weekday'); setRows(data||[]) }
  useEffect(()=>{ load() },[])
  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">Business Hours</h3></div>
      <div className="card-body">
        {rows.length===0 ? 'No rows' : (
          <table className="w-full text-sm">
            <thead><tr><th>WH</th><th>Day</th><th>Open</th><th>Close</th><th>Closed</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.warehouse_id}</td><td>{r.weekday}</td><td>{r.open_time}</td><td>{r.close_time}</td><td>{r.closed?'Yes':'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
