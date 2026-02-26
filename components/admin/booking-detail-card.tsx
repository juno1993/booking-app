'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { confirmBooking, cancelBooking } from '@/app/actions/booking'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { BookingWithDetails } from '@/types'

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: '대기', variant: 'secondary' },
  CONFIRMED: { label: '확정', variant: 'default' },
  CANCELLED: { label: '취소', variant: 'destructive' },
}

interface BookingDetailCardProps {
  booking: BookingWithDetails
}

export function BookingDetailCard({ booking }: BookingDetailCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    await confirmBooking(booking.id)
    setIsLoading(false)
    router.refresh()
  }

  const handleCancel = async () => {
    setIsLoading(true)
    await cancelBooking(booking.id)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          예약 상세
          <Badge variant={statusLabel[booking.status]?.variant ?? 'secondary'}>
            {statusLabel[booking.status]?.label ?? booking.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">상품</span>
          <span className="font-medium">{booking.timeSlot.product.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">고객</span>
          <span>{booking.user.name ?? '-'} ({booking.user.email})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">날짜</span>
          <span>{new Date(booking.timeSlot.date).toLocaleDateString('ko-KR')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">시간</span>
          <span>{booking.timeSlot.startTime} ~ {booking.timeSlot.endTime}</span>
        </div>
        {booking.roomTypeName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">객실</span>
            <span>{booking.roomTypeName}</span>
          </div>
        )}
        {booking.priceSnapshot !== null && booking.priceSnapshot !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">예약 가격</span>
            <span className="font-medium">{booking.priceSnapshot.toLocaleString()}원/박</span>
          </div>
        )}
        {booking.note && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">메모</span>
            <span>{booking.note}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {booking.status === 'PENDING' && (
          <>
            <Button onClick={handleConfirm} disabled={isLoading}>
              예약 확정
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              예약 취소
            </Button>
          </>
        )}
        {booking.status === 'CONFIRMED' && (
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            예약 취소
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
