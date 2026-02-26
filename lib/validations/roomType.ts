import { z } from 'zod'

export const roomTypeSchema = z.object({
  name: z.string().min(1, '객실명을 입력해주세요').max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().int().min(0, '가격은 0 이상이어야 합니다').default(0),
  capacity: z.coerce.number().int().min(1).max(100).default(2),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
})

export type RoomTypeSchemaType = z.infer<typeof roomTypeSchema>
