import { z } from 'zod'

export const bookingSchema = z.object({
  timeSlotId: z.string().uuid('유효하지 않은 시간 슬롯입니다'),
  note: z.string().max(500).optional(),
  roomTypeName: z.string().optional(),
  priceSnapshot: z.number().int().optional(),
})

export const multiBookingSchema = z.object({
  timeSlotIds: z.array(z.string().uuid()).min(1, '슬롯을 선택해주세요'),
  note: z.string().max(500).optional(),
  roomTypeName: z.string().optional(),
  priceSnapshot: z.number().int().optional(),
})

export type BookingSchemaType = z.infer<typeof bookingSchema>
export type MultiBookingSchemaType = z.infer<typeof multiBookingSchema>
