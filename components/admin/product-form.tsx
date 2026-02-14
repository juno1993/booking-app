'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductSchemaType } from '@/lib/validations/product'
import { createProduct, updateProduct } from '@/app/actions/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product } from '@prisma/client'

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? '',
          category: product.category,
          images: product.images,
          pricePerSlot: product.pricePerSlot,
          address: product.address ?? '',
          openTime: product.openTime,
          closeTime: product.closeTime,
          slotDuration: product.slotDuration,
          isActive: product.isActive,
        }
      : {
          openTime: '09:00',
          closeTime: '22:00',
          slotDuration: 30,
          isActive: true,
          images: [],
        },
  })

  const onSubmit = async (data: ProductSchemaType) => {
    setError(null)
    const result = isEdit
      ? await updateProduct(product.id, data)
      : await createProduct(data)

    if (!result.success) {
      setError('저장에 실패했습니다')
      return
    }

    router.push('/admin/products')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">상품명</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" rows={4} {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>카테고리</Label>
        <Select
          defaultValue={product?.category}
          onValueChange={(value) =>
            setValue('category', value as ProductSchemaType['category'])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENSION">펜션</SelectItem>
            <SelectItem value="HOTEL">호텔</SelectItem>
            <SelectItem value="SPACE">공간</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerSlot">가격 (슬롯당, 원)</Label>
        <Input id="pricePerSlot" type="number" {...register('pricePerSlot')} />
        {errors.pricePerSlot && (
          <p className="text-sm text-destructive">{errors.pricePerSlot.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input id="address" {...register('address')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="openTime">운영 시작시간</Label>
          <Input id="openTime" type="time" {...register('openTime')} />
          {errors.openTime && (
            <p className="text-sm text-destructive">{errors.openTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="closeTime">운영 종료시간</Label>
          <Input id="closeTime" type="time" {...register('closeTime')} />
          {errors.closeTime && (
            <p className="text-sm text-destructive">{errors.closeTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slotDuration">슬롯 단위 (분)</Label>
        <Input id="slotDuration" type="number" {...register('slotDuration')} />
        {errors.slotDuration && (
          <p className="text-sm text-destructive">{errors.slotDuration.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          className="h-4 w-4"
          {...register('isActive')}
        />
        <Label htmlFor="isActive">활성 상태</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
