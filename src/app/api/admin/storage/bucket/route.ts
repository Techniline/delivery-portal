import { NextResponse } from 'next/server'
export async function POST() {
  // No-op endpoint to avoid 400 during setup
  return NextResponse.json({ ok: true })
}
