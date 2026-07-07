# AGENTS.md

## Project: BrandGuard

BrandGuard is a Next.js B2B SaaS portfolio project for pre-publication brand risk review of marketing assets.

The product helps marketing, brand, PR, and legal teams review campaign images and copy before publishing. It must be positioned as a **human review assistant**, not as an automatic ideology, political, or intent classifier.

---

## Core Product Principle

Never claim that the system can determine a person's intention, ideology, political affiliation, gender view, or membership in any community.

Use neutral language:

Good:
- "risk candidate"
- "review required"
- "visual pattern candidate"
- "possible controversial interpretation"
- "human review recommended"
- "false positive possible"

Bad:
- "this is feminist"
- "this is ilbe"
- "this is political intent"
- "this image is definitely dangerous"
- "this person has a specific ideology"
- "the AI confirmed controversy"

The app should always communicate uncertainty and human review.

---

## Tech Stack

Use the following stack unless there is a strong reason not to:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui style component structure
- TanStack Query for server/cache state
- Zustand or Jotai for local UI state
- React Hook Form
- Zod
- Recharts for charts
- Canvas or SVG for image overlay
- MSW for mock API
- Playwright for E2E tests
- Optional: Supabase for persistence
- Optional: MediaPipe for hand landmark demo

This project is frontend-first. AI/OCR/VLM outputs can be mocked with JSON.

---

## Development Goal

Build a polished frontend SaaS experience, not a real ML classifier.

The strongest demo screen should be:

```txt
/campaigns/[id]/review
```

This page should show:
- Uploaded marketing image
- Risk region overlays
- Mock hand landmark visualization
- OCR text region overlays
- Risk score
- Category-level findings
- Evidence
- False-positive note
- Suggested revisions
- Reviewer comments
- Approval/revision/rejection workflow
- Audit log

---

## Recommended App Routes

```txt
/dashboard
/campaigns
/campaigns/new
/campaigns/[id]/review
/campaigns/[id]/approval
/campaigns/[id]/versions
/approvals
/risk-dictionary
/cases
/settings/team
/settings/profile
```

Use nested layouts where appropriate.

---

## Suggested Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  dashboard/
    page.tsx
  campaigns/
    page.tsx
    new/
      page.tsx
    [id]/
      review/
        page.tsx
      approval/
        page.tsx
      versions/
        page.tsx
  approvals/
    page.tsx
  risk-dictionary/
    page.tsx
  cases/
    page.tsx
  settings/
    team/
      page.tsx
    profile/
      page.tsx

components/
  ui/
  layout/
  dashboard/
  campaign/
  image-review/
    ReviewCanvas.tsx
    ImageOverlay.tsx
    BoundingBox.tsx
    LandmarkOverlay.tsx
    RiskTooltip.tsx
    ZoomControls.tsx
  risk/
    RiskScoreCard.tsx
    RiskCategoryList.tsx
    RiskFindingPanel.tsx
    RevisionSuggestions.tsx
  workflow/
    ReviewActions.tsx
    CommentThread.tsx
    AuditLog.tsx

features/
  campaign/
    types.ts
    schema.ts
    api.ts
    hooks.ts
  risk-analysis/
    types.ts
    mock-analysis.ts
    scoring.ts
  review-workflow/
    types.ts
    state-machine.ts

lib/
  utils.ts
  format.ts
  constants.ts

mocks/
  handlers.ts
  data/
    campaigns.ts
    analysis-results.ts
    risk-dictionary.ts
    cases.ts

tests/
  e2e/
```

---

## TypeScript Domain Types

Implement or adapt these types.

```ts
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type CampaignStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'AI_REVIEWED'
  | 'STAKEHOLDER_REVIEW'
  | 'NEEDS_REVISION'
  | 'PR_REVIEW'
  | 'LEGAL_REVIEW'
  | 'FINAL_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'

export type RiskCategory =
  | 'visual_gesture'
  | 'ocr_text'
  | 'sensitive_date'
  | 'political_historical'
  | 'gender_conflict'
  | 'regional_discrimination'
  | 'generation_conflict'
  | 'disability_disease'
  | 'race_nationality'
  | 'religion'
  | 'labor_power_abuse'
  | 'sexual_expression'
  | 'violence_disaster'
  | 'community_slang'
  | 'brand_mismatch'

export type UserRole =
  | 'MARKETER'
  | 'BRAND_MANAGER'
  | 'PR_REVIEWER'
  | 'LEGAL_REVIEWER'
  | 'FINAL_APPROVER'
  | 'ADMIN'

export type Campaign = {
  id: string
  name: string
  brandName: string
  channel: 'instagram' | 'youtube' | 'tiktok' | 'web_banner' | 'push' | 'offline'
  publishDate: string
  targetAudience: string
  industry: string
  status: CampaignStatus
  riskScore: number
  ownerName: string
  createdAt: string
  updatedAt: string
}

export type AnalysisResult = {
  id: string
  campaignId: string
  versionId: string
  overallRiskScore: number
  overallRiskLevel: RiskLevel
  categories: RiskFinding[]
  suggestions: RevisionSuggestion[]
  createdAt: string
}

export type RiskFinding = {
  id: string
  category: RiskCategory
  title: string
  level: RiskLevel
  confidence: number
  description: string
  evidence: string[]
  falsePositiveNote?: string
  regions?: ImageRegion[]
}

export type ImageRegion = {
  id: string
  type: 'hand' | 'ocr_text' | 'symbol' | 'object'
  x: number
  y: number
  width: number
  height: number
  confidence: number
  label: string
  landmarks?: Landmark[]
}

export type Landmark = {
  x: number
  y: number
  label?: string
}

export type RevisionSuggestion = {
  id: string
  target: 'copy' | 'image' | 'schedule' | 'review_process'
  title: string
  description: string
  before?: string
  after?: string
}
```

---

## Mock First Rule

Implement the UI with mock data first.

Do not block progress by trying to build real AI detection.

Recommended order:
1. Hardcode sample campaigns.
2. Hardcode sample analysis results.
3. Build review UI.
4. Build image overlay using mock coordinates.
5. Build workflow state changes.
6. Add mock API using MSW.
7. Add optional real detection demo later.

---

## Upload, AI Review, and Approval Flow

The core v2 demo must show a complete review pipeline:

```txt
Upload marketing asset
→ AI first-pass review
→ Human stakeholder review
→ Stakeholder opinions
→ Final approval decision
```

Required screens:
- `/campaigns/new` uploads or previews a marketing image and campaign copy.
- The create screen starts an AI first-pass review simulation with staged progress.
- `/campaigns/[id]/review` shows the uploaded or mock asset, AI review candidates, and reviewer opinions.
- `/campaigns/[id]/approval` lets the final decision maker review AI output, human opinions, audit log, and choose approve/revision/reject.
- `/approvals` shows campaigns waiting for stakeholder review or final approval.

AI review stages should be presented as review assistance:
- asset intake
- image region candidate scan
- OCR text candidate scan
- risk dictionary comparison
- reviewer summary generation

The app must not imply AI makes the final decision. AI output is only the first-pass opinion used by people in the approval workflow.

---

## AI Review Integration Rules

BrandGuard may include an AI first-review flow, but the AI must be implemented as a **review assistant** that creates structured review candidates for humans.

AI must not be implemented as:
- an ideology classifier
- a political affiliation classifier
- an intent detector
- a gender view classifier
- a community membership detector
- an automatic legal approval system

Recommended analysis pipeline:
1. Campaign is submitted for analysis.
2. Status changes to `ANALYZING`.
3. A mock or AI provider creates an `AnalysisResult`.
4. Status changes to `AI_REVIEWED`.
5. Human reviewers decide the next workflow state.

Use a provider interface so the UI can be completed with mock data first and upgraded later:

```ts
export type AnalysisInput = {
  campaignId: string
  versionId: string
  imageUrl?: string
  copy?: string
  publishDate: string
  channel: Campaign['channel']
  targetAudience: string
  industry: string
}

export type AnalysisProvider = {
  analyzeCampaign(input: AnalysisInput): Promise<AnalysisResult>
}
```

Start with:
- `mockAnalysisProvider`
- mock OCR text regions
- mock visual pattern regions
- mock hand landmarks
- deterministic mock suggestions

Later providers may be added behind the same contract:
- `ocrAnalysisProvider` for OCR text and coordinates
- `visionAnalysisProvider` for image observations and candidate regions
- `hybridAnalysisProvider` for OCR + vision + risk dictionary + LLM summary

Keep all AI provider calls server-side. Do not expose model API keys in client components, browser bundles, public env vars, or mock fixtures.

---

## AI Prompt and Output Rules

Any real AI prompt must include these constraints:

```txt
You are a brand risk review assistant.
Do not determine ideology, intent, political affiliation, gender view, or group membership.
Only identify review candidates based on visible patterns, OCR text, dates, and campaign context.
Always include uncertainty, evidence, false-positive possibility, and human review recommendation.
Return JSON matching the AnalysisResult schema.
Use Korean B2B SaaS wording.
```

AI output must:
- match the TypeScript/Zod schema before it is shown in the UI
- include `falsePositiveNote` for every non-low finding
- include evidence for every finding
- use neutral labels such as "visual pattern candidate" or "review recommended"
- avoid deterministic labels such as "detected ideology" or "confirmed controversy"
- create audit log entries for analysis start, analysis success, analysis failure, and human review actions

For visual gesture findings, keep using the wording pattern in the Review Result Wording Rules section.

---

## Image Overlay Requirements

The image review UI is the most important frontend showcase.

Implement:
- Image preview
- Bounding boxes using SVG or absolutely positioned divs
- Landmark dots and lines
- Hover tooltip
- Click-to-select finding
- Right panel sync
- Zoom controls
- Responsive layout
- Empty state when no image is uploaded
- Loading state while "analysis" is running

Coordinates should be treated as relative to the original image size or normalized to 0-1. Pick one approach and document it.

Recommended normalized region format:

```ts
type NormalizedRegion = {
  x: number // 0 to 1
  y: number // 0 to 1
  width: number // 0 to 1
  height: number // 0 to 1
}
```

If using pixel coordinates, convert them based on rendered image dimensions.

---

## Review Result Wording Rules

For any visual gesture result, use this pattern:

```txt
Title:
손동작 후보 검토 필요

Description:
이미지 내 손동작이 일부 민감한 시각 패턴과 유사하게 해석될 가능성이 있습니다.

Evidence:
- 엄지와 검지 사이 거리가 가까운 형태가 감지되었습니다.
- 일부 손가락이 가려져 있어 맥락 확인이 필요합니다.
- 제품을 집는 동작일 가능성도 있습니다.

False-positive note:
이 결과는 의도나 성향을 판정하지 않으며, 시각적 유사성에 기반한 검토 후보입니다.
```

Do not use labels like:
- feminist gesture
- ilbe gesture
- political hand sign
- ideology detected

Use labels like:
- visual gesture candidate
- sensitive visual pattern candidate
- review recommended

---

## UI Tone

Use a professional B2B SaaS tone.

Recommended Korean labels:
- 검토 필요
- 오탐 가능성
- 감지 근거
- 수정 제안
- 검토 이력
- 승인
- 수정 요청
- 반려
- 재분석
- 고위험
- 중간 위험
- 낮은 위험

Avoid sensational wording:
- 위험 확정
- 논란 확정
- 사상 탐지
- 정치 성향 탐지
- 페미 감지
- 일베 감지

---

## Workflow State Machine

Implement clear state transitions.

```txt
DRAFT
→ ANALYZING
→ AI_REVIEWED
→ STAKEHOLDER_REVIEW
→ NEEDS_REVISION
→ AI_REVIEWED
→ FINAL_APPROVAL
→ APPROVED
```

Allow:
- DRAFT → ANALYZING
- ANALYZING → AI_REVIEWED
- AI_REVIEWED → STAKEHOLDER_REVIEW
- STAKEHOLDER_REVIEW → NEEDS_REVISION
- STAKEHOLDER_REVIEW → FINAL_APPROVAL
- STAKEHOLDER_REVIEW → PR_REVIEW
- STAKEHOLDER_REVIEW → LEGAL_REVIEW
- PR_REVIEW → FINAL_APPROVAL
- LEGAL_REVIEW → FINAL_APPROVAL
- PR_REVIEW → REJECTED
- FINAL_APPROVAL → APPROVED
- FINAL_APPROVAL → NEEDS_REVISION
- FINAL_APPROVAL → REJECTED
- NEEDS_REVISION → ANALYZING

Every state change should create an audit log entry.

---

## Forms and Validation

Use React Hook Form and Zod.

Campaign creation required fields:
- campaign name
- brand name
- channel
- publish date
- target audience
- industry
- image or copy

Validation requirements:
- Do not allow empty campaign name.
- Do not allow invalid date.
- Do not allow unsupported image file type.
- Show field-level error messages.
- Submit button should show loading state.

---

## Dashboard Requirements

Dashboard should include:
- Pending reviews
- High-risk campaigns
- Approved campaigns
- Average risk score
- Risk category distribution chart
- Recent campaigns table
- "Needs urgent review" list

Make the dashboard visually polished but not overloaded.

---

## Campaign List Requirements

Implement:
- Search
- Status filter
- Risk level filter
- Channel filter
- Sort by risk score
- Sort by publish date
- Table row click to review page
- Empty state
- Loading skeleton

---

## Versions Page Requirements

Show before/after comparison.

Include:
- v1/v2 risk score
- Score delta
- Copy diff
- Risk findings removed
- Risk findings added
- Image comparison placeholder
- Approval status per version

This page demonstrates product depth.

---

## Risk Dictionary Requirements

Use mock entries.

Each entry:
- title
- category
- severity
- description
- review guide
- safer alternative
- last updated

Do not include explicit slurs, targeted harassment, or overly sensitive terms unless necessary for neutral placeholder examples.

Use generic examples like:
- "민감 날짜 예시"
- "커뮤니티 은어 예시"
- "시각 패턴 후보"
- "지역 비하 표현 후보"

---

## Accessibility Requirements

- All interactive controls must be keyboard accessible.
- Image overlays must have corresponding text list items.
- Do not rely only on color for risk level.
- Dialogs must trap focus.
- Buttons must have accessible names.
- Tooltips should not hide critical information.
- Tables should have proper headers.
- Risk score should include text, not only a chart.

---

## Loading, Empty, Error States

Every major page should include:
- loading state
- empty state
- error state

Examples:
- No campaigns yet
- No risk findings detected
- Analysis failed
- Image upload failed
- Review comment is empty
- Version comparison unavailable

---

## Testing Requirements

Use Playwright for E2E.

Minimum test scenarios:
1. User creates a campaign.
2. User uploads an image and enters copy.
3. User sees analysis loading state.
4. User lands on review page.
5. User clicks a risk overlay.
6. Matching risk finding is highlighted.
7. User adds a review comment.
8. User requests revision.
9. Campaign status updates.
10. Audit log contains the new event.

Optional tests:
- Campaign list filtering
- Risk dictionary search
- Version comparison
- Form validation errors

---

## Performance Requirements

- Lazy-load heavy review canvas if needed.
- Use optimized image preview.
- Avoid unnecessary rerenders when selecting overlays.
- Memoize expensive coordinate calculations.
- Keep mock data small but realistic.
- Use skeletons for async-like interactions.

---

## Privacy and Safety Notes

Treat uploaded marketing assets as sensitive internal company data.

Even in mock mode:
- Do not expose uploaded asset data in public URLs.
- Do not frame analysis results as final truth.
- Include false-positive notes.
- Include manual override.
- Include audit logs.

The app must never encourage harassment, labeling, or targeting of individuals or groups.

---

## README Requirements

The README should clearly explain:

- BrandGuard is a portfolio project.
- It is a brand risk review assistant, not an ideology detector.
- AI results are mocked for demo purposes.
- The core frontend challenge is image analysis result visualization and review workflow.
- Tech stack.
- Main features.
- How to run.
- How to test.
- Known limitations.
- Future improvements.

Suggested README headline:

```md
# BrandGuard

마케팅 소재 공개 전, 사회적 논란 가능성을 사전에 점검하는 브랜드 리스크 리뷰 SaaS입니다.

BrandGuard는 특정 정치 성향이나 개인의 사상을 판정하지 않습니다.
광고 문구, 게시일, 이미지 요소, 타깃 맥락을 기반으로
논란 가능성이 있는 신호를 탐지하고,
브랜드/PR/법무 담당자가 검토할 수 있는 근거와 대안 문구를 제공합니다.
```

---

## Implementation Priority

### Phase 1
- Project setup
- Layout
- Mock data
- Dashboard
- Campaign list
- Campaign create form

### Phase 2
- Review page
- Image upload preview
- Risk result panel
- Overlay visualization
- Selected finding sync

### Phase 3
- Review workflow
- Comments
- Audit log
- State transitions

### Phase 4
- Version comparison
- Risk dictionary
- Case library
- E2E tests
- README polish

### Phase 5 Optional
- MediaPipe demo
- OCR mock-to-real switch
- Supabase persistence
- Storybook

---

## Definition of Done

A feature is done when:
- UI is responsive.
- Loading, error, and empty states exist.
- TypeScript types are explicit.
- No unsafe deterministic language is used for risk findings.
- Main interactions are testable.
- State changes update audit log.
- Components are reasonably reusable.
- Accessibility basics are satisfied.

---

## Final Reminder for Codex

Do not over-focus on building real AI.

The product value in this portfolio is:
1. Clear problem definition.
2. Polished B2B SaaS UX.
3. Image overlay visualization.
4. Human review workflow.
5. Safe, neutral risk communication.
6. Strong TypeScript and component architecture.


## 15. Git and PR Rules

Each task should produce a focused change.

### Git Workflow

- Use `develop` as the main development branch.
- Do not use `main` for daily development work.
- Create short-lived feature branches from `develop`.
- Use branch names that describe the work clearly.
- Prefer these branch prefixes:
  - `feature/*` for new features
  - `fix/*` for bug fixes
  - `docs/*` for documentation changes
  - `refactor/*` for refactoring
  - `chore/*` for setup, config, dependency, or maintenance work
- Keep feature branches small and merge them back into `develop` frequently.
- Run lint, tests, or build checks before pushing when the related scripts exist.
- When a phase is completed, commit the completed phase with a Conventional Commit message and push the current branch to `origin` before the final response, unless the user explicitly says not to push.
- Use `main` later as the stable release branch.
- When releasing, merge `develop` into `main` and create a version tag such as `v0.1.0`.
- Use `hotfix/*` branches only for urgent production fixes after `main` becomes active.

Example:

```bash
git checkout develop
git pull
git checkout -b feature/auth
```

### Commit Message Rules

Use Conventional Commits.

Format:

```txt
type(scope): subject
```

Rules:

- Use lowercase English for `type`, `scope`, and `subject`.
- Keep the subject short, clear, and action-oriented.
- Do not end the subject with a period.
- Make one commit represent one logical change.
- Avoid vague messages such as `update`, `fix`, `wip`, or `asdf`.

Allowed types:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation only
- `style`: formatting or style changes without behavior changes
- `refactor`: code restructuring without behavior changes
- `test`: tests
- `chore`: config, dependency, setup, or maintenance work
- `build`: build system or package changes
- `ci`: CI workflow changes
- `perf`: performance improvement
- `revert`: revert a previous commit

Recommended scopes for this project:

- `auth`
- `hatch`
- `character`
- `diary`
- `care`
- `home`
- `ui`
- `db`
- `prisma`
- `3d`
- `docs`
- `config`

Examples:

```txt
feat(auth): add signup page
feat(hatch): implement server-side character draw
fix(diary): ignore empty lines when counting diary content
refactor(care): extract action cooldown constants
docs(tasks): mark project setup checklist done
chore(prisma): add seed script
```

Before final response:

- Summarize changed files
- Explain implementation decisions
- Mention commands run
- Mention anything not completed
- Mention any placeholders requiring user input

Do not claim a check passed unless it was actually run.
