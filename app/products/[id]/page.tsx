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

  const user = await getAuthUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductDetail product={product} />
        <SlotPicker
          productId={product.id}
          productName={product.name}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  )
}
