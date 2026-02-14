export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/product-card'
import { Search, TreePine, Hotel, Building2, ArrowRight } from 'lucide-react'
import type { Product } from '@prisma/client'

export default async function Home() {
  const [pensions, hotels, spaces, latest] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, category: 'PENSION' },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, category: 'HOTEL' },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, category: 'SPACE' },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground animate-fade-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              최고의 숙소를<br />최저가로 만나보세요
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              펜션, 호텔, 공간까지 한 곳에서 간편하게 예약
            </p>

            {/* Search Bar */}
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-white/95 backdrop-blur text-foreground rounded-full px-6 py-4 shadow-lg hover:shadow-xl transition-all hover:bg-white w-full max-w-md"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">어디로 떠나시나요?</span>
                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium">
                  검색
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <Link
            href="/products?category=PENSION"
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-md border hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <TreePine className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium">펜션</span>
          </Link>
          <Link
            href="/products?category=HOTEL"
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-md border hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Hotel className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">호텔</span>
          </Link>
          <Link
            href="/products?category=SPACE"
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-md border hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium">공간</span>
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Pension Section */}
        {pensions.length > 0 && (
          <CategorySection
            title="인기 펜션"
            emoji="🏕️"
            href="/products?category=PENSION"
            products={pensions}
          />
        )}

        {/* Hotel Section */}
        {hotels.length > 0 && (
          <CategorySection
            title="인기 호텔"
            emoji="🏨"
            href="/products?category=HOTEL"
            products={hotels}
          />
        )}

        {/* Space Section */}
        {spaces.length > 0 && (
          <CategorySection
            title="인기 공간"
            emoji="🏢"
            href="/products?category=SPACE"
            products={spaces}
          />
        )}

        {/* Latest Products */}
        {latest.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">최신 등록 상품</h2>
              <Link
                href="/products"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                전체보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function CategorySection({
  title,
  emoji,
  href,
  products,
}: {
  title: string
  emoji: string
  href: string
  products: Product[]
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          전체보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
