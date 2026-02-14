# Phase 4: 관리자 대시보드

---

## 4.1 관리자 레이아웃 & 사이드바

- [x] 완료

### `app/admin/layout.tsx` (서버 컴포넌트)
- `requireAdmin()` 호출 — ADMIN 아닌 유저는 `/`로 redirect
- 레이아웃: `flex min-h-screen` → 좌측 `<AdminSidebar />` + 우측 `<main className="flex-1 p-6">{children}</main>`

### `components/admin/admin-sidebar.tsx` (클라이언트 컴포넌트, `'use client'`)
- `usePathname()`으로 현재 경로 가져와서 활성 메뉴 하이라이트
- 네비게이션 링크 목록:

| 아이콘 | 라벨 | 경로 |
|--------|------|------|
| LayoutDashboard | 대시보드 | `/admin` |
| Package | 상품 관리 | `/admin/products` |
| Calendar | 예약 관리 | `/admin/bookings` |

- 스타일: `w-64 border-r bg-muted/40 p-4`, 활성 링크는 `bg-primary/10 text-primary`

---

## 4.2 상품 CRUD

- [x] 완료

### `app/actions/product.ts` (Server Actions)

| 함수 | 입력 | 동작 |
|------|------|------|
| `createProduct(formData)` | `unknown` → Zod `productSchema` 검증 | `requireAdmin()` → `prisma.product.create(parsed.data)` → `revalidatePath('/admin/products')` |
| `updateProduct(id, formData)` | `string, unknown` | `requireAdmin()` → `prisma.product.update({ where: { id }, data })` → revalidate |
| `deleteProduct(id)` | `string` | `requireAdmin()` → `prisma.product.delete({ where: { id } })` → revalidate (Cascade로 연관 슬롯/예약도 삭제) |
| `getProducts()` | 없음 | `prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { timeSlots: true } } } })` |
| `getProduct(id)` | `string` | `prisma.product.findUnique({ where: { id } })` |

### `components/admin/product-form.tsx` (클라이언트 컴포넌트)
- Props: `product?: Product` (수정 모드 시 기존 데이터)
- React Hook Form + `zodResolver(productSchema)` + Shadcn `Form` 컴포넌트
- 필드 구성:
  - 상품명: `Input`
  - 설명: `Textarea`
  - 카테고리: `Select` (펜션/호텔/공간)
  - 가격(슬롯당): `Input type="number"`
  - 주소: `Input`
  - 운영 시작시간: `Input type="time"`
  - 운영 종료시간: `Input type="time"`
  - 슬롯 단위(분): `Input type="number"` (기본값 30)
  - 활성 상태: 체크박스
- submit → `createProduct()` 또는 `updateProduct()` 호출
- 성공 시 `router.push('/admin/products')`

### `components/admin/product-table.tsx` (클라이언트 컴포넌트)
- Props: `products` 배열
- Shadcn `Table` 사용

| 컬럼 | 내용 |
|------|------|
| 상품명 | name |
| 카테고리 | Badge (PENSION→펜션, HOTEL→호텔, SPACE→공간) |
| 운영시간 | openTime ~ closeTime |
| 슬롯 수 | _count.timeSlots |
| 상태 | isActive ? "활성" : "비활성" |
| 액션 | 수정 링크(`/admin/products/[id]`), 슬롯 관리(`/admin/products/[id]/slots`), 삭제 버튼(확인 Dialog) |

### 관리자 상품 페이지

**`app/admin/products/page.tsx`** (서버 컴포넌트)
- `getProducts()`로 상품 목록 조회
- "상품 등록" 버튼 → `/admin/products/new`
- `<ProductTable products={products} />`

**`app/admin/products/new/page.tsx`** (서버 컴포넌트)
- 제목: "상품 등록"
- `<ProductForm />`

**`app/admin/products/[id]/page.tsx`** (서버 컴포넌트)
- `getProduct(params.id)`로 기존 상품 로드 (없으면 `notFound()`)
- 제목: "상품 수정"
- `<ProductForm product={product} />`

---

## 4.3 타임슬롯 관리

- [x] 완료

### `app/actions/timeslot.ts` (Server Actions)

| 함수 | 입력 | 동작 |
|------|------|------|
| `generateTimeSlots(productId, startDate, endDate)` | `string, string("YYYY-MM-DD"), string` | `requireAdmin()` → 상품의 openTime/closeTime/slotDuration 조회 → 날짜 범위 순회 → 30분 슬롯 배열 생성 → `prisma.timeSlot.createMany({ data: slots, skipDuplicates: true })` → 생성된 개수 반환 |
| `toggleSlotStatus(slotId, status)` | `string, 'AVAILABLE' \| 'BLOCKED'` | `requireAdmin()` → `prisma.timeSlot.update({ where: { id }, data: { status } })` |
| `getSlotsByProductAndDate(productId, date)` | `string, string` | `prisma.timeSlot.findMany({ where: { productId, date }, include: { booking: { include: { user: { select: { id, email, name, phone } } } } }, orderBy: { startTime: 'asc' } })` |

### `components/admin/slot-generator-form.tsx` (클라이언트 컴포넌트)
- Props: `productId: string`
- 필드: 시작일 (`Input type="date"`), 종료일 (`Input type="date"`)
- submit → `generateTimeSlots()` 호출 → 토스트로 "N개 슬롯이 생성되었습니다" 알림
- 생성된 슬롯이 0개면 "이미 생성된 슬롯입니다" 안내

### `components/admin/slot-calendar-view.tsx` (클라이언트 컴포넌트)
- Props: `productId: string`
- 날짜 선택 `Input type="date"` → 해당 날짜의 슬롯 목록 fetch
- 슬롯 그리드 표시 (시간별):

| 상태 | 색상 | 클릭 동작 |
|------|------|-----------|
| AVAILABLE | 초록(bg-green-100) | 클릭 → BLOCKED로 전환 |
| BOOKED | 파랑(bg-blue-100) | 클릭 불가 (예약 정보 툴팁 표시) |
| BLOCKED | 빨강(bg-red-100) | 클릭 → AVAILABLE로 전환 |

### `app/admin/products/[id]/slots/page.tsx` (서버 컴포넌트)
- 상품 정보 로드 (없으면 `notFound()`)
- 상품명 + 운영시간 표시
- `<SlotGeneratorForm productId={id} />`
- `<SlotCalendarView productId={id} />`

---

## 4.4 예약 관리

- [x] 완료

### `app/actions/booking.ts` (Server Actions)

| 함수 | 입력 | 동작 |
|------|------|------|
| `createBooking(formData)` | `unknown` → Zod 검증 | `requireAuth()` → `prisma.$transaction`: 슬롯 조회(AVAILABLE 확인) → 슬롯 status='BOOKED' → `prisma.booking.create({ userId, timeSlotId, status: 'PENDING' })` |
| `confirmBooking(bookingId)` | `string` | `requireAdmin()` → `prisma.booking.update({ status: 'CONFIRMED' })` |
| `cancelBooking(bookingId)` | `string` | `requireAuth()` → 본인 예약 또는 ADMIN 확인 → `prisma.$transaction`: booking status='CANCELLED' + 슬롯 status='AVAILABLE' |
| `getBookings(filter?)` | `{ status? }` | `requireAdmin()` → `prisma.booking.findMany({ include: { timeSlot: { include: { product } }, user }, orderBy: { createdAt: 'desc' } })` |
| `getBooking(id)` | `string` | `requireAdmin()` → `prisma.booking.findUnique({ include: { ... } })` |

### `components/admin/booking-table.tsx` (클라이언트 컴포넌트)
- Props: `bookings: BookingWithDetails[]`
- Shadcn `Table` 사용

| 컬럼 | 내용 |
|------|------|
| 상품명 | timeSlot.product.name |
| 고객 | user.name (user.email) |
| 날짜 | timeSlot.date 포맷팅 |
| 시간 | timeSlot.startTime ~ timeSlot.endTime |
| 상태 | Badge (PENDING→대기, CONFIRMED→확정, CANCELLED→취소) |
| 액션 | 상세 보기 링크(`/admin/bookings/[id]`) |

### `components/admin/booking-detail-card.tsx` (클라이언트 컴포넌트)
- Props: `booking: BookingWithDetails`
- Card에 예약 상세 정보 표시: 상품, 고객, 날짜/시간, 메모, 상태
- 하단 버튼:
  - PENDING 상태: "예약 확정" 버튼 → `confirmBooking()`, "예약 취소" 버튼 → `cancelBooking()`
  - CONFIRMED 상태: "예약 취소" 버튼만
  - CANCELLED 상태: 버튼 없음

### 관리자 예약 페이지

**`app/admin/bookings/page.tsx`** (서버 컴포넌트)
- `getBookings()`로 전체 예약 목록 조회
- 상태 필터 (전체/대기/확정/취소) — `searchParams.status`
- `<BookingTable bookings={bookings} />`

**`app/admin/bookings/[id]/page.tsx`** (서버 컴포넌트)
- `getBooking(params.id)` (없으면 `notFound()`)
- `<BookingDetailCard booking={booking} />`

---

## 4.5 대시보드 통계 카드

- [x] 완료

### `components/admin/stats-cards.tsx`
- Props: `stats: { products, pending, today, total }`
- 4개 Shadcn `Card` 그리드 (2x2 반응형):

| 카드 | 아이콘 | 라벨 | 값 |
|------|--------|------|-----|
| 활성 상품 | Package | 활성 상품 | products |
| 대기 예약 | Clock | 대기 중 예약 | pending |
| 오늘 예약 | CalendarCheck | 오늘 예약 | today |
| 전체 예약 | BarChart3 | 전체 예약 | total |

### `app/admin/page.tsx` (서버 컴포넌트)
- `Promise.all()`로 4개 카운트 쿼리 병렬 실행
  - `prisma.product.count({ where: { isActive: true } })`
  - `prisma.booking.count({ where: { status: 'PENDING' } })`
  - `prisma.booking.count({ where: { createdAt: { gte: today } } })`
  - `prisma.booking.count()`
- 제목: "관리자 대시보드"
- `<StatsCards stats={...} />`
- 최근 예약 5건 테이블 (선택적)

---

## 검증 방법

1. ADMIN으로 로그인 → `/admin` 접근 → 대시보드 통계 카드 표시
2. `/admin/products/new` → 상품 등록 → 목록에 표시 확인
3. 상품 수정 → 변경 내용 반영 확인
4. 상품 삭제 → 확인 Dialog → 삭제 + 목록에서 제거
5. `/admin/products/[id]/slots` → 날짜 범위 입력 → 슬롯 생성 → 캘린더 뷰에 표시
6. 슬롯 클릭 → AVAILABLE↔BLOCKED 전환
7. 예약 목록/상세에서 확정/취소 동작 확인 (Phase 5 예약 기능 구현 후 테스트)
