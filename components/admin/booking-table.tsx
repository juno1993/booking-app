'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BookingWithDetails } from '@/types'

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDING: { label: '대기', variant: 'secondary' },
  CONFIRMED: { label: '확정', variant: 'default' },
  CANCELLED: { label: '취소', variant: 'destructive' },
}

interface BookingTableProps {
  bookings: BookingWithDetails[]
}

export function BookingTable({ bookings }: BookingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>상품명</TableHead>
          <TableHead>고객</TableHead>
          <TableHead>날짜</TableHead>
          <TableHead>시간</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              예약이 없습니다
            </TableCell>
          </TableRow>
        ) : (
          bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                {booking.timeSlot.product.name}
              </TableCell>
              <TableCell>
                {booking.user.name ?? '-'} ({booking.user.email})
              </TableCell>
              <TableCell>
                {new Date(booking.timeSlot.date).toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell>
                {booking.timeSlot.startTime} ~ {booking.timeSlot.endTime}
              </TableCell>
              <TableCell>
                <Badge variant={statusLabel[booking.status]?.variant ?? 'secondary'}>
                  {statusLabel[booking.status]?.label ?? booking.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/bookings/${booking.id}`}>상세</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
