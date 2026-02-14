import Link from 'next/link'
import { getBookings } from '@/app/actions/booking'
import { BookingTable } from '@/components/admin/booking-table'
import { Button } from '@/components/ui/button'

const statusFilters = [
  { label: '전체', value: '' },
  { label: '대기', value: 'PENDING' },
  { label: '확정', value: 'CONFIRMED' },
  { label: '취소', value: 'CANCELLED' },
]

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const filter = searchParams.status ? { status: searchParams.status } : undefined
  const bookings = await getBookings(filter)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">예약 관리</h1>
      <div className="flex gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={searchParams.status === f.value || (!searchParams.status && !f.value) ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={f.value ? `/admin/bookings?status=${f.value}` : '/admin/bookings'}>
              {f.label}
            </Link>
          </Button>
        ))}
      </div>
      <BookingTable bookings={bookings} />
    </div>
  )
}
