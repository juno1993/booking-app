'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { bookingSchema, multiBookingSchema } from '@/lib/validations/booking'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: unknown) {
  const user = await requireAuth()

  const parsed = bookingSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  const { timeSlotId, note, roomTypeName, priceSnapshot } = parsed.data

  const booking = await prisma.$transaction(async (tx) => {
    // atomic: 상태 확인 + 변경을 단일 쿼리로 처리해 동시 예약 race condition 방지
    const updated = await tx.timeSlot.updateMany({
      where: { id: timeSlotId, status: 'AVAILABLE' },
      data: { status: 'BOOKED' },
    })

    if (updated.count === 0) {
      throw new Error('해당 슬롯은 예약할 수 없습니다')
    }

    return tx.booking.create({
      data: {
        userId: user.id,
        timeSlotId,
        note,
        status: 'PENDING',
        ...(roomTypeName && { roomTypeName }),
        ...(priceSnapshot !== undefined && { priceSnapshot }),
      },
    })
  }).catch((err: unknown) => {
    return { error: err instanceof Error ? err.message : '예약 처리 중 오류가 발생했습니다' }
  })

  if ('error' in booking) {
    return { success: false, error: booking.error }
  }

  revalidatePath('/my/bookings')
  revalidatePath('/admin/bookings')
  return { success: true, bookingId: booking.id }
}

export async function createMultipleBookings(formData: unknown) {
  const user = await requireAuth()

  const parsed = multiBookingSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  const { timeSlotIds, note, roomTypeName, priceSnapshot } = parsed.data
  const groupId = crypto.randomUUID()

  const result = await prisma.$transaction(async (tx) => {
    // atomic: AVAILABLE 상태인 슬롯만 한 번에 BOOKED로 변경 → 동시 예약 race condition 방지
    const updated = await tx.timeSlot.updateMany({
      where: { id: { in: timeSlotIds }, status: 'AVAILABLE' },
      data: { status: 'BOOKED' },
    })

    if (updated.count !== timeSlotIds.length) {
      throw new Error('일부 날짜는 이미 예약되었습니다')
    }

    return Promise.all(
      timeSlotIds.map((timeSlotId) =>
        tx.booking.create({
          data: {
            userId: user.id,
            timeSlotId,
            note,
            status: 'PENDING',
            groupId,
            ...(roomTypeName && { roomTypeName }),
            ...(priceSnapshot !== undefined && { priceSnapshot }),
          },
        })
      )
    )
  }).catch((err: unknown) => {
    return { error: err instanceof Error ? err.message : '예약 처리 중 오류가 발생했습니다' }
  })

  if ('error' in result) {
    return { success: false, error: result.error }
  }

  revalidatePath('/my/bookings')
  revalidatePath('/admin/bookings')
  return { success: true, groupId }
}

export async function confirmBooking(bookingId: string) {
  await requireAdmin()

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
  })

  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  const user = await requireAuth()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    return { success: false, error: '예약을 찾을 수 없습니다' }
  }

  if (booking.userId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: '권한이 없습니다' }
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    }),
    prisma.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { status: 'AVAILABLE' },
    }),
  ])

  revalidatePath('/my/bookings')
  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function getBookings(filter?: { status?: string }) {
  await requireAdmin()

  const where = filter?.status ? { status: filter.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' } : {}

  return prisma.booking.findMany({
    where,
    include: {
      timeSlot: {
        include: { product: true, roomType: true },
      },
      user: {
        select: { id: true, email: true, name: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getBooking(id: string) {
  await requireAdmin()

  return prisma.booking.findUnique({
    where: { id },
    include: {
      timeSlot: {
        include: { product: true, roomType: true },
      },
      user: {
        select: { id: true, email: true, name: true, phone: true },
      },
    },
  })
}
