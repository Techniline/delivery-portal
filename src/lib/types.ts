export type BookingStatus = 'PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'
export type BookingOrigin = 'SHOWROOM_REQUEST'|'WAREHOUSE_BOOKING'
export interface Booking {
  id: number
  origin: BookingOrigin
  status: BookingStatus
  creator_user_id: string
  warehouse_id: number
  dock_id: number | null
  date: string            // YYYY-MM-DD
  start_time: string      // HH:MM:SS
  end_time: string        // HH:MM:SS
  vehicle_plate: string | null
  vehicle_model: string | null
  driver_name: string | null
  driver_photo_url: string | null
  delivery_location: string | null
  notes: string | null
  start_ts: string
  end_ts: string
  created_at: string
  updated_at: string
}
