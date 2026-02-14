export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilter } from '@/components/product/product-filter'
import type { ProductCategory, Prisma } from '@prisma/client'

interface SearchParams {
  category?: string
  startDate?: string
  endDate?: string
  region?: string
  minPrice?: string
  maxPrice?: string
  available?: string
  sort?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { category, startDate, endDate, region, minPrice, maxPrice, available, sort } = searchParams

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category && { category: category as ProductCategory }),
    ...(region && { address: { contains: region, mode: 'insensitive' as const } }),
  }

  // Price range
  if (minPrice || maxPrice) {
    where.pricePerSlot = {
      ...(minPrice && { gte: Number(minPrice) }),
      ...(maxPrice && { lte: Number(maxPrice) }),
    }
  }

  // Date range + availability filter
  if (startDate) {
    const dateFrom = new Date(startDate + 'T00:00:00Z')
    const dateTo = endDate ? new Date(endDate + 'T00:00:00Z') : dateFrom

    const slotCondition: Prisma.TimeSlotWhereInput = {
      date: { gte: dateFrom, lte: dateTo },
      ...(available === 'true' && { status: 'AVAILABLE' }),
    }

    where.timeSlots = { some: slotCondition }
  }

  // Sort
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'
      ? { pricePerSlot: 'asc' }
      : sort === 'price_desc'
        ? { pricePerSlot: 'desc' }
        : { createdAt: 'desc' }

  const products = await prisma.product.findMany({
    where,
    orderBy,
  })

  return (
    <div className="container mx-auto px-4 py-8 animate-slide-up">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <ProductFilter
          filters={{ category, startDate, endDate, region, minPrice, maxPrice, available, sort }}
          totalCount={products.length}
        />
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🔍</p>
            <p className="text-lg font-medium">검색 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground">
              필터 조건을 변경해보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
