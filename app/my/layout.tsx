import { requireAuth } from '@/lib/auth'

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <>{children}</>
}
