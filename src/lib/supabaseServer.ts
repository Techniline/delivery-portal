import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin client – uses SERVICE ROLE.
 * Never expose this key on the client.
 */
export function supabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE)    throw new Error('Missing SUPABASE_SERVICE_ROLE')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  )
}

/** Back-compat alias (some files import supabaseService) */
export const supabaseService = supabaseAdmin;
