# Modern Web Template

Next.js 14.2 + TypeScript 기반 최신 웹 애플리케이션 템플릿

## 🎯 기술 스택

- **프레임워크**: Next.js 14.2 (App Router) + TypeScript 5.4
- **스타일링**: Tailwind CSS 3.4 + KRDS 디자인 시스템
- **UI 컴포넌트**: Shadcn/ui (Radix UI 기반)
- **상태관리**: Zustand 4.5
- **폼/검증**: React Hook Form + Zod
- **DB/ORM**: PostgreSQL (Supabase) + Prisma 5.11
- **인증**: Supabase Auth (SSR)
- **배포**: Vercel

## 🚀 빠른 시작

### 1. 프로젝트 생성

```bash
# 이 템플릿을 복사하여 새 프로젝트 생성
cp -r modern-web-template my-project
cd my-project

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 값을 입력하세요.

### 3. 데이터베이스 설정

```bash
# Prisma 초기 마이그레이션
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 레이아웃
│   ├── api/               # API 라우트
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── ui/               # Shadcn UI 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   └── layouts/          # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── supabase/         # Supabase 클라이언트
│   ├── prisma.ts         # Prisma 클라이언트
│   └── utils.ts          # 공통 유틸
├── store/                 # Zustand 스토어
├── hooks/                 # 커스텀 훅
├── types/                 # TypeScript 타입 정의
├── prisma/               # Prisma 스키마
└── public/               # 정적 파일
```

## 🛠️ 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
npm run format       # Prettier 포맷팅
```

## 📦 Shadcn/ui 컴포넌트 추가

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

## 🔐 Supabase 설정

1. Supabase 프로젝트 생성
2. `.env.local`에 API 키 추가
3. `lib/supabase/client.ts`와 `server.ts` 확인

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [Supabase 가이드](https://supabase.com/docs)
- [Prisma 문서](https://www.prisma.io/docs)
