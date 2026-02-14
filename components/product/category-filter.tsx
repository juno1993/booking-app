'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const categories = [
  { label: '전체', value: '' },
  { label: '펜션', value: 'PENSION' },
  { label: '호텔', value: 'HOTEL' },
  { label: '공간', value: 'SPACE' },
]

interface CategoryFilterProps {
  current?: string
}

export function CategoryFilter({ current }: CategoryFilterProps) {
  const router = useRouter()

  return (
    <div className="flex gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() =>
            router.push(cat.value ? `/products?category=${cat.value}` : '/products')
          }
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            (current === cat.value || (!current && !cat.value))
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
