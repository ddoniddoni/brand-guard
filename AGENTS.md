# AGENTS.md

## Project: BrandGuard

BrandGuard is a Next.js B2B SaaS portfolio project for **brand marketing content preflight review**.

The product is no longer centered on a formal approval-line workflow. The main value is helping enterprise or brand marketing teams review scripts, ad copy, and image text against a brand-defined policy dictionary before publication.

The project must focus on one core workflow:

```txt
Brand policy / forbidden-term dictionary setup
→ User pastes a video script, ad copy, or SNS caption
→ System splits the text into lines and sentences
→ System checks the text against brand-defined forbidden terms and caution terms
→ User uploads marketing images
→ Tesseract.js extracts text from the images with OCR
→ OCR text is checked against the same policy dictionary
→ Review candidates are shown with evidence, location, severity, and replacement suggestions
→ A review report is saved
→ Optional AI image analysis can be enabled later by adding an API key
```

BrandGuard is a **marketing content review assistant**. It is not an automatic ideology, political-view, gender-view, intent, or community-membership classifier.

---

## Most Important Product Principle

Do not build BrandGuard as a broad risk-management or approval system first.

The main product value is **policy-based pre-publication review**:

1. A brand or marketing manager registers forbidden terms, caution terms, and replacement suggestions.
2. A marketer pastes a video script, ad copy, campaign copy, or SNS caption.
3. The system checks the pasted text against the policy dictionary.
4. The marketer uploads one or more images.
5. Tesseract.js runs OCR and extracts image text.
6. The OCR result is checked against the same policy dictionary.
7. The review screen shows:
   - original pasted text
   - uploaded image preview
   - OCR extracted text
   - matched forbidden/caution terms
   - source of each match: pasted text or image OCR
   - sentence or line location
   - image region location when available
   - severity
   - reason
   - replacement suggestion
8. The user reviews the candidates and saves a report.
9. AI image analysis is shown as an extension point. It must work as a disabled or mock provider until an API key is connected.

Other screens such as dashboard, approval line, case library, version comparison, team roles, and advanced analytics are optional secondary features. Do not let them distract from the policy dictionary + OCR review flow.

---

## Product Safety Principle

Never claim that the system can determine a person's intention, ideology, political affiliation, gender view, or membership in any community.

Use neutral language.

Good:

- "review candidate"
- "policy match"
- "forbidden-term match"
- "caution-term match"
- "human review required"
- "replacement suggestion"
- "false positive possible"
- "OCR text candidate"
- "AI image analysis not connected"
- "visual review candidate"

Bad:

- "this is feminist"
- "this is ilbe"
- "this is political intent"
- "this image is definitely dangerous"
- "this person has a specific ideology"
- "the AI confirmed controversy"
- "AI approved this campaign"
- "100% safe"
- "automatic controversy prevention"

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
- Tesseract.js for OCR
- SVG or absolutely positioned divs for OCR/image overlay
- MSW for mock API
- Playwright for E2E tests
- Optional: Supabase for persistence later

This project is frontend-first, but OCR should be implemented enough to demonstrate the real user flow. AI image analysis should be provider-based and can remain disabled or mocked until an API key is connected.

---

## MVP Scope

### Required

Build these first:

1. Brand policy dictionary page
2. Forbidden term / caution term create, edit, enable, disable UI
3. Content review creation page
4. Video script / ad copy / SNS caption paste area
5. Text normalization and sentence/line splitting
6. Policy filter engine for pasted text
7. Image upload and preview
8. Tesseract.js OCR execution
9. OCR progress UI
10. OCR extracted text panel
11. OCR text policy filtering
12. OCR bounding box overlay when region data is available
13. Review result page with matched policy candidates
14. Severity, category, source, evidence, and replacement suggestion UI
15. Review memo and report save action
16. AI image analysis connection status screen
17. Disabled or mock vision provider that can be replaced by a real provider when an API key exists
18. Basic history list for saved review reports

### Optional Later

These are secondary and should not block the core flow:

- Approval line workflow
- Complex dashboard
- Campaign list filters beyond basic list/search
- Case library
- Version comparison
- Team permission management
- Real production database
- Advanced NLP semantic matching
- Brand policy import/export
- Real AI vision provider
- Real LLM replacement-copy generator
- Advertising platform publishing integration
- Billing/subscription
- Storybook

---

## Primary Demo Routes

Prioritize these routes:

```txt
/reviews/new
/reviews/[id]
/dictionaries
/settings/ai
/history
```

Optional routes:

```txt
/dashboard
/reports
/settings/team
/settings/profile
/cases
```

---

## Primary User Flow

### 1. Dictionary Setup

Route:

```txt
/dictionaries
```

The brand manager or marketer defines the brand policy dictionary.

Required fields for a policy term:

- term
- type: forbidden or caution
- category
- severity
- match type
- reason
- replacement suggestion
- enabled status

Example categories:

```txt
확정/보장 표현
과장 광고 표현
비교/순위 표현
민감 업종 표현
브랜드 톤 불일치
법적 검토 필요 표현
이벤트 조건 누락 가능성
커뮤니티/은어 표현
직접 등록 금지어
```

Recommended match types:

```txt
exact
contains
regex
normalized
```

---

### 2. Content Review Creation

Route:

```txt
/reviews/new
```

The user creates a new review.

Required fields:

- review title
- brand name
- content type
- channel
- pasted script or copy
- image files optional, but at least text or image must exist
- applied dictionary

Content types:

```txt
video_script
ad_copy
sns_caption
web_banner
image_only
mixed
```

When the user clicks `콘텐츠 검수 시작`, the review status changes to `ANALYZING`.

The app shows staged review progress:

```txt
콘텐츠 접수
→ 대본/문구 문장 분리
→ 브랜드 금지어 사전 매칭
→ 이미지 OCR 문구 추출
→ OCR 문구 정책 검사
→ 검토 리포트 생성
```

If AI image analysis is connected, append:

```txt
→ AI 이미지 분석 실행
```

After analysis, status becomes `COMPLETED` and the user moves to the review result page.

---

### 3. Review Result

Route:

```txt
/reviews/[id]
```

This is the most important screen.

The user must be able to:

- see the original pasted script/copy
- see matched sentences and lines
- see matched forbidden/caution terms
- see uploaded images
- see OCR extracted text
- click OCR regions on the image when available
- see image OCR policy matches
- read evidence, severity, reason, and replacement suggestions
- filter findings by source, severity, and category
- write a review memo
- save or export a review report
- see whether AI image analysis is connected or disabled

The key action is:

```txt
검수 리포트 저장
```

---

### 4. AI Image Analysis Settings

Route:

```txt
/settings/ai
```

AI image analysis is not required for the base MVP. It must be designed as an extension.

Required states:

```txt
not_configured
configured
connection_failed
mock_mode
```

When no API key exists, show:

```txt
AI 이미지 분석이 아직 연결되지 않았습니다.
현재는 대본/문구 검사와 Tesseract.js OCR 기반 이미지 문구 검사가 가능합니다.
API Key를 연결하면 이미지의 시각 요소와 장면 구성까지 추가로 검토할 수 있습니다.
```

AI provider calls must be server-side only. Do not expose model API keys in client components, browser bundles, public env vars, or mock fixtures.

---

## Suggested Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  reviews/
    new/
      page.tsx
    [id]/
      page.tsx
  dictionaries/
    page.tsx
  settings/
    ai/
      page.tsx
  history/
    page.tsx

components/
  ui/
  layout/
    AppShell.tsx
    Sidebar.tsx
  review/
    ReviewCreateForm.tsx
    ScriptInput.tsx
    ContentTypeSelect.tsx
    ImageUploader.tsx
    ReviewProgress.tsx
    ReviewSummaryCards.tsx
    ReviewSourceTabs.tsx
    FindingList.tsx
    FindingDetailPanel.tsx
    ReviewMemoForm.tsx
    ReviewReportActions.tsx
  dictionary/
    PolicyTermTable.tsx
    PolicyTermForm.tsx
    PolicyCategoryBadge.tsx
    SeverityBadge.tsx
    MatchTypeBadge.tsx
  ocr/
    OcrImagePreview.tsx
    OcrOverlay.tsx
    OcrProgress.tsx
    OcrTextPanel.tsx
    OcrRegionTooltip.tsx
  ai/
    AiConnectionStatus.tsx
    AiKeyForm.tsx
    VisionAiEmptyState.tsx
    VisionFindingList.tsx

features/
  review/
    types.ts
    schema.ts
    api.ts
    hooks.ts
    mock-data.ts
    state-machine.ts
  policy/
    types.ts
    schema.ts
    filter-engine.ts
    normalize-text.ts
    split-text.ts
    matchers.ts
    mock-terms.ts
  ocr/
    types.ts
    tesseract-client.ts
    ocr-service.ts
    ocr-mapper.ts
  vision-ai/
    types.ts
    provider.ts
    disabled-provider.ts
    mock-provider.ts
    server-provider.ts
  report/
    types.ts
    build-report.ts

lib/
  utils.ts
  format.ts
  constants.ts

mocks/
  handlers.ts
  data/
    review-jobs.ts
    policy-terms.ts
    ocr-results.ts
    findings.ts
    reports.ts

tests/
  e2e/
```

---

## TypeScript Domain Types

Implement or adapt these types.

```ts
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type ReviewStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEWED'

export type ContentType =
  | 'video_script'
  | 'ad_copy'
  | 'sns_caption'
  | 'web_banner'
  | 'image_only'
  | 'mixed'

export type Channel =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'web_banner'
  | 'push'
  | 'offline'
  | 'homepage'
  | 'newsletter'

export type PolicyTermType = 'forbidden' | 'caution'

export type MatchType = 'exact' | 'contains' | 'regex' | 'normalized'

export type FindingSource = 'pasted_text' | 'image_ocr' | 'vision_ai'

export type PolicyCategory =
  | 'guarantee_claim'
  | 'exaggerated_claim'
  | 'comparative_rank'
  | 'sensitive_industry'
  | 'brand_tone_mismatch'
  | 'legal_review_required'
  | 'event_condition_missing'
  | 'community_slang'
  | 'custom_forbidden_term'

export type PolicyTerm = {
  id: string
  brandId: string
  term: string
  type: PolicyTermType
  category: PolicyCategory
  severity: Severity
  matchType: MatchType
  reason: string
  replacementSuggestion?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type ReviewJob = {
  id: string
  title: string
  brandName: string
  contentType: ContentType
  channel: Channel
  status: ReviewStatus
  originalText?: string
  imageUrls: string[]
  dictionaryId: string
  reviewerName: string
  createdAt: string
  updatedAt: string
}

export type TextSegment = {
  id: string
  reviewJobId: string
  source: 'pasted_text' | 'image_ocr'
  text: string
  normalizedText: string
  lineNumber?: number
  sentenceIndex?: number
  imageId?: string
  regionId?: string
}

export type OcrTextRegion = {
  id: string
  imageId: string
  text: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
  lineNumber?: number
}

export type OcrResult = {
  id: string
  reviewJobId: string
  imageId: string
  imageUrl: string
  fullText: string
  language: string
  confidence: number
  regions: OcrTextRegion[]
  createdAt: string
}

export type PolicyFinding = {
  id: string
  reviewJobId: string
  source: FindingSource
  severity: Severity
  category: PolicyCategory
  policyTermId?: string
  matchedTerm: string
  originalText: string
  highlightedText: string
  reason: string
  replacementSuggestion?: string
  confidence?: number
  lineNumber?: number
  sentenceIndex?: number
  imageId?: string
  regionId?: string
  createdAt: string
}

export type VisionAiFinding = {
  id: string
  reviewJobId: string
  title: string
  description: string
  severity: Severity
  confidence: number
  evidence: string[]
  falsePositiveNote: string
  regions?: ImageRegion[]
}

export type ImageRegion = {
  id: string
  x: number
  y: number
  width: number
  height: number
  confidence: number
  label: string
}

export type ReviewReport = {
  id: string
  reviewJobId: string
  summary: string
  totalFindingCount: number
  pastedTextFindingCount: number
  ocrFindingCount: number
  visionFindingCount: number
  reviewerMemo?: string
  createdAt: string
}
```

---

## Review State Machine

Primary state transitions:

```txt
DRAFT
→ ANALYZING
→ COMPLETED
→ REVIEWED
```

Failure path:

```txt
ANALYZING
→ FAILED
→ ANALYZING
→ COMPLETED
```

Rules:

- `DRAFT → ANALYZING`: user starts content review.
- `ANALYZING → COMPLETED`: text filtering and OCR review are completed.
- `ANALYZING → FAILED`: OCR or review processing fails.
- `FAILED → ANALYZING`: user retries review.
- `COMPLETED → REVIEWED`: user saves a review memo or report.

Every state change should create a lightweight event record if history is implemented.

---

## Policy Filter Engine Requirements

The policy filter engine is the core of the MVP.

Input:

```ts
export type PolicyFilterInput = {
  reviewJobId: string
  source: 'pasted_text' | 'image_ocr'
  textSegments: TextSegment[]
  policyTerms: PolicyTerm[]
}
```

Output:

```ts
export type PolicyFilterResult = {
  findings: PolicyFinding[]
}
```

Required matching behavior:

1. Ignore disabled terms.
2. Normalize text before matching.
3. Support case-insensitive matching for English.
4. Support spacing normalization for Korean and English.
5. Support `exact`, `contains`, `regex`, and `normalized` match types.
6. Return the original sentence or line where the match occurred.
7. Return the matched term and highlighted text.
8. Attach severity, category, reason, and replacement suggestion from the policy term.

Start simple. Do not build complex NLP before the base rule engine is stable.

Recommended implementation order:

```txt
contains matching
→ exact matching
→ normalized matching
→ regex matching
→ highlighting
→ replacement suggestions
```

---

## Tesseract.js OCR Requirements

The image OCR flow is a required MVP feature.

Implement:

- image upload
- image preview
- OCR progress indicator
- extracted full text display
- OCR confidence display
- OCR text regions when available
- OCR region overlay on image
- click-to-select OCR region
- selected region sync with the right-side OCR text panel
- OCR text policy filtering
- empty state when no text is detected
- failure state when OCR fails

Coordinates should be normalized from 0 to 1 for UI overlay.

```ts
export type NormalizedRegion = {
  x: number
  y: number
  width: number
  height: number
}
```

OCR output should be mapped into `OcrResult` and `OcrTextRegion` before the policy filter engine runs.

---

## AI Image Analysis Integration Rules

AI image analysis is an extension, not the base MVP dependency.

The app must work fully with:

```txt
pasted text filtering
+ Tesseract.js OCR
+ OCR text filtering
+ review report
```

without a real AI API key.

Use a provider interface:

```ts
export type VisionAnalysisInput = {
  reviewJobId: string
  imageUrls: string[]
  brandName: string
  policySummary: string
  ocrText: string
}

export type VisionAnalysisResult = {
  summary: string
  findings: VisionAiFinding[]
}

export type VisionAnalysisProvider = {
  analyzeImages(input: VisionAnalysisInput): Promise<VisionAnalysisResult>
}
```

Start with:

- `disabledVisionProvider`
- `mockVisionProvider`
- `serverVisionProvider` placeholder

The disabled provider should return:

```ts
export const disabledVisionProvider: VisionAnalysisProvider = {
  async analyzeImages() {
    return {
      summary: 'AI 이미지 분석이 연결되지 않았습니다.',
      findings: [],
    }
  },
}
```

Keep all real AI provider calls server-side. Do not expose API keys to client components, browser bundles, public environment variables, or fixtures.

---

## Image Overlay Requirements

The OCR image review UI is the strongest frontend showcase.

Implement:

- image preview
- OCR bounding boxes using SVG or absolutely positioned divs
- hover tooltip
- click-to-select OCR region
- selected overlay sync with OCR text panel and finding panel
- zoom controls
- responsive layout
- empty state when no image is uploaded
- loading state while OCR is running

Coordinates should be normalized from 0 to 1.

---

## Review Result Wording Rules

For policy findings, use this pattern:

```txt
Title:
금지어 후보 검토 필요

Description:
브랜드 정책 사전에 등록된 표현이 대본 또는 이미지 OCR 문구에서 확인되었습니다.

Evidence:
- 검출 표현: "무료 보장"
- 위치: 영상 대본 12번째 문장
- 적용 정책: 확정/보장 표현 제한

Replacement suggestion:
"조건 충족 시 제공"처럼 조건을 명확히 하는 표현으로 변경을 검토하세요.

False-positive note:
이 결과는 자동 확정 판정이 아니며, 실제 캠페인 맥락에 따라 담당자 검토가 필요합니다.
```

Do not use labels like:

- confirmed risk
- AI approved
- ideology detected
- legal violation confirmed
- controversy confirmed

Use labels like:

- policy match
- review candidate
- human review required
- replacement suggestion
- false positive possible

---

## UI Tone

Use a professional Korean B2B SaaS tone.

Recommended Korean labels:

- 콘텐츠 검수
- 브랜드 정책 사전
- 금지어
- 주의어
- 검토 후보
- 정책 매칭
- 검토 필요
- OCR 문구 추출
- 이미지 문구 검사
- 신뢰도
- 검출 위치
- 수정 제안
- 검수 메모
- 검수 리포트
- AI 이미지 분석 미연결
- API Key 연결

Avoid sensational wording:

- 위험 확정
- 논란 확정
- 사상 탐지
- 정치 성향 탐지
- 페미 감지
- 일베 감지
- AI 승인 완료
- 100% 안전
- 자동 논란 방지

---

## Forms and Validation

Use React Hook Form and Zod.

Review creation required fields:

- review title
- brand name
- content type
- channel
- dictionary
- pasted text or at least one image

Policy term required fields:

- term
- type
- category
- severity
- match type
- reason

Review memo optional for MVP, but useful for portfolio polish.

Validation requirements:

- Do not allow empty review title.
- Do not allow empty brand name.
- Do not allow review creation without text or image.
- Do not allow unsupported image file type.
- Allow jpg, png, and webp.
- Show field-level error messages.
- Submit buttons should show loading states.

---

## E2E Testing Requirements

Use Playwright for the main review flow.

Minimum test scenario:

1. User opens `/dictionaries`.
2. User creates a forbidden term with a replacement suggestion.
3. User opens `/reviews/new`.
4. User pastes a sample video script containing the forbidden term.
5. User uploads an image.
6. User starts content review.
7. User sees review loading/progress states.
8. User lands on `/reviews/[id]`.
9. User sees the pasted-text finding.
10. User sees OCR result or OCR empty state.
11. User filters findings by source or severity.
12. User saves a review memo/report.
13. History contains the saved review.

Optional tests:

- dictionary validation errors
- review creation validation errors
- OCR failure state
- AI image analysis disabled state
- AI settings page rendering

---

## Performance Requirements

- Lazy-load Tesseract.js worker or OCR-heavy code when possible.
- Use optimized image preview.
- Avoid unnecessary rerenders when selecting overlays.
- Memoize coordinate calculations.
- Keep mock data small but realistic.
- Use skeletons for async-like interactions.
- Show OCR progress so the app does not feel frozen.

---

## Privacy and Safety Notes

Treat uploaded marketing assets as sensitive internal company data.

Even in mock mode:

- Do not expose uploaded asset data in public URLs.
- Do not frame review results as final truth.
- Include false-positive or human-review notes.
- Do not encourage harassment, labeling, or targeting of individuals or groups.
- Do not expose AI provider API keys in frontend code.
- Do not store API keys in localStorage for production-like examples.

---

## README Requirements

The README should clearly explain:

- BrandGuard is a portfolio project.
- The core workflow is brand policy dictionary + text filtering + Tesseract.js OCR.
- It helps brand marketers review scripts, ad copy, and image text before publication.
- It is not an ideology detector or automatic approval system.
- AI image analysis is an optional extension enabled by API key.
- The base MVP works without a real AI key.
- Tech stack.
- Main features.
- How to run.
- How to test.
- Known limitations.
- Future improvements.

Suggested README headline:

```md
# BrandGuard

영상 대본, 광고 문구, 이미지 속 텍스트를 공개 전 검수하는
브랜드 마케팅 콘텐츠 사전 검수 SaaS 포트폴리오입니다.

BrandGuard는 브랜드가 등록한 금지어와 표현 정책을 기준으로
대본과 OCR 문구의 검토 후보를 찾아줍니다.
AI 이미지 분석은 API Key 연결 후 확장할 수 있으며,
최종 판단은 항상 마케팅 담당자가 수행합니다.
```

---

## Implementation Priority

### Phase 1

- Project setup
- Layout
- Types and mock data
- Policy dictionary model
- Policy term table and form

### Phase 2

- Review creation form
- Script/copy paste area
- Text normalization
- Sentence/line splitting
- Policy filter engine
- Pasted text findings UI

### Phase 3

- Image uploader
- Tesseract.js OCR integration
- OCR progress UI
- OCR text panel
- OCR region overlay
- OCR policy findings

### Phase 4

- Review summary cards
- Finding filters
- Finding detail panel
- Review memo
- Review report save action
- History page

### Phase 5

- AI settings page
- Disabled vision provider
- Mock vision provider
- Server-side provider placeholder
- Main E2E test
- README polish

### Phase 6 Optional

- Dashboard
- Team settings
- Approval workflow
- Version comparison
- Case library
- Supabase persistence
- Real AI vision provider

---

## Definition of Done

A feature is done when:

- The core review flow is clear.
- UI is responsive.
- Loading, error, and empty states exist.
- TypeScript types are explicit.
- Policy findings use safe, non-deterministic language.
- Pasted text filtering works.
- Tesseract.js OCR flow works or has a clear failure state.
- OCR text is checked by the same policy filter engine.
- AI image analysis can be disabled without breaking the product.
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
git checkout -b feature/policy-ocr-review
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

- `review`
- `policy`
- `dictionary`
- `ocr`
- `vision-ai`
- `report`
- `history`
- `ui`
- `mock`
- `docs`
- `config`
- `test`

Examples:

```txt
feat(policy): add forbidden term dictionary
feat(review): add script paste review flow
feat(ocr): add tesseract image text extraction
feat(review): show OCR policy findings with image overlay
feat(vision-ai): add disabled provider and AI connection status
fix(policy): normalize whitespace before matching terms
docs(prd): focus scope on policy OCR review flow
```

Before final response:

- Summarize changed files.
- Explain implementation decisions.
- Mention commands run.
- Mention anything not completed.
- Mention any placeholders requiring user input.
- Do not claim a check passed unless it was actually run.
