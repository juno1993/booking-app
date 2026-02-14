# Phase 6: 마무리

---

## 6.1 홈페이지 업데이트

- [x] 완료

**수정**: `app/page.tsx`

### 구조
1. **히어로 섹션** (text-center)
   - 타이틀: "예약 서비스" (text-4xl bold)
   - 설명: "펜션, 호텔, 공간을 간편하게 예약하세요" (text-lg muted)
   - CTA: `<Button size="lg">` → `/products` 링크 "상품 보기"

2. **최신 상품 섹션**
   - `prisma.product.findMany({ where: { isActive: true }, take: 6, orderBy: { createdAt: 'desc' } })`
   - 제목: "최신 상품"
   - `<ProductCard>` 그리드 (3열 반응형)
   - 상품 없으면 섹션 미표시

---

## 6.2 전체 플로우 점검

- [x] 완료

### 고객 플로우
1. `/` 홈페이지 → 최신 상품 표시 확인
2. `/signup` → 회원가입 성공
3. `/login` → 로그인 성공 → Header에 UserNav 표시
4. `/products` → 상품 목록 + 카테고리 필터 동작
5. `/products/[id]` → 상세 보기 + 슬롯 피커
6. 날짜 선택 → 슬롯 로드 → 슬롯 클릭 → 예약 확인 Dialog → 예약 완료
7. `/my/bookings` → 예약 내역 확인 + 취소 동작

### 관리자 플로우
1. SQL로 ADMIN 역할 부여 후 로그인
2. Header에 "관리자" 링크 표시 확인
3. `/admin` → 대시보드 통계 카드 표시
4. `/admin/products/new` → 상품 등록
5. `/admin/products` → 상품 목록 + 수정/삭제
6. `/admin/products/[id]/slots` → 슬롯 일괄 생성 + 캘린더 뷰
7. `/admin/bookings` → 예약 목록 + 상태 필터
8. `/admin/bookings/[id]` → 예약 확정/취소

### 접근 제어
1. 미인증 → `/admin` 접근 → `/login` redirect
2. 미인증 → `/my/bookings` 접근 → `/login` redirect
3. 인증(CUSTOMER) → `/admin` 접근 → `/` redirect
4. 인증 상태 → `/login` 접근 → `/` redirect

### 빌드 검증
```bash
npm run type-check   # 타입 에러 없음
npm run build        # 빌드 성공
```

---

## 6.3 Supabase SQL — 최종 확인 쿼리

> 데이터 정합성 확인용 쿼리

```sql
-- 테이블별 레코드 수 확인
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'time_slots', COUNT(*) FROM time_slots
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;

-- 예약 상태별 집계
SELECT status, COUNT(*) AS count
FROM bookings
GROUP BY status;

-- BOOKED 상태 슬롯과 예약 매칭 검증 (불일치 시 데이터 오류)
SELECT ts.id AS slot_id, ts.status AS slot_status, b.id AS booking_id, b.status AS booking_status
FROM time_slots ts
LEFT JOIN bookings b ON b.time_slot_id = ts.id
WHERE ts.status = 'BOOKED' AND (b.id IS NULL OR b.status = 'CANCELLED')
   OR ts.status = 'AVAILABLE' AND b.id IS NOT NULL AND b.status != 'CANCELLED';
```
