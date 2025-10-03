'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Profile = { user_id:string; email?:string|null; role?:string|null }

export default function UsersPanel(){
  const s = supabase()
  const [rows,setRows] = useState<Profile[]>([])
  const [loading,setLoading] = useState(false)
  const ROLES = ['SHOWROOM_MANAGER','WAREHOUSE_MANAGER','ADMIN']

  async function load(){
    setLoading(true)
    // requires a view or join in DB that exposes email; if not, we just show id + role
    const { data } = await s.from('profiles').select('user_id, role')
    setRows((data||[]).map(r => ({ ...r, email: r.user_id })))
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  async function setRole(user_id:string, role:string){
    const { error } = await s.from('profiles').update({ role }).eq('user_id', user_id)
    if (error) alert(error.message); else await load()
  }

  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">Users & Roles</h3></div>
      <div className="card-body">
        {loading ? 'Loading…' : (
          <div className="space-y-2">
            {rows.map(u=>(
              <div key={u.user_id} className="flex items-center gap-3">
                <div className="w-64 truncate">{u.email || u.user_id}</div>
                <select className="border rounded-xl px-2 py-1"
                        value={u.role||''}
                        onChange={e=>setRole(u.user_id, e.target.value)}>
                  <option value="">(none)</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
