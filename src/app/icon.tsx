import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  // Simple, crisp “T” in Techniline blue on white
  return new ImageResponse(
    (
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#ffffff"/>
        <rect x="10" y="12" width="44" height="10" rx="5" fill="#2563EB"/>
        <rect x="27" y="22" width="10" height="30" rx="5" fill="#2563EB"/>
      </svg>
    ),
    { }
  )
}
