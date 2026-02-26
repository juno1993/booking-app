import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const roomTypes = await prisma.roomType.findMany({
    where: {
      productId: params.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      capacity: true,
      images: true,
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(roomTypes)
}
