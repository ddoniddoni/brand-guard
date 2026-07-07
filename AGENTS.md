# AGENTS.md

## Project: BrandGuard

BrandGuard is a Next.js B2B SaaS portfolio project for reviewing marketing assets before publication.

The project must focus on one core workflow:

```txt
Marketing asset upload
→ AI first-pass review
→ Requester reviews AI result and adds an opinion
→ Requester submits the asset to an approval line
→ Approvers review AI result + requester opinion
→ Final approver approves, requests revision, or rejects
→ Only approved assets can be published
```

BrandGuard is a **human approval workflow assistant**. It is not an automatic ideology, political, gender-view, intent, or community-membership classifier.

---

## Most Important Product Principle

Do not build BrandGuard as a broad risk-management platform first.

The main product value is the approval workflow:

1. A designer or marketing staff member uploads campaign copy and/or an image.
2. The system runs an AI first-pass review using mocked analysis data.
3. The requester checks the AI result and writes their own review opinion.
4. The requester submits the asset to the approval line.
5. Each approver sees:
   - original image/copy
   - AI first-pass findings
   - evidence and false-positive notes
   - requester opinion
   - previous approver comments
   - approval history
6. The final approver makes the final decision.
7. The asset becomes publishable only after final approval.

Other screens such as dashboard, risk dictionary, case library, settings, and version comparison are optional secondary features. Do not let them distract from the approval-line flow.

---

## Product Safety Principle

Never claim that the system can determine a person's intention, ideology, political affiliation, gender view, or membership in any community.

Use neutral language.

Good:
- "risk candidate"
- "review required"
- "visual pattern candidate"
- "possible controversial interpretation"
- "human review recommended"
- "false positive possible"
- "requester opinion"
- "approval review"

Bad:
- "this is feminist"
- "this is ilbe"
- "this is political intent"
- "this image is definitely dangerous"
- "this person has a specific ideology"
- "the AI confirmed controversy"
- "AI approved this campaign"

The app must always communicate uncertainty and human review.

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
- Recharts only if a small summary chart is needed
- SVG or absolutely positioned divs for image overlay
- MSW for mock API
- Playwright for E2E tests
- Optional: Supabase for persistence later

This project is frontend-first. AI/OCR/VLM outputs should be mocked with JSON first.

---

## MVP Scope

### Required

Build these first:

1. Campaign asset creation page
2. Image/copy upload and preview
3. AI first-pass review simulation
4. Review result page with image overlay and risk findings
5. Requester opinion form
6. Submit-to-approval-line action
7. Approval page for next approver/final approver
8. Approval/revision/rejection workflow
9. Audit log for AI review, requester review, and approver decisions

### Optional Later

These are secondary and should not block the core flow:

- Dashboard
- Campaign list filters beyond basic list/search
- Risk dictionary management
- Case library
- Version comparison
- Team settings
- Real OCR/Vision/LLM integration
- Supabase persistence
- MediaPipe hand landmark demo
- Storybook

---

## Primary Demo Routes

Prioritize these routes:

```txt
/campaigns/new
/campaigns/[id]/review
/campaigns/[id]/approval
/approvals
```

Optional routes:

```txt
/campaigns
/dashboard
/campaigns/[id]/versions
/risk-dictionary
/cases
/settings/team
/settings/profile
```

---

## Primary User Flow

### 1. Asset Upload

Route:

```txt
/campaigns/new
```

The requester, usually a designer or marketing staff member, creates a campaign review request.

Required fields:
- campaign name
- brand name
- channel
- publish date
- target audience
- industry
- image and/or campaign copy
- approval line

When the requester clicks `AI 1차 검토 시작`, the campaign status changes to `ANALYZING`.

The app shows staged AI review progress:

```txt
소재 접수
→ 이미지 후보 영역 확인
→ OCR 문구 후보 확인
→ 리스크 후보 정리
→ 담당자 검토용 요약 생성
```

After analysis, status becomes `AI_REVIEWED`.

---

### 2. Requester Review

Route:

```txt
/campaigns/[id]/review
```

This is the most important screen.

The requester must be able to:
- see the uploaded image/copy
- see AI first-pass review candidates
- click image overlay regions
- read evidence, confidence, and false-positive notes
- decide whether the AI result is relevant in context
- write their own review opinion
- submit the asset to the approval line

The key action is:

```txt
검토 의견 작성 후 결재 상신
```

Submitting to approval changes the status from `AI_REVIEWED` to `IN_APPROVAL` and creates an audit log entry.

---

### 3. Approval Line Review

Route:

```txt
/campaigns/[id]/approval
```

Approvers must see:
- original image/copy
- AI first-pass summary
- risk candidates
- requester opinion
- previous approval comments
- approval step timeline
- audit log

Each approver can choose:
- approve
- request revision
- reject

If an intermediate approver approves, the campaign moves to the next approval step.

If the final approver approves, the campaign status becomes `APPROVED` or `READY_TO_PUBLISH`.

If any approver requests revision, status becomes `NEEDS_REVISION` and the asset returns to the requester.

If any approver rejects, status becomes `REJECTED`.

---

## Suggested Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  campaigns/
    new/
      page.tsx
    [id]/
      review/
        page.tsx
      approval/
        page.tsx
  approvals/
    page.tsx

components/
  ui/
  layout/
  campaign/
    CampaignAssetForm.tsx
    AssetPreview.tsx
    AnalysisProgress.tsx
  image-review/
    ReviewCanvas.tsx
    ImageOverlay.tsx
    BoundingBox.tsx
    LandmarkOverlay.tsx
    RiskTooltip.tsx
    ZoomControls.tsx
  risk/
    RiskScoreCard.tsx
    RiskFindingList.tsx
    RiskFindingPanel.tsx
    RevisionSuggestions.tsx
  approval/
    RequesterOpinionForm.tsx
    ApprovalLineTimeline.tsx
    ApprovalDecisionPanel.tsx
    ApprovalHistory.tsx
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
    provider.ts
  approval-workflow/
    types.ts
    state-machine.ts
    mock-approval-line.ts

lib/
  utils.ts
  format.ts
  constants.ts

mocks/
  handlers.ts
  data/
    campaigns.ts
    analysis-results.ts
    approval-lines.ts
    audit-logs.ts

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
  | 'IN_APPROVAL'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'READY_TO_PUBLISH'
  | 'REJECTED'

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
  | 'REQUESTER'
  | 'MARKETING_REVIEWER'
  | 'BRAND_MANAGER'
  | 'PR_REVIEWER'
  | 'LEGAL_REVIEWER'
  | 'FINAL_APPROVER'
  | 'ADMIN'

export type ApprovalDecision = 'approve' | 'request_revision' | 'reject'

export type ApprovalStepStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'revision_requested'
  | 'rejected'
  | 'skipped'

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
  requesterName: string
  currentApprovalStepId?: string
  createdAt: string
  updatedAt: string
}

export type MarketingAsset = {
  id: string
  campaignId: string
  imageUrl?: string
  copy?: string
  fileName?: string
  createdAt: string
}

export type AnalysisResult = {
  id: string
  campaignId: string
  assetId: string
  source: 'mock' | 'ocr' | 'vision_llm' | 'hybrid'
  overallRiskScore: number
  overallRiskLevel: RiskLevel
  summary: string
  reviewRequired: boolean
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
  falsePositiveNote: string
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

export type RequesterOpinion = {
  id: string
  campaignId: string
  authorName: string
  body: string
  conclusion: 'submit_for_approval' | 'needs_edit_before_submit' | 'false_positive_likely'
  createdAt: string
}

export type ApprovalStep = {
  id: string
  campaignId: string
  order: number
  title: string
  ownerName: string
  role: UserRole
  status: ApprovalStepStatus
  decision?: ApprovalDecision
  comment?: string
  decidedAt?: string
}

export type AuditLogEntry = {
  id: string
  campaignId: string
  actorName: string
  action:
    | 'campaign_created'
    | 'analysis_started'
    | 'analysis_completed'
    | 'requester_opinion_added'
    | 'submitted_for_approval'
    | 'approval_step_approved'
    | 'revision_requested'
    | 'campaign_rejected'
    | 'campaign_final_approved'
  message: string
  createdAt: string
}
```

---

## Workflow State Machine

Primary state transitions:

```txt
DRAFT
→ ANALYZING
→ AI_REVIEWED
→ IN_APPROVAL
→ APPROVED
→ READY_TO_PUBLISH
```

Revision path:

```txt
IN_APPROVAL
→ NEEDS_REVISION
→ ANALYZING
→ AI_REVIEWED
→ IN_APPROVAL
```

Rejection path:

```txt
IN_APPROVAL
→ REJECTED
```

Rules:

- `DRAFT → ANALYZING`: requester starts AI first-pass review.
- `ANALYZING → AI_REVIEWED`: mock analysis result is created.
- `AI_REVIEWED → IN_APPROVAL`: requester writes opinion and submits to approval line.
- `IN_APPROVAL → IN_APPROVAL`: intermediate approver approves and moves to next step.
- `IN_APPROVAL → APPROVED`: final approver approves.
- `APPROVED → READY_TO_PUBLISH`: asset is marked as publishable.
- `IN_APPROVAL → NEEDS_REVISION`: approver requests revision.
- `IN_APPROVAL → REJECTED`: approver rejects.

Every state change must create an audit log entry.

---

## Mock First Rule

Implement the UI with mock data first.

Do not block progress by trying to build real AI detection.

Recommended order:

1. Hardcode sample campaigns.
2. Hardcode sample assets.
3. Hardcode sample analysis results.
4. Hardcode sample approval line.
5. Build campaign create/upload UI.
6. Build AI analysis progress simulation.
7. Build review UI with image overlay.
8. Build requester opinion form.
9. Build approval page and decision actions.
10. Add audit log updates.
11. Add MSW mock API.
12. Add Playwright E2E for the main flow.

---

## AI Review Integration Rules

AI first-pass review creates structured review candidates for humans.

AI must not be implemented as:
- an ideology classifier
- a political affiliation classifier
- an intent detector
- a gender view classifier
- a community membership detector
- an automatic legal approval system
- an automatic publishing approval system

Recommended analysis pipeline:

1. Campaign is submitted for analysis.
2. Status changes to `ANALYZING`.
3. A mock provider creates an `AnalysisResult`.
4. Status changes to `AI_REVIEWED`.
5. The requester reviews the result and writes their own opinion.
6. Human approvers make all workflow decisions.

Provider interface:

```ts
export type AnalysisInput = {
  campaignId: string
  assetId: string
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

Keep all AI provider calls server-side. Do not expose model API keys in client components, browser bundles, public env vars, or mock fixtures.

---

## Image Overlay Requirements

The image review UI is the strongest frontend showcase.

Implement:
- image preview
- bounding boxes using SVG or absolutely positioned divs
- landmark dots and lines if mock data includes landmarks
- hover tooltip
- click-to-select finding
- selected overlay sync with right-side finding panel
- zoom controls
- responsive layout
- empty state when no image is uploaded
- loading state while analysis is running

Coordinates should be normalized from 0 to 1.

```ts
type NormalizedRegion = {
  x: number
  y: number
  width: number
  height: number
}
```

---

## Review Result Wording Rules

For any visual gesture result, use this pattern:

```txt
Title:
손동작 후보 검토 필요

Description:
이미지 내 손동작이 일부 민감한 시각 패턴과 유사하게 해석될 가능성이 있습니다.

Evidence:
- 엄지와 검지 사이 거리가 가까운 형태가 확인되었습니다.
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
- requester review required

---

## UI Tone

Use a professional Korean B2B SaaS tone.

Recommended Korean labels:
- AI 1차 검토
- 검토 후보
- 검토 필요
- 오탐 가능성
- 감지 근거
- 수정 제안
- 작성자 검토 의견
- 결재 상신
- 결재 라인
- 검토 이력
- 승인
- 수정 요청
- 반려
- 최종 승인
- 게시 가능

Avoid sensational wording:
- 위험 확정
- 논란 확정
- 사상 탐지
- 정치 성향 탐지
- 페미 감지
- 일베 감지
- AI 승인 완료

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
- at least one approver in approval line

Requester opinion required fields:
- opinion body
- conclusion

Approval decision required fields:
- decision
- comment when requesting revision or rejecting

Validation requirements:
- Do not allow empty campaign name.
- Do not allow invalid date.
- Do not allow unsupported image file type.
- Do not allow submitting to approval without requester opinion.
- Do not allow final approval before all previous required steps are completed.
- Show field-level error messages.
- Submit buttons should show loading states.

---

## E2E Testing Requirements

Use Playwright for the main approval flow.

Minimum test scenario:

1. User creates a campaign.
2. User uploads an image and enters copy.
3. User starts AI first-pass review.
4. User sees analysis loading state.
5. User lands on review page.
6. User clicks a risk overlay.
7. Matching risk finding is highlighted.
8. User writes requester opinion.
9. User submits to approval line.
10. Approver opens approval page.
11. Approver sees AI result and requester opinion.
12. Approver approves or requests revision.
13. Final approver approves.
14. Campaign status becomes `APPROVED` or `READY_TO_PUBLISH`.
15. Audit log contains analysis, requester opinion, approval submission, and final decision events.

Optional tests:
- validation errors
- revision request path
- rejection path
- approval step timeline rendering

---

## Performance Requirements

- Lazy-load heavy review canvas if needed.
- Use optimized image preview.
- Avoid unnecessary rerenders when selecting overlays.
- Memoize coordinate calculations.
- Keep mock data small but realistic.
- Use skeletons for async-like interactions.

---

## Privacy and Safety Notes

Treat uploaded marketing assets as sensitive internal company data.

Even in mock mode:
- Do not expose uploaded asset data in public URLs.
- Do not frame analysis results as final truth.
- Include false-positive notes.
- Include manual override through human approval decisions.
- Include audit logs.
- Do not encourage harassment, labeling, or targeting of individuals or groups.

---

## README Requirements

The README should clearly explain:

- BrandGuard is a portfolio project.
- The core workflow is AI first-pass review plus human approval line.
- It is a brand risk review assistant, not an ideology detector.
- AI results are mocked for demo purposes.
- The core frontend challenge is image analysis visualization and approval workflow.
- Tech stack.
- Main features.
- How to run.
- How to test.
- Known limitations.
- Future improvements.

Suggested README headline:

```md
# BrandGuard

마케팅 소재 공개 전, AI 1차 검토와 사람 중심 결재 라인을 통해
이미지와 문구의 브랜드 리스크 후보를 점검하는 B2B SaaS 포트폴리오입니다.

BrandGuard는 특정 사상이나 의도를 판정하지 않습니다.
AI는 검토 후보와 근거를 정리하고,
최종 판단은 작성자와 결재자가 남긴 의견과 승인 이력을 통해 이루어집니다.
```

---

## Implementation Priority

### Phase 1
- Project setup
- Layout
- Types and mock data
- Campaign creation form
- Asset preview

### Phase 2
- AI first-pass review simulation
- Review page
- Image overlay visualization
- Risk finding panel

### Phase 3
- Requester opinion form
- Submit-to-approval-line action
- Approval line timeline
- Approval decision panel
- Audit log

### Phase 4
- Main E2E test
- Empty/loading/error states
- README polish

### Phase 5 Optional
- Dashboard
- Campaign list filters
- Version comparison
- Risk dictionary
- Case library
- Real OCR/Vision/LLM provider

---

## Definition of Done

A feature is done when:

- The core approval flow is clear.
- UI is responsive.
- Loading, error, and empty states exist.
- TypeScript types are explicit.
- No unsafe deterministic language is used for risk findings.
- Requester opinion is required before approval submission.
- Approval decisions update status correctly.
- State changes update audit log.
- Components are reasonably reusable.
- Accessibility basics are satisfied.
- The main user flow is covered by E2E tests.

---

## Git and PR Rules

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
- Use `main` later as the stable release branch.

Example:

```bash
git checkout develop
git pull
git checkout -b feature/approval-flow
```

### Commit Message Rules

Use Conventional Commits.

Format:

```txt
type(scope): subject
```

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

- `campaign`
- `asset`
- `analysis`
- `review`
- `approval`
- `workflow`
- `audit-log`
- `ui`
- `mock`
- `docs`
- `config`
- `test`

Examples:

```txt
feat(campaign): add asset upload form
feat(analysis): add mock first-pass review flow
feat(review): sync selected overlay with finding panel
feat(approval): add requester opinion and approval submission
fix(workflow): prevent final approval before previous steps complete
docs(prd): focus scope on approval-line flow
```

Before final response:

- Summarize changed files.
- Explain implementation decisions.
- Mention commands run.
- Mention anything not completed.
- Mention any placeholders requiring user input.
- Do not claim a check passed unless it was actually run.
