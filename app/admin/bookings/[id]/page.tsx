import { notFound } from 'next/navigation'
import { getBooking } from '@/app/actions/booking'
import { BookingDetailCard } from '@/components/admin/booking-detail-card'

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const booking = await getBooking(params.id)
  if (!booking) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">예약 상세</h1>
      <BookingDetailCard booking={booking} />
    </div>
  )
}
