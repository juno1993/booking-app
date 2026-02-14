import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import type { Product } from '@prisma/client'

const categoryLabel: Record<string, string> = {
  PENSION: '펜션',
  HOTEL: '호텔',
  SPACE: '공간',
}

const categoryColor: Record<string, string> = {
  PENSION: 'bg-green-100 text-green-700',
  HOTEL: 'bg-blue-100 text-blue-700',
  SPACE: 'bg-purple-100 text-purple-700',
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl">
                {product.category === 'PENSION' ? '🏕️' : product.category === 'HOTEL' ? '🏨' : '🏢'}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor[product.category]}`}>
              {categoryLabel[product.category]}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.address && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{product.address}</span>
            </p>
          )}

          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="text-lg font-bold text-primary">
                {product.pricePerSlot.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">원</span>
              <span className="text-xs text-muted-foreground"> / {product.slotDuration}분</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
