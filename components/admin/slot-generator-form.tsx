'use client'

import { useState } from 'react'
import { generateTimeSlots } from '@/app/actions/timeslot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface SlotGeneratorFormProps {
  productId: string
}

export function SlotGeneratorForm({ productId }: SlotGeneratorFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    setIsLoading(true)
    const result = await generateTimeSlots(productId, startDate, endDate)
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
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
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
