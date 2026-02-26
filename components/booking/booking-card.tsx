'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cancelBooking } from '@/app/actions/booking'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Calendar, Clock, MapPin, ExternalLink, BedDouble } from 'lucide-react'
import type { BookingWithDetails } from '@/types'

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  PENSION: { label: '펜션', emoji: '🏡', color: 'bg-emerald-100 text-emerald-700' },
  HOTEL: { label: '호텔', emoji: '🏨', color: 'bg-blue-100 text-blue-700' },
  SPACE: { label: '공간', emoji: '🏢', color: 'bg-purple-100 text-purple-700' },
}

const statusConfig: Record<string, { label: string; dotColor: string; bgColor: string }> = {
  PENDING: { label: '대기 중', dotColor: 'bg-yellow-500', bgColor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: '확정', dotColor: 'bg-green-500', bgColor: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: '취소됨', dotColor: 'bg-red-400', bgColor: 'bg-red-50 text-red-600 border-red-200' },
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

  const product = booking.timeSlot.product
  const status = statusConfig[booking.status]
  const category = categoryConfig[product.category]
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

  const dateStr = new Date(booking.timeSlot.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex">
          {/* Image / Placeholder */}
          <Link
            href={`/products/${product.id}`}
            className="relative flex-shrink-0 w-28 sm:w-36 bg-muted flex items-center justify-center"
          >
            {product.images?.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl">{category?.emoji ?? '🏠'}</span>
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 p-4 space-y-2.5 min-w-0">
            {/* Header: Name + Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', category?.color)}>
                    {category?.label ?? product.category}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn('flex-shrink-0 gap-1 text-xs border', status?.bgColor)}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', status?.dotColor)} />
                {status?.label ?? booking.status}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{booking.timeSlot.startTime} ~ {booking.timeSlot.endTime}</span>
              </div>
              {booking.roomTypeName && (
                <div className="flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{booking.roomTypeName}</span>
                  {booking.priceSnapshot !== null && booking.priceSnapshot !== undefined && (
                    <span className="text-primary font-medium">
                      · {booking.priceSnapshot.toLocaleString()}원/박
                    </span>
                  )}
                </div>
              )}
              {product.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{product.address}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Link href={`/products/${product.id}`}>
                  <ExternalLink className="h-3 w-3" />
                  상세보기
                </Link>
              </Button>
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  취소하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 취소</DialogTitle>
            <DialogDescription>
              <strong>{product.name}</strong>의 {dateStr} 예약을 취소하시겠습니까?
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
