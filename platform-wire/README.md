# Platform Wire 🗞️

플랫폼 비즈니스 · 디지털 대전환 실시간 뉴스 포스팅 자동화

## Vercel 배포 방법 (5분)

### 1. GitHub에 올리기
```bash
# GitHub에서 새 레포 만들고
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_ID/platform-wire.git
git push -u origin main
```

### 2. Vercel 배포
1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. "New Project" → 방금 만든 레포 선택
3. **Environment Variables** 에 아래 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (Anthropic Console에서 발급)
4. Deploy 클릭

### 3. 완료
배포되면 `https://platform-wire-xxx.vercel.app` 같은 URL로 어디서든 접근 가능

## 로컬 실행
```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
# http://localhost:3000
```

## 기능
- 열 때마다 최근 7일 플랫폼·DX 뉴스 실시간 검색
- 주목도 순 정렬, 한국어 번역
- 뉴스 클릭 → 페이스북 포스팅 즉시 생성
- 포스팅 번호 직접 입력, 복사 기능
