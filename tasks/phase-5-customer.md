# Phase 5: 고객 페이지

---

## 5.1 상품 목록 페이지

- [x] 완료

### `components/product/product-card.tsx`
- Props: `product: Product`
- Shadcn `Card` 사용
- 구조:
  - 상단: 이미지 (images[0] 또는 placeholder)
  - 본문: 상품명, 카테고리 `Badge` (PENSION→펜션, HOTEL→호텔, SPACE→공간)
  - 하단: 가격 (₩ pricePerSlot / 30분), 주소
- 전체 카드 클릭 → `/products/[id]` 링크

### `components/product/category-filter.tsx` (클라이언트 컴포넌트)
- Props: `current?: ProductCategory`
- 탭 버튼 목록:

| 라벨 | 값 | 동작 |
|------|-----|------|
| 전체 | undefined | `/products` |
| 펜션 | PENSION | `/products?category=PENSION` |
| 호텔 | HOTEL | `/products?category=HOTEL` |
| 공간 | SPACE | `/products?category=SPACE` |

- `useRouter().push()`로 URL searchParams 변경 → 서버 컴포넌트 refetch
- 활성 탭: `bg-primary text-primary-foreground`, 비활성: `bg-muted`

### `app/(public)/products/page.tsx` (서버 컴포넌트)
- `searchParams.category`로 필터 조건 결정
- `prisma.product.findMany({ where: { isActive: true, ...(category && { category }) }, orderBy: { createdAt: 'desc' } })`
- 구조:
  - 제목: "상품 목록"
  - `<CategoryFilter current={category} />`
  - 상품 카드 그리드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - 상품 없을 때: "등록된 상품이 없습니다" 안내

---

## 5.2 상품 상세 페이지

- [x] 완료

### `components/product/product-detail.tsx`
- Props: `product: Product`
- 구조:
  - 이미지 갤러리 (images 배열, 없으면 placeholder)
  - 카테고리 `Badge`
  - 상품명 (h1)
  - 설명
  - 정보 목록: 주소 (MapPin 아이콘), 운영시간 (Clock 아이콘, openTime ~ closeTime), 가격 (₩ pricePerSlot / slotDuration분)

### `app/(public)/products/[id]/page.tsx` (서버 컴포넌트)
- `prisma.product.findUnique({ where: { id: params.id, isActive: true } })`
- 없으면 `notFound()`
- `getAuthUser()`로 로그인 여부 확인
- 구조:
  - `<ProductDetail product={product} />`
  - `<SlotPicker productId={product.id} isLoggedIn={!!user} />`

---

## 5.3 슬롯 피커 & 예약 기능

- [x] 완료

### `app/api/products/[id]/slots/route.ts` (API Route)

```
GET /api/products/:id/slots?date=YYYY-MM-DD
- date 파라미터 필수 (없으면 400)
- prisma.timeSlot.findMany({
    where: { productId: id, date: new Date(date) },
    select: { id, startTime, endTime, status },
    orderBy: { startTime: 'asc' }
  })
- 200 + SlotData[] JSON 반환
```

### `components/booking/slot-picker.tsx` (클라이언트 컴포넌트, `'use client'`)
- Props: `productId: string, isLoggedIn: boolean`
- State: `selectedDate` (오늘), `slots: SlotData[]`, `loading`, `selectedSlot: string | null`
- `useEffect`: selectedDate 변경 시 → `fetch('/api/products/${productId}/slots?date=${selectedDate}')` → setSlots
- UI 구조:
  1. **날짜 선택**: `Input type="date"` (min=오늘)
  2. **슬롯 그리드**: `grid-cols-4 sm:grid-cols-6 gap-2`
     - 각 슬롯 버튼에 `startTime` 표시 (예: "09:00")
     - 상태별 스타일:

     | 상태 | 스타일 | 동작 |
     |------|--------|------|
     | AVAILABLE (미선택) | `border hover:border-primary` | 클릭 → 선택 |
     | AVAILABLE (선택됨) | `bg-primary text-primary-foreground` | 클릭 → 선택 해제 |
     | BOOKED | `bg-muted text-muted-foreground cursor-not-allowed` | 비활성 |
     | BLOCKED | `bg-muted text-muted-foreground cursor-not-allowed` | 비활성 |

  3. **예약 버튼**: 슬롯 선택 시 나타남
     - 로그인됨: "예약하기" → `<BookingConfirmDialog>` 열기
     - 미로그인: "로그인 후 예약" → `router.push('/login')`
  4. **빈 상태**: 슬롯 없으면 "예약 가능한 시간이 없습니다" 표시
  5. **로딩**: 슬롯 fetch 중 스켈레톤 또는 스피너

### `components/booking/booking-confirm-dialog.tsx` (클라이언트 컴포넌트)
- Props: `open: boolean, onOpenChange, selectedSlot: SlotData, productName: string, selectedDate: string, onConfirm: (note?: string) => void`
- Shadcn `Dialog` 사용
- 내용:
  - 제목: "예약 확인"
  - 정보 표시: 상품명, 날짜, 시간 (startTime ~ endTime)
  - 메모 입력: `Textarea` (optional, 500자 제한)
  - 하단 버튼: "취소" + "예약 확정"
- "예약 확정" 클릭 → `createBooking({ timeSlotId, note })` 호출 → 성공 시 `router.push('/my/bookings')` + 토스트 "예약이 완료되었습니다"

---

## 5.4 내 예약 페이지

- [x] 완료

### `app/my/layout.tsx` (서버 컴포넌트)
- `requireAuth()` 호출 — 미인증 시 `/login` redirect
- `<>{children}</>` 반환

### `components/booking/booking-card.tsx`
- Props: `booking: BookingWithDetails`
- Shadcn `Card` 사용
- 구조:
  - 상품명 (bold) + 카테고리 Badge
  - 날짜: timeSlot.date 포맷팅 (YYYY년 MM월 DD일)
  - 시간: timeSlot.startTime ~ timeSlot.endTime
  - 상태: Badge

  | 상태 | Badge 색상 | 텍스트 |
  |------|-----------|--------|
  | PENDING | yellow/warning | 대기 중 |
  | CONFIRMED | green/success | 확정 |
  | CANCELLED | red/destructive | 취소됨 |

  - 메모: booking.note (있을 때만 표시)
  - 예약일: createdAt 포맷팅
  - 하단: PENDING 또는 CONFIRMED → "예약 취소" 버튼 (확인 Dialog 후 `cancelBooking()`)

### `app/my/bookings/page.tsx` (서버 컴포넌트)
- `requireAuth()`로 유저 가져오기
- `prisma.booking.findMany({ where: { userId: user.id }, include: { timeSlot: { include: { product: true } } }, orderBy: { createdAt: 'desc' } })`
- 제목: "내 예약"
- 예약 없을 때: "예약 내역이 없습니다" + "상품 보기" 링크
- 예약 목록: `<BookingCard>` 반복

---

## 검증 방법

1. `/products` → 상품 목록 카드 그리드 표시, 카테고리 필터 동작
2. `/products/[id]` → 상품 상세 정보 + 슬롯 피커 표시
3. 날짜 변경 → 해당 날짜의 슬롯 로드 확인
4. 슬롯 클릭 → 선택 하이라이트 + 예약 버튼 표시
5. 미로그인 시 예약 버튼 → `/login` 이동
6. 로그인 후 예약 → 확인 Dialog → 예약 완료 → `/my/bookings`로 이동
7. 내 예약 목록에서 상태 표시 + 취소 동작 확인
8. 관리자 대시보드에서 해당 예약 확인/확정/취소 가능
