'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Search,
  SlidersHorizontal,
  X,
  TreePine,
  Hotel,
  Building2,
  CalendarDays,
  MapPin,
  Check,
} from 'lucide-react'

const categories = [
  { label: '전체', value: '', icon: null },
  { label: '펜션', value: 'PENSION', icon: TreePine },
  { label: '호텔', value: 'HOTEL', icon: Hotel },
  { label: '공간', value: 'SPACE', icon: Building2 },
]

const pricePresets = [
  { label: '전체', min: '', max: '' },
  { label: '~3만', min: '', max: '30000' },
  { label: '3~5만', min: '30000', max: '50000' },
  { label: '5~10만', min: '50000', max: '100000' },
  { label: '10만~', min: '100000', max: '' },
]

const sortOptions = [
  { label: '최신순', value: 'newest' },
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
]

interface ProductFilterProps {
  filters: {
    category?: string
    startDate?: string
    endDate?: string
    region?: string
    minPrice?: string
    maxPrice?: string
    available?: string
    sort?: string
  }
  totalCount: number
}

export function ProductFilter({ filters, totalCount }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showFilters, setShowFilters] = useState(false)
  const [region, setRegion] = useState(filters.region ?? '')

  const updateFilter = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      // available은 날짜 없으면 제거
      if (!params.get('startDate')) {
        params.delete('available')
        params.delete('endDate')
      }

      const query = params.toString()
      router.push(query ? `/products?${query}` : '/products')
    },
    [router, searchParams]
  )

  const clearAllFilters = () => {
    setRegion('')
    router.push('/products')
  }

  const hasDateFilter = filters.startDate || filters.endDate
  const activeFilterCount = [
    filters.category,
    hasDateFilter,
    filters.region,
    filters.minPrice || filters.maxPrice,
    filters.available,
  ].filter(Boolean).length

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Top Bar: Category + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Buttons */}
        <div className="flex gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = filters.category === cat.value || (!filters.category && !cat.value)
            return (
              <button
                key={cat.value}
                onClick={() => updateFilter({ category: cat.value })}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Sort + Filter Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sort ?? 'newest'}
            onChange={(e) => updateFilter({ sort: e.target.value === 'newest' ? '' : e.target.value })}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            필터
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="rounded-xl border bg-card p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date Range Filter */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                날짜
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  min={today}
                  value={filters.startDate ?? ''}
                  onChange={(e) => {
                    const updates: Record<string, string> = { startDate: e.target.value }
                    // 종료일이 시작일보다 이전이면 종료일도 같이 변경
                    if (filters.endDate && e.target.value && e.target.value > filters.endDate) {
                      updates.endDate = e.target.value
                    }
                    updateFilter(updates)
                  }}
                  placeholder="체크인"
                />
                <span className="text-muted-foreground text-sm flex-shrink-0">~</span>
                <Input
                  type="date"
                  min={filters.startDate || today}
                  value={filters.endDate ?? ''}
                  onChange={(e) => updateFilter({ endDate: e.target.value })}
                  disabled={!filters.startDate}
                  placeholder="체크아웃"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                지역
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="예: 제주, 강남"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateFilter({ region })
                  }}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateFilter({ region })}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">가격대</Label>
              <div className="flex flex-wrap gap-2">
                {pricePresets.map((preset) => {
                  const isActive =
                    (filters.minPrice ?? '') === preset.min &&
                    (filters.maxPrice ?? '') === preset.max
                  return (
                    <button
                      key={preset.label}
                      onClick={() =>
                        updateFilter({ minPrice: preset.min, maxPrice: preset.max })
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      )}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Available Only + Clear */}
          <div className="flex items-center justify-between border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={() =>
                  updateFilter({
                    available: filters.available === 'true' ? '' : 'true',
                  })
                }
                disabled={!filters.startDate}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                  filters.available === 'true'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border',
                  !filters.startDate && 'opacity-50 cursor-not-allowed'
                )}
              >
                {filters.available === 'true' && <Check className="h-3 w-3" />}
              </button>
              <span className={cn(
                'text-sm',
                !filters.startDate && 'text-muted-foreground'
              )}>
                예약 가능한 숙소만 보기
              </span>
              {!filters.startDate && (
                <span className="text-xs text-muted-foreground">(날짜를 먼저 선택하세요)</span>
              )}
            </label>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1 text-muted-foreground">
                <X className="h-4 w-4" />
                필터 초기화
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Result Count */}
      <p className="text-sm text-muted-foreground">
        검색 결과 <span className="font-semibold text-foreground">{totalCount}</span>개
      </p>
    </div>
  )
}
