import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const date = request.nextUrl.searchParams.get('date')
  const roomTypeId = request.nextUrl.searchParams.get('roomTypeId')

  if (!date) {
    return NextResponse.json({ error: 'date parameter is required' }, { status: 400 })
  }

  const slots = await prisma.timeSlot.findMany({
    where: {
      productId: params.id,
      date: new Date(date + 'T00:00:00Z'),
      ...(roomTypeId ? { roomTypeId } : {}),
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      roomTypeId: true,
    },
    orderBy: [{ roomTypeId: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json(slots)
}
