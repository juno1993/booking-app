# Phase 8: 확장 기능

> 추후 확장성을 위한 태스크 목록

---

## 8.1 호텔 등급 시스템

- [ ] 완료

### 스키마 변경
- Product 모델에 `starRating Int?` 필드 추가 (1~5, 호텔 전용)
- `prisma db push` 실행

### 필터 확장
- 상품 목록 필터에 "등급" 필터 추가 (1성급~5성급 체크박스)
- URL 파라미터: `?stars=3,4,5`
- 쿼리: `where: { starRating: { in: [3, 4, 5] } }`

### UI 표시
- ProductCard에 별점 아이콘 표시 (호텔인 경우)
- ProductDetail에 등급 뱃지
- 관리자 상품 등록/수정 폼에 등급 선택 (호텔 카테고리 선택 시 노출)

---

## 8.2 리뷰 & 별점 시스템

- [ ] 완료

### 스키마
```prisma
model Review {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  productId String   @map("product_id")
  bookingId String   @unique @map("booking_id")
  rating    Int      // 1~5
  content   String?
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])

  @@map("reviews")
}
```

### 기능
- 예약 완료(CONFIRMED) 후 리뷰 작성 가능
- 상품 상세 페이지에 리뷰 목록 + 평균 별점
- 상품 카드에 평균 별점 표시
- 필터: 별점 N점 이상

---

## 8.3 편의시설 태그

- [ ] 완료

### 스키마
- Product 모델에 `amenities String[]` 필드 추가
- 예: ["주차장", "와이파이", "수영장", "바베큐", "조식"]

### 기능
- 관리자: 상품 등록 시 편의시설 태그 선택 (체크박스)
- 상품 상세: 아이콘 + 텍스트로 편의시설 표시
- 필터: 편의시설별 필터링

---

## 8.4 수용 인원

- [ ] 완료

### 스키마
- Product 모델에 `minCapacity Int @default(1)`, `maxCapacity Int @default(10)` 추가

### 기능
- 필터: 인원수 입력 → 해당 인원 수용 가능한 상품만 표시
- 상품 카드/상세에 수용 인원 표시

---

## 8.5 지도 기반 검색

- [ ] 완료

### 스키마
- Product 모델에 `latitude Float?`, `longitude Float?` 추가

### 기능
- 카카오맵 or 네이버 지도 연동
- 상품 상세 페이지에 지도 표시
- 지도 기반 주변 검색 (반경 N km)

---

## 8.6 소셜 로그인

- [ ] 완료

### 지원 플랫폼
- 카카오 로그인
- 네이버 로그인
- 구글 로그인

### 구현
- Supabase Auth Provider 설정
- 로그인 페이지에 소셜 버튼 추가
- 소셜 로그인 시 users 테이블 자동 생성

---

## 8.7 결제 시스템

- [ ] 완료

### 연동
- 토스페이먼츠 or 카카오페이 연동
- Booking 모델에 `paymentId`, `paymentStatus`, `paidAmount` 필드 추가

### 플로우
1. 예약 확인 → 결제 페이지 → 결제 완료 → 예약 확정
2. 취소 시 환불 처리

---

## 8.8 알림 시스템

- [ ] 완료

### 기능
- 예약 확정/취소 시 이메일 알림
- 예약 당일 리마인더
- 관리자: 새 예약 알림

### 구현
- Supabase Edge Functions or Resend API
- Notification 모델 추가 (in-app 알림)

---

## 우선순위

| 순서 | 항목 | 비즈니스 임팩트 | 기술 난이도 |
|------|------|----------------|------------|
| 1 | 8.1 호텔 등급 | ★★★☆☆ | ★☆☆ |
| 2 | 8.3 편의시설 | ★★★☆☆ | ★★☆ |
| 3 | 8.4 수용 인원 | ★★★☆☆ | ★☆☆ |
| 4 | 8.2 리뷰 & 별점 | ★★★★☆ | ★★★ |
| 5 | 8.6 소셜 로그인 | ★★★★☆ | ★★☆ |
| 6 | 8.7 결제 시스템 | ★★★★★ | ★★★★ |
| 7 | 8.5 지도 검색 | ★★★☆☆ | ★★★ |
| 8 | 8.8 알림 시스템 | ★★★☆☆ | ★★★ |
