import AuthGate from '@/components/AuthGate'
import RequestForm from '@/components/RequestForm'
import RequestsTable from './table'
export default function Page() {
  return (
    <AuthGate>
      <h1 className="text-2xl font-semibold mb-4">My Requests</h1>
      <div className="grid gap-6">
        <RequestForm />
        <RequestsTable />
      </div>
    </AuthGate>
  )
}
