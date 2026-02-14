import { ProductForm } from '@/components/admin/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">상품 등록</h1>
      <ProductForm />
    </div>
  )
}
