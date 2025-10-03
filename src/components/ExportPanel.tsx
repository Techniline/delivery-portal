'use client'
import { useState } from 'react'
export default function ExportPanel(){
  const [from,setFrom]=useState(''); const [to,setTo]=useState('')
  const go=()=>{ if(!from||!to) return; window.location.href=`/api/admin/export?from=${from}&to=${to}` }
  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">Export CSV</h3></div>
      <div className="card-body flex items-center gap-3">
        <input className="border rounded-xl px-3 py-2" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <span>to</span>
        <input className="border rounded-xl px-3 py-2" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={go}>Download</button>
      </div>
    </div>
  )
}
