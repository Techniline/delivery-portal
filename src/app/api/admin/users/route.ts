import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function GET() {
  const sb = supabaseService()
  const { data, error } = await sb
    .from('profiles')
    .select('user_id, email, full_name, role, active')
    .order('email', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

/** Create/invite a user and upsert their profile.
 *  Body: { email, full_name, role }  role ∈ ['SHOWROOM_MANAGER','WAREHOUSE_MANAGER','ADMIN']
 */
export async function POST(req: NextRequest) {
  const { email, full_name, role } = await req.json()
  if (!email || !role) return NextResponse.json({ error: 'email and role are required' }, { status: 400 })

  const sb = supabaseService()

  // 1) Invite or fetch existing user
  let userId: string | null = null
  const existing = await sb
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .maybeSingle()
  if (existing.data?.user_id) {
    userId = existing.data.user_id
  } else {
    // Send invite (service role required)
    const inv = await sb.auth.admin.inviteUserByEmail(email, { data: { full_name } })
    if (inv.error) return NextResponse.json({ error: inv.error.message }, { status: 400 })
    userId = inv.data.user?.id ?? null
  }
  if (!userId) return NextResponse.json({ error: 'Could not create or find user' }, { status: 400 })

  // 2) Upsert profile
  const { error } = await sb.from('profiles').upsert({
    user_id: userId,
    email,
    full_name,
    role,
    active: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, user_id: userId })
}

/** Update role/active.
 *  Body: { user_id, role?, active? }
 */
export async function PATCH(req: NextRequest) {
  const { user_id, role, active } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  const sb = supabaseService()
  const { error } = await sb.from('profiles').update({ role, active }).eq('user_id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/** Delete profile (optional hard-delete) */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  const sb = supabaseService()
  const { error } = await sb.from('profiles').delete().eq('user_id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
