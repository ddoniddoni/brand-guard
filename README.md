# BrandGuard

마케팅 소재 공개 전, AI 1차 검토와 사람 중심 결재 라인을 통해 이미지와 문구의 브랜드 리스크 후보를 점검하는 B2B SaaS 포트폴리오입니다.

BrandGuard는 특정 정치 성향이나 개인의 사상을 판정하지 않습니다. AI는 광고 문구, 게시일, 이미지 요소, 타깃 맥락에서 검토 후보와 근거를 정리하고, 작성자와 결재자가 의견을 남겨 최종 게시 여부를 결정합니다.

## Status

Frontend-first MVP foundation is in progress. The current demo focuses on
uploading a marketing asset, running a mocked AI first-pass review, collecting
the requester opinion, and sending the asset through an approval line.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint

## Getting Started

```bash
npm run dev
```

Open `http://localhost:3000`.

## Current Routes

- `/dashboard`
- `/campaigns`
- `/campaigns/new`
- `/campaigns/[id]/review`
- `/campaigns/[id]/approval`
- `/campaigns/[id]/versions`
- `/approvals`
- `/risk-dictionary`
- `/cases`
- `/settings/team`
- `/settings/profile`

## Checks

```bash
npm run lint
```

```bash
npx @google/design.md lint DESIGN.md
```

## Notes

- AI analysis is mocked first.
- Uploaded demo campaigns are persisted in browser `localStorage`.
- Revision uploads create local v2 analysis and before/after comparison data.
- AI output must remain a review assistant result, not a final judgment.
- Requesters must add an opinion before approval submission.
- Human approvers make approval, revision, and rejection decisions.
- Final approval happens after AI first-pass review and approval-line comments.
