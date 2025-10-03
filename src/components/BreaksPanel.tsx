'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
type Break = { id:number; warehouse_id:number; weekday:number; start_time:string; end_time:string }
export default function BreaksPanel(){
  const s = supabase()
  const [rows,setRows] = useState<Break[]>([])
  async function load(){ const { data } = await s.from('breaks').select('*').order('warehouse_id').order('weekday'); setRows(data||[]) }
  useEffect(()=>{ load() },[])
  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">Breaks</h3></div>
      <div className="card-body">
        {rows.length===0 ? 'No rows' : (
          <table className="w-full text-sm">
            <thead><tr><th>WH</th><th>Day</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.warehouse_id}</td><td>{r.weekday}</td><td>{r.start_time}</td><td>{r.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
