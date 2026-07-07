# BrandGuard PRD

## 1. 제품 개요

### 제품명

**BrandGuard**

### 한 줄 설명

마케팅 소재 공개 전, AI 1차 검토와 사람 중심 결재 라인을 통해 이미지와 문구의 브랜드 리스크 후보를 검토하는 B2B SaaS.

### 핵심 포지션

BrandGuard는 특정 사상, 성향, 의도, 정치적 입장, 커뮤니티 소속을 판정하는 도구가 아니다.

광고 이미지와 문구에서 논란으로 해석될 가능성이 있는 **검토 후보**를 AI가 1차로 정리하고, 작성자와 결재자가 의견을 남겨 최종 승인 여부를 결정하는 **마케팅 소재 결재 보조 도구**다.

### 가장 중요한 제품 흐름

```txt
디자인/마케팅 담당자가 소재 업로드
→ AI가 이미지와 문구를 1차 검토
→ 작성자가 AI 결과를 확인하고 본인 검토 의견 작성
→ 작성자가 결재 상신
→ 다음 결재자가 AI 결과 + 작성자 의견 확인
→ 결재자 의견 작성 후 승인/수정요청/반려
→ 최종 결재자 승인
→ 소재 게시 가능 상태 전환
```

이 프로젝트의 핵심은 여러 부가 기능이 아니라 **AI 1차 검토 결과를 사람이 확인하고, 작성자 의견을 붙여 결재 라인을 타는 과정**이다.

---

## 2. 제품 원칙

- AI는 최종 판정자가 아니라 1차 검토 보조자다.
- AI 결과만으로 캠페인을 자동 승인, 자동 반려, 자동 게시하지 않는다.
- 리스크는 "확정"이 아니라 "검토 필요 후보"로 표현한다.
- 작성자는 AI 결과를 그대로 넘기는 것이 아니라, 본인의 검토 의견을 반드시 남긴다.
- 결재자는 AI 결과와 작성자 의견을 함께 보고 승인, 수정 요청, 반려를 결정한다.
- 최종 승인된 소재만 게시 가능 상태가 된다.
- 모든 주요 행동은 감사 로그로 남긴다.

---

## 3. 문제 정의

마케팅팀에서는 광고 이미지나 문구를 제작한 뒤 게시 전에 내부 검토와 결재를 거친다. 하지만 실제 현업에서는 다음 문제가 자주 발생한다.

- 디자인/문구 작성자가 논란 가능성을 혼자 판단하기 어렵다.
- 이미지 속 손동작, 문구, 날짜, 숫자, 표현 등이 의도와 다르게 해석될 수 있다.
- AI나 자동 도구의 결과가 있더라도, 누가 그 결과를 확인했고 어떤 의견을 냈는지 남지 않는다.
- 결재자는 원본 소재, AI 검토 결과, 작성자 의견을 한 번에 보기 어렵다.
- 승인, 수정 요청, 반려 이력이 흩어져 있어 나중에 추적하기 어렵다.

BrandGuard는 이 문제를 **소재 업로드 → AI 1차 검토 → 작성자 의견 → 결재 라인 → 최종 승인**이라는 단순하고 명확한 워크플로우로 해결한다.

---

## 4. 타깃 사용자

### 4.1 작성자 / 결재 상신자

예: 디자이너, 마케팅 사원, 콘텐츠 담당자

- 캠페인 이미지와 문구를 업로드한다.
- AI 1차 검토 결과를 확인한다.
- AI 결과가 실제 맥락과 맞는지 본인 의견을 작성한다.
- 결재 라인을 선택하고 결재를 상신한다.
- 수정 요청을 받으면 소재를 수정해 다시 검토를 시작한다.

### 4.2 중간 결재자

예: 마케팅 리더, 브랜드 매니저, PR 담당자

- AI 결과와 작성자 의견을 함께 확인한다.
- 본인 검토 의견을 남긴다.
- 승인, 수정 요청, 반려 중 하나를 선택한다.
- 승인 시 다음 결재 단계로 넘긴다.

### 4.3 최종 결재자

예: 팀장, 브랜드 책임자, 법무/컴플라이언스 담당자

- 최종 게시 가능 여부를 결정한다.
- 모든 의견과 검토 이력을 확인한다.
- 최종 승인, 수정 요청, 반려를 선택한다.
- 최종 승인 시 소재는 게시 가능 상태가 된다.

---

## 5. 제품 목표

### 5.1 사용자 목표

1. 마케팅 소재를 쉽게 업로드한다.
2. AI 1차 검토로 놓칠 수 있는 리스크 후보를 빠르게 확인한다.
3. 작성자가 AI 결과에 대한 본인 판단과 맥락 의견을 남긴다.
4. 결재자가 원본, AI 결과, 작성자 의견, 이전 결재 의견을 한 화면에서 확인한다.
5. 최종 승인된 소재만 게시 가능하도록 한다.
6. 누가 언제 어떤 판단을 했는지 감사 로그로 남긴다.

### 5.2 포트폴리오 목표

이 프로젝트는 프론트엔드 포트폴리오에서 다음 역량을 보여주는 것을 목표로 한다.

- 파일 업로드와 미리보기 UX
- AI 분석 진행 상태 UI
- 이미지 위 리스크 후보 오버레이 시각화
- 오른쪽 패널과 이미지 오버레이 동기화
- 작성자 의견 작성 플로우
- 결재 라인 타임라인
- 승인/수정요청/반려 상태 전이
- 감사 로그 UI
- TypeScript 기반 도메인 모델링
- mock API 기반 실제 SaaS 같은 흐름 구현
- E2E 테스트 가능한 핵심 사용자 플로우

---

## 6. MVP 범위

### 6.1 반드시 포함

- 캠페인 생성
- 이미지/문구 업로드
- 업로드 소재 미리보기
- AI 1차 검토 시작 버튼
- AI 1차 검토 진행 단계 표시
- mock 분석 결과 생성
- 리뷰 화면에서 AI 결과 확인
- 이미지 위 리스크 후보 영역 표시
- OCR 텍스트 후보 영역 표시
- 리스크 점수, 근거, 오탐 가능성, 수정 제안 표시
- 작성자 검토 의견 작성
- 결재 라인 선택 또는 mock 결재 라인 표시
- 결재 상신
- 결재자 검토 화면
- 결재자 의견 작성
- 승인/수정요청/반려
- 최종 승인 후 게시 가능 상태 표시
- 감사 로그

### 6.2 MVP에서 제외 또는 후순위

아래 기능은 있으면 좋지만, 핵심 플로우보다 우선하지 않는다.

- 복잡한 대시보드
- 고급 캠페인 필터/정렬
- 버전 비교
- 리스크 사전 관리
- 케이스 라이브러리
- 팀/권한 설정 화면
- 실제 AI 모델 학습
- 실제 OCR/Vision/LLM 연동
- 실제 광고 플랫폼 게시 연동
- 실제 결제/구독
- 실제 기업 데이터 연동

---

## 7. 핵심 사용자 플로우

## Flow 1. 소재 업로드와 AI 1차 검토

1. 작성자가 `/campaigns/new`로 이동한다.
2. 캠페인명, 브랜드명, 채널, 게시 예정일, 타깃, 업종을 입력한다.
3. 광고 이미지와 문구를 업로드한다.
4. 업로드한 이미지와 문구를 미리보기로 확인한다.
5. 결재 라인을 선택하거나 기본 결재 라인을 확인한다.
6. `AI 1차 검토 시작` 버튼을 클릭한다.
7. 시스템은 캠페인 상태를 `ANALYZING`으로 변경한다.
8. 분석 진행 단계가 순차적으로 표시된다.
9. mock 분석 결과가 생성된다.
10. 캠페인 상태가 `AI_REVIEWED`로 변경된다.
11. 작성자는 리뷰 화면으로 이동한다.

분석 단계 예시:

```txt
소재 접수
→ 이미지 후보 영역 확인
→ OCR 문구 후보 확인
→ 리스크 후보 정리
→ 담당자 검토용 요약 생성
```

---

## Flow 2. 작성자 검토 의견 작성 및 결재 상신

1. 작성자는 `/campaigns/[id]/review`에서 AI 1차 검토 결과를 확인한다.
2. 왼쪽 이미지 영역에서 bounding box overlay를 확인한다.
3. 오른쪽 패널에서 리스크 후보, 감지 근거, 신뢰도, 오탐 가능성, 수정 제안을 확인한다.
4. AI 결과가 실제 소재 맥락과 맞는지 작성자가 직접 판단한다.
5. 작성자는 검토 의견을 작성한다.
6. 작성자는 다음 중 하나의 결론을 선택한다.
   - 결재 상신
   - 수정 후 재검토 필요
   - 오탐 가능성이 높음
7. `검토 의견 작성 후 결재 상신` 버튼을 클릭한다.
8. 캠페인 상태가 `IN_APPROVAL`로 변경된다.
9. 감사 로그에 작성자 의견과 결재 상신 이벤트가 기록된다.

작성자 의견 예시:

```txt
AI가 손동작 후보를 표시했지만, 실제로는 제품을 집는 장면입니다.
다만 SNS 게시 이미지로 오해 가능성이 있을 수 있어 PR 검토가 필요하다고 판단했습니다.
```

---

## Flow 3. 중간 결재자 검토

1. 중간 결재자는 `/campaigns/[id]/approval`에서 결재 대상을 확인한다.
2. 결재자는 다음 정보를 한 화면에서 본다.
   - 원본 이미지와 문구
   - AI 1차 검토 요약
   - 리스크 후보와 근거
   - 작성자 검토 의견
   - 이전 결재자 의견
   - 감사 로그
3. 결재자는 본인 의견을 작성한다.
4. 결재자는 다음 중 하나를 선택한다.
   - 승인
   - 수정 요청
   - 반려
5. 승인 시 다음 결재 단계로 넘어간다.
6. 수정 요청 시 작성자에게 돌아간다.
7. 반려 시 캠페인은 종료된다.

---

## Flow 4. 최종 결재와 게시 가능 처리

1. 최종 결재자는 동일한 승인 화면에서 전체 검토 내용을 확인한다.
2. AI 결과, 작성자 의견, 중간 결재자 의견, 감사 로그를 모두 확인한다.
3. 최종 결재자는 최종 승인, 수정 요청, 반려 중 하나를 선택한다.
4. 최종 승인 시 캠페인 상태가 `APPROVED`가 된다.
5. 승인된 소재는 `READY_TO_PUBLISH` 상태로 표시할 수 있다.
6. 이 상태가 된 소재만 실제 게시 가능한 것으로 표현한다.

---

## Flow 5. 수정 요청 후 재검토

1. 결재자가 수정 요청을 남긴다.
2. 캠페인 상태가 `NEEDS_REVISION`이 된다.
3. 작성자는 이미지나 문구를 수정한다.
4. 작성자는 다시 AI 1차 검토를 시작한다.
5. 상태는 `ANALYZING → AI_REVIEWED`로 이동한다.
6. 작성자는 새 검토 의견을 작성하고 다시 결재 상신한다.

MVP에서는 버전 비교 화면까지 깊게 만들지 않아도 된다. 단, 수정 요청 후 다시 AI 검토를 시작할 수 있는 흐름은 상태 모델에 포함한다.

---

## 8. 정보 구조

### 핵심 라우트

```txt
/campaigns/new
/campaigns/[id]/review
/campaigns/[id]/approval
/approvals
```

### 선택 라우트

```txt
/campaigns
/dashboard
/campaigns/[id]/versions
/risk-dictionary
/cases
/settings/team
/settings/profile
```

MVP에서는 핵심 라우트를 우선 구현한다.

---

## 9. 페이지 요구사항

## 9.1 Campaign Create

### 목적

작성자가 마케팅 소재를 업로드하고 AI 1차 검토를 시작한다.

### 주요 요소

- 캠페인 기본 정보 입력
- 이미지 업로드
- 광고 문구 입력
- 이미지/문구 미리보기
- 기본 결재 라인 표시 또는 선택
- AI 1차 검토 시작 버튼
- 분석 진행 상태 표시
- 분석 완료 후 리뷰 화면 이동

### 필수 입력

- 캠페인명
- 브랜드명
- 채널
- 게시 예정일
- 타깃
- 업종
- 이미지 또는 문구 중 하나 이상
- 결재 라인

### 검증

- 캠페인명은 비어 있을 수 없다.
- 게시 예정일은 유효한 날짜여야 한다.
- 이미지는 jpg, png, webp만 허용한다.
- 이미지 또는 문구 중 하나 이상이 있어야 한다.
- 결재자가 최소 1명 이상 있어야 한다.

---

## 9.2 Review Page

### 목적

작성자가 AI 1차 검토 결과를 확인하고, 본인 의견을 작성한 뒤 결재 상신한다.

### 레이아웃

왼쪽에는 원본 이미지와 오버레이를 보여준다. 오른쪽에는 AI 결과와 작성자 의견 입력 영역을 보여준다.

### 왼쪽 영역

- 이미지 미리보기
- bounding box overlay
- hand landmark mock overlay
- OCR 영역 overlay
- zoom in/out
- 영역 클릭 시 오른쪽 패널 해당 항목 강조

### 오른쪽 영역

- 종합 리스크 점수
- 리스크 레벨
- AI 검토 요약
- 카테고리별 검토 후보
- 감지 근거
- 오탐 가능성 안내
- 수정 제안
- 작성자 검토 의견 입력
- 결재 상신 버튼
- 감사 로그

### 핵심 액션

```txt
검토 의견 작성 후 결재 상신
```

작성자 의견이 없으면 결재 상신할 수 없다.

---

## 9.3 Approval Page

### 목적

결재자가 AI 결과와 작성자 의견을 보고 승인, 수정 요청, 반려를 결정한다.

### 주요 요소

- 결재 단계 타임라인
- 현재 결재자 표시
- 원본 이미지/문구 확인
- AI 1차 검토 요약
- 리스크 후보와 수정 제안
- 작성자 검토 의견
- 이전 결재자 의견
- 결재 의견 입력
- 승인 버튼
- 수정 요청 버튼
- 반려 버튼
- 감사 로그

### 결재 원칙

- AI 의견은 결재 참고 자료다.
- 작성자 의견은 결재자가 반드시 볼 수 있어야 한다.
- 수정 요청이나 반려 시 코멘트를 필수로 입력한다.
- 최종 승인 전까지 게시 가능 상태가 될 수 없다.

---

## 9.4 Approvals List

### 목적

사용자가 자신에게 도착한 결재 요청을 확인한다.

### 주요 요소

- 결재 대기 목록
- 캠페인명
- 브랜드명
- 요청자
- 현재 상태
- 리스크 점수
- 상신일
- 승인 화면으로 이동하는 CTA

MVP에서는 복잡한 필터보다 `내 결재 대기`, `전체 결재 대기` 정도만 있어도 충분하다.

---

## 10. 상태 모델

```ts
type CampaignStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'AI_REVIEWED'
  | 'IN_APPROVAL'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'READY_TO_PUBLISH'
  | 'REJECTED'
```

### 기본 흐름

```txt
DRAFT
→ ANALYZING
→ AI_REVIEWED
→ IN_APPROVAL
→ APPROVED
→ READY_TO_PUBLISH
```

### 수정 흐름

```txt
IN_APPROVAL
→ NEEDS_REVISION
→ ANALYZING
→ AI_REVIEWED
→ IN_APPROVAL
```

### 반려 흐름

```txt
IN_APPROVAL
→ REJECTED
```

### 상태 전이 규칙

- `DRAFT → ANALYZING`: 작성자가 AI 1차 검토를 시작한다.
- `ANALYZING → AI_REVIEWED`: mock 분석 결과가 생성된다.
- `AI_REVIEWED → IN_APPROVAL`: 작성자가 의견을 작성하고 결재 상신한다.
- `IN_APPROVAL → IN_APPROVAL`: 중간 결재자가 승인하고 다음 단계로 넘긴다.
- `IN_APPROVAL → APPROVED`: 최종 결재자가 승인한다.
- `APPROVED → READY_TO_PUBLISH`: 게시 가능한 소재로 표시한다.
- `IN_APPROVAL → NEEDS_REVISION`: 결재자가 수정 요청한다.
- `IN_APPROVAL → REJECTED`: 결재자가 반려한다.

모든 상태 전이는 감사 로그에 기록한다.

---

## 11. 데이터 모델

```ts
type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

type RiskCategory =
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

type UserRole =
  | 'REQUESTER'
  | 'MARKETING_REVIEWER'
  | 'BRAND_MANAGER'
  | 'PR_REVIEWER'
  | 'LEGAL_REVIEWER'
  | 'FINAL_APPROVER'
  | 'ADMIN'

type Campaign = {
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

type MarketingAsset = {
  id: string
  campaignId: string
  imageUrl?: string
  copy?: string
  fileName?: string
  createdAt: string
}

type AnalysisResult = {
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

type RiskFinding = {
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

type ImageRegion = {
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

type Landmark = {
  x: number
  y: number
  label?: string
}

type RevisionSuggestion = {
  id: string
  target: 'copy' | 'image' | 'schedule' | 'review_process'
  title: string
  description: string
  before?: string
  after?: string
}

type RequesterOpinion = {
  id: string
  campaignId: string
  authorName: string
  body: string
  conclusion: 'submit_for_approval' | 'needs_edit_before_submit' | 'false_positive_likely'
  createdAt: string
}

type ApprovalDecision = 'approve' | 'request_revision' | 'reject'

type ApprovalStepStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'revision_requested'
  | 'rejected'
  | 'skipped'

type ApprovalStep = {
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

type AuditLogEntry = {
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

## 12. Mock 분석 결과 예시

```json
{
  "source": "mock",
  "overallRiskScore": 74,
  "overallRiskLevel": "medium",
  "summary": "이미지와 문구에서 담당자 검토가 필요한 리스크 후보가 확인되었습니다. 최종 판단은 캠페인 맥락을 아는 작성자와 결재자가 검토해야 합니다.",
  "reviewRequired": true,
  "categories": [
    {
      "id": "risk-001",
      "category": "visual_gesture",
      "title": "손동작 후보 검토 필요",
      "level": "medium",
      "confidence": 0.74,
      "description": "이미지 내 손동작이 일부 민감한 시각 패턴과 유사하게 해석될 가능성이 있습니다.",
      "evidence": [
        "엄지와 검지 사이 거리가 가까운 형태가 확인되었습니다.",
        "일부 손가락이 가려져 있어 맥락 확인이 필요합니다.",
        "제품을 집는 동작일 가능성도 있습니다."
      ],
      "falsePositiveNote": "이 결과는 의도나 성향을 판정하지 않으며, 시각적 유사성에 기반한 검토 후보입니다.",
      "regions": [
        {
          "id": "region-001",
          "type": "hand",
          "x": 0.52,
          "y": 0.24,
          "width": 0.2,
          "height": 0.28,
          "confidence": 0.91,
          "label": "visual gesture candidate",
          "landmarks": [
            { "x": 0.55, "y": 0.31, "label": "wrist" },
            { "x": 0.62, "y": 0.27, "label": "thumb_tip" },
            { "x": 0.64, "y": 0.28, "label": "index_tip" }
          ]
        }
      ]
    }
  ],
  "suggestions": [
    {
      "id": "sug-001",
      "target": "image",
      "title": "제품 단독 컷 사용 검토",
      "description": "손동작 해석 가능성을 줄이기 위해 손이 보이지 않는 제품 단독 이미지를 사용하는 방안을 검토하세요."
    },
    {
      "id": "sug-002",
      "target": "review_process",
      "title": "PR 담당자 추가 검토 권장",
      "description": "SNS 채널 게시 전 PR 담당자의 추가 검토를 권장합니다."
    }
  ]
}
```

---

## 13. AI 1차 검토 원칙

AI는 작성자와 결재자의 검토를 돕는 1차 리뷰 어시스턴트다.

AI 결과에는 항상 다음 정보가 있어야 한다.

- 검토 후보 제목
- 설명
- 근거
- 신뢰도
- 오탐 가능성
- 사람 검토 권장 문구
- 수정 제안

AI는 다음을 하면 안 된다.

- 특정 사상 판정
- 정치 성향 판정
- 의도 판정
- 성별 관점 판정
- 커뮤니티 소속 판정
- 법적 문제 자동 판정
- 자동 승인/반려/게시 결정

좋은 표현:

```txt
논란으로 해석될 가능성이 있는 손동작 후보가 확인되었습니다.
제품을 집는 동작일 가능성도 있으므로 작성자와 결재자의 검토가 필요합니다.
```

나쁜 표현:

```txt
이 이미지는 특정 사상을 담고 있습니다.
이 손동작은 특정 집단 표현입니다.
AI가 위험하다고 확정했습니다.
```

---

## 14. 작성자 의견 요구사항

작성자 의견은 이 프로젝트에서 매우 중요하다.

AI 결과가 나온 뒤 바로 결재로 넘기는 것이 아니라, 작성자가 다음을 확인하고 의견을 남겨야 한다.

- AI가 표시한 후보가 실제 소재 맥락과 맞는지
- 오탐 가능성이 있는지
- 그래도 결재자 검토가 필요한지
- 수정 없이 상신할지
- 수정 후 재검토할지

작성자 의견 필드는 필수다.

작성자 의견 없이 `결재 상신` 버튼은 비활성화한다.

---

## 15. 결재 라인 요구사항

MVP에서는 복잡한 권한 관리보다 단순한 결재 라인을 우선한다.

예시 결재 라인:

```txt
작성자
→ 마케팅 리더
→ PR 담당자
→ 최종 결재자
```

각 결재 단계는 다음 정보를 가진다.

- 단계명
- 담당자 이름
- 역할
- 상태
- 결정
- 의견
- 결정 시각

결재자는 다음 중 하나를 선택할 수 있다.

- 승인
- 수정 요청
- 반려

수정 요청 또는 반려 시 의견 입력은 필수다.

---

## 16. 감사 로그 요구사항

다음 이벤트는 반드시 로그로 남긴다.

- 캠페인 생성
- AI 1차 검토 시작
- AI 1차 검토 완료
- 작성자 검토 의견 작성
- 결재 상신
- 중간 결재자 승인
- 수정 요청
- 반려
- 최종 승인
- 게시 가능 상태 전환

로그는 다음 정보를 포함한다.

- 행동자
- 행동 유형
- 설명
- 생성 시각

---

## 17. UI 문구 가이드

### 권장 문구

- AI 1차 검토
- 검토 후보
- 검토 필요
- 오탐 가능성
- 감지 근거
- 수정 제안
- 작성자 검토 의견
- 결재 상신
- 결재 라인
- 승인
- 수정 요청
- 반려
- 최종 승인
- 게시 가능

### 금지 문구

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

## 18. 접근성 요구사항

- 모든 버튼은 키보드로 접근 가능해야 한다.
- 이미지 overlay 항목은 오른쪽 리스트에서도 접근 가능해야 한다.
- 위험도는 색상만으로 전달하지 않는다.
- badge에는 텍스트 레이블을 포함한다.
- tooltip은 핵심 정보를 숨기는 용도로 사용하지 않는다.
- 입력 필드에는 label과 에러 메시지가 있어야 한다.
- 결재 버튼은 명확한 accessible name을 가져야 한다.

---

## 19. 로딩, 빈 상태, 에러 상태

다음 상태를 제공한다.

- 업로드 이미지 없음
- 광고 문구 없음
- AI 분석 중
- AI 분석 실패
- 리스크 후보 없음
- 작성자 의견 없음
- 결재 대기 항목 없음
- 결재 권한 없음
- 감사 로그 없음

---

## 20. 성공 지표

MVP 성공 기준:

- 사용자가 3분 안에 소재 업로드부터 AI 결과 확인까지 완료할 수 있다.
- 작성자가 AI 결과를 확인하고 본인 의견을 남긴 뒤 결재 상신할 수 있다.
- 결재자가 원본 소재, AI 결과, 작성자 의견을 한 화면에서 이해할 수 있다.
- 승인/수정요청/반려 상태 전이가 명확하다.
- 최종 승인된 소재만 게시 가능 상태가 된다.
- mock 데이터만으로도 실제 SaaS처럼 보인다.
- 이미지 overlay와 오른쪽 리스크 패널이 직관적으로 연결된다.
- 감사 로그로 전체 의사결정 흐름을 추적할 수 있다.

---

## 21. 추천 개발 순서

1. 프로젝트 세팅
2. 디자인 토큰/레이아웃 구축
3. 타입 정의와 mock 데이터 작성
4. 캠페인 생성 폼
5. 이미지/문구 업로드 미리보기
6. AI 1차 검토 progress UI
7. mock analysis provider
8. 리뷰 페이지 레이아웃
9. 이미지 overlay 구현
10. 리스크 결과 패널 구현
11. 작성자 의견 폼
12. 결재 상신 액션
13. 결재 화면 구현
14. 결재 라인 타임라인
15. 승인/수정요청/반려 상태 전이
16. 감사 로그
17. 핵심 E2E 테스트
18. README 정리

---

## 22. 핵심 카피

### 메인 카피

```txt
공개 전, AI 1차 검토와 결재 라인으로 브랜드 리스크를 확인하세요.
```

### 서브카피

```txt
BrandGuard는 마케팅 이미지와 문구에서 검토가 필요한 리스크 후보를 정리하고,
작성자 의견과 결재자 판단을 하나의 승인 흐름으로 연결합니다.
```

### 제품 설명

```txt
AI가 최종 판단하지 않습니다.
AI는 검토 후보와 근거를 정리하고,
작성자와 결재자가 의견을 남겨 최종 게시 여부를 결정합니다.
```

---

## 23. README 요약 문구

```md
# BrandGuard

BrandGuard는 마케팅 소재 공개 전, AI 1차 검토와 사람 중심 결재 라인을 통해
이미지와 문구의 브랜드 리스크 후보를 점검하는 B2B SaaS 포트폴리오입니다.

사용자는 이미지와 문구를 업로드하고, AI 검토 결과를 확인한 뒤,
작성자 의견을 남겨 결재를 상신할 수 있습니다.
결재자는 AI 결과와 작성자 의견을 함께 확인하고
승인, 수정 요청, 반려를 결정합니다.

BrandGuard는 특정 사상, 정치 성향, 의도, 커뮤니티 소속을 판정하지 않습니다.
AI 결과는 최종 판단이 아니라 사람 검토를 돕는 참고 자료입니다.
```
