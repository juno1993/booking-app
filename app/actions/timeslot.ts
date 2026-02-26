'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function generateTimeSlots(
  productId: string,
  startDate: string,
  endDate: string,
  roomTypeId?: string
) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { openTime: true, closeTime: true, slotDuration: true },
  })

  if (!product) return { success: false, error: '상품을 찾을 수 없습니다', count: 0 }

  const slots: {
    productId: string
    roomTypeId?: string
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

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]

    if (isOvernight) {
      // 숙박형 — 하루 1슬롯
      slots.push({
        productId,
        ...(roomTypeId && { roomTypeId }),
        date: new Date(dateStr + 'T00:00:00Z'),
        startTime: product.openTime,
        endTime: product.closeTime,
      })
    } else {
      // 시간제 — slotDuration 단위로 분할
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

  let count = 0

  if (roomTypeId) {
    // roomTypeId 있는 경우: unique constraint 동작하므로 skipDuplicates 사용
    const result = await prisma.timeSlot.createMany({
      data: slots,
      skipDuplicates: true,
    })
    count = result.count
  } else {
    // roomTypeId 없는 SPACE 상품: 앱 레벨에서 중복 체크
    const existing = await prisma.timeSlot.findMany({
      where: {
        productId,
        roomTypeId: null,
        date: { gte: start, lte: end },
      },
      select: { date: true, startTime: true },
    })
    const existingSet = new Set(
      existing.map((s) => `${s.date.toISOString().split('T')[0]}_${s.startTime}`)
    )
    const newSlots = slots.filter(
      (s) => !existingSet.has(`${s.date.toISOString().split('T')[0]}_${s.startTime}`)
    )
    if (newSlots.length > 0) {
      const result = await prisma.timeSlot.createMany({ data: newSlots })
      count = result.count
    }
  }

  revalidatePath(`/admin/products/${productId}/slots`)
  return { success: true, count }
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
  date: string,
  roomTypeId?: string
) {
  return prisma.timeSlot.findMany({
    where: {
      productId,
      date: new Date(date + 'T00:00:00Z'),
      ...(roomTypeId ? { roomTypeId } : {}),
    },
    include: {
      roomType: true,
      booking: {
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true },
          },
        },
      },
    },
    orderBy: [{ roomTypeId: 'asc' }, { startTime: 'asc' }],
  })
}
