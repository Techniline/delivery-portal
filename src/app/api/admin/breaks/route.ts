import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function GET() {
  const sb = supabaseService()
  const { data, error } = await sb
    .from('warehouse_breaks')
    .select('*')
    .order('warehouse_id', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

/** Upsert break:
 *  Body: { id?, warehouse_id, weekday, start_time, end_time }
 */
export async function POST(req: NextRequest) {
  const sb = supabaseService()
  const body = await req.json()
  const { error } = await sb.from('warehouse_breaks').upsert(body).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/** Delete by id: /api/admin/breaks?id=123 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const sb = supabaseService()
  const { error } = await sb.from('warehouse_breaks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
