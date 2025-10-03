import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'
export async function GET(){ const sb=supabaseService(); const { data }=await sb.from('drivers').select('*').order('full_name'); return NextResponse.json(data||[]) }
export async function POST(req:Request){ const body=await req.json(); const sb=supabaseService(); const { error }=await sb.from('drivers').insert({ full_name:body.full_name, photo_url:body.photo_url??null, active:true }); if(error) return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true}) }
