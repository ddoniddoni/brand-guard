import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from "@/features/campaign/types";
import type { CampaignCreateInput } from "@/features/campaign/schema";
import type {
  AnalysisResult,
  RiskFinding,
  RiskLevel,
  RevisionSuggestion,
} from "@/features/risk-analysis/types";
import type {
  ApprovalStep,
  AuditLogEntry,
  ReviewerComment,
} from "@/features/review-workflow/types";

const storageKey = "brandguard.campaign-workspaces.v1";
const storageVersion = 1;
const listeners = new Set<() => void>();
let cachedRawValue: string | null = null;
let cachedWorkspaces: CampaignWorkspace[] = [];
const emptyWorkspaces: CampaignWorkspace[] = [];

type StoredWorkspacePayload = {
  version: number;
  workspaces: CampaignWorkspace[];
};

export type CampaignAsset = {
  copy: string;
  imageDataUrl?: string;
  imageFileName?: string;
  source: "mock" | "sample" | "upload";
  usesSampleAsset: boolean;
};

export type CampaignWorkspace = {
  analysis: AnalysisResult;
  approvalSteps: ApprovalStep[];
  asset: CampaignAsset;
  auditLogEntries: AuditLogEntry[];
  campaign: Campaign;
  comments: ReviewerComment[];
};

type CreateCampaignWorkspaceInput = Pick<
  CampaignCreateInput,
  | "brandName"
  | "channel"
  | "copy"
  | "industry"
  | "name"
  | "publishDate"
  | "targetAudience"
> & {
  imageDataUrl?: string;
  imageFileName?: string;
  usesSampleAsset: boolean;
};

export type WorkspacePatch = Partial<
  Pick<
    CampaignWorkspace,
    "analysis" | "approvalSteps" | "asset" | "auditLogEntries" | "comments"
  >
> & {
  campaign?: Partial<Campaign>;
  status?: CampaignStatus;
};

export function createCampaignWorkspace(
  input: CreateCampaignWorkspaceInput,
): CampaignWorkspace {
  const timestamp = new Date().toISOString();
  const campaignId = `cmp-local-${Date.now().toString(36)}`;
  const asset: CampaignAsset = {
    copy: input.copy?.trim() ?? "",
    imageDataUrl: input.imageDataUrl,
    imageFileName: input.imageFileName,
    source: input.usesSampleAsset ? "sample" : input.imageDataUrl ? "upload" : "mock",
    usesSampleAsset: input.usesSampleAsset,
  };
  const analysis = createInputBasedAnalysis({
    asset,
    campaignId,
    channel: input.channel,
    publishDate: input.publishDate,
  });
  const campaign: Campaign = {
    id: campaignId,
    name: input.name,
    brandName: input.brandName,
    channel: input.channel,
    publishDate: input.publishDate,
    targetAudience: input.targetAudience,
    industry: input.industry,
    status: "STAKEHOLDER_REVIEW",
    riskScore: analysis.overallRiskScore,
    riskLevel: analysis.overallRiskLevel,
    ownerName: "현재 사용자",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    analysis,
    approvalSteps: createApprovalSteps(campaignId, timestamp),
    asset,
    auditLogEntries: createInitialAuditLog(campaignId, timestamp),
    campaign,
    comments: [],
  };
}

export function createMockCampaignAsset(campaign: Campaign): CampaignAsset {
  return {
    copy:
      campaign.id === "cmp-001"
        ? "Summer calm, reviewed first.\n신제품 공개 전 브랜드 리스크를 함께 확인합니다."
        : `${campaign.name}\n게시 전 브랜드 맥락을 확인합니다.`,
    source: "mock",
    usesSampleAsset: true,
  };
}

export function getStoredCampaignWorkspaces() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (rawValue === cachedRawValue) {
    return cachedWorkspaces;
  }

  if (!rawValue) {
    cachedRawValue = rawValue;
    cachedWorkspaces = [];
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredWorkspacePayload>;

    if (
      parsedValue.version !== storageVersion ||
      !Array.isArray(parsedValue.workspaces)
    ) {
      cachedRawValue = rawValue;
      cachedWorkspaces = [];
      return [];
    }

    cachedRawValue = rawValue;
    cachedWorkspaces = parsedValue.workspaces.filter(isCampaignWorkspace);

    return cachedWorkspaces;
  } catch {
    cachedRawValue = rawValue;
    cachedWorkspaces = [];
    return [];
  }
}

export function getStoredCampaignWorkspaceById(campaignId: string) {
  return (
    getStoredCampaignWorkspaces().find(
      (workspace) => workspace.campaign.id === campaignId,
    ) ?? null
  );
}

export function saveCampaignWorkspace(workspace: CampaignWorkspace) {
  if (typeof window === "undefined") {
    return;
  }

  const workspaces = getStoredCampaignWorkspaces();
  const nextWorkspaces = [
    workspace,
    ...workspaces.filter(
      (item) => item.campaign.id !== workspace.campaign.id,
    ),
  ].slice(0, 12);

  const nextRawValue = JSON.stringify({
    version: storageVersion,
    workspaces: nextWorkspaces,
  });

  window.localStorage.setItem(storageKey, nextRawValue);
  cachedRawValue = nextRawValue;
  cachedWorkspaces = nextWorkspaces;
  emitWorkspaceChange();
}

export function subscribeCampaignWorkspaces(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      cachedRawValue = null;
      cachedWorkspaces = [];
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getStoredCampaignWorkspacesSnapshot() {
  return getStoredCampaignWorkspaces();
}

export function getStoredCampaignWorkspacesServerSnapshot() {
  return emptyWorkspaces;
}

function emitWorkspaceChange() {
  listeners.forEach((listener) => listener());
}

export function mergeCampaignWorkspaces(
  initialWorkspaces: CampaignWorkspace[],
) {
  const storedWorkspaces = getStoredCampaignWorkspaces();
  const storedWorkspaceIds = new Set(
    storedWorkspaces.map((workspace) => workspace.campaign.id),
  );

  return [
    ...storedWorkspaces,
    ...initialWorkspaces.filter(
      (workspace) => !storedWorkspaceIds.has(workspace.campaign.id),
    ),
  ];
}

export function applyWorkspacePatch(
  workspace: CampaignWorkspace,
  patch: WorkspacePatch,
): CampaignWorkspace {
  const status = patch.status ?? patch.campaign?.status;
  const nextCampaign = {
    ...workspace.campaign,
    ...patch.campaign,
    ...(status ? { status } : {}),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...workspace,
    ...patch,
    campaign: nextCampaign,
  };
}

function createInputBasedAnalysis({
  asset,
  campaignId,
  channel,
  publishDate,
}: {
  asset: CampaignAsset;
  campaignId: string;
  channel: CampaignChannel;
  publishDate: string;
}): AnalysisResult {
  const hasImage = Boolean(asset.imageDataUrl || asset.usesSampleAsset);
  const hasCopy = asset.copy.trim().length > 0;
  const hasLongCopy = asset.copy.trim().length > 80;
  const isFastChannel = channel === "instagram" || channel === "tiktok";
  const isWeekendPublish = [0, 6].includes(new Date(publishDate).getDay());
  const findings: RiskFinding[] = [];

  if (hasImage) {
    findings.push(createVisualFinding(campaignId));
  }

  if (hasCopy) {
    findings.push(createCopyFinding(campaignId, asset.copy, hasLongCopy));
  }

  if (isWeekendPublish && isFastChannel) {
    findings.push(createScheduleFinding(campaignId));
  }

  const score = Math.min(
    92,
    18 +
      (hasImage ? 26 : 0) +
      (hasCopy ? 18 : 0) +
      (hasLongCopy ? 8 : 0) +
      (isFastChannel ? 6 : 0) +
      (isWeekendPublish ? 7 : 0),
  );
  const riskLevel = getRiskLevelByScore(score);

  return {
    id: `analysis-${campaignId}`,
    campaignId,
    versionId: "v1",
    source: "mock",
    overallRiskScore: score,
    overallRiskLevel: riskLevel,
    summary:
      findings.length > 0
        ? "업로드한 소재에서 담당자 확인이 필요한 검토 후보가 정리되었습니다. 최종 판단은 캠페인 맥락을 아는 사람이 확인해야 합니다."
        : "현재 입력값 기준으로는 주요 검토 후보가 적습니다. 게시 전 기본 담당자 확인은 유지하는 것을 권장합니다.",
    reviewRequired: findings.length > 0,
    categories: findings,
    suggestions: createRevisionSuggestions(hasImage, hasCopy, isFastChannel),
    createdAt: new Date().toISOString(),
  };
}

function createVisualFinding(campaignId: string): RiskFinding {
  return {
    id: `${campaignId}-risk-visual`,
    category: "visual_gesture",
    title: "이미지 시각 요소 후보 검토 필요",
    level: "medium",
    confidence: 0.72,
    description:
      "업로드 이미지의 주요 오브젝트와 손 영역이 일부 민감한 시각 패턴과 유사하게 해석될 가능성이 있어 맥락 확인이 권장됩니다.",
    evidence: [
      "이미지 내 손 또는 제품 접촉 영역이 주요 시선 구간에 위치합니다.",
      "일부 형태는 촬영 각도와 크롭 방식에 따라 다르게 해석될 수 있습니다.",
      "제품을 잡거나 강조하는 일반적인 광고 연출일 가능성도 있습니다.",
    ],
    falsePositiveNote:
      "이 결과는 의도나 성향을 판정하지 않으며, 시각적 유사성에 기반한 검토 후보입니다.",
    regions: [
      {
        id: `${campaignId}-region-visual`,
        type: "hand",
        x: 0.52,
        y: 0.24,
        width: 0.24,
        height: 0.34,
        confidence: 0.86,
        label: "visual pattern candidate",
        landmarks: [
          { x: 0.56, y: 0.31, label: "wrist" },
          { x: 0.63, y: 0.28, label: "thumb_tip" },
          { x: 0.65, y: 0.3, label: "index_tip" },
        ],
      },
    ],
  };
}

function createCopyFinding(
  campaignId: string,
  copy: string,
  hasLongCopy: boolean,
): RiskFinding {
  const copyPreview = copy
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .join(" ");

  return {
    id: `${campaignId}-risk-copy`,
    category: "ocr_text",
    title: "광고 문구 맥락 확인 권장",
    level: hasLongCopy ? "medium" : "low",
    confidence: hasLongCopy ? 0.7 : 0.62,
    description:
      "광고 카피가 게시 채널과 타깃 맥락에 따라 다르게 받아들여질 수 있어 담당자 확인이 권장됩니다.",
    evidence: [
      copyPreview
        ? `입력 문구 일부: "${copyPreview}"`
        : "광고 카피가 입력되었습니다.",
      "문구 톤과 게시 맥락을 함께 확인할 필요가 있습니다.",
      "짧은 문구는 의도와 다르게 축약 해석될 수 있습니다.",
    ],
    falsePositiveNote:
      "문구 검토는 맥락 후보를 정리하는 단계이며, 특정 의도나 성향을 판정하지 않습니다.",
    regions: [
      {
        id: `${campaignId}-region-copy`,
        type: "ocr_text",
        x: 0.14,
        y: 0.66,
        width: 0.58,
        height: 0.12,
        confidence: 0.78,
        label: "copy context candidate",
      },
    ],
  };
}

function createScheduleFinding(campaignId: string): RiskFinding {
  return {
    id: `${campaignId}-risk-schedule`,
    category: "sensitive_date",
    title: "게시 일정 맥락 확인 권장",
    level: "low",
    confidence: 0.58,
    description:
      "빠르게 확산되는 채널의 주말 게시 일정은 담당자 응답 가능 시간과 함께 검토하는 것이 좋습니다.",
    evidence: [
      "SNS 채널은 게시 직후 반응 속도가 빠를 수 있습니다.",
      "주말 게시 시 브랜드/PR 담당자의 확인 가능 시간을 점검하는 것이 좋습니다.",
    ],
    falsePositiveNote:
      "일정 검토는 운영 리스크 후보이며, 특정 사회적 의미를 단정하지 않습니다.",
  };
}

function createRevisionSuggestions(
  hasImage: boolean,
  hasCopy: boolean,
  isFastChannel: boolean,
): RevisionSuggestion[] {
  const suggestions: RevisionSuggestion[] = [];

  if (hasImage) {
    suggestions.push({
      id: "suggestion-image",
      target: "image",
      title: "대체 컷 함께 검토",
      description:
        "주요 손동작이나 크롭이 다르게 보이는 대체 이미지를 함께 올려 담당자가 비교할 수 있게 하세요.",
    });
  }

  if (hasCopy) {
    suggestions.push({
      id: "suggestion-copy",
      target: "copy",
      title: "문구 톤 명확화",
      description:
        "짧은 광고 문구는 맥락이 생략될 수 있으므로, 제품/혜택/대상 맥락을 한 줄 더 보강하는 방안을 검토하세요.",
    });
  }

  if (isFastChannel) {
    suggestions.push({
      id: "suggestion-process",
      target: "review_process",
      title: "게시 전 담당자 확인",
      description:
        "확산 속도가 빠른 채널은 게시 전 브랜드/PR 담당자 의견을 취합한 뒤 최종 결재로 넘기는 흐름을 권장합니다.",
    });
  }

  return suggestions;
}

function createApprovalSteps(
  campaignId: string,
  timestamp: string,
): ApprovalStep[] {
  return [
    {
      id: `${campaignId}-step-upload`,
      campaignId,
      order: 1,
      title: "소재 등록",
      ownerName: "현재 사용자",
      role: "MARKETER",
      status: "completed",
      description: "이미지와 광고 카피를 등록했습니다.",
      decision: "approve",
      note: "로컬 mock workspace에 저장되었습니다.",
      updatedAt: timestamp,
    },
    {
      id: `${campaignId}-step-ai`,
      campaignId,
      order: 2,
      title: "AI 1차 검토",
      ownerName: "BrandGuard mock AI",
      role: "ADMIN",
      status: "completed",
      description: "업로드 소재 기반 검토 후보를 생성했습니다.",
      decision: "approve",
      note: "검토 후보와 수정 제안이 생성되었습니다.",
      updatedAt: timestamp,
    },
    {
      id: `${campaignId}-step-stakeholder`,
      campaignId,
      order: 3,
      title: "담당자 의견 취합",
      ownerName: "브랜드 담당자",
      role: "BRAND_MANAGER",
      status: "in_progress",
      description: "AI 의견과 실제 소재 맥락을 담당자가 다시 확인합니다.",
    },
    {
      id: `${campaignId}-step-final`,
      campaignId,
      order: 4,
      title: "최종 결재",
      ownerName: "최종 결정자",
      role: "FINAL_APPROVER",
      status: "pending",
      description: "담당자 의견 취합 후 최종 승인 여부를 결정합니다.",
    },
  ];
}

function createInitialAuditLog(
  campaignId: string,
  timestamp: string,
): AuditLogEntry[] {
  return [
    {
      id: `${campaignId}-audit-ai`,
      actorName: "BrandGuard mock AI",
      action: "AI 1차 검토 완료",
      fromStatus: "ANALYZING",
      toStatus: "AI_REVIEWED",
      note: "업로드 소재를 기반으로 검토 후보와 수정 제안을 생성했습니다.",
      createdAt: timestamp,
    },
    {
      id: `${campaignId}-audit-review`,
      actorName: "현재 사용자",
      action: "담당자 검토 요청",
      fromStatus: "AI_REVIEWED",
      toStatus: "STAKEHOLDER_REVIEW",
      note: "AI 1차 의견을 담당자가 확인할 수 있도록 리뷰 화면으로 전달했습니다.",
      createdAt: timestamp,
    },
  ];
}

function getRiskLevelByScore(score: number): RiskLevel {
  if (score >= 85) {
    return "critical";
  }

  if (score >= 70) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

function isCampaignWorkspace(value: unknown): value is CampaignWorkspace {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CampaignWorkspace>;

  return Boolean(
    candidate.campaign?.id &&
      candidate.analysis?.campaignId &&
      candidate.asset &&
      Array.isArray(candidate.approvalSteps) &&
      Array.isArray(candidate.auditLogEntries) &&
      Array.isArray(candidate.comments),
  );
}
