'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/app/actions/product'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@prisma/client'

type ProductWithCount = Product & { _count: { timeSlots: number } }

const categoryLabel: Record<string, string> = {
  PENSION: '펜션',
  HOTEL: '호텔',
  SPACE: '공간',
}

interface ProductTableProps {
  products: ProductWithCount[]
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteProduct(deleteId)
    setDeleteId(null)
    setIsDeleting(false)
    router.refresh()
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>상품명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>운영시간</TableHead>
            <TableHead>슬롯 수</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                등록된 상품이 없습니다
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabel[product.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.openTime} ~ {product.closeTime}
                </TableCell>
                <TableCell>{product._count.timeSlots}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? 'default' : 'outline'}>
                    {product.isActive ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>수정</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/slots`}>
                        슬롯 관리
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(product.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              정말 이 상품을 삭제하시겠습니까? 연관된 슬롯과 예약도 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
