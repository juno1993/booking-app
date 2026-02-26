import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProduct } from '@/app/actions/product'
import { getAllRoomTypes } from '@/app/actions/roomType'
import { RoomTypeList } from '@/components/admin/room-type-list'
import { Button } from '@/components/ui/button'

export default async function RoomsPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  if (product.category !== 'PENSION' && product.category !== 'HOTEL') {
    notFound()
  }

  const roomTypes = await getAllRoomTypes(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">← 상품 목록</Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{product.name} — 객실 관리</h1>
        <p className="text-muted-foreground text-sm mt-1">
          객실 유형을 추가하고 관리합니다. 슬롯 생성 시 각 객실을 선택할 수 있습니다.
        </p>
      </div>
      <RoomTypeList productId={params.id} roomTypes={roomTypes} />
    </div>
  )
}
