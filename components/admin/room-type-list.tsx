'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoomType, updateRoomType, deleteRoomType } from '@/app/actions/roomType'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { RoomType } from '@/types'

type RoomTypeWithCount = RoomType & { _count: { timeSlots: number } }

interface RoomTypeListProps {
  productId: string
  roomTypes: RoomTypeWithCount[]
}

interface RoomTypeFormState {
  name: string
  description: string
  price: string
  capacity: string
}

const defaultForm: RoomTypeFormState = {
  name: '',
  description: '',
  price: '0',
  capacity: '2',
}

export function RoomTypeList({ productId, roomTypes }: RoomTypeListProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomTypeWithCount | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomTypeFormState>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const openCreate = () => {
    setEditingRoom(null)
    setForm(defaultForm)
    setError(null)
    setFieldErrors({})
    setIsDialogOpen(true)
  }

  const openEdit = (room: RoomTypeWithCount) => {
    setEditingRoom(room)
    setForm({
      name: room.name,
      description: room.description ?? '',
      price: String(room.price),
      capacity: String(room.capacity),
    })
    setError(null)
    setFieldErrors({})
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    const data = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      capacity: Number(form.capacity),
      images: [],
      isActive: true,
    }

    const result = editingRoom
      ? await updateRoomType(editingRoom.id, productId, data)
      : await createRoomType(productId, data)

    setIsSubmitting(false)

    if (!result.success) {
      // result를 unknown으로 캐스팅 후 재추론 — Zod fieldErrors(항상 object)와 문자열 에러 모두 처리
      const errorData = (result as { success: false; error: unknown }).error
      if (errorData && typeof errorData === 'object') {
        setFieldErrors(errorData as Record<string, string[]>)
      } else {
        setError(typeof errorData === 'string' ? errorData : '입력값을 확인해주세요')
      }
      return
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsSubmitting(true)
    await deleteRoomType(deleteId, productId)
    setDeleteId(null)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">총 {roomTypes.length}개 객실 유형</p>
        <Button onClick={openCreate}>+ 객실 추가</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>객실명</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>정원</TableHead>
            <TableHead>슬롯 수</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                등록된 객실이 없습니다. 객실을 추가해주세요.
              </TableCell>
            </TableRow>
          ) : (
            roomTypes.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {room.description ?? '-'}
                </TableCell>
                <TableCell>{room.price.toLocaleString()}원</TableCell>
                <TableCell>{room.capacity}인</TableCell>
                <TableCell>{room._count.timeSlots}</TableCell>
                <TableCell>
                  <Badge variant={room.isActive ? 'default' : 'outline'}>
                    {room.isActive ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(room)}>
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(room.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? '객실 수정' : '객실 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="room-name">객실명 *</Label>
              <Input
                id="room-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 스탠다드룸, 디럭스룸"
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="room-desc">설명</Label>
              <Textarea
                id="room-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="객실 설명 (선택사항)"
                rows={2}
              />
              {fieldErrors.description && (
                <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="room-price">1박 가격 (원)</Label>
                <Input
                  id="room-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {fieldErrors.price && (
                  <p className="text-xs text-destructive">{fieldErrors.price[0]}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="room-capacity">최대 정원</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min={1}
                  max={100}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
                {fieldErrors.capacity && (
                  <p className="text-xs text-destructive">{fieldErrors.capacity[0]}</p>
                )}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>객실 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            이 객실을 삭제하면 연결된 슬롯과 예약도 모두 삭제됩니다. 계속하시겠습니까?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
