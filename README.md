# BrandGuard

마케팅 소재 공개 전, AI 1차 검토와 사람 중심 결재 라인을 통해
이미지와 문구의 브랜드 리스크 후보를 점검하는 B2B SaaS 포트폴리오입니다.

BrandGuard는 특정 사상이나 의도를 판정하지 않습니다. AI는 검토 후보와
근거를 정리하고, 최종 판단은 작성자와 결재자가 남긴 의견과 승인 이력을
통해 이루어집니다.

## Core Workflow

```txt
마케팅 소재 업로드
→ mocked AI 1차 검토
→ 작성자 검토 의견 작성
→ 결재 라인 상신
→ 결재자 의견 및 승인/수정 요청/반려
→ 최종 승인 후 게시 가능 상태 판단
```

## Main Features

- 캠페인 검토 요청 생성
- 이미지/문구 업로드와 미리보기
- staged AI 1차 검토 시뮬레이션
- 이미지 오버레이 기반 검토 후보 선택
- 감지 근거, 신뢰도, 오탐 가능성 노트 표시
- 작성자 검토 의견 저장 후 결재 상신
- mock 현재 사용자/역할 전환
- `내 요청`과 `내 결재함` 분리
- 현재 결재 단계 담당자만 승인, 수정 요청, 반려 가능
- 결재자 의견과 감사 로그 기록
- 수정본 업로드 및 버전 비교

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- MSW
- Playwright

## Routes

- `/campaigns/new`
- `/campaigns/[id]/review`
- `/campaigns/[id]/approval`
- `/approvals`
- `/campaigns`
- `/dashboard`
- `/campaigns/[id]/versions`
- `/risk-dictionary`
- `/cases`
- `/settings/team`
- `/settings/profile`

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

If Playwright browsers are not installed locally, run:

```bash
npx playwright install
```

## Demo Notes

- AI/OCR/VLM outputs are mocked JSON-style results.
- Uploaded demo campaigns are persisted in browser `localStorage`.
- The current user switcher is mock auth, not real authentication.
- Role-based filtering currently uses mock names and roles.
- Approval decisions are human actions; AI never approves a campaign.
- Risk wording intentionally stays neutral: 검토 후보, 오탐 가능성, 사람 검토 권장.

## Known Limitations

- No real account system or organization membership yet.
- No server-side persistence yet.
- No real OCR, vision, or LLM provider integration.
- Mock uploaded assets stay in local browser storage.
- E2E currently covers the main approval path; revision and rejection paths are future tests.

## Future Improvements

- Supabase Auth and database persistence
- User ID based ownership and approval permissions
- Approval delegation and team settings
- Revision request and rejection E2E coverage
- Real OCR/Vision/LLM provider behind a server-side API
- Richer audit export and approval evidence package
