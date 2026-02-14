import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/product-card'
import { CategoryFilter } from '@/components/product/category-filter'
import type { ProductCategory } from '@prisma/client'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category as ProductCategory | undefined

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <CategoryFilter current={category} />
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            등록된 상품이 없습니다
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
