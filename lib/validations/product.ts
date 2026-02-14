import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요').max(100),
  description: z.string().max(2000).optional(),
  category: z.enum(['PENSION', 'HOTEL', 'SPACE']),
  images: z.array(z.string().url()).default([]),
  pricePerSlot: z.coerce.number().int().min(0).default(0),
  address: z.string().max(200).optional(),
  openTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '올바른 시간 형식이 아닙니다'),
  closeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '올바른 시간 형식이 아닙니다'),
  slotDuration: z.coerce.number().int().min(30).max(120).default(30),
  isActive: z.boolean().default(true),
})

export type ProductSchemaType = z.infer<typeof productSchema>
