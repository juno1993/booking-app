import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const date = request.nextUrl.searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date parameter is required' }, { status: 400 })
  }

  const slots = await prisma.$queryRaw`
    SELECT id, start_time as "startTime", end_time as "endTime", status
    FROM time_slots
    WHERE product_id = ${params.id}
      AND date = ${date}::date
    ORDER BY start_time ASC
  `

  return NextResponse.json(slots)
}
