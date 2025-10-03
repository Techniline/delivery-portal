'use client'
import { useEffect, useState } from 'react'

type Holiday = {
  id:number
  warehouse_id:number
  start_date:string
  end_date:string
  is_closed:boolean
  reason:string|null
}

export default function HolidaysPanel(){
  const [rows, setRows] = useState<Holiday[]>([])
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [closed, setClosed] = useState<boolean>(true)
  const [reason, setReason] = useState<string>('')

  async function load(){
    const r = await fetch('/api/admin/holidays', { cache:'no-store' })
    const data = await r.json()
    setRows(Array.isArray(data)? data : [])
  }
  useEffect(()=>{ load() },[])

  async function add(){
    if(!start) return alert('Pick start date')
    const payload = { start_date:start, end_date: end || start, is_closed:closed, reason: reason||null }
    const r = await fetch('/api/admin/holidays', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    })
    if(!r.ok){ const e = await r.json().catch(()=>({error:'Failed'})); return alert(e.error||'Failed') }
    setStart(''); setEnd(''); setClosed(true); setReason('')
    load()
  }
  async function del(id:number){
    const r = await fetch(`/api/admin/holidays?id=${id}`, { method:'DELETE' })
    if(!r.ok){ const e = await r.json().catch(()=>({error:'Failed'})); return alert(e.error||'Failed') }
    load()
  }

  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">Holidays & Special Closures</h3></div>
      <div className="card-body">
        <div className="grid gap-3 md:grid-cols-5 items-end">
          <div className="col-span-1">
            <label className="lbl">Start</label>
            <input type="date" className="inp" value={start} onChange={e=>setStart(e.target.value)} />
          </div>
          <div className="col-span-1">
            <label className="lbl">End (optional)</label>
            <input type="date" className="inp" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
          <div className="col-span-1">
            <label className="lbl">Closed?</label>
            <select className="inp" value={closed? '1':'0'} onChange={e=>setClosed(e.target.value==='1')}>
              <option value="1">Closed</option>
              <option value="0">Open (annotate only)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="lbl">Reason</label>
            <input className="inp" placeholder="Eid holiday, stock take, etc." value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
          <div className="col-span-5">
            <button className="btn-primary" onClick={add}>Add</button>
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Dates</th>
                <th className="py-2">Closed</th>
                <th className="py-2">Reason</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.start_date}{r.end_date!==r.start_date ? ` → ${r.end_date}`:''}</td>
                  <td className="py-2">{r.is_closed ? 'Yes':'No'}</td>
                  <td className="py-2">{r.reason||'-'}</td>
                  <td className="py-2 text-right">
                    <button className="btn-outline" onClick={()=>del(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-500">No holidays added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
