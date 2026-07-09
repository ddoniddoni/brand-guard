# BrandGuard PRD

## 1. 제품 개요

### 제품명

**BrandGuard**

### 한 줄 설명

기업과 브랜드 마케팅 담당자가 영상 대본, 광고 문구, 이미지 속 텍스트를 공개 전에 검수할 수 있도록 돕는 브랜드 정책 기반 콘텐츠 사전 검수 SaaS.

### 핵심 포지션

BrandGuard는 브랜드가 사전에 등록한 금지어, 주의어, 제한 표현, 대체 표현 정책을 기준으로 마케팅 콘텐츠의 **검토 후보**를 찾아주는 도구다.

사용자는 영상 대본이나 광고 문구를 붙여넣고, 이미지를 업로드할 수 있다. 시스템은 텍스트를 문장/줄 단위로 나누어 브랜드 정책 사전과 비교하고, 이미지의 경우 Tesseract.js OCR로 이미지 속 문구를 추출한 뒤 동일한 기준으로 검사한다.

AI 이미지 분석은 기본 MVP의 필수 기능이 아니라 확장 기능이다. 기본 기능은 AI 없이도 동작해야 하며, 추후 API Key를 연결하면 이미지의 시각 요소와 장면 구성까지 분석할 수 있도록 provider 구조를 준비한다.

BrandGuard는 특정 사상, 성향, 의도, 정치적 입장, 커뮤니티 소속을 판정하는 도구가 아니다. 또한 자동 승인, 자동 반려, 자동 게시를 수행하지 않는다.

### 가장 중요한 제품 흐름

```txt
브랜드 정책 사전 등록
→ 영상 대본/광고 문구/SNS 카피 붙여넣기
→ 문장/줄 단위 분리
→ 금지어·주의어·제한 표현 검사
→ 이미지 업로드
→ Tesseract.js OCR로 이미지 속 문구 추출
→ OCR 문구를 동일한 정책 사전으로 검사
→ 검토 후보, 근거, 위치, 심각도, 수정 제안 확인
→ 검수 메모 작성
→ 검수 리포트 저장
→ API Key 연결 시 AI 이미지 분석 확장
```

이 프로젝트의 핵심은 여러 부가 기능이 아니라 **브랜드 정책 사전 + 대본/문구 검사 + 이미지 OCR 검사 + AI 확장 구조**다.

---

## 2. 제품 원칙

- 브랜드 정책 사전이 검수 기준의 중심이다.
- 사용자가 등록한 금지어, 주의어, 제한 표현을 기준으로 검토 후보를 찾는다.
- AI 없이도 대본/문구 검사와 이미지 OCR 검사는 완성된 기능처럼 동작해야 한다.
- 이미지 속 문구는 Tesseract.js OCR로 추출한다.
- OCR 결과는 원문 텍스트와 동일한 정책 필터 엔진으로 검사한다.
- AI 이미지 분석은 API Key 연결 후 사용할 수 있는 확장 기능으로 분리한다.
- 결과는 "위반 확정"이 아니라 "검토 후보"로 표현한다.
- 시스템은 특정 사상, 의도, 성향, 커뮤니티 소속을 판정하지 않는다.
- 최종 판단과 수정 여부는 마케팅 담당자가 결정한다.
- API Key는 반드시 서버 사이드에서만 사용한다.

---

## 3. 문제 정의

기업과 브랜드의 마케팅팀은 영상, SNS, 배너, 이벤트 페이지, 광고 이미지 등을 공개하기 전에 내부 정책에 맞는지 검토해야 한다. 하지만 실제 작업 과정에서는 다음 문제가 자주 발생한다.

- 영상 대본이나 광고 문구가 길면 금지어와 제한 표현을 사람이 일일이 찾기 어렵다.
- 브랜드마다 쓰면 안 되는 표현, 주의해야 하는 표현, 대체해야 하는 표현이 다르다.
- 이미지 안에 들어간 문구는 텍스트 검색만으로 검수하기 어렵다.
- 디자이너가 만든 이미지 속 작은 문구, 배너 문장, 이벤트 조건 문구가 누락될 수 있다.
- AI 이미지 분석을 바로 붙이기 전에도 동작하는 실용적인 검수 도구가 필요하다.
- 추후 AI API Key를 연결했을 때 구조를 갈아엎지 않고 이미지 분석 기능을 확장하고 싶다.

BrandGuard는 이 문제를 **정책 사전 등록 → 대본/문구 검사 → 이미지 OCR 검사 → 검수 리포트**라는 단순하고 명확한 흐름으로 해결한다.

---

## 4. 타깃 사용자

### 4.1 브랜드 마케팅 담당자

예: 브랜드 마케터, 콘텐츠 마케터, SNS 운영자, 퍼포먼스 마케터

- 영상 대본, SNS 카피, 광고 문구를 붙여넣는다.
- 캠페인 이미지나 배너 이미지를 업로드한다.
- 브랜드 정책 위반 가능성이 있는 문장을 확인한다.
- 수정 제안을 참고해 문구를 다듬는다.
- 검수 리포트를 저장한다.

### 4.2 브랜드 매니저 / 캠페인 책임자

예: 브랜드 매니저, 마케팅 리더, 캠페인 오너

- 브랜드별 금지어와 주의어를 관리한다.
- 검수 기준과 대체 표현을 정리한다.
- 검수 리포트를 보고 캠페인 공개 전 수정 여부를 판단한다.
- 반복적으로 문제가 되는 표현을 정책 사전에 추가한다.

### 4.3 콘텐츠 제작자 / 디자이너

예: 디자이너, 영상 편집자, 카피라이터

- 제작한 이미지와 문구를 업로드한다.
- 이미지 속 텍스트가 OCR로 잘 추출되었는지 확인한다.
- 문제가 되는 문구의 위치를 이미지 위에서 확인한다.
- 수정해야 할 문장이나 이미지 문구를 빠르게 파악한다.

### 4.4 관리자

예: 팀 관리자, 운영 관리자

- 브랜드 정책 사전을 관리한다.
- AI API Key 연결 상태를 관리한다.
- 저장된 검수 기록을 확인한다.

---

## 5. 제품 목표

### 5.1 사용자 목표

1. 브랜드별 금지어와 주의어를 쉽게 등록한다.
2. 긴 영상 대본이나 광고 문구를 붙여넣고 빠르게 검사한다.
3. 문제가 될 수 있는 문장과 단어를 문장 단위로 확인한다.
4. 이미지 속 문구를 OCR로 추출해 동일한 기준으로 검사한다.
5. 이미지 위에서 OCR 문구 위치와 검토 후보를 확인한다.
6. 검출 사유와 대체 표현을 확인하고 수정 방향을 잡는다.
7. AI API Key 연결 전에도 실사용 가능한 검수 흐름을 제공한다.
8. API Key 연결 후 이미지의 시각적 요소까지 확장 분석한다.

### 5.2 포트폴리오 목표

이 프로젝트는 프론트엔드 포트폴리오에서 다음 역량을 보여주는 것을 목표로 한다.

- 브랜드 정책 사전 기반 도메인 모델링
- 긴 텍스트 입력과 문장/줄 단위 분석 UX
- 룰 기반 필터링 엔진 설계
- 파일 업로드와 이미지 미리보기 UX
- Tesseract.js OCR 연동
- OCR 진행 상태 UI
- OCR 결과 텍스트 패널
- 이미지 위 OCR bounding box overlay
- 결과 리스트와 이미지 overlay 동기화
- 심각도/카테고리/출처별 필터링
- AI provider 확장 구조
- 서버 사이드 API Key 관리 구조
- TypeScript 기반 데이터 모델링
- mock API 기반 실제 SaaS 같은 흐름 구현
- E2E 테스트 가능한 핵심 사용자 플로우

---

## 6. MVP 범위

### 6.1 반드시 포함

- 브랜드 정책 사전 관리
- 금지어 등록
- 주의어 등록
- 카테고리, 심각도, 매칭 방식 설정
- 대체 표현 입력
- 검수 생성 화면
- 영상 대본/광고 문구/SNS 카피 붙여넣기
- 텍스트 정규화
- 문장/줄 단위 분리
- 금지어/주의어 매칭
- 검토 후보 문장 하이라이트
- 이미지 업로드
- 이미지 미리보기
- Tesseract.js OCR 실행
- OCR 진행 상태 표시
- OCR 전체 텍스트 표시
- OCR confidence 표시
- OCR region overlay
- OCR 텍스트 정책 검사
- 검토 후보 목록
- 검토 후보 상세 패널
- 출처별 필터: 붙여넣은 텍스트 / 이미지 OCR / AI 이미지 분석
- 심각도별 필터
- 수정 제안 표시
- 검수 메모
- 검수 리포트 저장
- 검수 기록 목록
- AI 이미지 분석 미연결 상태 UI
- AI API Key 설정 화면
- disabled/mock vision provider 구조

### 6.2 MVP에서 제외 또는 후순위

아래 기능은 있으면 좋지만, 핵심 플로우보다 우선하지 않는다.

- 결재 라인
- 최종 승인/반려 워크플로우
- 복잡한 대시보드
- 고급 통계
- 버전 비교
- 케이스 라이브러리
- 팀 권한 관리
- 실제 광고 플랫폼 게시 연동
- 실제 결제/구독
- 고급 NLP 유사어 탐지
- 실시간 공동 편집
- 실제 AI 이미지 분석 provider

기존 결재 기능을 이미 일부 구현했다면 완전히 삭제하지 말고 후속 기능 또는 `/settings/workflow` 하위 기능으로 숨긴다. 메인 플로우에서는 보여주지 않는다.

---

## 7. 핵심 사용자 플로우

## Flow 1. 브랜드 정책 사전 등록

1. 사용자가 `/dictionaries`로 이동한다.
2. 브랜드명 또는 기본 브랜드 정책 세트를 선택한다.
3. 금지어 또는 주의어를 추가한다.
4. 카테고리와 심각도를 선택한다.
5. 매칭 방식을 선택한다.
6. 검출 사유를 입력한다.
7. 대체 표현을 입력한다.
8. 정책을 저장한다.

정책 예시:

```txt
표현: 무료 보장
유형: 금지어
카테고리: 확정/보장 표현
심각도: high
매칭 방식: contains
검출 사유: 객관적 조건 없이 보장성 표현 사용 제한
대체 표현: 조건 충족 시 제공
```

---

## Flow 2. 대본/문구 붙여넣기 검사

1. 사용자가 `/reviews/new`로 이동한다.
2. 검수 제목, 브랜드명, 콘텐츠 유형, 채널을 입력한다.
3. 영상 대본, 광고 문구, SNS 카피 중 하나를 붙여넣는다.
4. 적용할 브랜드 정책 사전을 선택한다.
5. `콘텐츠 검수 시작` 버튼을 클릭한다.
6. 시스템은 텍스트를 정규화한다.
7. 시스템은 텍스트를 줄 또는 문장 단위로 나눈다.
8. 정책 사전의 금지어/주의어와 매칭한다.
9. 검토 후보 문장과 검출 표현을 생성한다.
10. 결과 화면으로 이동한다.

진행 단계 예시:

```txt
콘텐츠 접수
→ 대본/문구 문장 분리
→ 브랜드 금지어 사전 매칭
→ 검토 후보 정리
→ 검수 리포트 생성
```

---

## Flow 3. 이미지 OCR 검사

1. 사용자가 `/reviews/new`에서 이미지를 업로드한다.
2. 이미지 미리보기가 표시된다.
3. `콘텐츠 검수 시작` 버튼을 클릭한다.
4. Tesseract.js OCR이 실행된다.
5. OCR 진행률이 표시된다.
6. 이미지에서 추출된 텍스트가 표시된다.
7. OCR confidence가 표시된다.
8. OCR region 정보가 있으면 이미지 위에 overlay가 표시된다.
9. OCR 텍스트도 동일한 정책 사전으로 검사된다.
10. 이미지 OCR 출처의 검토 후보가 생성된다.

진행 단계 예시:

```txt
이미지 접수
→ OCR 엔진 준비
→ 이미지 문구 추출
→ OCR 문구 정리
→ OCR 문구 정책 검사
→ 이미지 검토 후보 생성
```

---

## Flow 4. 검수 결과 확인

1. 사용자가 `/reviews/[id]`에서 검수 결과를 확인한다.
2. 상단 요약 카드에서 전체 검토 후보 수를 본다.
3. 출처별 후보 수를 확인한다.
   - 붙여넣은 텍스트
   - 이미지 OCR
   - AI 이미지 분석
4. 왼쪽에는 원문 텍스트와 이미지 미리보기를 본다.
5. 오른쪽에는 검토 후보 리스트와 상세 패널을 본다.
6. 검토 후보를 클릭하면 해당 문장 또는 OCR region이 강조된다.
7. 수정 제안을 확인한다.
8. 검수 메모를 작성한다.
9. `검수 리포트 저장`을 클릭한다.
10. 검수 기록에 저장된다.

결과 예시:

```txt
검토 후보 6개 발견

붙여넣은 텍스트: 4개
이미지 OCR: 2개
AI 이미지 분석: 미연결
```

---

## Flow 5. AI 이미지 분석 확장

1. 관리자가 `/settings/ai`로 이동한다.
2. AI 이미지 분석 연결 상태를 확인한다.
3. API Key를 입력한다.
4. 서버 사이드에서 연결 테스트를 수행한다.
5. 연결 성공 시 이후 검수부터 AI 이미지 분석이 함께 실행된다.
6. 연결 실패 시 기본 OCR 기반 검수는 계속 사용할 수 있다.

AI 미연결 상태 문구:

```txt
AI 이미지 분석이 아직 연결되지 않았습니다.
현재는 대본/문구 검사와 Tesseract.js OCR 기반 이미지 문구 검사가 가능합니다.
API Key를 연결하면 이미지의 시각 요소와 장면 구성까지 추가로 검토할 수 있습니다.
```

---

## 8. 정보 구조

### 핵심 라우트

```txt
/reviews/new
/reviews/[id]
/dictionaries
/settings/ai
/history
```

### 선택 라우트

```txt
/dashboard
/reports
/settings/team
/settings/profile
/cases
```

MVP에서는 핵심 라우트를 우선 구현한다.

---

## 9. 페이지 요구사항

## 9.1 Dictionary Page

### 목적

브랜드 정책 사전을 관리한다.

### 주요 요소

- 정책 사전 목록
- 금지어/주의어 테이블
- 검색
- 카테고리 필터
- 심각도 필터
- 활성/비활성 토글
- 금지어 추가 버튼
- 금지어 수정 drawer 또는 dialog
- 대체 표현 표시

### 필수 입력

- 표현
- 유형: 금지어 / 주의어
- 카테고리
- 심각도
- 매칭 방식
- 검출 사유

### 검증

- 표현은 비어 있을 수 없다.
- 카테고리는 필수다.
- 심각도는 필수다.
- 정규식 매칭을 선택한 경우 유효한 정규식이어야 한다.

---

## 9.2 Review Create Page

### 목적

사용자가 대본/문구와 이미지를 입력하고 검수를 시작한다.

### 주요 요소

- 검수 제목
- 브랜드명
- 콘텐츠 유형
- 채널
- 적용 정책 사전 선택
- 대본/문구 붙여넣기 textarea
- 이미지 업로드
- 이미지 미리보기
- AI 이미지 분석 연결 상태
- 콘텐츠 검수 시작 버튼
- 분석 진행 상태

### 필수 입력

- 검수 제목
- 브랜드명
- 콘텐츠 유형
- 채널
- 정책 사전
- 대본/문구 또는 이미지 중 하나 이상

### 검증

- 검수 제목은 비어 있을 수 없다.
- 브랜드명은 비어 있을 수 없다.
- 이미지 파일은 jpg, png, webp만 허용한다.
- 대본/문구와 이미지가 모두 없으면 검수를 시작할 수 없다.

---

## 9.3 Review Result Page

### 목적

검수 결과를 확인하고 리포트를 저장한다.

### 레이아웃

추천 구조:

```txt
상단: 검수 요약 카드
좌측: 원문 텍스트 / 이미지 OCR preview
우측: 검토 후보 리스트 / 상세 패널
하단 또는 우측 하단: 검수 메모 / 리포트 저장
```

### 탭 구조

```txt
전체 요약
대본/문구 검사
이미지 OCR 검사
AI 이미지 분석
검수 메모
```

### 상단 요약

- 전체 검토 후보 수
- high/medium/low 개수
- 붙여넣은 텍스트 후보 수
- 이미지 OCR 후보 수
- AI 이미지 분석 연결 상태

### 대본/문구 검사 영역

- 원문 텍스트 표시
- 문장/줄 단위 하이라이트
- 검출 표현 강조
- 검출 사유
- 대체 표현
- false positive 가능성 안내

### 이미지 OCR 검사 영역

- 이미지 미리보기
- OCR bounding box overlay
- OCR 전체 텍스트
- OCR confidence
- OCR 검토 후보
- 클릭 시 이미지 region과 후보 상세 동기화

### AI 이미지 분석 영역

API Key가 없을 때:

```txt
AI 이미지 분석이 아직 연결되지 않았습니다.
현재는 이미지 속 문구만 OCR로 추출해 검사합니다.
API Key를 연결하면 이미지의 시각 요소와 장면 구성까지 추가로 검토할 수 있습니다.
```

API Key가 있을 때:

```txt
AI 이미지 분석 결과
- 시각 요소 후보
- 장면 맥락 요약
- 브랜드 톤 불일치 후보
- 사람 검토 권장 사항
```

---

## 9.4 AI Settings Page

### 목적

AI 이미지 분석 연결 상태를 관리한다.

### 주요 요소

- 현재 연결 상태
- provider 선택
- API Key 입력
- 연결 테스트 버튼
- 마지막 테스트 시각
- 실패 메시지
- 보안 안내

### 원칙

- API Key는 클라이언트에 노출하지 않는다.
- production-like 예시에서는 localStorage에 API Key를 저장하지 않는다.
- 프론트에서는 연결 상태만 표시한다.
- 실제 provider 호출은 서버 route 또는 server action에서 수행한다.

---

## 9.5 History Page

### 목적

저장된 검수 리포트를 확인한다.

### 주요 요소

- 검수 기록 목록
- 검수 제목
- 브랜드명
- 콘텐츠 유형
- 후보 수
- 심각도 요약
- 생성일
- 상세 보기 CTA

MVP에서는 복잡한 필터보다 검색과 기본 정렬만 있어도 충분하다.

---

## 10. 상태 모델

```ts
type ReviewStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEWED'
```

### 기본 흐름

```txt
DRAFT
→ ANALYZING
→ COMPLETED
→ REVIEWED
```

### 실패 흐름

```txt
ANALYZING
→ FAILED
→ ANALYZING
→ COMPLETED
```

### 상태 전이 규칙

- `DRAFT → ANALYZING`: 사용자가 콘텐츠 검수를 시작한다.
- `ANALYZING → COMPLETED`: 대본/문구 검사와 OCR 검사가 완료된다.
- `ANALYZING → FAILED`: OCR 또는 검수 처리 중 오류가 발생한다.
- `FAILED → ANALYZING`: 사용자가 재시도한다.
- `COMPLETED → REVIEWED`: 사용자가 검수 메모 또는 리포트를 저장한다.

---

## 11. 데이터 모델

```ts
type Severity = 'low' | 'medium' | 'high' | 'critical'

type ReviewStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEWED'

type ContentType =
  | 'video_script'
  | 'ad_copy'
  | 'sns_caption'
  | 'web_banner'
  | 'image_only'
  | 'mixed'

type Channel =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'web_banner'
  | 'push'
  | 'offline'
  | 'homepage'
  | 'newsletter'

type PolicyTermType = 'forbidden' | 'caution'

type MatchType = 'exact' | 'contains' | 'regex' | 'normalized'

type FindingSource = 'pasted_text' | 'image_ocr' | 'vision_ai'

type PolicyCategory =
  | 'guarantee_claim'
  | 'exaggerated_claim'
  | 'comparative_rank'
  | 'sensitive_industry'
  | 'brand_tone_mismatch'
  | 'legal_review_required'
  | 'event_condition_missing'
  | 'community_slang'
  | 'custom_forbidden_term'

type PolicyTerm = {
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

type ReviewJob = {
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

type TextSegment = {
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

type OcrTextRegion = {
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

type OcrResult = {
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

type PolicyFinding = {
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

type VisionAiFinding = {
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

type ImageRegion = {
  id: string
  x: number
  y: number
  width: number
  height: number
  confidence: number
  label: string
}

type ReviewReport = {
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

## 12. 정책 필터 엔진 요구사항

정책 필터 엔진은 MVP의 핵심이다.

### 입력

```ts
type PolicyFilterInput = {
  reviewJobId: string
  source: 'pasted_text' | 'image_ocr'
  textSegments: TextSegment[]
  policyTerms: PolicyTerm[]
}
```

### 출력

```ts
type PolicyFilterResult = {
  findings: PolicyFinding[]
}
```

### 필수 동작

- 비활성화된 정책은 무시한다.
- 매칭 전 텍스트를 정규화한다.
- 영문 대소문자를 무시한다.
- 한글/영문 공백 변형에 대응한다.
- `exact`, `contains`, `regex`, `normalized` 매칭을 지원한다.
- 매칭된 원문 문장 또는 줄을 반환한다.
- 매칭된 표현을 하이라이트할 수 있어야 한다.
- 정책의 심각도, 카테고리, 사유, 대체 표현을 결과에 포함한다.

### 추천 구현 순서

```txt
contains 매칭
→ exact 매칭
→ normalized 매칭
→ regex 매칭
→ 하이라이트
→ 대체 표현 제안
```

---

## 13. Tesseract.js OCR 요구사항

이미지 OCR은 MVP 필수 기능이다.

### 필수 기능

- jpg/png/webp 이미지 업로드
- 이미지 미리보기
- OCR 진행률 표시
- OCR 전체 텍스트 표시
- OCR confidence 표시
- OCR 텍스트 region 표시
- 이미지 위 OCR bounding box overlay
- OCR region 클릭 시 텍스트 패널과 동기화
- OCR 텍스트를 정책 필터 엔진으로 검사
- OCR 실패 상태 표시
- 이미지에서 텍스트가 없을 때 empty state 표시

### OCR 결과 매핑

Tesseract.js 결과는 UI에서 바로 쓰지 말고 앱 도메인 타입으로 변환한다.

```txt
Tesseract raw result
→ OcrResult
→ OcrTextRegion[]
→ TextSegment[]
→ PolicyFilterEngine
→ PolicyFinding[]
```

### 좌표 규칙

이미지 overlay 좌표는 0~1 사이의 normalized coordinate로 관리한다.

```ts
type NormalizedRegion = {
  x: number
  y: number
  width: number
  height: number
}
```

---

## 14. AI 이미지 분석 확장 요구사항

AI 이미지 분석은 기본 검수 기능이 아니라 확장 기능이다.

기본 MVP는 다음만으로도 완성된 제품처럼 동작해야 한다.

```txt
대본/문구 검사
+ Tesseract.js OCR
+ OCR 문구 검사
+ 검수 리포트
```

AI 연결 전에는 다음 상태를 보여준다.

```txt
AI 이미지 분석 미연결
```

AI 연결 후에는 vision provider가 추가로 실행된다.

### Provider Interface

```ts
type VisionAnalysisInput = {
  reviewJobId: string
  imageUrls: string[]
  brandName: string
  policySummary: string
  ocrText: string
}

type VisionAnalysisResult = {
  summary: string
  findings: VisionAiFinding[]
}

type VisionAnalysisProvider = {
  analyzeImages(input: VisionAnalysisInput): Promise<VisionAnalysisResult>
}
```

### Disabled Provider

```ts
const disabledVisionProvider: VisionAnalysisProvider = {
  async analyzeImages() {
    return {
      summary: 'AI 이미지 분석이 연결되지 않았습니다.',
      findings: [],
    }
  },
}
```

### 연결 원칙

- API Key는 서버 사이드에서만 사용한다.
- 프론트에는 연결 상태만 내려준다.
- API Key를 public env로 두지 않는다.
- API Key를 client component에서 참조하지 않는다.
- API Key를 localStorage에 저장하지 않는다.
- 연결 실패 시 OCR 기반 검수는 계속 동작해야 한다.

---

## 15. Mock 데이터 예시

### 정책 사전 예시

```json
[
  {
    "id": "term-001",
    "brandId": "brand-001",
    "term": "무료 보장",
    "type": "forbidden",
    "category": "guarantee_claim",
    "severity": "high",
    "matchType": "contains",
    "reason": "조건 없이 혜택을 보장하는 표현은 브랜드 정책상 사용이 제한됩니다.",
    "replacementSuggestion": "조건 충족 시 제공",
    "enabled": true
  },
  {
    "id": "term-002",
    "brandId": "brand-001",
    "term": "업계 1위",
    "type": "caution",
    "category": "comparative_rank",
    "severity": "medium",
    "matchType": "contains",
    "reason": "객관적 근거 없이 순위 표현을 사용할 경우 검토가 필요합니다.",
    "replacementSuggestion": "많은 고객이 선택한",
    "enabled": true
  }
]
```

### 검토 후보 예시

```json
{
  "id": "finding-001",
  "reviewJobId": "review-001",
  "source": "pasted_text",
  "severity": "high",
  "category": "guarantee_claim",
  "policyTermId": "term-001",
  "matchedTerm": "무료 보장",
  "originalText": "이번 이벤트에 참여하면 누구나 무료 보장 혜택을 받을 수 있습니다.",
  "highlightedText": "이번 이벤트에 참여하면 누구나 <mark>무료 보장</mark> 혜택을 받을 수 있습니다.",
  "reason": "조건 없이 혜택을 보장하는 표현은 브랜드 정책상 사용이 제한됩니다.",
  "replacementSuggestion": "조건 충족 시 제공",
  "lineNumber": 12,
  "sentenceIndex": 18
}
```

### OCR 후보 예시

```json
{
  "id": "finding-002",
  "reviewJobId": "review-001",
  "source": "image_ocr",
  "severity": "medium",
  "category": "comparative_rank",
  "policyTermId": "term-002",
  "matchedTerm": "업계 1위",
  "originalText": "업계 1위 확정 이벤트",
  "highlightedText": "<mark>업계 1위</mark> 확정 이벤트",
  "reason": "객관적 근거 없이 순위 표현을 사용할 경우 검토가 필요합니다.",
  "replacementSuggestion": "많은 고객이 선택한",
  "confidence": 0.89,
  "imageId": "image-001",
  "regionId": "ocr-region-001"
}
```

---

## 16. 검수 결과 표현 원칙

결과 표현은 반드시 사람이 검토해야 하는 후보로 표현한다.

### 좋은 표현

```txt
브랜드 정책 사전에 등록된 표현이 확인되었습니다.
해당 문장은 검토가 필요합니다.
OCR로 추출된 문구에서 주의어가 확인되었습니다.
캠페인 맥락에 따라 오탐일 수 있습니다.
담당자 검토 후 수정 여부를 결정하세요.
```

### 나쁜 표현

```txt
정책 위반 확정입니다.
법적 문제가 확정되었습니다.
AI가 논란을 감지했습니다.
이 이미지는 위험합니다.
100% 안전합니다.
AI가 승인했습니다.
```

---

## 17. UI 문구 가이드

### 권장 문구

- 콘텐츠 검수
- 브랜드 정책 사전
- 금지어
- 주의어
- 정책 매칭
- 검토 후보
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
- 심각도는 색상만으로 전달하지 않는다.
- badge에는 텍스트 레이블을 포함한다.
- tooltip은 핵심 정보를 숨기는 용도로 사용하지 않는다.
- 입력 필드에는 label과 에러 메시지가 있어야 한다.
- 이미지 OCR region은 리스트에서도 선택 가능해야 한다.
- OCR 진행률은 스크린리더가 인식할 수 있는 텍스트와 함께 제공한다.

---

## 19. 로딩, 빈 상태, 에러 상태

다음 상태를 제공한다.

- 정책 사전 없음
- 금지어 없음
- 대본/문구 없음
- 업로드 이미지 없음
- OCR 분석 중
- OCR 분석 실패
- 이미지에서 텍스트를 찾지 못함
- 검토 후보 없음
- AI 이미지 분석 미연결
- AI 연결 실패
- 검수 리포트 없음
- 저장된 검수 기록 없음

---

## 20. 성공 지표

MVP 성공 기준:

- 사용자가 3분 안에 대본/문구 입력부터 검수 결과 확인까지 완료할 수 있다.
- 사용자가 금지어를 등록하고, 해당 표현이 포함된 문장을 검출할 수 있다.
- 사용자가 이미지를 업로드하고 OCR 문구를 확인할 수 있다.
- OCR로 추출된 문구가 정책 필터 엔진으로 검사된다.
- 이미지 위 OCR 영역과 오른쪽 결과 패널이 직관적으로 연결된다.
- AI API Key가 없어도 제품의 핵심 기능이 동작한다.
- AI API Key 연결 후 확장 가능한 provider 구조가 존재한다.
- mock 데이터만으로도 실제 SaaS처럼 보인다.
- 안전하지 않은 확정 표현 없이 검토 후보 중심으로 표시된다.

---

## 21. 추천 개발 순서

1. 프로젝트 세팅
2. 디자인 토큰/레이아웃 구축
3. 타입 정의와 mock 데이터 작성
4. 브랜드 정책 사전 모델 작성
5. 금지어/주의어 테이블 구현
6. 금지어/주의어 추가/수정 폼 구현
7. 검수 생성 폼 구현
8. 대본/문구 붙여넣기 textarea 구현
9. 텍스트 정규화 함수 구현
10. 문장/줄 단위 split 함수 구현
11. 정책 필터 엔진 구현
12. 대본/문구 검토 후보 UI 구현
13. 이미지 업로드와 미리보기 구현
14. Tesseract.js OCR 연동
15. OCR progress UI 구현
16. OCR 텍스트 패널 구현
17. OCR region overlay 구현
18. OCR 텍스트 정책 검사 연결
19. 검수 결과 요약 카드 구현
20. 검토 후보 상세 패널 구현
21. 출처/심각도 필터 구현
22. 검수 메모와 리포트 저장 구현
23. 검수 기록 페이지 구현
24. AI settings 화면 구현
25. disabled/mock vision provider 구현
26. 핵심 E2E 테스트 작성
27. README 정리

---

## 22. 핵심 카피

### 메인 카피

```txt
영상 대본과 이미지 문구를 공개 전 미리 검수하세요.
```

### 서브카피

```txt
BrandGuard는 브랜드가 등록한 금지어와 표현 정책을 기준으로
대본, 광고 문구, 이미지 속 텍스트의 검토 후보를 찾아줍니다.
```

### OCR 설명

```txt
이미지 속 문구는 Tesseract.js OCR로 추출한 뒤,
브랜드 정책 사전과 동일한 기준으로 검사합니다.
```

### AI 확장 설명

```txt
AI 이미지 분석은 API Key 연결 후 사용할 수 있습니다.
연결 전에도 대본/문구 검사와 OCR 기반 이미지 문구 검사는 정상적으로 동작합니다.
```

### 제품 설명

```txt
BrandGuard는 위반 여부를 최종 확정하지 않습니다.
정책 위반 가능성이 있는 검토 후보와 근거, 대체 표현을 제공하며,
최종 판단과 수정 여부는 마케팅 담당자가 결정합니다.
```

---

## 23. README 요약 문구

```md
# BrandGuard

BrandGuard는 기업과 브랜드 마케팅 담당자가 영상 대본, 광고 문구,
이미지 속 텍스트를 공개하기 전에 검수할 수 있도록 돕는
브랜드 정책 기반 콘텐츠 사전 검수 SaaS 포트폴리오입니다.

사용자는 브랜드 금지어와 주의어를 등록하고,
영상 대본이나 광고 문구를 붙여넣어 문장 단위로 검사할 수 있습니다.
이미지의 경우 Tesseract.js OCR로 이미지 속 문구를 추출하고,
동일한 정책 사전 기준으로 검토 후보를 확인할 수 있습니다.

BrandGuard는 특정 사상, 정치 성향, 의도, 커뮤니티 소속을 판정하지 않습니다.
결과는 최종 확정이 아니라 사람이 확인해야 하는 검토 후보입니다.

AI 이미지 분석은 API Key 연결 후 확장할 수 있으며,
기본 MVP는 AI 없이도 대본/문구 검사와 OCR 이미지 문구 검사가 동작합니다.
```
