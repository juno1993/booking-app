'use client'

import { useState } from 'react'
import { generateTimeSlots } from '@/app/actions/timeslot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { RoomType } from '@prisma/client'

interface SlotGeneratorFormProps {
  productId: string
  roomTypes?: RoomType[]
}

export function SlotGeneratorForm({ productId, roomTypes }: SlotGeneratorFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [roomTypeId, setRoomTypeId] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const hasRooms = roomTypes && roomTypes.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    setIsLoading(true)
    const selectedRoomTypeId = hasRooms && roomTypeId !== 'all' ? roomTypeId : undefined

    if (hasRooms && roomTypeId === 'all') {
      // 전체 객실에 일괄 생성
      let totalCount = 0
      for (const room of roomTypes) {
        const result = await generateTimeSlots(productId, startDate, endDate, room.id)
        if (result.success) totalCount += result.count
      }
      setIsLoading(false)
      toast({
        title: '슬롯 생성 완료',
        description: totalCount > 0 ? `${totalCount}개 슬롯이 생성되었습니다` : '이미 모든 슬롯이 존재합니다',
      })
      return
    }

    const result = await generateTimeSlots(productId, startDate, endDate, selectedRoomTypeId)
    setIsLoading(false)

    if (!result.success) {
      toast({
        title: '오류',
        description: result.error ?? '슬롯 생성에 실패했습니다',
        variant: 'destructive',
      })
    } else if (result.count > 0) {
      toast({
        title: '슬롯 생성 완료',
        description: `${result.count}개 슬롯이 생성되었습니다`,
      })
    } else {
      toast({
        title: '알림',
        description: '해당 기간에 이미 슬롯이 존재합니다',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
      {hasRooms && (
        <div className="space-y-2">
          <Label>객실 선택</Label>
          <Select value={roomTypeId} onValueChange={setRoomTypeId}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="객실 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 객실</SelectItem>
              {roomTypes.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="startDate">시작일</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">종료일</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isLoading || !startDate || !endDate}>
        {isLoading ? '생성 중...' : '슬롯 생성'}
      </Button>
    </form>
  )
}
