'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
export default function SignOut() {
  const router = useRouter()
  useEffect(() => { (async () => {
    try { await supabase().auth.signOut() } finally { router.replace('/') }
  })() }, [router])
  return <div className="panel p-6">Signing out…</div>
}
