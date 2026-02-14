export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/admin/stats-cards'

export default async function AdminDashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [products, pending, todayBookings, total] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { createdAt: { gte: today } } }),
    prisma.booking.count(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <StatsCards
        stats={{
          products,
          pending,
          today: todayBookings,
          total,
        }}
      />
    </div>
  )
}
