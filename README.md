# BrandGuard

BrandGuard는 기업과 브랜드 마케팅 담당자가 영상 대본, 광고 문구,
이미지 속 텍스트를 공개하기 전에 검수할 수 있도록 돕는 브랜드 정책 기반
콘텐츠 사전 검수 SaaS 포트폴리오입니다.

사용자는 브랜드 금지어와 주의어를 등록하고, 영상 대본이나 광고 문구를
붙여넣어 문장 단위로 검사할 수 있습니다. 이미지의 경우 Tesseract.js OCR로
이미지 속 문구를 추출하고, 동일한 정책 사전 기준으로 검토 후보를 확인할 수
있습니다.

BrandGuard는 특정 사상, 정치 성향, 의도, 커뮤니티 소속을 판정하지 않습니다.
결과는 최종 확정이 아니라 사람이 확인해야 하는 검토 후보입니다.

## Core Workflow

```txt
브랜드 정책 사전 등록
→ 영상 대본/광고 문구/SNS 카피 붙여넣기
→ 문장/줄 단위 분리
→ 금지어·주의어 정책 매칭
→ 이미지 업로드
→ Tesseract.js OCR 문구 추출
→ OCR 문구 정책 매칭
→ 검토 후보, 근거, 위치, 수정 제안 확인
→ 검수 메모 작성
→ 검수 리포트 저장
```

## Main Features

- 브랜드 정책 사전 mock 관리
- 금지어/주의어, 심각도, 매칭 방식, 대체 표현 표시
- 콘텐츠 검수 생성 폼
- 대본/문구 문장 단위 분리
- `contains`, `exact`, `normalized`, `regex` 정책 필터 엔진
- Tesseract.js 기반 이미지 OCR 실행
- OCR 텍스트와 이미지 영역 표시
- 출처/심각도별 검토 후보 필터
- 검수 메모와 리포트 저장
- 저장된 검수 기록 목록
- AI 이미지 분석 미연결 상태 화면

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Playwright
- Tesseract.js

## Routes

- `/reviews/new`
- `/reviews/[id]`
- `/dictionaries`
- `/history`
- `/settings/ai`

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm run lint
npm run build
npm run test:e2e
```

The E2E suite checks the policy dictionary, pasted-text review flow, Korean
validation messages, report saving, and history rendering.

If Playwright browsers are not installed locally, run:

```bash
npx playwright install
```

## Demo Notes

- Policy terms are mock data for portfolio demonstration.
- Review jobs and reports are persisted in browser `localStorage`.
- Uploaded images run client-side OCR with Tesseract.js when possible.
- AI image analysis is shown as a disabled extension point until an API Key is
  connected.
- API Keys must be handled server-side only in future provider work.
- Wording intentionally stays neutral: 검토 후보, 정책 매칭, 오탐 가능성,
  담당자 검토 필요.

## Known Limitations

- No real account system or organization membership yet.
- No server-side persistence yet.
- Policy dictionary edits are persisted only in the current browser's `localStorage`.
- OCR is client-side Tesseract.js only.
- AI image analysis provider is not connected yet.
- The policy dictionary UI is currently mock-first and will need persistent CRUD.

## Future Improvements

- Persistent policy dictionary CRUD
- Server-side review/report API
- OCR result mapping per text line and region
- AI vision provider interface behind server routes
- Policy import/export
- Supabase Auth and database persistence
