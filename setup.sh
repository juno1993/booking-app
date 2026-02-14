#!/bin/bash

# Modern Web Template - 빠른 시작 스크립트

echo "🚀 Modern Web Template Setup"
echo "=============================="

# 프로젝트 이름 입력받기
if [ -z "$1" ]; then
  read -p "프로젝트 이름을 입력하세요: " PROJECT_NAME
else
  PROJECT_NAME=$1
fi

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ 프로젝트 이름이 필요합니다."
  exit 1
fi

echo ""
echo "📦 $PROJECT_NAME 프로젝트 생성 중..."

# 현재 템플릿 디렉토리에서 새 프로젝트로 복사
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="../$PROJECT_NAME"

if [ -d "$TARGET_DIR" ]; then
  echo "❌ $PROJECT_NAME 디렉토리가 이미 존재합니다."
  exit 1
fi

cp -r "$TEMPLATE_DIR" "$TARGET_DIR"
cd "$TARGET_DIR"

# setup.sh 스크립트 제거 (불필요)
rm -f setup.sh

echo "✅ 프로젝트 파일 복사 완료"
echo ""

# .env.local 생성
if [ -f .env.example ]; then
  cp .env.example .env.local
  echo "📝 .env.local 파일 생성됨 (환경 변수를 설정해주세요)"
fi

echo ""
echo "🎉 프로젝트 생성 완료!"
echo ""
echo "다음 단계:"
echo "1. cd $PROJECT_NAME"
echo "2. .env.local 파일에 Supabase 키 추가"
echo "3. npm install"
echo "4. npx prisma generate"
echo "5. npx prisma db push"
echo "6. npm run dev"
echo ""
echo "자세한 내용은 SETUP.md 파일을 참고하세요."
