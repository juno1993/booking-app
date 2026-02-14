# Phase 2: 인증 & 사용자 시스템

---

## 2.1 인증 유틸리티

- [x] 완료

**신규**: `lib/auth.ts`

| 함수 | 설명 |
|------|------|
| `getAuthUser()` | Supabase `auth.getUser()` → `supabaseId`로 Prisma User 조회 → 반환 (없으면 `null`) |
| `requireAuth()` | `getAuthUser()` 호출 → `null`이면 `redirect('/login')` → User 반환 |
| `requireAdmin()` | `requireAuth()` 호출 → `role !== 'ADMIN'`이면 `redirect('/')` → User 반환 |

---

## 2.2 인증 Server Actions

- [x] 완료

**신규**: `app/actions/auth.ts`

| 함수 | 동작 |
|------|------|
| `signUp(data: SignUpSchemaType)` | Supabase `auth.signUp()` → 성공 시 `prisma.user.create({ supabaseId, email, name, role: 'CUSTOMER' })` → `{ success }` 반환 |
| `signIn(data: LoginSchemaType)` | Supabase `auth.signInWithPassword()` → 에러 시 `{ success: false, error }` 반환 |
| `signOut()` | Supabase `auth.signOut()` → `redirect('/login')` |
| `getCurrentUser()` | `getAuthUser()` wrapper |

---

## 2.3 미들웨어 업데이트

- [x] 완료

**수정**: `middleware.ts`

- 기존 Supabase 쿠키 리프레시 로직 **유지**
- 추가할 라우트 보호 로직:

| 경로 패턴 | 조건 | 동작 |
|-----------|------|------|
| `/admin/*`, `/my/*` | 미인증 | → `redirect('/login')` |
| `/login`, `/signup` | 이미 인증됨 | → `redirect('/')` |

- `config.matcher`는 기존과 동일 (정적 파일 제외)

---

## 2.4 스토어 & 훅 업데이트

- [x] 완료

### `store/user-store.ts` (수정)
- `UserProfile` 인터페이스 변경:
  - `id`, `supabaseId`, `email`, `name?`, `phone?`, `role: UserRole`
- `isAdmin()` 메서드 추가: `get().user?.role === 'ADMIN'`

### `hooks/use-user.ts` (수정)
- Supabase `auth.getUser()` 후 `/api/user/me` fetch로 Prisma 프로필(role 포함) 조회
- 조회된 프로필을 Zustand `setUser()`에 동기화
- `onAuthStateChange` 구독: 로그아웃 시 `clearUser()`
- 반환: `{ supabaseUser, profile, loading }`

---

## 2.5 로그인/회원가입 페이지 & 폼 컴포넌트

- [x] 완료

### 페이지 (서버 컴포넌트)

**`app/login/page.tsx`**
- 중앙 정렬 레이아웃, 제목 "로그인", 설명 "계정에 로그인하세요"
- `<LoginForm />` 렌더링

**`app/signup/page.tsx`**
- 중앙 정렬 레이아웃, 제목 "회원가입", 설명 "새 계정을 만드세요"
- `<SignUpForm />` 렌더링

### 폼 컴포넌트 (클라이언트 컴포넌트)

**`components/auth/login-form.tsx`**
- `'use client'`
- React Hook Form + `zodResolver(loginSchema)`
- 필드: 이메일 (Input), 비밀번호 (Input type=password)
- submit → `signIn(data)` 호출 → 성공 시 `router.push('/')` + `router.refresh()`
- 에러 표시 (서버 에러 + 필드 validation 에러)
- 하단: "계정이 없으신가요?" → `/signup` 링크

**`components/auth/signup-form.tsx`**
- React Hook Form + `zodResolver(signUpSchema)`
- 필드: 이름 (Input), 이메일 (Input), 비밀번호 (Input type=password)
- submit → `signUp(data)` 호출 → 성공 시 `router.push('/login')` (이메일 확인 안내 가능)
- 하단: "이미 계정이 있으신가요?" → `/login` 링크

---

## 2.6 사용자 프로필 API

- [x] 완료

**신규**: `app/api/user/me/route.ts`

```
GET /api/user/me
- getAuthUser()로 현재 유저 조회
- 인증됨: 200 + User 객체 JSON 반환
- 미인증: 401 + { error: 'Unauthorized' }
```

---

## 2.7 Supabase SQL — 관리자 계정 설정

> 첫 사용자 회원가입 후, Supabase SQL Editor에서 실행하여 ADMIN 역할 부여

```sql
-- 특정 이메일의 사용자를 ADMIN으로 변경
UPDATE users
SET role = 'ADMIN'
WHERE email = 'admin@example.com';
```

---

## 검증 방법

1. `/signup`에서 회원가입 → Supabase Auth + users 테이블에 레코드 생성 확인
2. `/login`에서 로그인 → 메인 페이지 이동, Header에 사용자 정보 표시
3. 로그아웃 → `/login`으로 이동, 세션 제거 확인
4. 미인증 상태에서 `/admin` 접근 → `/login`으로 redirect
5. 미인증 상태에서 `/my/bookings` 접근 → `/login`으로 redirect
6. 인증 상태에서 `/login` 접근 → `/`로 redirect
7. SQL로 ADMIN 역할 부여 후 `/admin` 접근 가능 확인
