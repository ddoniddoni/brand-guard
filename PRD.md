# BrandGuard PRD

## 1. 제품 개요

### 제품명
**BrandGuard**

### 한 줄 설명
마케팅 소재 공개 전, 사회적 논란 가능성이 있는 시각 요소와 문구를 사전에 점검하고 팀 단위로 검토할 수 있게 돕는 브랜드 리스크 리뷰 SaaS.

### 핵심 포지션
BrandGuard는 특정 사상, 성향, 의도를 판정하는 도구가 아니다.  
광고 이미지, 문구, 게시일, 채널, 타깃 맥락을 기반으로 **논란 가능성이 있는 리스크 후보**를 탐지하고, 브랜드/마케팅/PR 담당자가 검토할 수 있는 근거와 수정 제안을 제공하는 **검토 보조 도구**다.

### 제품 원칙
- 자동 판정이 아니라 검토 보조를 제공한다.
- 특정 집단, 성향, 정치적 입장을 단정하지 않는다.
- 리스크는 "확정"이 아니라 "검토 필요 신호"로 표현한다.
- 모든 분석 결과에는 근거, 신뢰도, 오탐 가능성을 함께 보여준다.
- 최종 판단은 사람이 하며, 승인/반려/수정요청 이력을 남긴다.

---

## 2. 문제 정의

기업의 마케팅 소재는 이미지, 문구, 숫자, 날짜, 손동작, 상징, 커뮤니티 은어, 역사적 맥락 등 다양한 요소로 인해 의도치 않은 논란에 휩싸일 수 있다.

현재 많은 팀은 다음과 같은 방식으로 리스크를 확인한다.

- 마케터 개인 경험에 의존
- 팀 채팅방에서 수동 검토
- 과거 논란 사례를 기억에 의존
- 업로드 직전 급하게 확인
- 문제 발생 후 소셜 모니터링으로 대응

이 방식은 다음 문제를 만든다.

- 검토 기준이 일관되지 않다.
- 민감 날짜/표현/시각 요소를 놓치기 쉽다.
- 누가 어떤 근거로 승인했는지 추적하기 어렵다.
- 수정 전후 리스크 감소를 설명하기 어렵다.
- 브랜드/PR/법무 간 협업 흐름이 정리되지 않는다.

BrandGuard는 이 과정을 하나의 리뷰 워크플로우로 정리한다.

---

## 3. 타깃 사용자

### Primary Persona: 브랜드 마케터
- 광고 소재를 업로드하고 1차 리스크 점검을 받는다.
- 수정 제안을 참고해 카피나 이미지를 변경한다.
- 승인 요청을 보낸다.

### Secondary Persona: PR/브랜드 매니저
- 고위험 소재를 검토한다.
- 분석 근거와 과거 사례를 확인한다.
- 승인, 반려, 수정요청을 남긴다.

### Tertiary Persona: 법무/컴플라이언스 담당자
- 민감도가 높은 캠페인만 최종 확인한다.
- 감사 로그와 검토 이력을 확인한다.
- 최종 승인 여부를 결정한다.

---

## 4. 목표

### 제품 목표
1. 마케팅 소재 공개 전 잠재 리스크를 빠르게 발견한다.
2. 분석 결과를 사람이 이해 가능한 형태로 시각화한다.
3. 팀 단위 승인/반려/수정요청 워크플로우를 제공한다.
4. 리스크 판단 근거와 이력을 남긴다.
5. 수정 전후 버전 비교를 통해 리스크 감소를 보여준다.

### 포트폴리오 목표
이 프로젝트는 프론트엔드 4년차 수준의 다음 역량을 보여주는 것을 목표로 한다.

- 복잡한 B2B SaaS UI 설계
- 이미지 분석 결과 시각화
- 상태 기반 워크플로우 설계
- 파일 업로드 UX
- 데이터 테이블, 필터, 검색, 상세 화면 구현
- 리스크 점수/카테고리 시각화
- 권한 기반 UI
- 버전 비교 UI
- 접근성, 로딩, 에러, 빈 상태 처리
- E2E 테스트 가능한 핵심 플로우

---

## 5. MVP 범위

### 포함
- 대시보드
- 캠페인 생성
- 이미지/문구 소재 업로드
- AI 1차 검토 플로우를 고려한 mock 분석 결과 표시
- 분석 provider 인터페이스(mock 우선, 실제 AI 교체 가능)
- 이미지 위 리스크 영역 오버레이
- 손동작 후보 영역 표시
- OCR 텍스트 영역 mock 표시
- 리스크 점수 및 카테고리별 결과
- 감지 근거와 수정 제안
- 담당자 코멘트
- 승인/수정요청/반려 워크플로우
- 버전 비교
- 리스크 사전
- 케이스 라이브러리
- 팀/권한 mock

### 제외
- 실제 AI 모델 학습
- AI 단독 최종 승인/반려 결정
- 실제 정치 성향/사상 판정
- 실제 법무 판단 자동화
- 실제 광고 플랫폼 배포 연동
- 실제 결제/구독
- 실제 기업 데이터 연동
- 실제 민감 단어 대규모 크롤링

---

## 6. 핵심 사용자 플로우

### Flow 1. 캠페인 생성 및 분석
1. 사용자가 `/campaigns/new`로 이동한다.
2. 캠페인명, 브랜드, 채널, 게시 예정일, 타깃, 업종을 입력한다.
3. 광고 이미지와 카피를 업로드한다.
4. 분석 요청 버튼을 누른다.
5. 시스템은 `ANALYZING` 상태로 전환하고 mock 또는 AI provider를 통해 1차 검토 결과를 생성한다.
6. 사용자는 `/campaigns/[id]/review`에서 결과를 확인한다.

### Flow 2. 리스크 리뷰
1. 사용자는 이미지 위에 표시된 bounding box를 확인한다.
2. 오른쪽 패널에서 리스크 카테고리, 신뢰도, 감지 근거를 본다.
3. 수정 제안을 확인한다.
4. 코멘트를 남긴다.
5. `승인`, `수정 요청`, `반려` 중 하나를 선택한다.
6. 상태 변경과 코멘트가 감사 로그에 기록된다.

### Flow 3. 버전 비교
1. 마케터가 수정된 문구 또는 이미지를 새 버전으로 업로드한다.
2. 시스템은 v1/v2 리스크 결과를 비교한다.
3. 사용자는 변경 전후 리스크 점수, 감지 항목, 문구 차이를 확인한다.
4. 리뷰어는 수정된 버전을 승인한다.

### Flow 4. AI 1차 검토 및 담당자 확인
1. 사용자가 캠페인 분석을 요청하면 시스템은 AI 1차 검토 작업을 생성한다.
2. OCR 단계는 이미지 내 텍스트 후보와 좌표를 추출한다.
3. Vision 단계는 이미지에서 검토가 필요할 수 있는 시각 패턴 후보를 구조화한다.
4. Risk Dictionary 단계는 OCR 텍스트, 게시일, 채널, 업종, 타깃 맥락을 규칙과 비교한다.
5. LLM 단계는 리스크 후보, 근거, 오탐 가능성, 수정 제안을 `AnalysisResult` 형식으로 정리한다.
6. 캠페인 상태는 `AI_REVIEWED`가 되며, 최종 판단은 담당자가 승인/수정요청/반려로 남긴다.

#### AI 1차 검토 원칙
- AI는 최종 판정자가 아니라 담당자 검토를 돕는 1차 리뷰 어시스턴트다.
- AI 결과는 항상 "검토 후보", "가능성", "맥락 확인 필요", "오탐 가능성" 표현을 포함한다.
- AI는 의도, 사상, 정치 성향, 성별 관점, 커뮤니티 소속을 판정하지 않는다.
- AI는 리스크 후보마다 근거, 신뢰도, 오탐 가능성, 사람 검토 권장을 함께 제공한다.
- AI 결과만으로 캠페인을 자동 승인, 자동 반려, 자동 게시하지 않는다.
- 실제 AI 연동 전에는 동일한 데이터 계약을 따르는 mock provider로 전체 UI와 워크플로우를 완성한다.

#### AI 분석 API 초안
```txt
POST /api/campaigns/:id/analyze
→ 캠페인 상태를 ANALYZING으로 변경하고 분석 작업을 시작한다.

GET /api/campaigns/:id/analysis
→ 최신 AnalysisResult를 반환한다.

GET /api/campaigns/:id/analysis-job
→ 분석 작업 상태, 실패 사유, 사용 provider 정보를 반환한다.
```

---

## 7. 정보 구조

```txt
/dashboard
/campaigns
/campaigns/new
/campaigns/[id]/review
/campaigns/[id]/versions
/risk-dictionary
/cases
/settings/team
/settings/profile
```

---

## 8. 페이지 요구사항

### 8.1 Dashboard

#### 목적
현재 팀의 마케팅 소재 검수 상태를 한눈에 확인한다.

#### 주요 컴포넌트
- 검수 대기 캠페인 수
- 고위험 캠페인 수
- 승인 완료 수
- 최근 분석된 캠페인 리스트
- 카테고리별 리스크 분포 차트
- 긴급 검토 필요 카드

#### 데이터 예시
```ts
type DashboardSummary = {
  pendingReviews: number
  highRiskCampaigns: number
  approvedCampaigns: number
  averageRiskScore: number
}
```

---

### 8.2 Campaign List

#### 목적
캠페인 목록을 검색, 필터, 정렬한다.

#### 필터
- 상태
- 리스크 레벨
- 채널
- 담당자
- 게시 예정일
- 브랜드

#### 테이블 컬럼
- 캠페인명
- 브랜드
- 채널
- 게시 예정일
- 리스크 점수
- 상태
- 담당자
- 최종 수정일

---

### 8.3 Campaign Create

#### 목적
새로운 마케팅 소재 검수 프로젝트를 생성한다.

#### 입력 필드
- 캠페인명
- 브랜드명
- 게시 채널
- 게시 예정일
- 타깃
- 업종
- 광고 카피
- 이미지 파일

#### 검증
- 캠페인명 필수
- 게시일 필수
- 채널 필수
- 이미지 또는 카피 중 하나 이상 필수
- 이미지 파일은 jpg, png, webp 허용
- 파일 크기 제한 표시

---

### 8.4 Review Page

#### 목적
분석 결과를 검토하고 승인/반려/수정요청을 수행한다.

#### 레이아웃
왼쪽에는 이미지 리뷰 캔버스, 오른쪽에는 리스크 분석 패널을 둔다.

#### 왼쪽 영역
- 이미지 미리보기
- bounding box overlay
- hand landmark mock overlay
- OCR 영역 overlay
- zoom in/out
- 영역 클릭 시 오른쪽 패널 해당 항목 highlight

#### 오른쪽 영역
- 종합 리스크 점수
- 리스크 레벨
- 카테고리별 결과
- 감지 근거
- 오탐 가능성 안내
- 수정 제안
- 코멘트
- 승인/수정요청/반려 버튼
- 감사 로그

#### 결과 표현 원칙
나쁜 표현:
- "이 이미지는 특정 사상을 담고 있습니다."
- "이 손동작은 특정 집단 표현입니다."

좋은 표현:
- "논란으로 해석될 수 있는 손동작 후보가 감지되었습니다."
- "제품을 집는 동작일 가능성도 있으므로 사람 검토가 필요합니다."
- "검토 권장: 중간"

---

### 8.5 Versions Page

#### 목적
수정 전후 리스크 변화를 비교한다.

#### 주요 기능
- v1/v2 이미지 비교
- 문구 diff
- 리스크 점수 변화
- 사라진 리스크 항목
- 새로 생긴 리스크 항목
- 버전별 코멘트
- 최종 승인 버전 표시

---

### 8.6 Risk Dictionary

#### 목적
리스크 규칙과 카테고리를 관리한다.

#### 항목
- 민감 날짜
- 민감 숫자
- 시각 패턴
- 표현 카테고리
- 역사/정치/젠더/지역/세대/장애/종교/재난 관련 카테고리
- 설명
- 검토 가이드
- 예시 대체 표현

#### 주의
실제 혐오표현이나 민감 용어를 과도하게 노출하지 않는다. 포트폴리오에서는 mock 데이터와 중립적 placeholder를 사용한다.

---

### 8.7 Case Library

#### 목적
과거 논란 유형을 학습 가능한 참고 자료로 정리한다.

#### 항목
- 케이스 제목
- 리스크 카테고리
- 발생 채널
- 문제 요소
- 결과
- 예방 체크포인트
- 관련 리스크 사전 항목

---

## 9. 리스크 카테고리

```ts
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
```

---

## 10. 상태 모델

```ts
type CampaignStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'AI_REVIEWED'
  | 'NEEDS_REVISION'
  | 'PR_REVIEW'
  | 'LEGAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
```

상태 전이 예시:

```txt
DRAFT
→ ANALYZING
→ AI_REVIEWED
→ PR_REVIEW
→ NEEDS_REVISION
→ AI_REVIEWED
→ LEGAL_REVIEW
→ APPROVED
```

---

## 11. 분석 결과 데이터 모델

```ts
type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

type AnalysisSource = 'mock' | 'ocr' | 'vision_llm' | 'hybrid'

type AnalysisJobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

type AnalysisJob = {
  id: string
  campaignId: string
  versionId: string
  status: AnalysisJobStatus
  provider: AnalysisSource
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

type AnalysisResult = {
  id: string
  campaignId: string
  versionId: string
  source: AnalysisSource
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
  falsePositiveNote?: string
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
```

---

## 12. Mock 분석 결과 예시

```json
{
  "source": "mock",
  "overallRiskScore": 74,
  "overallRiskLevel": "medium",
  "summary": "이미지와 문구에서 담당자 검토가 필요한 리스크 후보가 확인되었습니다. 최종 판단은 캠페인 맥락을 아는 담당자가 검토해야 합니다.",
  "reviewRequired": true,
  "categories": [
    {
      "id": "risk-001",
      "category": "visual_gesture",
      "title": "손동작 후보 검토 필요",
      "level": "medium",
      "confidence": 0.74,
      "description": "이미지 내 손동작이 일부 민감한 시각 패턴과 유사하게 해석될 수 있습니다.",
      "evidence": [
        "엄지와 검지 사이 거리가 가까운 형태가 감지되었습니다.",
        "나머지 손가락이 일부 가려져 있어 맥락 확인이 필요합니다.",
        "제품을 집는 동작일 가능성도 존재합니다."
      ],
      "falsePositiveNote": "해당 결과는 의도나 성향을 판정하지 않으며, 시각적 유사성에 기반한 검토 후보입니다.",
      "regions": [
        {
          "id": "region-001",
          "type": "hand",
          "x": 420,
          "y": 180,
          "width": 160,
          "height": 210,
          "confidence": 0.91,
          "label": "hand gesture candidate",
          "landmarks": [
            { "x": 450, "y": 220, "label": "wrist" },
            { "x": 500, "y": 190, "label": "thumb_tip" },
            { "x": 515, "y": 198, "label": "index_tip" }
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
      "title": "PR팀 2차 검토 요청",
      "description": "SNS 채널 게시 전 PR 담당자의 추가 검토를 권장합니다."
    }
  ]
}
```

---

## 13. 권한

```ts
type UserRole = 'MARKETER' | 'BRAND_MANAGER' | 'PR_REVIEWER' | 'LEGAL_REVIEWER' | 'ADMIN'
```

### 권한별 가능 기능
- MARKETER: 캠페인 생성, 소재 업로드, 수정 요청 반영
- BRAND_MANAGER: 리뷰 코멘트, 수정 요청, 승인 요청
- PR_REVIEWER: 고위험 캠페인 검토, 승인/반려
- LEGAL_REVIEWER: 법무 검토 필요 캠페인 최종 승인
- ADMIN: 팀 설정, 권한 관리, 리스크 사전 관리

---

## 14. 비기능 요구사항

### 접근성
- 모든 버튼은 키보드로 접근 가능해야 한다.
- 이미지 리뷰 캔버스의 위험 영역은 리스트로도 접근 가능해야 한다.
- 색상만으로 위험도를 전달하지 않는다.
- 위험도 badge에는 텍스트 레이블을 포함한다.
- 모달은 focus trap과 ESC 닫기를 지원한다.

### 성능
- 이미지 업로드 후 미리보기는 빠르게 보여준다.
- 큰 이미지는 클라이언트에서 preview용으로 축소한다.
- 분석 결과 패널은 skeleton UI를 제공한다.
- 리스트 페이지는 pagination 또는 infinite query를 적용한다.

### 보안/개인정보
- 업로드 이미지가 민감할 수 있음을 안내한다.
- mock 프로젝트에서는 실제 외부 저장소 업로드 없이 로컬/샘플 데이터로 구현 가능하다.
- 분석 결과는 "공유 가능"과 "내부 검토용"을 구분한다.
- 공개 URL에는 민감 데이터가 노출되지 않도록 설계한다.

### 신뢰성
- 분석 실패 상태를 명확히 표시한다.
- 오탐 가능성을 결과에 항상 포함한다.
- 사용자가 수동으로 "오탐 처리"할 수 있어야 한다.
- 모든 승인/반려는 로그로 남긴다.

---

## 15. 성공 지표

포트폴리오 관점의 성공 지표:

- 사용자가 3분 안에 캠페인 생성부터 분석 결과 확인까지 완료할 수 있다.
- 이미지 위 리스크 영역과 오른쪽 설명 패널이 직관적으로 연결된다.
- 승인/수정요청/반려 상태 전이가 명확하다.
- mock 데이터만으로도 실제 SaaS처럼 보인다.
- README만 읽어도 제품의 문제 정의와 안전장치가 이해된다.
- E2E 테스트로 핵심 플로우가 검증된다.
- AI provider를 mock에서 실제 OCR/Vision/LLM 조합으로 교체해도 UI와 워크플로우 계약이 유지된다.

---

## 16. 추천 개발 순서

1. 프로젝트 세팅
2. 디자인 토큰/레이아웃 구축
3. mock 데이터와 타입 정의
4. 분석 provider 인터페이스와 mock analyze API
5. 대시보드
6. 캠페인 생성 폼
7. 캠페인 리스트
8. 리뷰 페이지 레이아웃
9. 이미지 오버레이
10. 리스크 패널
11. 코멘트/상태 변경
12. 버전 비교
13. 리스크 사전
14. 테스트
15. README 정리
16. 배포

---

## 17. 핵심 카피

### 랜딩 히어로
공개 전, 브랜드 리스크를 먼저 확인하세요.

### 서브카피
BrandGuard는 광고 이미지와 문구에서 논란 가능성이 있는 신호를 탐지하고, 팀이 안전하게 검토할 수 있는 근거와 수정 제안을 제공합니다.

### 제품 설명
자동 판정이 아니라, 사람의 판단을 돕는 브랜드 리스크 리뷰 워크플로우입니다.

---

## 18. 금지 표현

제품 UI와 문서에서 다음 표현을 피한다.

- "이 이미지는 페미니즘입니다."
- "이 문구는 일베입니다."
- "이 사람은 정치적 의도를 가졌습니다."
- "자동으로 논란을 완벽히 방지합니다."
- "100% 안전한 광고를 보장합니다."
- "특정 성향을 탐지합니다."

대신 다음 표현을 사용한다.

- "검토가 필요한 시각 패턴 후보"
- "논란으로 해석될 가능성"
- "맥락 확인 필요"
- "오탐 가능성 있음"
- "사람 검토 권장"
- "브랜드 리스크 후보"
