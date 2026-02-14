import { notFound } from 'next/navigation'
import { getProduct } from '@/app/actions/product'
import { SlotGeneratorForm } from '@/components/admin/slot-generator-form'
import { SlotCalendarView } from '@/components/admin/slot-calendar-view'

export default async function SlotsPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">슬롯 관리 — {product.name}</h1>
        <p className="text-sm text-muted-foreground">
          운영시간: {product.openTime} ~ {product.closeTime} | 슬롯 단위: {product.slotDuration}분
        </p>
      </div>
      <SlotGeneratorForm productId={params.id} />
      <SlotCalendarView productId={params.id} />
    </div>
  )
}
