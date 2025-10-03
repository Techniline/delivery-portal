import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function GET() {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('business_holidays')
    .select('*')
    .order('start_date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const body = await req.json()
  const sb = supabaseAdmin()
  const { start_date, end_date, is_closed, reason, warehouse_id = 1 } = body || {}
  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 })
  }
  const { error } = await sb.from('business_holidays').insert({
    start_date, end_date, is_closed: !!is_closed, reason, warehouse_id
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const sb = supabaseAdmin()
  const { error } = await sb.from('business_holidays').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
