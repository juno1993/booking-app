import { notFound } from 'next/navigation'
import { getProduct } from '@/app/actions/product'
import { ProductForm } from '@/components/admin/product-form'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">상품 수정</h1>
      <ProductForm product={product} />
    </div>
  )
}
