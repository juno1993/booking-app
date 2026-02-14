export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ProductDetail } from '@/components/product/product-detail'
import { SlotPicker } from '@/components/booking/slot-picker'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true },
  })

  if (!product) notFound()

  let user = null
  try {
    user = await getAuthUser()
  } catch {
    // Auth failure - render as logged out
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-slide-up">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <ProductDetail product={product} />
        <div className="lg:self-start lg:sticky lg:top-24">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  {product.pricePerSlot.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">원 / {product.slotDuration}분</span>
              </div>
            </div>
            <div className="border-t" />
            <SlotPicker
              productId={product.id}
              productName={product.name}
              isLoggedIn={!!user}
              price={product.pricePerSlot}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
