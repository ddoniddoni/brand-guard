# BrandGuard

마케팅 소재 공개 전, 사회적 논란 가능성을 사전에 점검하는 브랜드 리스크 리뷰 SaaS입니다.

BrandGuard는 특정 정치 성향이나 개인의 사상을 판정하지 않습니다. 광고 문구, 게시일, 이미지 요소, 타깃 맥락을 기반으로 논란 가능성이 있는 신호를 검토 후보로 정리하고, 브랜드/PR/법무 담당자가 근거와 대안 문구를 확인할 수 있게 돕습니다.

## Status

Initial Next.js setup is complete.

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

## Checks

```bash
npm run lint
```

```bash
npx @google/design.md lint DESIGN.md
```

## Notes

- AI analysis is mocked first.
- AI output must remain a review assistant result, not a final judgment.
- Human reviewers make approval, revision, and rejection decisions.
