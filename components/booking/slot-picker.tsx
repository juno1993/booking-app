'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BookingConfirmDialog } from '@/components/booking/booking-confirm-dialog'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'

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
  price?: number
}

export function SlotPicker({ productId, productName, isLoggedIn, price }: SlotPickerProps) {
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

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        예약하기
      </h2>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm">날짜 선택</Label>
        <Input
          id="date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Slots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            시간 선택
          </Label>
          {!loading && slots.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {availableCount > 0 ? `${availableCount}개 예약 가능` : '마감'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              예약 가능한 시간이 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE'
              const isSelected = selectedSlot?.id === slot.id
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!isAvailable}
                  className={cn(
                    'rounded-lg border p-2.5 text-center text-sm transition-all',
                    isAvailable && !isSelected &&
                      'hover:border-primary hover:bg-primary/5 cursor-pointer',
                    isAvailable && isSelected &&
                      'border-primary bg-primary text-primary-foreground shadow-sm',
                    !isAvailable &&
                      'bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through'
                  )}
                >
                  <div className="font-medium">{slot.startTime}</div>
                  <div className="text-[10px] opacity-70">~{slot.endTime}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      {slots.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm border" /> 예약 가능
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> 선택됨
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> 마감
          </span>
        </div>
      )}

      {/* Book Button */}
      {selectedSlot && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">선택한 시간</span>
            <span className="font-medium">
              {selectedDate} {selectedSlot.startTime}~{selectedSlot.endTime}
            </span>
          </div>
          <Button
            onClick={handleBookingClick}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isLoggedIn ? '예약하기' : '로그인 후 예약'}
          </Button>
        </div>
      )}

      {/* Mobile fixed bottom bar */}
      {selectedSlot && (
        <div className="fixed bottom-14 left-0 right-0 z-40 border-t bg-background p-3 flex items-center justify-between gap-3 lg:hidden md:bottom-0">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {selectedDate} {selectedSlot.startTime}~{selectedSlot.endTime}
            </p>
            {price && (
              <p className="text-base font-bold text-primary">
                {price.toLocaleString()}원
              </p>
            )}
          </div>
          <Button
            onClick={handleBookingClick}
            className="flex-shrink-0 h-10 px-6 font-semibold"
          >
            {isLoggedIn ? '예약하기' : '로그인 후 예약'}
          </Button>
        </div>
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
