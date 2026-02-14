import { MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@prisma/client'

const categoryLabel: Record<string, string> = {
  PENSION: '펜션',
  HOTEL: '호텔',
  SPACE: '공간',
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="space-y-6">
      <div className="aspect-video max-w-2xl overflow-hidden rounded-lg bg-muted flex items-center justify-center">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground">이미지 없음</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{categoryLabel[product.category]}</Badge>
        </div>

        <h1 className="text-3xl font-bold">{product.name}</h1>

        {product.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
        )}

        <div className="space-y-2 text-sm">
          {product.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{product.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{product.openTime} ~ {product.closeTime}</span>
          </div>
          <div className="text-lg font-semibold">
            ₩{product.pricePerSlot.toLocaleString()} / {product.slotDuration}분
          </div>
        </div>
      </div>
    </div>
  )
}
