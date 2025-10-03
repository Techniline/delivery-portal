'use client'
import AdminGate from '@/components/AdminGate'
import FleetPanel from '@/components/FleetPanel'
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
function UsersPanel(){
  const [users,setUsers]=useState<User[]>([])
  const [email,setEmail]=useState('')
  const [role,setRole]=useState('SHOWROOM_MANAGER')
  const [name,setName]=useState('')
  const [busy,setBusy]=useState(false)

  async function load(){
    const r = await fetch('/api/admin/users').then(r=>r.json())
    setUsers(r.users||[])
  }
  useEffect(()=>{ load() },[])

  async function invite(){
    if(!email) return
    setBusy(true)
    const r = await fetch('/api/admin/users', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, role, full_name:name })
    }).then(r=>r.json())
    setBusy(false)
    if (r.error) return alert(r.error)
    setEmail(''); setName(''); load()
  }

  async function setUserRole(id:string, role:string){
    const r = await fetch(`/api/admin/users/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ role })
    }).then(r=>r.json())
    if (r.error) alert(r.error); else load()
  }

  async function del(id:string){
    if (!confirm('Delete user?')) return
    const r = await fetch(`/api/admin/users/${id}`, { method:'DELETE' }).then(r=>r.json())
    if (r.error) alert(r.error); else load()
  }

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Users</div></div>
      <div className="panel-body grid gap-4">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="email@domain" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
          <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
            <option>SHOWROOM_MANAGER</option>
            <option>WAREHOUSE_MANAGER</option>
            <option>ADMIN</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={busy || !email} onClick={invite}>
            {busy? 'Inviting…' : 'Invite user'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{borderColor:'var(--line)'}}>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} className="border-b last:border-0" style={{borderColor:'var(--line)'}}>
                  <td className="py-3 pr-3">{u.email ?? '—'}</td>
                  <td className="py-3 pr-3">
                    <select className="input" defaultValue="SHOWROOM_MANAGER" onChange={e=>setUserRole(u.id, e.target.value)}>
                      <option>SHOWROOM_MANAGER</option>
                      <option>WAREHOUSE_MANAGER</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button className="btn btn-outline" onClick={()=>del(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length===0 && (
                <tr><td colSpan={3} className="py-6 text-center text-neutral-500">No users.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========= Business Hours ========= */
function HoursPanel(){
  const [rows,setRows]=useState<Hours[]>([])
  const [wh,setWh]=useState(1)
  const [weekday,setWeekday]=useState(1)
  const [open,setOpen]=useState('08:00')
  const [close,setClose]=useState('18:00')

  async function load(){
    const r=await fetch('/api/admin/hours').then(r=>r.json())
    setRows(r.data||[])
  }
  useEffect(()=>{ load() },[])

  async function save(){
    const r=await fetch('/api/admin/hours',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ warehouse_id:wh, weekday, open_time:open+':00', close_time:close+':00' })
    }).then(r=>r.json())
    if(r.error) alert(r.error); else load()
  }
  async function removeRow(w:number,d:number){
    const r=await fetch('/api/admin/hours',{
      method:'DELETE',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ warehouse_id:w, weekday:d })
    }).then(r=>r.json())
    if(r.error) alert(r.error); else load()
  }

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Business Hours</div></div>
      <div className="panel-body grid gap-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input className="input" type="number" value={wh} onChange={e=>setWh(Number(e.target.value))} placeholder="Warehouse"/>
          <select className="input" value={weekday} onChange={e=>setWeekday(Number(e.target.value))}>
            <option value={1}>Mon</option><option value={2}>Tue</option><option value={3}>Wed</option>
            <option value={4}>Thu</option><option value={5}>Fri</option><option value={6}>Sat</option><option value={0}>Sun</option>
          </select>
          <input className="input" type="time" value={open} onChange={e=>setOpen(e.target.value)}/>
          <input className="input" type="time" value={close} onChange={e=>setClose(e.target.value)}/>
        </div>
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{borderColor:'var(--line)'}}>
                <th className="py-2 pr-3">WH</th>
                <th className="py-2 pr-3">Day</th>
                <th className="py-2 pr-3">Open</th>
                <th className="py-2 pr-3">Close</th>
                <th className="py-2 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={`${r.warehouse_id}-${r.weekday}`} className="border-b last:border-0" style={{borderColor:'var(--line)'}}>
                  <td className="py-3 pr-3">W#{r.warehouse_id}</td>
                  <td className="py-3 pr-3">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][r.weekday]}</td>
                  <td className="py-3 pr-3">{r.open_time.slice(0,5)}</td>
                  <td className="py-3 pr-3">{r.close_time.slice(0,5)}</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="btn btn-outline" onClick={()=>removeRow(r.warehouse_id, r.weekday)}>Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No rows.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========= Breaks ========= */
function BreaksPanel(){
  const [rows,setRows]=useState<Break[]>([])
  const [wh,setWh]=useState(1)
  const [weekday,setWeekday]=useState(1)
  const [start,setStart]=useState('13:00')
  const [end,setEnd]=useState('14:00')

  async function load(){
    const r=await fetch('/api/admin/breaks').then(r=>r.json())
    setRows(r.data||[])
  }
  useEffect(()=>{ load() },[])

  async function save(){
    const r=await fetch('/api/admin/breaks',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ warehouse_id:wh, weekday, start_time:start+':00', end_time:end+':00' })
    }).then(r=>r.json())
    if(r.error) alert(r.error); else load()
  }
  async function removeRow(id:number){
    const r=await fetch('/api/admin/breaks',{
      method:'DELETE',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id })
    }).then(r=>r.json())
    if(r.error) alert(r.error); else load()
  }

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Breaks</div></div>
      <div className="panel-body grid gap-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input className="input" type="number" value={wh} onChange={e=>setWh(Number(e.target.value))} placeholder="Warehouse"/>
          <select className="input" value={weekday} onChange={e=>setWeekday(Number(e.target.value))}>
            <option value={1}>Mon</option><option value={2}>Tue</option><option value={3}>Wed</option>
            <option value={4}>Thu</option><option value={5}>Fri</option><option value={6}>Sat</option><option value={0}>Sun</option>
          </select>
          <input className="input" type="time" value={start} onChange={e=>setStart(e.target.value)}/>
          <input className="input" type="time" value={end} onChange={e=>setEnd(e.target.value)}/>
        </div>
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{borderColor:'var(--line)'}}>
                <th className="py-2 pr-3">WH</th>
                <th className="py-2 pr-3">Day</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">End</th>
                <th className="py-2 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-b last:border-0" style={{borderColor:'var(--line)'}}>
                  <td className="py-3 pr-3">W#{r.warehouse_id}</td>
                  <td className="py-3 pr-3">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][r.weekday]}</td>
                  <td className="py-3 pr-3">{r.start_time.slice(0,5)}</td>
                  <td className="py-3 pr-3">{r.end_time.slice(0,5)}</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="btn btn-outline" onClick={()=>removeRow(r.id!)}>Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No rows.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

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
