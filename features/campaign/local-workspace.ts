import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from "@/features/campaign/types";
import type { CampaignCreateInput } from "@/features/campaign/schema";
import type {
  CampaignVersion,
  CopyDiffSegment,
  VersionComparison,
} from "@/features/campaign/version-types";
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
  assetVersions?: CampaignAssetVersion[];
  auditLogEntries: AuditLogEntry[];
  campaign: Campaign;
  comments: ReviewerComment[];
  versionComparison?: VersionComparison | null;
};

export type CampaignAssetVersion = CampaignAsset & {
  analysis: AnalysisResult;
  createdAt: string;
  id: string;
  imageNote: string;
  label: string;
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
    | "analysis"
    | "approvalSteps"
    | "asset"
    | "assetVersions"
    | "auditLogEntries"
    | "comments"
    | "versionComparison"
  >
> & {
  campaign?: Partial<Campaign>;
  status?: CampaignStatus;
};

export type RevisionUploadInput = {
  copy: string;
  imageDataUrl?: string;
  imageFileName?: string;
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
    assetVersions: [
      {
        ...asset,
        analysis,
        createdAt: timestamp,
        id: "v1",
        imageNote: getAssetImageNote(asset),
        label: "1차 원본",
      },
    ],
    auditLogEntries: createInitialAuditLog(campaignId, timestamp),
    campaign,
    comments: [],
    versionComparison: null,
  };
}

export function createMockCampaignAsset(campaign: Campaign): CampaignAsset {
  return {
    copy:
      campaign.id === "cmp-001"
        ? "여름의 산뜻함을 먼저 만나보세요.\n신제품 공개 전 브랜드 리스크를 함께 확인합니다."
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

export function createRevisionWorkspace(
  workspace: CampaignWorkspace,
  input: RevisionUploadInput,
): CampaignWorkspace {
  const timestamp = new Date().toISOString();
  const previousAsset = workspace.asset;
  const nextAsset: CampaignAsset = {
    copy: input.copy.trim() || previousAsset.copy,
    imageDataUrl: input.imageDataUrl ?? previousAsset.imageDataUrl,
    imageFileName: input.imageFileName ?? previousAsset.imageFileName,
    source: input.imageDataUrl ? "upload" : previousAsset.source,
    usesSampleAsset: input.imageDataUrl ? false : previousAsset.usesSampleAsset,
  };
  const isImageReplaced = Boolean(input.imageDataUrl);
  const nextAnalysis = createRevisionAnalysis({
    asset: nextAsset,
    baseAnalysis: workspace.analysis,
    campaignId: workspace.campaign.id,
    isImageReplaced,
  });
  const previousVersions =
    workspace.assetVersions && workspace.assetVersions.length > 0
      ? workspace.assetVersions
      : [
          {
            ...previousAsset,
            analysis: workspace.analysis,
            createdAt: workspace.campaign.createdAt,
            id: "v1",
            imageNote: getAssetImageNote(previousAsset),
            label: "1차 원본",
          },
        ];
  const nextAssetVersion: CampaignAssetVersion = {
    ...nextAsset,
    analysis: nextAnalysis,
    createdAt: timestamp,
    id: `v${previousVersions.length + 1}`,
    imageNote: isImageReplaced
      ? "수정 업로드된 대체 이미지입니다. 주요 시각 후보가 줄어든 상태로 재분석되었습니다."
      : "이미지는 유지하고 문구를 수정한 버전입니다. 문구 맥락 중심으로 재분석되었습니다.",
    label: `${previousVersions.length + 1}차 수정본`,
  };
  const beforeVersion = previousVersions[0];
  const comparison = createVersionComparisonFromAssets({
    after: nextAssetVersion,
    before: beforeVersion,
    campaignId: workspace.campaign.id,
  });
  const auditEntry: AuditLogEntry = {
    id: `${workspace.campaign.id}-audit-revision-${timestamp}`,
    actorName: "현재 사용자",
    action: "수정 버전 업로드 및 재분석",
    fromStatus: workspace.campaign.status,
    toStatus: "AI_REVIEWED",
    note: "2차 소재를 업로드하고 모의 AI 1차 검토를 다시 실행했습니다.",
    createdAt: timestamp,
  };

  return {
    ...workspace,
    analysis: nextAnalysis,
    approvalSteps: resetApprovalStepsForRevision(
      workspace.approvalSteps,
      timestamp,
    ),
    asset: nextAsset,
    assetVersions: [...previousVersions, nextAssetVersion],
    auditLogEntries: [auditEntry, ...workspace.auditLogEntries],
    campaign: {
      ...workspace.campaign,
      riskLevel: nextAnalysis.overallRiskLevel,
      riskScore: nextAnalysis.overallRiskScore,
      status: "AI_REVIEWED",
      updatedAt: timestamp,
    },
    versionComparison: comparison,
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

function createRevisionAnalysis({
  asset,
  baseAnalysis,
  campaignId,
  isImageReplaced,
}: {
  asset: CampaignAsset;
  baseAnalysis: AnalysisResult;
  campaignId: string;
  isImageReplaced: boolean;
}): AnalysisResult {
  const copyFinding = createCopyFinding(campaignId, asset.copy, false);
  const findings: RiskFinding[] = [
    {
      ...copyFinding,
      id: `${campaignId}-risk-copy-revised`,
      confidence: 0.42,
      description:
        "수정된 문구는 의미가 더 명확하지만, 게시 전 최종 톤 확인은 권장됩니다.",
      evidence: [
        "수정본에서 제품/혜택 맥락이 더 명확하게 표현되었습니다.",
        "게시 채널과 타깃 기준의 최종 문구 톤 확인이 필요합니다.",
      ],
      falsePositiveNote:
        "이 결과는 문구의 의도나 성향을 판정하지 않으며, 표현 맥락 확인을 돕는 검토 후보입니다.",
      level: "low" as const,
      title: "수정 문구 최종 확인 권장",
    },
  ];

  if (!isImageReplaced) {
    findings.unshift({
      ...createVisualFinding(campaignId),
      id: `${campaignId}-risk-visual-revised`,
      confidence: 0.48,
      description:
        "이미지는 유지되었으므로 주요 시각 후보가 낮은 신뢰도로 남아 있습니다. 필요 시 대체 컷 비교가 권장됩니다.",
      level: "low" as const,
      title: "기존 이미지 후보 낮은 수준 확인",
    });
  }

  const score = Math.max(
    24,
    Math.min(baseAnalysis.overallRiskScore - (isImageReplaced ? 32 : 18), 52),
  );

  return {
    id: `analysis-${campaignId}-v2`,
    campaignId,
    versionId: "v2",
    source: "mock",
    overallRiskScore: score,
    overallRiskLevel: getRiskLevelByScore(score),
    summary:
      "수정 버전에서 일부 검토 후보가 줄었습니다. 남은 후보는 최종 게시 전 담당자가 맥락을 확인해야 합니다.",
    reviewRequired: findings.length > 0,
    categories: findings,
    suggestions: [
      {
        id: `${campaignId}-suggestion-final-review`,
        target: "review_process",
        title: "최종 결재 요청",
        description:
          "수정본 재분석 결과와 담당자 의견을 함께 확인한 뒤 최종 결재로 넘기세요.",
      },
    ],
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
        label: "시각 패턴 후보",
        landmarks: [
          { x: 0.56, y: 0.31, label: "손목" },
          { x: 0.63, y: 0.28, label: "엄지 끝" },
          { x: 0.65, y: 0.3, label: "검지 끝" },
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
        label: "문구 맥락 후보",
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
      note: "로컬 모의 작업 공간에 저장되었습니다.",
      updatedAt: timestamp,
    },
    {
      id: `${campaignId}-step-ai`,
      campaignId,
      order: 2,
      title: "AI 1차 검토",
      ownerName: "브랜드가드 모의 AI",
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
      actorName: "브랜드가드 모의 AI",
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

function createVersionComparisonFromAssets({
  after,
  before,
  campaignId,
}: {
  after: CampaignAssetVersion;
  before: CampaignAssetVersion;
  campaignId: string;
}): VersionComparison {
  const beforeVersion = createCampaignVersion({
    assetVersion: before,
    campaignId,
    status: "NEEDS_REVISION",
  });
  const afterVersion = createCampaignVersion({
    assetVersion: after,
    campaignId,
    status: "AI_REVIEWED",
  });

  return {
    campaignId,
    before: beforeVersion,
    after: afterVersion,
    scoreDelta: after.analysis.overallRiskScore - before.analysis.overallRiskScore,
    copyDiff: createCopyDiff(before.copy, after.copy),
    removedFindings: getRemovedFindings(
      before.analysis.categories,
      after.analysis.categories,
    ),
    addedFindings: after.analysis.categories,
  };
}

function createCampaignVersion({
  assetVersion,
  campaignId,
  status,
}: {
  assetVersion: CampaignAssetVersion;
  campaignId: string;
  status: CampaignVersion["status"];
}): CampaignVersion {
  return {
    id: assetVersion.id,
    campaignId,
    label: assetVersion.label,
    riskScore: assetVersion.analysis.overallRiskScore,
    status,
    createdAt: assetVersion.createdAt,
    copy: assetVersion.copy,
    imageNote: assetVersion.imageNote,
    findings: assetVersion.analysis.categories,
  };
}

function createCopyDiff(beforeCopy: string, afterCopy: string): CopyDiffSegment[] {
  if (beforeCopy.trim() === afterCopy.trim()) {
    return [{ type: "unchanged", text: beforeCopy || "문구 변경 없음" }];
  }

  return [
    { type: "removed", text: beforeCopy || "기존 문구 없음" },
    { type: "added", text: afterCopy || "수정 문구 없음" },
  ];
}

function getRemovedFindings(
  beforeFindings: RiskFinding[],
  afterFindings: RiskFinding[],
) {
  const afterCategories = new Set(afterFindings.map((finding) => finding.category));

  return beforeFindings.filter(
    (finding) => !afterCategories.has(finding.category),
  );
}

function getAssetImageNote(asset: CampaignAsset) {
  if (asset.imageFileName) {
    return `${asset.imageFileName} 업로드 소재입니다. 이미지와 카피를 함께 검토합니다.`;
  }

  if (asset.usesSampleAsset) {
    return "샘플 홍보 소재입니다. 모의 시각 후보와 OCR 문구 후보가 함께 표시됩니다.";
  }

  return "이미지 없이 문구 중심으로 등록된 소재입니다.";
}

function resetApprovalStepsForRevision(
  steps: ApprovalStep[],
  timestamp: string,
) {
  return steps.map((step) => {
    if (step.title === "소재 등록" || step.title === "AI 1차 검토") {
      return {
        ...step,
        status: "completed" as const,
        updatedAt: timestamp,
      };
    }

    if (step.title === "담당자 의견 취합") {
      return {
        ...step,
        status: "pending" as const,
        note: "수정본 재분석 후 담당자 확인 대기",
        updatedAt: timestamp,
      };
    }

    if (step.title === "최종 결재") {
      return {
        ...step,
        status: "pending" as const,
        note: undefined,
        updatedAt: undefined,
      };
    }

    return step;
  });
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
