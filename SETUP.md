# 설치 및 설정 가이드

## 1. 템플릿 사용하기

### 새 프로젝트 생성

```bash
# 홈 디렉토리에 템플릿 저장 (한 번만)
cp -r /path/to/modern-web-template ~/.modern-web-template

# 새 프로젝트 생성
cp -r ~/.modern-web-template my-new-project
cd my-new-project
```

### 쉘 함수로 자동화 (선택사항)

`~/.bashrc` 또는 `~/.zshrc`에 추가:

```bash
create-web-project() {
  if [ -z "$1" ]; then
    echo "사용법: create-web-project <project-name>"
    return 1
  fi
  
  cp -r ~/.modern-web-template "$1"
  cd "$1"
  
  echo "✅ $1 프로젝트가 생성되었습니다!"
  echo "📦 npm install 실행 중..."
  npm install
  
  echo "
🎉 프로젝트 준비 완료!

다음 단계:
1. .env.example을 .env.local로 복사하고 환경 변수 설정
2. npx prisma db push (데이터베이스 스키마 적용)
3. npm run dev (개발 서버 시작)
"
}
```

사용:
```bash
source ~/.bashrc  # 또는 source ~/.zshrc
create-web-project my-awesome-app
```

## 2. 초기 설정

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 편집:

```env
# Supabase (https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database (Supabase Settings > Database > Connection string)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# Prisma Studio 실행 (선택사항)
npx prisma studio
```

### Shadcn/ui 컴포넌트 추가

```bash
# 필요한 컴포넌트 설치
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

## 3. 개발 시작

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

## 4. Supabase 설정 (처음 한 번만)

### Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 지역 선택
4. 생성 완료 대기

### API 키 확인

1. Settings > API 메뉴
2. Project URL과 anon public key 복사
3. `.env.local`에 붙여넣기

### 연결 문자열 확인

1. Settings > Database > Connection string
2. Connection pooling (Pooler) 선택
3. Session mode 선택
4. 연결 문자열 복사하여 `.env.local`에 붙여넣기

## 5. 배포

### Vercel 배포

```bash
# Vercel CLI 설치 (전역)
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

또는 GitHub 연동:
1. GitHub에 푸시
2. Vercel 대시보드에서 Import
3. 환경 변수 설정
4. Deploy

### 환경 변수 (Vercel)

배포 시 다음 환경 변수를 Vercel에 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_URL` (Vercel URL로 변경)

## 6. 팁

### 개발 중 유용한 명령어

```bash
# 타입 체크
npm run type-check

# 린팅
npm run lint

# 포맷팅
npm run format

# Prisma Studio (DB GUI)
npm run db:studio

# DB 스키마 동기화
npm run db:push
```

### VS Code 확장 프로그램 추천

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- TypeScript

### 트러블슈팅

**문제**: Module not found 에러
```bash
rm -rf node_modules package-lock.json
npm install
```

**문제**: Prisma 생성 에러
```bash
npx prisma generate --force
```

**문제**: Supabase 연결 실패
- `.env.local` 파일이 있는지 확인
- API 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
