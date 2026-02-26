'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BookingConfirmDialog } from '@/components/booking/booking-confirm-dialog'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface SlotData {
  id: string
  startTime: string
  endTime: string
  status: string
}

interface NightAvailability {
  date: string
  slot: SlotData | null
  available: boolean
}

interface SlotPickerProps {
  productId: string
  productName: string
  isLoggedIn: boolean
  price?: number
  openTime: string
  closeTime: string
  category: string
}

function isOvernightProduct(category: string, openTime: string, closeTime: string): boolean {
  // PENSION, HOTEL 카테고리는 항상 숙박형 (날짜 범위 선택)
  if (category === 'PENSION' || category === 'HOTEL') return true
  // 그 외: openTime >= closeTime이면 숙박형 (예: 15:00 ~ 11:00)
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  return oh * 60 + om >= ch * 60 + cm
}

// UTC 기준으로 날짜 계산 (타임존 버그 방지)
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

// 로컬 날짜를 YYYY-MM-DD 형식으로 반환
function getLocalToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = []
  let current = start
  while (current < end) {
    dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

function getNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + 'T00:00:00')
  const b = new Date(checkOut + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function SlotPicker({ productId, productName, isLoggedIn, price, openTime, closeTime, category }: SlotPickerProps) {
  const router = useRouter()
  const today = getLocalToday()
  const isOvernight = isOvernightProduct(category, openTime, closeTime)

  // Hourly mode state
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null)

  // Overnight mode state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [nightAvailability, setNightAvailability] = useState<NightAvailability[]>([])
  const [loadingRange, setLoadingRange] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)

  // Hourly: fetch slots for selected date
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

  // Overnight: fetch slots for date range
  const fetchRangeSlots = useCallback(async (start: string, end: string) => {
    if (!start || !end || start >= end) return
    setLoadingRange(true)
    const dates = getDatesInRange(start, end)

    const results = await Promise.all(
      dates.map(async (date) => {
        const res = await fetch(`/api/products/${productId}/slots?date=${date}`)
        if (!res.ok) return { date, slot: null, available: false }
        const data: SlotData[] = await res.json()
        const slot = data[0] ?? null
        return { date, slot, available: slot?.status === 'AVAILABLE' }
      })
    )

    setNightAvailability(results)
    setLoadingRange(false)
  }, [productId])

  useEffect(() => {
    if (!isOvernight) {
      fetchSlots()
      setSelectedSlot(null)
    }
  }, [fetchSlots, isOvernight])

  const handleCheckInChange = (value: string) => {
    setCheckIn(value)
    setNightAvailability([])
    if (checkOut && value >= checkOut) {
      setCheckOut('')
    }
  }

  const handleCheckOutChange = (value: string) => {
    setCheckOut(value)
    setNightAvailability([])
    if (checkIn && value > checkIn) {
      fetchRangeSlots(checkIn, value)
    }
  }

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

  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : 0
  const allAvailable = nightAvailability.length > 0 && nightAvailability.every((n) => n.available)
  const selectedSlotIds = nightAvailability.filter((n) => n.available && n.slot).map((n) => n.slot!.id)
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length

  // =================== OVERNIGHT MODE ===================
  if (isOvernight) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          예약하기
        </h2>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="checkIn" className="text-sm">체크인</Label>
            <Input
              id="checkIn"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut" className="text-sm">체크아웃</Label>
            <Input
              id="checkOut"
              type="date"
              min={checkIn ? addDays(checkIn, 1) : today}
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              disabled={!checkIn}
            />
          </div>
        </div>

        {/* Availability */}
        {checkIn && checkOut && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{nights}박 {nights + 1}일</span>
              {price && nights > 0 && (
                <span className="text-sm font-bold text-primary">
                  총 {(price * nights).toLocaleString()}원
                </span>
              )}
            </div>

            {loadingRange ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : nightAvailability.length > 0 && (
              <div className="space-y-2">
                {nightAvailability.map((n) => (
                  <div
                    key={n.date}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                      n.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    )}
                  >
                    <span className={n.available ? 'text-green-800' : 'text-red-800'}>
                      {n.date}
                    </span>
                    {n.available ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="h-3.5 w-3.5" /> 예약 가능
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs">
                        <XCircle className="h-3.5 w-3.5" /> 예약 불가
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {nightAvailability.length > 0 && (
              allAvailable ? (
                <div className="border-t pt-4">
                  <Button
                    onClick={handleBookingClick}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    {isLoggedIn ? `${nights}박 예약하기` : '로그인 후 예약'}
                  </Button>
                </div>
              ) : (
                <p className="text-center text-sm text-destructive pt-2">
                  선택한 기간에 예약 불가한 날짜가 있습니다
                </p>
              )
            )}
          </div>
        )}

        {/* Mobile fixed bottom bar */}
        {allAvailable && checkIn && checkOut && (
          <div className="fixed bottom-14 left-0 right-0 z-40 border-t bg-background p-3 flex items-center justify-between gap-3 lg:hidden md:bottom-0">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {checkIn} ~ {checkOut} ({nights}박)
              </p>
              {price && (
                <p className="text-base font-bold text-primary">
                  {(price * nights).toLocaleString()}원
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

        {allAvailable && checkIn && checkOut && (
          <BookingConfirmDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            selectedSlot={null}
            selectedSlotIds={selectedSlotIds}
            productName={productName}
            selectedDate={checkIn}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            totalPrice={price ? price * nights : undefined}
            isOvernight
          />
        )}
      </div>
    )
  }

  // =================== HOURLY MODE ===================
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
