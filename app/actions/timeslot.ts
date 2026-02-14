'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function generateTimeSlots(
  productId: string,
  startDate: string,
  endDate: string
) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { openTime: true, closeTime: true, slotDuration: true },
  })

  if (!product) return { success: false, error: '상품을 찾을 수 없습니다', count: 0 }

  const slots: {
    productId: string
    date: Date
    startTime: string
    endTime: string
  }[] = []

  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')

  const [openH, openM] = product.openTime.split(':').map(Number)
  const [closeH, closeM] = product.closeTime.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  const isOvernight = openMinutes >= closeMinutes

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]

    if (isOvernight) {
      // 숙박형 (예: 15:00~11:00) — 하루 1슬롯
      slots.push({
        productId,
        date: new Date(dateStr + 'T00:00:00Z'),
        startTime: product.openTime,
        endTime: product.closeTime,
      })
    } else {
      // 시간제 (예: 09:00~22:00) — slotDuration 단위로 분할
      for (let m = openMinutes; m + product.slotDuration <= closeMinutes; m += product.slotDuration) {
        const sh = Math.floor(m / 60)
        const sm = m % 60
        const eh = Math.floor((m + product.slotDuration) / 60)
        const em = (m + product.slotDuration) % 60

        slots.push({
          productId,
          date: new Date(dateStr + 'T00:00:00Z'),
          startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
          endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
        })
      }
    }
  }

  const result = await prisma.timeSlot.createMany({
    data: slots,
    skipDuplicates: true,
  })

  revalidatePath(`/admin/products/${productId}/slots`)
  return { success: true, count: result.count }
}

export async function toggleSlotStatus(
  slotId: string,
  status: 'AVAILABLE' | 'BLOCKED'
) {
  await requireAdmin()

  await prisma.timeSlot.update({
    where: { id: slotId },
    data: { status },
  })

  return { success: true }
}

export async function getSlotsByProductAndDate(
  productId: string,
  date: string
) {
  return prisma.timeSlot.findMany({
    where: {
      productId,
      date: new Date(date + 'T00:00:00Z'),
    },
    include: {
      booking: {
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })
}
