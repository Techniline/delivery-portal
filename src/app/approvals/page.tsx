import AuthGate from '@/components/AuthGate'
import ApprovalsTable from './table'
import WarehouseBookingForm from './warehouse-booking-form'
export default function Page() {
  return (
    <AuthGate>
      <h1 className="text-2xl font-semibold mb-4">Approvals & Warehouse Bookings</h1>
      <div className="grid gap-6">
        <WarehouseBookingForm />
        <ApprovalsTable />
      </div>
    </AuthGate>
  )
}
