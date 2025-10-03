'use client'
import { useEffect, useState } from 'react'

const LOCATIONS = [
  'MusicMajlis',
  'Amazon Delivery',
  'B2B',
  'Soundline Main',
  'Other Delivery',
  'Showroom Delivery',
] as const

export default function LegendChips(){
  const [active, setActive] = useState<string[]>([])

  useEffect(()=>{
    // announce current selection to listeners (CalendarView)
    window.dispatchEvent(new CustomEvent('location-filter', { detail: active }))
  }, [active])

  const toggle = (name:string) => {
    setActive(prev => prev.includes(name) ? prev.filter(x=>x!==name) : [...prev, name])
  }

  const clear = () => setActive([])

  return (
    <div className="legend-wrap">
      <button className={`pill ${active.length===0 ? 'selected' : ''}`} onClick={clear}>All</button>
      {LOCATIONS.map(loc => (
        <button
          key={loc}
          className={`pill loc-${slug(loc)} ${active.includes(loc) ? 'selected' : ''}`}
          onClick={()=>toggle(loc)}
          title={active.includes(loc) ? 'Click to hide' : 'Click to show'}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}

function slug(s:string){
  return s.toLowerCase().replace(/\s+/g,'-')
}
