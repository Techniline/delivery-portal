'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    (async () => {
      const s = supabase()
      const { data: { user } } = await s.auth.getUser()
      setAuthed(!!user)
      setReady(true)
    })()
  }, [])

  if (!ready) return <div className="panel p-6">Loading…</div>
  if (!authed) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-2">Sign in</h2>
        <AuthForm/>
      </div>
    )
  }
  return <>{children}</>
}

function AuthForm() {
  const s = supabase()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      let error: any = null
      if (mode === 'signin') {
        ({ error } = await s.auth.signInWithPassword({ email, password: pass }))
      } else {
        ({ error } = await s.auth.signUp({ email, password: pass }))
      }
      if (error) alert(error.message); else location.reload()
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={busy}>{busy? 'Please wait…' : (mode==='signin' ? 'Sign in' : 'Create account')}</button>
        <button type="button" className="btn btn-outline" onClick={() => setMode(m => m==='signin'?'signup':'signin')}>
          {mode==='signin' ? 'Need an account?' : 'Have an account?'}
        </button>
      </div>
    </form>
  )
}
