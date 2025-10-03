'use client'
import { ReactNode, useEffect } from 'react'

export default function Modal({
  title,
  onClose,
  children,
}: { title?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[680px] max-w-[92vw]">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold">{title || 'Modal'}</h3>
          <button className="rounded-full px-3 py-1 border" onClick={onClose}>✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
