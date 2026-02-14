import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingCard } from '@/components/booking/booking-card'
import { Button } from '@/components/ui/button'

export default async function MyBookingsPage() {
  const user = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      timeSlot: {
        include: { product: true },
      },
      user: {
        select: { id: true, email: true, name: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">내 예약</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">예약 내역이 없습니다</p>
            <Button asChild>
              <Link href="/products">상품 보기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
