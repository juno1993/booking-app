# Phase 1: DB 스키마 & 타입 정의

---

## 1.1 Prisma 스키마 교체

- [x] 완료

**파일**: `prisma/schema.prisma`

### Enum 정의
- `UserRole`: ADMIN, CUSTOMER
- `ProductCategory`: PENSION, HOTEL, SPACE
- `BookingStatus`: PENDING, CONFIRMED, CANCELLED
- `TimeSlotStatus`: AVAILABLE, BOOKED, BLOCKED

### 모델 정의

**User**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (uuid) | PK |
| supabaseId | String (unique) | Supabase auth.users.id 연동 |
| email | String (unique) | 이메일 |
| name | String? | 이름 |
| phone | String? | 전화번호 |
| role | UserRole (default: CUSTOMER) | 역할 |
| createdAt / updatedAt | DateTime | 타임스탬프 |
| bookings | Booking[] | 예약 관계 |

**Product**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (uuid) | PK |
| name | String | 상품명 |
| description | String? | 설명 |
| category | ProductCategory | 카테고리 (PENSION/HOTEL/SPACE) |
| images | String[] | Supabase Storage URL 배열 |
| pricePerSlot | Int (default: 0) | 슬롯당 표시 가격 (결제 없음) |
| address | String? | 주소 |
| openTime | String (default: "09:00") | 운영 시작 시간 (HH:mm) |
| closeTime | String (default: "22:00") | 운영 종료 시간 (HH:mm) |
| slotDuration | Int (default: 30) | 슬롯 단위 (분) |
| isActive | Boolean (default: true) | 활성 상태 |
| createdAt / updatedAt | DateTime | 타임스탬프 |
| timeSlots | TimeSlot[] | 슬롯 관계 |

**TimeSlot**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (uuid) | PK |
| productId | String (FK → Product) | 상품 ID |
| date | DateTime (@db.Date) | 날짜 (시간 없이) |
| startTime | String | 시작 시간 (HH:mm) |
| endTime | String | 종료 시간 (HH:mm) |
| status | TimeSlotStatus (default: AVAILABLE) | 상태 |
| createdAt / updatedAt | DateTime | 타임스탬프 |
| booking | Booking? | 예약 관계 (1:1) |
| 제약조건 | `@@unique([productId, date, startTime])` | 중복 방지 |
| 인덱스 | `@@index([productId, date])`, `@@index([date, status])` | 조회 성능 |

**Booking**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (uuid) | PK |
| userId | String (FK → User) | 예약자 ID |
| timeSlotId | String (unique, FK → TimeSlot) | 슬롯 ID (1:1) |
| status | BookingStatus (default: PENDING) | 예약 상태 |
| note | String? | 고객 메모 |
| createdAt / updatedAt | DateTime | 타임스탬프 |
| 인덱스 | `@@index([userId])`, `@@index([status])` | 조회 성능 |

---

## 1.2 Supabase SQL — RLS 정책 & 설정

> `prisma db push`로 테이블 생성 후, Supabase SQL Editor에서 실행

### 1.2.1 RLS 활성화

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### 1.2.2 users 테이블 정책

```sql
-- 본인 프로필 조회
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (supabase_id = auth.uid()::text);

-- 본인 프로필 수정
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (supabase_id = auth.uid()::text);

-- 회원가입 시 INSERT (서비스 역할로 실행되므로 Prisma에서 처리)
CREATE POLICY "users_insert_service"
  ON users FOR INSERT
  WITH CHECK (true);
```

### 1.2.3 products 테이블 정책

```sql
-- 누구나 활성 상품 조회 가능
CREATE POLICY "products_select_active"
  ON products FOR SELECT
  USING (is_active = true);

-- ADMIN만 상품 생성/수정/삭제 (Prisma 서버 사이드에서 역할 검증)
CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );
```

### 1.2.4 time_slots 테이블 정책

```sql
-- 누구나 슬롯 조회 가능
CREATE POLICY "time_slots_select_all"
  ON time_slots FOR SELECT
  USING (true);

-- ADMIN만 슬롯 생성/수정/삭제
CREATE POLICY "time_slots_admin_all"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );
```

### 1.2.5 bookings 테이블 정책

```sql
-- 본인 예약 조회
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE supabase_id = auth.uid()::text
    )
  );

-- ADMIN은 모든 예약 조회
CREATE POLICY "bookings_select_admin"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );

-- 인증된 사용자 예약 생성
CREATE POLICY "bookings_insert_auth"
  ON bookings FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE supabase_id = auth.uid()::text
    )
  );

-- 본인 예약 취소 (status 업데이트)
CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE supabase_id = auth.uid()::text
    )
  );

-- ADMIN 예약 관리
CREATE POLICY "bookings_admin_all"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );
```

### 1.2.6 Supabase Storage 버킷 (상품 이미지용)

```sql
-- Storage 버킷 생성 (Supabase Dashboard > Storage에서도 가능)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 누구나 이미지 조회 가능
CREATE POLICY "product_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- ADMIN만 이미지 업로드
CREATE POLICY "product_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );

-- ADMIN만 이미지 삭제
CREATE POLICY "product_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );
```

### 1.2.7 Supabase Auth 설정 (Dashboard)

> Supabase Dashboard > Authentication > Settings에서 설정

- **Email Confirmations**: 개발 중 `Disable` (빠른 테스트)
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/**`

---

## 1.3 Zod 검증 스키마 생성

- [x] 완료

### `lib/validations/auth.ts`
- `loginSchema`: email(이메일 형식), password(6자 이상)
- `signUpSchema`: loginSchema 확장 + name(1자 이상, 50자 이하)

### `lib/validations/product.ts`
- `productSchema`: name(1~100자), description(2000자 이하, optional), category(PENSION/HOTEL/SPACE), images(URL 배열), pricePerSlot(0 이상 정수), address(200자 이하, optional), openTime/closeTime(HH:mm 정규식), slotDuration(30~120 정수), isActive(boolean)

### `lib/validations/booking.ts`
- `bookingSchema`: timeSlotId(UUID), note(500자 이하, optional)

---

## 1.4 타입 정의 업데이트

- [x] 완료

**파일**: `types/index.ts`

- Prisma 모델 re-export: `User`, `Product`, `TimeSlot`, `Booking`
- Enum re-export: `UserRole`, `ProductCategory`, `BookingStatus`, `TimeSlotStatus`
- 복합 타입:
  - `ProductWithSlots` = Product & { timeSlots: TimeSlot[] }
  - `BookingWithDetails` = Booking & { timeSlot: TimeSlot & { product: Product }, user: Pick<User, 'id' | 'email' | 'name' | 'phone'> }
  - `TimeSlotWithBooking` = TimeSlot & { booking: (Booking & { user: Pick<User, ...> }) | null }
- 폼 타입: `LoginFormData`, `SignUpFormData`, `ProductFormData`, `BookingFormData`
- `ApiResponse<T>`: { success: boolean, data?: T, error?: string }

---

## 1.5 Prisma Generate & DB Push

- [x] `prisma generate` 완료 (타입 체크 통과)
- [x] `prisma db push` 완료 (Direct Connection 사용)
- [x] Supabase SQL Editor에서 1.2 RLS 쿼리 실행 완료

```bash
npx prisma generate    # Prisma Client 타입 생성
npx prisma db push     # Supabase PostgreSQL에 테이블 반영
npm run type-check     # 타입 오류 검증
```

실행 후 Supabase SQL Editor에서 1.2의 SQL 쿼리 실행.
