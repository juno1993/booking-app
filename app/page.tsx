import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="container mx-auto px-4 py-16">
      <section className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold">예약 서비스</h1>
        <p className="text-lg text-muted-foreground">
          펜션, 호텔, 공간을 간편하게 예약하세요
        </p>
        <Button size="lg" asChild>
          <Link href="/products">상품 보기</Link>
        </Button>
      </section>

      {products.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">최신 상품</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
