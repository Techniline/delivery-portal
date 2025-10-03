export type HourRow = { warehouse_id:number; weekday:number; open_time:string; close_time:string; active?:boolean|null }
export type BreakRow = { warehouse_id:number; weekday:number; start_time:string; end_time:string }

const hm = (s:string)=> s.slice(0,5) // 'HH:mm'

function normalizeDay(dbDay:number, mon1:boolean){
  // If DB stores 1..7 (Mon..Sun), convert to 0..6 (Sun..Sat)
  return mon1 ? (dbDay === 7 ? 0 : dbDay) : dbDay
}

export function computeCalendarProps(hours:HourRow[], breaks:BreakRow[], warehouseId=1){
  const H = hours.filter(h=>h.warehouse_id===warehouseId)
  const B = breaks.filter(b=>b.warehouse_id===warehouseId)
  const mon1 = H.some(h=>h.weekday===7) || B.some(b=>b.weekday===7)
  const normH = H.map(h=>({...h, weekday: normalizeDay(h.weekday, mon1)}))
  const normB = B.map(b=>({...b, weekday: normalizeDay(b.weekday, mon1)}))

  const businessHours = normH
    .filter(h => (h.active ?? true))
    .map(h => ({ daysOfWeek:[h.weekday], startTime:hm(h.open_time), endTime:hm(h.close_time) }))

  const openDays = new Set(normH.filter(h=> (h.active ?? true)).map(h=> h.weekday))
  const hiddenDays = Array.from({length:7}, (_,i)=>i).filter(i=> !openDays.has(i))

  let min = '23:59', max = '00:00'
  for(const h of normH){ const s = hm(h.open_time), e = hm(h.close_time); if (s<min) min=s; if (e>max) max=e }
  const slotMinTime = min || '08:00'
  const slotMaxTime = max || '19:00'

  const normBreaks = normB.map(b=> ({ weekday:b.weekday, start:hm(b.start_time), end:hm(b.end_time) }))
  return { businessHours, hiddenDays, slotMinTime, slotMaxTime, breaks:normBreaks }
}
