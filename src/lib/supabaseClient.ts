import { createBrowserClient } from '@supabase/ssr'

export const supabase = () => {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  if (!url || !anon) throw new Error('Supabase env is missing. Check .env.local')
  return createBrowserClient(url, anon)
}
