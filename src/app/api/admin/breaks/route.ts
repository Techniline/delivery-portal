import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
export const dynamic = 'force-dynamic'

function j(n: any) { try { return JSON.stringify(n) } catch { return String(n) } }

export async function GET() {
  try {
    const s = supabaseAdmin()
    const { data, error } = await s.from('business_breaks').select('*').order('weekday')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err:any) {
    console.error('GET /api/admin/breaks error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSrv = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !hasSrv) {
      throw new Error('Missing Supabase env: require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    }

    const body = await req.json().catch(()=>null)
    console.log('POST /api/admin/breaks payload =', j(body))
    const rows = Array.isArray(body) ? body : body ? [body] : []
    if (!rows.length) throw new Error('No payload')

    const clean = rows.map((r:any)=>({
      id: r.id,
      warehouse_id: r.warehouse_id ?? 1,
      weekday: Number(r.weekday),
      start_time: r.start_time,
      end_time:   r.end_time
    }))

    const s = supabaseAdmin()
    const { data, error } = await s.from('business_breaks').upsert(clean, { onConflict: 'id' }).select('*')
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (err:any) {
    console.error('POST /api/admin/breaks error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(()=>null)
    console.log('DELETE /api/admin/breaks payload =', j(body))
    const ids:number[] = Array.isArray(body?.ids) ? body.ids : body?.id ? [body.id] : []
    if (!ids.length) throw new Error('No id(s)')
    const s = supabaseAdmin()
    const { error } = await s.from('business_breaks').delete().in('id', ids)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err:any) {
    console.error('DELETE /api/admin/breaks error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
