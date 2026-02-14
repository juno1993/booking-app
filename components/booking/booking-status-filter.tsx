'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BookingStatusFilterProps {
  current?: string
  counts: {
    all: number
    PENDING: number
    CONFIRMED: number
    CANCELLED: number
  }
}

const tabs = [
  { label: '전체', value: undefined, color: '' },
  { label: '대기 중', value: 'PENDING', color: 'text-yellow-600' },
  { label: '확정', value: 'CONFIRMED', color: 'text-green-600' },
  { label: '취소됨', value: 'CANCELLED', color: 'text-red-500' },
] as const

export function BookingStatusFilter({ current, counts }: BookingStatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = current === tab.value || (!current && !tab.value)
        const count = tab.value ? counts[tab.value] : counts.all
        return (
          <Link
            key={tab.label}
            href={tab.value ? `/my/bookings?status=${tab.value}` : '/my/bookings'}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background text-muted-foreground'
              )}
            >
              {count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
