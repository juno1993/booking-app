import Link from 'next/link'
import { SignUpForm } from '@/components/auth/signup-form'
import { Building2 } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-lg space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary">StayNow</span>
            </Link>
            <div className="pt-2">
              <h1 className="text-2xl font-bold">회원가입</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                StayNow에서 최고의 숙소를 예약하세요
              </p>
            </div>
          </div>

          <SignUpForm />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          {/* Social Login Placeholder */}
          <div className="grid gap-2">
            <button
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] opacity-50 cursor-not-allowed"
            >
              카카오로 시작하기 (준비 중)
            </button>
            <button
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border bg-[#03C75A] px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
            >
              네이버로 시작하기 (준비 중)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
