import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProduct } from '@/app/actions/product'
import { getAllRoomTypes } from '@/app/actions/roomType'
import { SlotGeneratorForm } from '@/components/admin/slot-generator-form'
import { SlotCalendarView } from '@/components/admin/slot-calendar-view'
import { Button } from '@/components/ui/button'

export default async function SlotsPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const isRoomProduct = product.category === 'PENSION' || product.category === 'HOTEL'
  const roomTypes = isRoomProduct ? await getAllRoomTypes(params.id) : []

  return (
    <div className="space-y-6">
      {isRoomProduct && (
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/products/${params.id}/rooms`}>← 객실 관리</Link>
          </Button>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">슬롯 관리 — {product.name}</h1>
        <p className="text-sm text-muted-foreground">
          운영시간: {product.openTime} ~ {product.closeTime} | 슬롯 단위: {product.slotDuration}분
          {isRoomProduct && roomTypes.length === 0 && (
            <span className="text-yellow-600 ml-2">
              ⚠ 객실을 먼저 등록해야 슬롯을 생성할 수 있습니다
            </span>
          )}
        </p>
      </div>
      {(!isRoomProduct || roomTypes.length > 0) && (
        <SlotGeneratorForm
          productId={params.id}
          roomTypes={isRoomProduct ? roomTypes : undefined}
        />
      )}
      <SlotCalendarView
        productId={params.id}
        roomTypes={isRoomProduct ? roomTypes : undefined}
      />
    </div>
  )
}
