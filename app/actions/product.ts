'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validations/product'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: unknown) {
  await requireAdmin()

  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  await prisma.product.create({ data: parsed.data })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: unknown) {
  await requireAdmin()

  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  await prisma.product.update({ where: { id }, data: parsed.data })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { timeSlots: true } },
    },
  })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } })
}
