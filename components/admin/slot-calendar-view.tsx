'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSlotsByProductAndDate, toggleSlotStatus } from '@/app/actions/timeslot'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { RoomType } from '@prisma/client'

interface SlotCalendarViewProps {
  productId: string
  roomTypes?: RoomType[]
}

type SlotWithBooking = Awaited<ReturnType<typeof getSlotsByProductAndDate>>[number]

export function SlotCalendarView({ productId, roomTypes }: SlotCalendarViewProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(
    roomTypes && roomTypes.length > 0 ? roomTypes[0].id : undefined
  )
  const [slots, setSlots] = useState<SlotWithBooking[]>([])
  const [loading, setLoading] = useState(false)

  const hasRooms = roomTypes && roomTypes.length > 0

  const fetchSlots = useCallback(async () => {
    if (!date) return
    setLoading(true)
    const data = await getSlotsByProductAndDate(productId, date, selectedRoomId)
    setSlots(data)
    setLoading(false)
  }, [productId, date, selectedRoomId])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const handleToggle = async (slot: SlotWithBooking) => {
    if (slot.status === 'BOOKED') return
    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE'
    await toggleSlotStatus(slot.id, newStatus)
    fetchSlots()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-2">
          <Label htmlFor="slotDate">날짜 선택</Label>
          <Input
            id="slotDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>

        {hasRooms && (
          <div className="flex gap-2 flex-wrap">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm border transition-colors',
                  selectedRoomId === room.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-accent'
                )}
              >
                {room.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">해당 날짜에 슬롯이 없습니다</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleToggle(slot)}
              disabled={slot.status === 'BOOKED'}
              className={cn(
                'rounded-md border p-2 text-center text-xs transition-colors',
                slot.status === 'AVAILABLE' &&
                  'bg-green-100 hover:bg-green-200 text-green-800',
                slot.status === 'BOOKED' &&
                  'bg-blue-100 text-blue-800 cursor-not-allowed',
                slot.status === 'BLOCKED' &&
                  'bg-red-100 hover:bg-red-200 text-red-800'
              )}
              title={
                slot.status === 'BOOKED' && slot.booking
                  ? `${slot.booking.user.name ?? slot.booking.user.email}`
                  : slot.status
              }
            >
              <div className="font-medium">{slot.startTime}</div>
              <div className="text-[10px]">~{slot.endTime}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 inline-block" /> 예약 가능
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-200 inline-block" /> 예약됨
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-200 inline-block" /> 차단됨
        </span>
      </div>
    </div>
  )
}
