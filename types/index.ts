import type {
  User as PrismaUser,
  Product as PrismaProduct,
  TimeSlot as PrismaTimeSlot,
  Booking as PrismaBooking,
  RoomType as PrismaRoomType,
} from '@prisma/client'

// Re-export Prisma types
export type User = PrismaUser
export type Product = PrismaProduct
export type TimeSlot = PrismaTimeSlot
export type Booking = PrismaBooking
export type RoomType = PrismaRoomType

// Re-export enums
export {
  UserRole,
  ProductCategory,
  BookingStatus,
  TimeSlotStatus,
} from '@prisma/client'

// Composite types
export type ProductWithSlots = PrismaProduct & {
  timeSlots: PrismaTimeSlot[]
}

export type BookingWithDetails = PrismaBooking & {
  timeSlot: PrismaTimeSlot & {
    product: PrismaProduct
    roomType: PrismaRoomType | null
  }
  user: Pick<PrismaUser, 'id' | 'email' | 'name' | 'phone'>
}

export type TimeSlotWithBooking = PrismaTimeSlot & {
  roomType: PrismaRoomType | null
  booking:
    | (PrismaBooking & {
        user: Pick<PrismaUser, 'id' | 'email' | 'name' | 'phone'>
      })
    | null
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData extends LoginFormData {
  name: string
}

export interface ProductFormData {
  name: string
  description: string
  category: 'PENSION' | 'HOTEL' | 'SPACE'
  images: string[]
  pricePerSlot: number
  address: string
  openTime: string
  closeTime: string
  slotDuration: number
  isActive: boolean
}

export interface BookingFormData {
  timeSlotId: string
  note?: string
}
