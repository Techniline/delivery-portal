'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const s = supabase()
    s.auth.getSession().then(({ data }) => { setSession(data.session ?? null); setLoading(false) })
    const { data: sub } = s.auth.onAuthStateChange((_e, sess) => setSession(sess))
    return () => { sub?.subscription.unsubscribe() }
  }, [])
  if (loading) return <div className="p-6">Loading…</div>
  if (!session) return <AuthForm />
  return (
    <div className="min-h-screen">
      <Navbar onSignOut={() => supabase().auth.signOut()} />
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  )
}
function AuthForm() {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const s = supabase()
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fn = mode==='signin' ? s.auth.signInWithPassword : s.auth.signUp
    const { error } = await fn({ email, password: pass } as any)
    if (error) alert(error.message)
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm">
        <div className="card-header"><h1 className="text-xl font-semibold" style={{color:'#0B0B0C'}}>Delivery Portal</h1></div>
        <div className="card-body space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="btn btn-primary w-full">{mode==='signin'?'Sign in':'Create account'}</button>
          <p className="text-sm text-neutral-600">
            {mode==='signin' ? 'No account?' : 'Have an account?'}{' '}
            <button type="button" className="underline" style={{color:'#C0101A'}} onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
              {mode==='signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
function Navbar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <header className="navbar">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link href="/" className="font-semibold text-lg" style={{color:'#0B0B0C'}}>Calendar</Link>
        <Link href="/requests" className="navlink">My Requests</Link>
        <Link href="/approvals" className="navlink">Approvals</Link>
        <div className="ml-auto"><button onClick={onSignOut} className="btn btn-outline">Sign out</button></div>
      </div>
    </header>
  )
}
