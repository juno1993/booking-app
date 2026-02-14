import { SignUpForm } from '@/components/auth/signup-form'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            새 계정을 만드세요
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
