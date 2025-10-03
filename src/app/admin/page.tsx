'use client'
import AdminGate from '@/components/AdminGate'
import FleetPanel from '@/components/FleetPanel'
import UsersPanel from '@/components/UsersPanel'
import HoursPanel from '@/components/HoursPanel'
import BreaksPanel from '@/components/BreaksPanel'
import HolidaysPanel from '@/components/HolidaysPanel'
import { useEffect, useState } from 'react'

import { useEffect, useState } from 'react'
type User = { id:string; email?:string|null }
type Hours = { warehouse_id:number; weekday:number; open_time:string; close_time:string }
type Break = { id?:number; warehouse_id:number; weekday:number; start_time:string; end_time:string }

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="grid gap-6">
        <FleetPanel/>
        <UsersPanel/>
        <HoursPanel/>
        <BreaksPanel/>
        <ExportPanel/>
      </div>
    </AdminGate>
  )
}

/* ========= Users ========= */
/* ========= Business Hours ========= */
/* ========= Breaks ========= */
/* ========= Export ========= */
function ExportPanel(){
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  async function download(){
    if(!from||!to) return alert('Pick a date range')
    const r = await fetch('/api/admin/export',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({from, to})
    })
    const csv = await r.text()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}))
    a.download = `bookings_${from}_${to}.csv`
    a.click()
  }
  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Export</div></div>
      <div className="panel-body grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-neutral-600">From</label>
          <input type="datetime-local" className="input" value={from} onChange={e=>setFrom(e.target.value)}/>
        </div>
        <div>
          <label className="text-sm text-neutral-600">To</label>
          <input type="datetime-local" className="input" value={to} onChange={e=>setTo(e.target.value)}/>
        </div>
        <div className="flex items-end justify-end">
          <button className="btn btn-primary" onClick={download}>Download CSV</button>
        </div>
      </div>
    </div>
  )
}