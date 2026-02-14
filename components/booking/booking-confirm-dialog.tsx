'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking } from '@/app/actions/booking'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface BookingConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSlot: {
    id: string
    startTime: string
    endTime: string
  }
  productName: string
  selectedDate: string
}

export function BookingConfirmDialog({
  open,
  onOpenChange,
  selectedSlot,
  productName,
  selectedDate,
}: BookingConfirmDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    const result = await createBooking({
      timeSlotId: selectedSlot.id,
      note: note || undefined,
    })
    setIsLoading(false)

    if (!result.success) {
      toast({
        title: '예약 실패',
        description: typeof result.error === 'string' ? result.error : '예약에 실패했습니다',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: '예약 완료',
      description: '예약이 완료되었습니다',
    })
    onOpenChange(false)
    router.push('/my/bookings')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>예약 확인</DialogTitle>
          <DialogDescription>예약 정보를 확인해주세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">상품</span>
            <span className="font-medium">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">날짜</span>
            <span>{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">시간</span>
            <span>{selectedSlot.startTime} ~ {selectedSlot.endTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">메모 (선택)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="요청사항을 입력해주세요"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? '예약 중...' : '예약 확정'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
