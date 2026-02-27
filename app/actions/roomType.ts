'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { roomTypeSchema } from '@/lib/validations/roomType'
import { revalidatePath } from 'next/cache'

export async function getRoomTypes(productId: string) {
  return prisma.roomType.findMany({
    where: { productId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getAllRoomTypes(productId: string) {
  await requireAdmin()
  return prisma.roomType.findMany({
    where: { productId },
    include: { _count: { select: { timeSlots: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createRoomType(productId: string, formData: unknown) {
  await requireAdmin()

  const parsed = roomTypeSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  await prisma.roomType.create({ data: { ...parsed.data, productId } })
  revalidatePath(`/admin/products/${productId}/rooms`)
  return { success: true as const }
}

export async function updateRoomType(id: string, productId: string, formData: unknown) {
  await requireAdmin()

  const parsed = roomTypeSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  await prisma.roomType.update({ where: { id }, data: parsed.data })
  revalidatePath(`/admin/products/${productId}/rooms`)
  return { success: true as const }
}

export async function deleteRoomType(id: string, productId: string) {
  await requireAdmin()

  await prisma.roomType.delete({ where: { id } })
  revalidatePath(`/admin/products/${productId}/rooms`)
  return { success: true as const }
}
