import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'
import { Search, Building2, Hotel, TreePine } from 'lucide-react'

export async function Header() {
  let user = null
  try {
    user = await getAuthUser()
  } catch {
    // Build time or DB connection failure - render as logged out
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold">StayNow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/products?category=PENSION"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              <TreePine className="h-4 w-4" />
              펜션
            </Link>
            <Link
              href="/products?category=HOTEL"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              <Hotel className="h-4 w-4" />
              호텔
            </Link>
            <Link
              href="/products?category=SPACE"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              <Building2 className="h-4 w-4" />
              공간
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>어디로 떠나시나요?</span>
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  관리자
                </Link>
              )}
              <UserNav user={{ name: user.name, email: user.email }} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
