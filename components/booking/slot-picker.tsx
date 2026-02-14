'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BookingConfirmDialog } from '@/components/booking/booking-confirm-dialog'
import { cn } from '@/lib/utils'

interface SlotData {
  id: string
  startTime: string
  endTime: string
  status: string
}

interface SlotPickerProps {
  productId: string
  productName: string
  isLoggedIn: boolean
}

export function SlotPicker({ productId, productName, isLoggedIn }: SlotPickerProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return
    setLoading(true)
    const res = await fetch(`/api/products/${productId}/slots?date=${selectedDate}`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data)
    }
    setLoading(false)
  }, [productId, selectedDate])

  useEffect(() => {
    fetchSlots()
    setSelectedSlot(null)
  }, [fetchSlots])

  const handleSlotClick = (slot: SlotData) => {
    if (slot.status !== 'AVAILABLE') return
    setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)
  }

  const handleBookingClick = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">예약하기</h2>

      <div className="space-y-2">
        <Label htmlFor="date">날짜 선택</Label>
        <Input
          id="date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          예약 가능한 시간이 없습니다
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={slot.status !== 'AVAILABLE'}
              className={cn(
                'rounded-md border p-2 text-center text-sm transition-colors',
                slot.status === 'AVAILABLE' &&
                  selectedSlot?.id !== slot.id &&
                  'hover:border-primary',
                slot.status === 'AVAILABLE' &&
                  selectedSlot?.id === slot.id &&
                  'bg-primary text-primary-foreground',
                (slot.status === 'BOOKED' || slot.status === 'BLOCKED') &&
                  'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {slot.startTime}
            </button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <Button onClick={handleBookingClick} className="w-full">
          {isLoggedIn ? '예약하기' : '로그인 후 예약'}
        </Button>
      )}

      {selectedSlot && (
        <BookingConfirmDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedSlot={selectedSlot}
          productName={productName}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}
