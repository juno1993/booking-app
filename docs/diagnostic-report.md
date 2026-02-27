# Booking Site — Harness Diagnostic Report

> 진단 일자: 2026-02-27
> 진단 범위: 전체 코드베이스 (Phase 8 완료 기준)
> 스택: Next.js 14 App Router · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Supabase)

---

## 목차

1. [전체 평가 요약](#1-전체-평가-요약)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [DB 스키마 분석](#3-db-스키마-분석)
4. [서버 액션 분석](#4-서버-액션-분석)
5. [API Routes 분석](#5-api-routes-분석)
6. [컴포넌트 분석](#6-컴포넌트-분석)
7. [페이지 분석](#7-페이지-분석)
8. [인증 / 미들웨어 분석](#8-인증--미들웨어-분석)
9. [타입 / 유효성 검증 분석](#9-타입--유효성-검증-분석)
10. [발견된 이슈 목록](#10-발견된-이슈-목록)
11. [아키텍처 강점 / 약점](#11-아키텍처-강점--약점)
12. [권고 사항](#12-권고-사항)

---

## 1. 전체 평가 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| DB 스키마 | ✅ 양호 | 관계, 인덱스, 스냅샷 설계 적절 |
| 서버 액션 | ⚠️ 주의 | 동시성 버그, 타입 불일치 |
| API Routes | ✅ 양호 | 간결하고 올바른 구현 |
| 핵심 컴포넌트 | ⚠️ 주의 | 타임존 버그, 에러 무시 패턴 |
| 인증 / 미들웨어 | ✅ 양호 | 보호 경로 커버리지 적절 |
| 타입 안전성 | ⚠️ 주의 | 일부 `as const` 누락, `unknown` catch 필요 |
| 전반적 완성도 | **70 / 100** | 프로덕션 전 HIGH 이슈 수정 필요 |

---

## 2. 프로젝트 구조

```
booking-site/
├── app/
│   ├── actions/          # Server Actions (auth, booking, product, roomType, timeslot)
│   ├── admin/            # 관리자 페이지
│   ├── api/products/[id]/ # slots, room-types API Routes
│   ├── my/bookings/      # 고객 예약 목록
│   └── products/[id]/    # 고객 예약 상세
├── components/
│   ├── admin/            # 관리자 전용 컴포넌트
│   ├── booking/          # 고객 예약 흐름 컴포넌트
│   ├── product/          # 상품 조회 컴포넌트
│   └── ui/               # shadcn/ui 기반 공통 UI
├── lib/
│   ├── auth.ts           # getAuthUser / requireAuth / requireAdmin
│   ├── prisma.ts         # PrismaClient 싱글톤
│   ├── supabase/         # client.ts / server.ts
│   └── validations/      # Zod 스키마 (auth, booking, product, roomType)
├── types/index.ts        # 복합 타입 (BookingWithDetails 등)
├── middleware.ts         # 경로 보호, 쿠키 동기화
└── prisma/schema.prisma  # DB 모델
```

**관찰**: 관심사 분리가 잘 되어 있고, 서버 액션 → API Route → 컴포넌트 계층 구조가 명확하다.

---

## 3. DB 스키마 분석

파일: [prisma/schema.prisma](../prisma/schema.prisma)

### 모델 구조

```
User ──< Booking
Product ──< RoomType ──< TimeSlot
Product ──< TimeSlot (SPACE의 경우 roomTypeId = NULL)
TimeSlot ──── Booking (1:1)
```

### 주요 설계 판단

| 항목 | 평가 |
|------|------|
| `supabaseId` unique 연결 | ✅ Supabase Auth와 DB 사용자 분리 설계 올바름 |
| `roomTypeName` / `priceSnapshot` 스냅샷 | ✅ 가격 변경 후에도 예약 내역 보존 |
| `groupId` 멀티나이트 묶음 | ✅ 연속 예약 연결 |
| Cascade delete (Product → RoomType → TimeSlot) | ✅ 정상 |
| `[productId, roomTypeId, date, startTime]` 복합 unique | ⚠️ NULL != NULL 특성으로 SPACE 슬롯 중복 가능 |
| `TimeSlot.status` AVAILABLE / BLOCKED / BOOKED | ✅ 상태 전환 명확 |

### SPACE 슬롯 Unique 제약 문제

PostgreSQL에서 `NULL != NULL`이므로 `roomTypeId = NULL`인 SPACE 슬롯에는 unique 제약이 실질적으로 동작하지 않는다.
현재 앱 레벨에서 기존 슬롯 조회 후 Set 기반 중복 제거를 하고 있으나, 동시 요청 시 race condition이 존재한다. (→ [이슈 #2](#이슈-2--space-슬롯-race-condition))

---

## 4. 서버 액션 분석

### 4-1. `app/actions/booking.ts`

파일: [app/actions/booking.ts](../app/actions/booking.ts)

| 함수 | 상태 | 비고 |
|------|------|------|
| `createBooking` | ⚠️ | 슬롯 동시 예약 race condition |
| `createMultipleBookings` | ⚠️ | 연속 날짜 검증 없음 |
| `confirmBooking` | ✅ | admin 권한 확인 |
| `cancelBooking` | ✅ | 본인 또는 admin 취소 허용 |
| `getBookings` / `getBooking` | ✅ | 정상 |

**[이슈 #1] createBooking 동시성 버그**

```ts
// 현재 코드 (취약)
const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } })
if (slot?.status !== 'AVAILABLE') return { error: '...' }
// ← 여기서 다른 요청이 동일 슬롯 예약 가능
await prisma.timeSlot.update({ where: { id: slotId }, data: { status: 'BOOKED' } })
```

두 요청이 동시에 상태 확인 → 둘 다 AVAILABLE → 둘 다 예약 시도 → 중복 예약 발생 가능.

**권고**: 조건부 업데이트(atomic) 패턴 사용

```ts
// 권고 패턴
const updated = await prisma.timeSlot.updateMany({
  where: { id: slotId, status: 'AVAILABLE' },
  data: { status: 'BOOKED' },
})
if (updated.count === 0) return { success: false, error: '이미 예약된 슬롯입니다.' }
```

**[이슈 #3] catch 타입 처리**

```ts
// 현재: 타입 안전하지 않음
.catch((err: Error) => ({ error: err.message }))

// 권고: unknown으로 catch
.catch((err: unknown) => ({
  error: err instanceof Error ? err.message : '알 수 없는 오류',
}))
```

---

### 4-2. `app/actions/timeslot.ts`

파일: [app/actions/timeslot.ts](../app/actions/timeslot.ts)

| 함수 | 상태 | 비고 |
|------|------|------|
| `generateTimeSlots` | ⚠️ | SPACE race condition, 날짜 검증 없음 |
| `toggleSlotStatus` | ✅ | 정상 |
| `getSlotsByProductAndDate` | ✅ | 정상 |

**[이슈 #2] SPACE 슬롯 race condition**

```ts
// 현재 코드: 조회 후 Set으로 중복 제거, 그러나 동시 요청 시 둘 다 통과
const existing = await prisma.timeSlot.findMany({ where: { ... } })
const existingSet = new Set(existing.map(...))
const toCreate = allSlots.filter(s => !existingSet.has(s.key))
await prisma.timeSlot.createMany({ data: toCreate })
```

**권고**: UPSERT 패턴 또는 DB 레벨 unique partial index

```sql
-- DB 레벨 해결책: NULL roomTypeId에도 unique 보장
CREATE UNIQUE INDEX time_slots_space_unique
  ON time_slots (product_id, date, start_time)
  WHERE room_type_id IS NULL;
```

**누락된 검증**
- `startDate > endDate` 케이스 처리 없음
- `roomTypeId`가 해당 `productId`에 속하는지 검증 없음

---

### 4-3. `app/actions/roomType.ts`

파일: [app/actions/roomType.ts](../app/actions/roomType.ts)

| 함수 | 상태 | 비고 |
|------|------|------|
| `getRoomTypes` | ✅ | isActive 필터 |
| `getAllRoomTypes` | ✅ | admin용, 슬롯 count 포함 |
| `createRoomType` | ✅ | `as const` 사용 |
| `updateRoomType` | ✅ | `as const` 사용 |
| `deleteRoomType` | ⚠️ | `as const` 누락 |

**[이슈 #4] deleteRoomType 타입 불일치**

```ts
// createRoomType, updateRoomType: 올바름
return { success: true as const }

// deleteRoomType: as const 누락 → 타입이 boolean으로 추론됨
return { success: true }  // ← 수정 필요
```

---

### 4-4. `app/actions/product.ts`

파일: [app/actions/product.ts](../app/actions/product.ts)

**상태**: ✅ 이슈 없음. 간결하고 올바른 CRUD 구현.

---

## 5. API Routes 분석

### `GET /api/products/[id]/slots`

파일: [app/api/products/[id]/slots/route.ts](../app/api/products/%5Bid%5D/slots/route.ts)

- ✅ `date`, `roomTypeId` 파라미터 처리
- ✅ `force-dynamic`으로 캐시 방지
- ✅ 필요 필드만 select (id, startTime, endTime, status, roomTypeId)

### `GET /api/products/[id]/room-types`

파일: [app/api/products/[id]/room-types/route.ts](../app/api/products/%5Bid%5D/room-types/route.ts)

- ✅ `isActive: true` 필터로 비활성 룸타입 숨김
- ✅ 공개 데이터이므로 인증 불필요
- ✅ name 순 정렬

**[이슈 #9] API Routes CSRF 보호 없음**

Next.js Server Actions는 CSRF 보호가 내장되어 있지만 API Routes는 아니다.
현재 API Routes는 읽기 전용(GET)이므로 즉각적 위험은 없으나, 향후 변경 API 추가 시 Origin/Referer 검증이 필요하다.

---

## 6. 컴포넌트 분석

### 6-1. `components/booking/slot-picker.tsx` (538줄)

파일: [components/booking/slot-picker.tsx](../components/booking/slot-picker.tsx)

**[이슈 #5] 타임존 버그 — getLocalToday()**

```ts
// 현재: 브라우저 로컬 시간 사용 (한국 UTC+9에서 오동작)
function getLocalToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 권고: UTC 기준 오늘 날짜
function getLocalToday(): string {
  return new Date().toISOString().split('T')[0]
}
```

영향: 서버(UTC)와 클라이언트(KST)의 날짜 기준이 달라 예약 가능 날짜 표시 오류 발생 가능.

**[이슈 #6] API 에러 무시 패턴**

```ts
// 현재: 실패해도 사용자에게 알리지 않음
.catch(() => {})

// 권고: 에러 상태 반영
.catch(() => setError('슬롯을 불러오지 못했습니다.'))
```

실패 시 빈 화면이 표시되어 사용자가 원인을 알 수 없다.

**[이슈 #7] 모바일 바 가격 표시 — 시간제 예약 시 룸 가격 미반영**

```tsx
// 시간제(hourly) 모드 모바일 바 (약 511번째 줄)
// `price` prop (상품 기본가) 사용 → selectedRoom.price 미반영
// 숙박 모드는 이미 올바르게 계산됨 (selectedRoom?.price || price)
```

**[이슈 #8] 멀티나이트 race condition**

슬롯 가용성 조회와 예약 사이에 다른 사용자가 동일 날짜를 예약할 수 있다.
Server Action에서 최종 검증이 일어나 에러를 반환하지만, UI에서 낙관적 업데이트나 재조회 없이 일반 에러 토스트만 보여준다.

**긍정적 구현**

- ✅ UTC 기반 `addDays()` / `getDatesInRange()`
- ✅ 체크아웃 최소값 = 체크인 + 1일 강제
- ✅ 룸 선택 시 두 번째 클릭으로 토글 취소
- ✅ 숙박/시간제 모드 자동 감지 (`isOvernightProduct`)

---

### 6-2. `components/booking/booking-confirm-dialog.tsx` (175줄)

파일: [components/booking/booking-confirm-dialog.tsx](../components/booking/booking-confirm-dialog.tsx)

**[이슈 #10] 멀티나이트 분기 로직 취약**

```ts
if (isOvernight && selectedSlotIds && selectedSlotIds.length > 0) {
  result = await createMultipleBookings({ ... })
} else if (selectedSlot) {
  result = await createBooking({ ... })  // ← isOvernight지만 slotIds 없을 때 단일 예약 시도
} else {
  setIsLoading(false)
  return
}
```

`isOvernight=true`이고 `selectedSlotIds`가 빈 배열인 경우 단일 예약으로 fallback한다.
이 경우 `selectedSlot`도 없다면 조용히 반환되어 아무 일도 일어나지 않는다.

**권고**: 사전 조건 명시적 검증

```ts
if (isOvernight) {
  if (!selectedSlotIds || selectedSlotIds.length === 0) {
    toast({ title: '날짜를 선택해주세요.' })
    setIsLoading(false)
    return
  }
  result = await createMultipleBookings({ ... })
} else {
  if (!selectedSlot) {
    toast({ title: '슬롯을 선택해주세요.' })
    setIsLoading(false)
    return
  }
  result = await createBooking({ ... })
}
```

---

### 6-3. `components/booking/booking-card.tsx` (186줄)

파일: [components/booking/booking-card.tsx](../components/booking/booking-card.tsx)

**상태**: ✅ 전반적으로 잘 구현됨

- ✅ 카테고리별 이모지 설정
- ✅ 상태별 색상 코딩
- ✅ 취소 권한 확인 (본인 예약만)
- ✅ `roomTypeName` / `priceSnapshot` 조건부 표시

---

### 6-4. `components/admin/room-type-list.tsx` (259줄)

파일: [components/admin/room-type-list.tsx](../components/admin/room-type-list.tsx)

**[이슈 #4-related] as const 미사용으로 인한 타입 추론 불일치**

`deleteRoomType` 반환값의 `as const` 누락이 이 컴포넌트의 타입 추론에도 영향.

**[이슈 #11] 이미지 업로드 미구현**

```ts
images: []  // 하드코딩
```

스키마 (`images TEXT[]`)에서는 지원하나 관리자 폼에서 이미지 업로드 UI가 없다.

**[이슈 #12] 유효성 오류 메시지 미표시**

```ts
setError('입력값을 확인해주세요')  // Zod 필드별 오류 미전달
```

**권고**: Zod 오류 파싱 후 필드별 메시지 표시

---

### 6-5. `components/admin/slot-generator-form.tsx` (120줄)

파일: [components/admin/slot-generator-form.tsx](../components/admin/slot-generator-form.tsx)

**상태**: ✅ 양호. 'All Rooms' 일괄 생성은 sequential await로 구현되어 있어 중간 실패 시 이후 룸에는 영향 없음. 슬롯 생성은 멱등성이 있으므로 재시도 가능.

---

### 6-6. `components/admin/slot-calendar-view.tsx` (128줄)

파일: [components/admin/slot-calendar-view.tsx](../components/admin/slot-calendar-view.tsx)

**[이슈 #13] 룸 삭제 시 selectedRoomId 동기화 안됨**

```ts
// roomTypes가 변경되어도 초기값으로 고정된 selectedRoomId
const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(
  roomTypes?.[0]?.id
)
```

삭제된 룸이 선택된 상태면 슬롯이 표시되지 않거나 오래된 데이터를 보여준다.

**권고**:
```ts
useEffect(() => {
  if (roomTypes && roomTypes.length > 0 && !roomTypes.find(r => r.id === selectedRoomId)) {
    setSelectedRoomId(roomTypes[0].id)
  }
}, [roomTypes])
```

---

## 7. 페이지 분석

### `app/products/[id]/page.tsx`

파일: [app/products/[id]/page.tsx](../app/products/%5Bid%5D/page.tsx)

**[이슈 #14] isOvernight 로직 중복**

`slot-picker.tsx`의 `isOvernightProduct()` 함수와 동일한 로직이 `page.tsx`에도 인라인으로 중복 구현.

**권고**: `lib/utils.ts`에 공유 유틸 추출

```ts
// lib/utils.ts에 추가
export function isOvernightProduct(
  category: string,
  openTime: string,
  closeTime: string
): boolean {
  if (category === 'PENSION' || category === 'HOTEL') return true
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  return oh * 60 + om >= ch * 60 + cm
}
```

---

### `app/my/bookings/page.tsx`

파일: [app/my/bookings/page.tsx](../app/my/bookings/page.tsx)

**상태**: ✅ 양호

- ✅ 인증 필수 검사
- ✅ 상태별 필터 + 카운트 표시
- ✅ 빈 상태 안내

**[이슈 #15] 상태별 카운트에 별도 쿼리**

```ts
const allBookings = await prisma.booking.groupBy({ by: ['status'], ... })
// + 위에서 이미 bookings를 조회함
```

하나의 쿼리로 통합 가능하나 성능 영향은 미미하다.

---

## 8. 인증 / 미들웨어 분석

### `lib/auth.ts`

파일: [lib/auth.ts](../lib/auth.ts)

**상태**: ✅ 올바른 구현

- ✅ Supabase 세션 → DB 사용자 체인
- ✅ `requireAuth()` / `requireAdmin()` 가드 체인
- ✅ `redirect()` 올바르게 throw (return 없음)

### `middleware.ts`

파일: [middleware.ts](../middleware.ts)

**상태**: ✅ 양호

- ✅ `/admin`, `/my` 경로 보호
- ✅ 인증 사용자 `/login`, `/signup` 리다이렉트
- ✅ SSR용 쿠키 동기화 패턴 올바름

**[이슈 #9] API Routes 변경 엔드포인트에 CSRF 미적용**

현재 API Routes는 모두 읽기 전용이라 즉각적 위험은 없다.
향후 변경 API 추가 시 `Origin` / `Referer` 헤더 검증 추가 필요.

---

## 9. 타입 / 유효성 검증 분석

### `types/index.ts`

파일: [types/index.ts](../types/index.ts)

**상태**: ✅ 잘 정의됨

- `BookingWithDetails`: timeSlot, product, roomType 중첩 include 정확
- `TimeSlotWithBooking`: nullable roomType 처리 명시

### `lib/validations/`

| 파일 | 상태 |
|------|------|
| auth.ts | ✅ |
| booking.ts | ✅ UUID 검증, optional roomType/price |
| product.ts | ✅ |
| roomType.ts | ✅ |

---

## 10. 발견된 이슈 목록

### 🔴 HIGH (프로덕션 전 필수 수정)

| # | 위치 | 설명 | 상태 |
|---|------|------|------|
| 1 | [app/actions/booking.ts](../app/actions/booking.ts) | `createBooking` 동시 예약 race condition — atomic 업데이트로 교체 | ✅ 수정됨 |
| 2 | [app/actions/timeslot.ts](../app/actions/timeslot.ts) | SPACE 슬롯 중복 생성 race condition — try/catch 방어 + 날짜/roomTypeId 검증 추가 | ✅ 수정됨 |
| 4 | [app/actions/roomType.ts](../app/actions/roomType.ts) | `deleteRoomType` `as const` 누락 | ✅ 수정됨 |
| 5 | [components/booking/slot-picker.tsx](../components/booking/slot-picker.tsx) | `getLocalToday()` 타임존 버그 — UTC 기준으로 수정 | ✅ 수정됨 |

### 🟡 MEDIUM (단기 수정 권고)

| # | 위치 | 설명 | 상태 |
|---|------|------|------|
| 3 | [app/actions/booking.ts](../app/actions/booking.ts) | `catch` 타입을 `unknown`으로 변경 | ✅ 수정됨 |
| 6 | [components/booking/slot-picker.tsx](../components/booking/slot-picker.tsx) | API 에러 무시 패턴 — 에러 상태 UI 추가 | ✅ 수정됨 |
| 7 | [components/booking/slot-picker.tsx](../components/booking/slot-picker.tsx) | 시간제 모바일 바 룸 가격 미반영 — `effectivePrice` 사용 | ✅ 수정됨 |
| 10 | [components/booking/booking-confirm-dialog.tsx](../components/booking/booking-confirm-dialog.tsx) | 멀티나이트 분기 로직 취약 — 명시적 사전 검증으로 교체 | ✅ 수정됨 |
| 13 | [components/admin/slot-calendar-view.tsx](../components/admin/slot-calendar-view.tsx) | 룸 삭제 시 `selectedRoomId` 미동기화 — `useEffect` 추가 | ✅ 수정됨 |

### 🟢 LOW (장기 개선 사항)

| # | 위치 | 설명 | 상태 |
|---|------|------|------|
| 8 | [components/booking/slot-picker.tsx](../components/booking/slot-picker.tsx) | 멀티나이트 race condition — 에러 후 슬롯 재조회 없음 | ⏳ 미수정 (서버에서 오류 반환으로 보완) |
| 9 | [middleware.ts](../middleware.ts) | API Routes CSRF 보호 미적용 | ⏳ 미수정 (현재 GET 전용이므로 즉각 위험 없음) |
| 11 | [components/admin/room-type-list.tsx](../components/admin/room-type-list.tsx) | 이미지 업로드 UI 미구현 | ⏳ 미수정 (추후 기능 구현 시 추가) |
| 12 | [components/admin/room-type-list.tsx](../components/admin/room-type-list.tsx) | Zod 유효성 오류 상세 메시지 미표시 | ✅ 수정됨 |
| 14 | [app/products/[id]/page.tsx](../app/products/%5Bid%5D/page.tsx) | `isOvernight` 로직 중복 (slot-picker.tsx와 동일) | ✅ 수정됨 (`lib/utils.ts`로 추출) |
| 15 | [app/my/bookings/page.tsx](../app/my/bookings/page.tsx) | 상태 카운트에 불필요한 별도 쿼리 | ⏳ 미수정 (성능 영향 미미) |

> 수정 일자: 2026-02-27 — HIGH 4건, MEDIUM 5건, LOW 2건 수정 완료

---

## 11. 아키텍처 강점 / 약점

### 강점

1. **관심사 분리 명확**: Server Actions, API Routes, 컴포넌트 역할이 뚜렷하게 구분됨
2. **타입 안전성**: TypeScript + Zod 조합으로 경계 유효성 검증이 일관적
3. **가격 이력 보존**: `roomTypeName` / `priceSnapshot` 스냅샷 설계로 가격 변경 후에도 예약 내역 정확
4. **숙박/시간제 이중 모드**: `isOvernightProduct` 로직으로 PENSION/HOTEL과 SPACE를 단일 컴포넌트에서 처리
5. **Auth 설계**: Supabase Auth + DB User 이중 계층으로 세션 관리와 비즈니스 권한 분리
6. **Cascade 삭제**: Product → RoomType → TimeSlot 고아 데이터 방지
7. **관리자 UI**: 슬롯 캘린더, 룸타입 CRUD, 예약 관리 모두 구현

### 약점

1. **동시성 제어 부재**: 슬롯 예약의 atomic 보장 없음 (이슈 #1, #2)
2. **타임존 일관성 부분적**: 서버는 UTC, 클라이언트 일부 함수는 로컬 시간 (이슈 #5)
3. **에러 피드백 부족**: API 실패를 사용자에게 알리지 않는 패턴 (이슈 #6)
4. **감사 로그 없음**: 취소 주체, 예약 변경 이력 추적 불가
5. **이미지 기능 미완성**: RoomType 이미지 필드 있으나 업로드 UI 없음 (이슈 #11)

---

## 12. 권고 사항

### 즉시 수정 (프로덕션 배포 전)

```
[이슈 #1] booking.ts — updateMany atomic 패턴으로 race condition 제거
[이슈 #2] timeslot.ts — DB partial unique index 추가 (WHERE room_type_id IS NULL)
[이슈 #4] roomType.ts — deleteRoomType에 as const 추가
[이슈 #5] slot-picker.tsx — getLocalToday()를 UTC 기준으로 수정
```

### 단기 (다음 스프린트)

```
[이슈 #3]  booking.ts — catch(err: unknown) 타입 수정
[이슈 #6]  slot-picker.tsx — API 에러 상태 UI 추가
[이슈 #10] booking-confirm-dialog.tsx — 멀티나이트 분기 사전 검증 강화
[이슈 #13] slot-calendar-view.tsx — roomTypes 변경 시 selectedRoomId useEffect 동기화
[이슈 #14] page.tsx + slot-picker.tsx — isOvernightProduct 공유 유틸 추출
```

### 장기 (아키텍처 개선)

```
- 예약/취소 감사 로그 테이블 추가
- RoomType 이미지 업로드 UI 구현 (Supabase Storage 활용)
- API Routes 변경 엔드포인트 CSRF 보호
- 인기 상품 슬롯 캐싱 전략 수립
- 이메일 알림 (예약 확인, 취소 알림)
```

---

*이 보고서는 코드 정적 분석 기반입니다. 런타임 테스트 및 부하 테스트는 별도로 수행하세요.*
