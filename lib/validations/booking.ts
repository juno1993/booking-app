import { z } from 'zod'

export const bookingSchema = z.object({
  timeSlotId: z.string().uuid('유효하지 않은 시간 슬롯입니다'),
  note: z.string().max(500).optional(),
})

export type BookingSchemaType = z.infer<typeof bookingSchema>
