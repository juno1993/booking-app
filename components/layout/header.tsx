import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'

export async function Header() {
  const user = await getAuthUser()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            예약사이트
          </Link>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            상품 목록
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  관리자
                </Link>
              )}
              <UserNav user={{ name: user.name, email: user.email }} />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
