'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { nanoid } from 'nanoid'

type Driver  = { id:string; full_name:string; photo_url?:string|null; active:boolean }
type Vehicle = { id:string; plate:string; model:string; active:boolean }

export default function FleetPanel(){
  const s = supabase()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)

  async function ensureBucket(){
    try { await fetch('/api/admin/storage/bucket', { method:'POST' }) } catch {}
  }

  async function load(){
    setLoading(true)
    await ensureBucket()
    const d = await s.from('drivers').select('*').order('full_name')
    const v = await s.from('vehicles').select('*').order('plate')
    setDrivers(d.data || [])
    setVehicles(v.data || [])
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  async function addDriver(){
    const full_name = prompt('Driver full name?')?.trim()
    if(!full_name) return
    const { data, error } = await s.from('drivers').insert({ full_name, active:true }).select('*').single()
    if(error) return alert(error.message)
    setDrivers(x=>[...x, data!])
  }

  async function addVehicle(){
    const plate = prompt('Vehicle plate?')?.trim()
    if(!plate) return
    const model = prompt('Vehicle model?')?.trim() || ''
    const { data, error } = await s.from('vehicles').insert({ plate, model, active:true }).select('*').single()
    if(error) return alert(error.message)
    setVehicles(x=>[...x, data!])
  }

  async function toggleActive(kind:'driver'|'vehicle', id:string, active:boolean){
    if(kind==='driver'){
      const { error } = await s.from('drivers').update({ active }).eq('id', id)
      if(error) return alert(error.message)
      setDrivers(ds => ds.map(d=> d.id===id ? {...d, active} : d))
    }else{
      const { error } = await s.from('vehicles').update({ active }).eq('id', id)
      if(error) return alert(error.message)
      setVehicles(vs => vs.map(v=> v.id===id ? {...v, active} : v))
    }
  }

  async function onPhotoPick(d:Driver, file:File){
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const key = `${d.id}/${nanoid(8)}.${ext}`
    const { error: upErr } = await s.storage.from('driver-photos').upload(key, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if(upErr) return alert(upErr.message)
    const { data } = s.storage.from('driver-photos').getPublicUrl(key)
    const url = data?.publicUrl || ''
    const { error: updErr } = await s.from('drivers').update({ photo_url: url }).eq('id', d.id)
    if(updErr) return alert(updErr.message)
    setDrivers(list => list.map(x => x.id===d.id ? {...x, photo_url:url } : x))
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="font-semibold">Fleet (Drivers & Vehicles)</h3>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={addDriver}>+ Driver</button>
          <button className="btn btn-primary" onClick={addVehicle}>+ Vehicle</button>
        </div>
      </div>
      <div className="card-body grid gap-6">
        {/* Drivers */}
        <div>
          <div className="mb-2 font-medium">Drivers</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Photo</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(d=>(
                  <tr key={d.id} className="border-t">
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <img src={d.photo_url || '/icon.png'} alt="" className="h-9 w-9 rounded-full object-cover"/>
                      </div>
                    </td>
                    <td>{d.full_name}</td>
                    <td>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={!!d.active} onChange={e=>toggleActive('driver', d.id, e.target.checked)} />
                        <span>{d.active ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td>
                      <input type="file" accept="image/*" onChange={e=>{
                        const f = e.target.files?.[0]; if(f) onPhotoPick(d, f)
                      }} />
                    </td>
                  </tr>
                ))}
                {!drivers.length && (
                  <tr><td className="py-4 text-gray-400" colSpan={4}>No drivers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicles */}
        <div>
          <div className="mb-2 font-medium">Vehicles</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Plate</th>
                  <th>Model</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v=>(
                  <tr key={v.id} className="border-t">
                    <td className="py-2">{v.plate}</td>
                    <td>{v.model}</td>
                    <td>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={!!v.active} onChange={e=>toggleActive('vehicle', v.id, e.target.checked)} />
                        <span>{v.active ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                  </tr>
                ))}
                {!vehicles.length && (
                  <tr><td className="py-4 text-gray-400" colSpan={3}>No vehicles yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading…</div>}
      </div>
    </div>
  )
}
