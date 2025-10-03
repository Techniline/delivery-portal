'use client'
export default function QuickSlotPicker({
  onPick
}:{ onPick:(minutes:number)=>void }) {
  const options = [30, 60, 90, 120]
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(m => (
        <button
          key={m}
          type="button"
          className="btn-chip"
          onClick={()=>onPick(m)}
          aria-label={`Quick pick ${m} minutes`}
        >
          {m}m
        </button>
      ))}
    </div>
  )
}
