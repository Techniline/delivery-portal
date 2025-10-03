import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function POST() {
  try {
    const sb = supabaseService()
    // Try to create; ignore "already exists"
    const { error } = await (sb as any).storage.createBucket('driver-photos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png','image/jpeg','image/webp','image/jpg']
    })
    if (error && !String(error.message || '').includes('already exists')) {
      return NextResponse.json({ ok:false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok:true })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 })
  }
}
