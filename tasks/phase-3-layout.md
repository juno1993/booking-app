# Phase 3: 공통 레이아웃 & UI

---

## 3.1 Shadcn UI 컴포넌트 설치

- [x] 완료

```bash
npx shadcn-ui@latest add card input label textarea dialog dropdown-menu select toast badge table tabs separator avatar form
```

설치 후 `components/ui/` 하위에 생성되는 파일 목록:
- `card.tsx` — 상품 카드, 통계 카드, 예약 카드에 사용
- `input.tsx` — 모든 폼 입력 필드
- `label.tsx` — 폼 필드 라벨
- `textarea.tsx` — 상품 설명, 예약 메모 입력
- `dialog.tsx` — 예약 확인, 삭제 확인 모달
- `dropdown-menu.tsx` — 사용자 네비게이션 메뉴
- `select.tsx` — 카테고리 선택, 상태 필터
- `toast.tsx`, `toaster.tsx`, `use-toast.ts` — 알림 토스트
- `badge.tsx` — 카테고리, 예약 상태 표시
- `table.tsx` — 관리자 목록 테이블
- `tabs.tsx` — 카테고리 필터 탭
- `separator.tsx` — 구분선
- `avatar.tsx` — 사용자 아바타
- `form.tsx` — React Hook Form 연동 (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)

---

## 3.2 Header & UserNav 컴포넌트

- [x] 완료

### `components/layout/header.tsx` (서버 컴포넌트)
- `getAuthUser()`로 현재 유저 조회
- 구조:
  - 좌측: 로고 텍스트 "예약사이트" → `/` 링크
  - 중앙/우측: "상품 목록" → `/products` 링크
  - 우측 (미인증): `<Button>로그인</Button>` → `/login` 링크
  - 우측 (인증됨): "관리자" 링크 (ADMIN만 노출, → `/admin`) + `<UserNav user={user} />`
- 스타일: `border-b`, container, `h-16`, `items-center`, `justify-between`

### `components/layout/user-nav.tsx` (클라이언트 컴포넌트, `'use client'`)
- Props: `user: { name?: string | null, email: string }`
- Shadcn `DropdownMenu` 사용:
  - Trigger: `<Button variant="ghost" size="icon">` + Lucide `User` 아이콘
  - Content:
    - 사용자 이름 + 이메일 표시
    - `<Separator />`
    - "내 예약" → `/my/bookings` 링크
    - `<Separator />`
    - "로그아웃" → `signOut()` 서버 액션 호출

---

## 3.3 루트 레이아웃 업데이트

- [x] 완료

**수정**: `app/layout.tsx`

변경 사항:
- `metadata.title` → `"예약 사이트"`
- `metadata.description` → `"펜션, 호텔, 공간 예약 서비스"`
- `<body>` 내부에 `<Header />` 추가 (children 위)
- `<body>` 내부에 `<Toaster />` 추가 (children 아래)
- import: `@/components/layout/header`, `@/components/ui/toaster`

---

## 검증 방법

1. `npm run dev` → 모든 페이지 상단에 Header 렌더링 확인
2. 미인증: "로그인" 버튼 표시
3. 인증 (CUSTOMER): UserNav 드롭다운 동작, "관리자" 링크 미노출
4. 인증 (ADMIN): UserNav + "관리자" 링크 노출
5. 토스트 알림 테스트 (이후 Phase에서 사용)
