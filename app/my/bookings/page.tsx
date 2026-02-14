export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingCard } from '@/components/booking/booking-card'
import { Button } from '@/components/ui/button'
import { BookingStatusFilter } from '@/components/booking/booking-status-filter'
import { CalendarDays } from 'lucide-react'

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await requireAuth()

  const statusFilter = searchParams.status

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      ...(statusFilter && { status: statusFilter as 'PENDING' | 'CONFIRMED' | 'CANCELLED' }),
    },
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

  // Count by status for badges
  const allBookings = await prisma.booking.groupBy({
    by: ['status'],
    where: { userId: user.id },
    _count: true,
  })
  const counts = {
    all: allBookings.reduce((sum, b) => sum + b._count, 0),
    PENDING: allBookings.find((b) => b.status === 'PENDING')?._count ?? 0,
    CONFIRMED: allBookings.find((b) => b.status === 'CONFIRMED')?._count ?? 0,
    CANCELLED: allBookings.find((b) => b.status === 'CANCELLED')?._count ?? 0,
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-slide-up">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">내 예약</h1>
        </div>

        <BookingStatusFilter current={statusFilter} counts={counts} />

        {bookings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-4xl">📭</p>
            <p className="text-lg font-medium">
              {statusFilter ? '해당 상태의 예약이 없습니다' : '예약 내역이 없습니다'}
            </p>
            <p className="text-sm text-muted-foreground">
              {statusFilter ? '다른 필터를 선택해보세요' : '지금 바로 예약해보세요!'}
            </p>
            <Button asChild>
              <Link href="/products">상품 둘러보기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 max-w-3xl">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
