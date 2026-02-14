'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelBooking } from '@/app/actions/booking'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BookingWithDetails } from '@/types'

const categoryLabel: Record<string, string> = {
  PENSION: '펜션',
  HOTEL: '호텔',
  SPACE: '공간',
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: '대기 중', variant: 'secondary' },
  CONFIRMED: { label: '확정', variant: 'default' },
  CANCELLED: { label: '취소됨', variant: 'destructive' },
}

interface BookingCardProps {
  booking: BookingWithDetails
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    await cancelBooking(booking.id)
    setIsCancelling(false)
    setCancelDialogOpen(false)
    router.refresh()
  }

  const status = statusConfig[booking.status]
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{booking.timeSlot.product.name}</span>
              <Badge variant="secondary">
                {categoryLabel[booking.timeSlot.product.category]}
              </Badge>
            </div>
            <Badge variant={status?.variant ?? 'secondary'}>
              {status?.label ?? booking.status}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              날짜: {new Date(booking.timeSlot.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p>시간: {booking.timeSlot.startTime} ~ {booking.timeSlot.endTime}</p>
            {booking.note && <p>메모: {booking.note}</p>}
            <p>
              예약일: {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </CardContent>

        {canCancel && (
          <CardFooter className="px-4 pb-4 pt-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
            >
              예약 취소
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 취소</DialogTitle>
            <DialogDescription>
              정말 이 예약을 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              돌아가기
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? '취소 중...' : '예약 취소'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
