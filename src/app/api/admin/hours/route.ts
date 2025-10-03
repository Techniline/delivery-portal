import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function GET() {
  const sb = supabaseService()
  const { data, error } = await sb
    .from('business_hours')
    .select('*')
    .order('warehouse_id', { ascending: true })
    .order('weekday', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

/** Upsert a row.
 *  Body: { id?, warehouse_id, weekday, open_time, close_time }
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const sb = supabaseService()
  const { error } = await sb.from('business_hours').upsert(body).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/** Delete by id: /api/admin/hours?id=123 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const sb = supabaseService()
  const { error } = await sb.from('business_hours').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
