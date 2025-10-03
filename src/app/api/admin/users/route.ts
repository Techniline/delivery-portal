import { NextResponse } from 'next/server'
export async function GET() {
  // Return an empty list for now; wire your real users later
  return NextResponse.json([])
}
