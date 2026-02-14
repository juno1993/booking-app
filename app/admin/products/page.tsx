import Link from 'next/link'
import { getProducts } from '@/app/actions/product'
import { Button } from '@/components/ui/button'
import { ProductTable } from '@/components/admin/product-table'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Button asChild>
          <Link href="/admin/products/new">상품 등록</Link>
        </Button>
      </div>
      <ProductTable products={products} />
    </div>
  )
}
