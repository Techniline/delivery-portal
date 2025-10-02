export type Role = 'SHOWROOM_MANAGER' | 'WAREHOUSE_MANAGER' | 'ADMIN'
export type BookingStatus = 'PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'
export type BookingOrigin = 'SHOWROOM_REQUEST'|'WAREHOUSE_BOOKING'
export interface Booking {
  id: number; origin: BookingOrigin; status: BookingStatus;
  creator_user_id: string; warehouse_id: number; dock_id: number | null;
  date: string; start_time: string; end_time: string;
  vehicle_plate: string | null; driver_name: string | null;
  delivery_location: string | null; notes: string | null;
  start_ts: string; end_ts: string; version: number;
  created_at: string; updated_at: string;
}
