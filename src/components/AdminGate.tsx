'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const s = supabase()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [debug, setDebug] = useState<{uid?:string; role?:string; error?:string}>({})

  useEffect(() => {
    (async () => {
      try {
        const { data: u, error: e1 } = await s.auth.getUser()
        if (e1) throw e1
        const uid = u.user?.id
        if (!uid) {
          setDebug({ error: 'No user session' })
          setIsAdmin(false)
          return
        }
        const { data: prof, error: e2 } = await s
          .from('profiles')
          .select('role')
          .eq('user_id', uid)
          .single()
        if (e2) {
          setDebug({ uid, error: e2.message })
          setIsAdmin(false)
          return
        }
        setDebug({ uid, role: prof?.role })
        setIsAdmin(prof?.role === 'ADMIN')
      } catch (err: any) {
        setDebug({ error: err?.message || String(err) })
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="panel p-6">Checking admin…</div>
  if (!isAdmin) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-neutral-600">You must be an ADMIN to view this page.</p>
        <pre className="mt-3 text-xs bg-neutral-50 p-3 rounded-xl overflow-auto">
{JSON.stringify(debug, null, 2)}
        </pre>
        <div className="mt-3">
          <a className="btn btn-outline" href="/signout">Sign out</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
