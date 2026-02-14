import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">S</span>
              </div>
              <span className="font-bold">StayNow</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              최고의 숙소를 최저가로.<br />
              펜션, 호텔, 공간을 간편하게 예약하세요.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">카테고리</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products?category=PENSION" className="hover:text-foreground transition-colors">
                  펜션
                </Link>
              </li>
              <li>
                <Link href="/products?category=HOTEL" className="hover:text-foreground transition-colors">
                  호텔
                </Link>
              </li>
              <li>
                <Link href="/products?category=SPACE" className="hover:text-foreground transition-colors">
                  공간
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">고객지원</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  자주 묻는 질문
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  이용약관
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  개인정보처리방침
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">고객센터</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-lg font-bold text-foreground">1588-0000</p>
              <p>평일 09:00 ~ 18:00</p>
              <p>점심시간 12:00 ~ 13:00</p>
              <p>주말/공휴일 휴무</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StayNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
