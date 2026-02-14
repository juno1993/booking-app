import { Package, Clock, CalendarCheck, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    products: number
    pending: number
    today: number
    total: number
  }
}

const cards = [
  { key: 'products' as const, icon: Package, label: '활성 상품' },
  { key: 'pending' as const, icon: Clock, label: '대기 중 예약' },
  { key: 'today' as const, icon: CalendarCheck, label: '오늘 예약' },
  { key: 'total' as const, icon: BarChart3, label: '전체 예약' },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[card.key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
