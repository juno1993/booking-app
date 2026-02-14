import { MapPin, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
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

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-foreground transition-colors"
        >
          {categoryLabel[product.category]}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-6xl">
              {product.category === 'PENSION' ? '🏕️' : product.category === 'HOTEL' ? '🏨' : '🏢'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor[product.category]}`}>
            {categoryLabel[product.category]}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

        {product.address && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{product.address}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{product.openTime} ~ {product.closeTime}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {product.pricePerSlot.toLocaleString()}
          </span>
          <span className="text-muted-foreground">원 / {product.slotDuration}분</span>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-lg font-semibold">상세 정보</h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Usage Info */}
      <div className="space-y-3 border-t pt-6">
        <h2 className="text-lg font-semibold">이용 안내</h2>
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
          <p>• 운영 시간: {product.openTime} ~ {product.closeTime}</p>
          <p>• 예약 단위: {product.slotDuration}분</p>
          <p>• 예약 후 관리자 확정이 필요합니다</p>
          <p>• 취소는 예약 상세 페이지에서 가능합니다</p>
        </div>
      </div>
    </div>
  )
}
