import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Product } from '@prisma/client'

const categoryLabel: Record<string, string> = {
  PENSION: '펜션',
  HOTEL: '호텔',
  SPACE: '공간',
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video bg-muted flex items-center justify-center">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">이미지 없음</span>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{product.name}</h3>
            <Badge variant="secondary">{categoryLabel[product.category]}</Badge>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
          <div className="flex w-full justify-between">
            <span>₩{product.pricePerSlot.toLocaleString()} / {product.slotDuration}분</span>
            {product.address && <span>{product.address}</span>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
