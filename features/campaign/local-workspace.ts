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
  ImageRegion,
  RiskFinding,
  RiskLevel,
  RevisionSuggestion,
} from "@/features/risk-analysis/types";
import type {
  OcrExtractionResult,
  OcrExtractionStatus,
} from "@/features/risk-analysis/ocr";
import type {
  ApprovalStep,
  AuditLogEntry,
  RequesterOpinion,
  ReviewerComment,
} from "@/features/review-workflow/types";

const storageKey = "brandguard.campaign-workspaces.v1";
const storageVersion = 2;
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
  ocrConfidence?: number;
  ocrErrorMessage?: string;
  ocrRegions?: ImageRegion[];
  ocrStatus?: OcrExtractionStatus;
  ocrText?: string;
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
  requesterOpinion?: RequesterOpinion | null;
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
  ocrResult?: OcrExtractionResult;
  requesterName: string;
  usesSampleAsset: boolean;
};

type CreateDraftCampaignWorkspaceInput = Partial<
  Pick<
    CampaignCreateInput,
    | "brandName"
    | "channel"
    | "copy"
    | "industry"
    | "name"
    | "publishDate"
    | "targetAudience"
  >
> & {
  campaignId?: string;
  imageDataUrl?: string;
  imageFileName?: string;
  requesterName: string;
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
    | "requesterOpinion"
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
    ocrConfidence: input.ocrResult?.confidence,
    ocrErrorMessage: input.ocrResult?.errorMessage,
    ocrRegions: input.ocrResult?.regions,
    ocrStatus: input.ocrResult?.status,
    ocrText: input.ocrResult?.text,
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
    status: "AI_REVIEWED",
    riskScore: analysis.overallRiskScore,
    riskLevel: analysis.overallRiskLevel,
    requesterName: input.requesterName,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    analysis,
    approvalSteps: createApprovalSteps(campaignId, timestamp, input.requesterName),
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
    auditLogEntries: createInitialAuditLog(
      campaignId,
      timestamp,
      input.requesterName,
    ),
    campaign,
    comments: [],
    requesterOpinion: null,
    versionComparison: null,
  };
}

export function createDraftCampaignWorkspace(
  input: CreateDraftCampaignWorkspaceInput,
): CampaignWorkspace {
  const timestamp = new Date().toISOString();
  const campaignId =
    input.campaignId?.trim() || `cmp-local-draft-${Date.now().toString(36)}`;
  const asset: CampaignAsset = {
    copy: input.copy?.trim() ?? "",
    imageDataUrl: input.imageDataUrl,
    imageFileName: input.imageFileName,
    source: input.imageDataUrl ? "upload" : "mock",
    usesSampleAsset: false,
  };
  const analysis = createDraftAnalysis(campaignId, timestamp);
  const campaign: Campaign = {
    id: campaignId,
    name: input.name?.trim() || "제목 없는 초안",
    brandName: input.brandName?.trim() || "브랜드 미입력",
    channel: input.channel ?? "instagram",
    publishDate: getSafeDraftPublishDate(input.publishDate),
    targetAudience: input.targetAudience?.trim() || "타깃 미입력",
    industry: input.industry?.trim() || "업종 미입력",
    status: "DRAFT",
    riskScore: analysis.overallRiskScore,
    riskLevel: analysis.overallRiskLevel,
    requesterName: input.requesterName,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    analysis,
    approvalSteps: createDraftApprovalSteps(campaignId, timestamp, input.requesterName),
    asset,
    assetVersions: [
      {
        ...asset,
        analysis,
        createdAt: timestamp,
        id: "draft",
        imageNote: getAssetImageNote(asset),
        label: "저장된 초안",
      },
    ],
    auditLogEntries: [
      {
        id: `${campaignId}-audit-draft-saved-${timestamp}`,
        campaignId,
        actorName: input.requesterName,
        action: "campaign_created",
        toStatus: "DRAFT",
        message: "검토 요청 초안을 저장했습니다.",
        createdAt: timestamp,
      },
    ],
    campaign,
    comments: [],
    requesterOpinion: null,
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
  actorName = workspace.campaign.requesterName,
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
      ? "수정 업로드된 대체 이미지입니다. OCR 문구와 입력 카피 맥락 중심으로 재분석되었습니다."
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
    campaignId: workspace.campaign.id,
    actorName,
    action: "revision_uploaded",
    fromStatus: workspace.campaign.status,
    toStatus: "AI_REVIEWED",
    message: "2차 소재를 업로드하고 모의 AI 1차 검토를 다시 실행했습니다.",
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
      currentApprovalStepId: undefined,
      riskLevel: nextAnalysis.overallRiskLevel,
      riskScore: nextAnalysis.overallRiskScore,
      status: "AI_REVIEWED",
      updatedAt: timestamp,
    },
    requesterOpinion: null,
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
  const hasOcrText = Boolean(asset.ocrText?.trim());
  const hasLongCopy = asset.copy.trim().length > 80;
  const isFastChannel = channel === "instagram" || channel === "tiktok";
  const isWeekendPublish = [0, 6].includes(new Date(publishDate).getDay());
  const findings: RiskFinding[] = [];

  if (hasOcrText || asset.ocrStatus === "empty" || asset.ocrStatus === "failed") {
    findings.push(createOcrFinding(campaignId, asset));
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
      (hasOcrText ? 16 : hasImage ? 4 : 0) +
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
        ? "업로드한 소재에서 작성자와 결재자 확인이 필요한 검토 후보가 정리되었습니다. 최종 판단은 소재 맥락을 아는 사람이 확인해야 합니다."
        : "현재 입력값 기준으로는 주요 검토 후보가 적습니다. 게시 전 기본 작성자 확인은 유지하는 것을 권장합니다.",
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
      "수정 버전에서 일부 검토 후보가 줄었습니다. 남은 후보는 최종 게시 전 작성자와 결재자가 맥락을 확인해야 합니다.",
    reviewRequired: findings.length > 0,
    categories: findings,
    suggestions: [
      {
        id: `${campaignId}-suggestion-final-review`,
        target: "review_process",
        title: "결재 라인 확인",
        description:
          "수정본 재분석 결과와 작성자 의견을 함께 확인한 뒤 결재 라인으로 넘기세요.",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function createOcrFinding(campaignId: string, asset: CampaignAsset): RiskFinding {
  const ocrText = asset.ocrText?.trim() ?? "";
  const ocrPreview = ocrText
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 16)
    .join(" ");
  const hasOcrText = Boolean(ocrPreview);

  if (!hasOcrText) {
    return {
      id: `${campaignId}-risk-ocr`,
      category: "ocr_text",
      title: "이미지 OCR 확인 결과",
      level: "low",
      confidence: asset.ocrStatus === "failed" ? 0.2 : 0.35,
      description:
        asset.ocrStatus === "failed"
          ? "이미지 OCR을 완료하지 못했습니다. 입력된 광고 카피와 원본 이미지를 사람이 함께 확인해야 합니다."
          : "이미지에서 의미 있는 문구가 OCR 후보로 추출되지 않았습니다. 원본 이미지에 작은 글자가 있다면 직접 확인이 필요합니다.",
      evidence: [
        asset.ocrErrorMessage ??
          "Tesseract.js OCR 결과에서 검토 가능한 문구 후보가 비어 있습니다.",
        "OCR 결과는 이미지 해상도, 폰트, 대비에 따라 누락될 수 있습니다.",
      ],
      falsePositiveNote:
        "OCR 결과는 문구 추출 보조 정보이며, 이미지 내용을 완전히 판정하지 않습니다.",
      regions: asset.ocrRegions,
    };
  }

  return {
    id: `${campaignId}-risk-ocr`,
    category: "ocr_text",
    title: "이미지 OCR 문구 확인 권장",
    level: ocrText.length > 80 ? "medium" : "low",
    confidence: asset.ocrConfidence ?? 0.62,
    description:
      "업로드 이미지에서 추출된 OCR 문구가 광고 카피와 게시 맥락에 맞는지 작성자와 결재자 확인이 권장됩니다.",
    evidence: [
      `OCR 추출 문구 일부: "${ocrPreview}"`,
      "이미지 안의 문구는 작은 글자, 배경 대비, 폰트에 따라 오인식될 수 있습니다.",
      "입력 광고 카피와 이미지 내 문구가 서로 다른 의미로 읽히지 않는지 확인하세요.",
    ],
    falsePositiveNote:
      "OCR 결과는 이미지 속 문구 후보를 추출한 값이며, 문구 의도나 사회적 의미를 판정하지 않습니다.",
    regions: asset.ocrRegions,
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
      "광고 카피가 게시 채널과 타깃 맥락에 따라 다르게 받아들여질 수 있어 작성자와 결재자 확인이 권장됩니다.",
    evidence: [
      copyPreview
        ? `입력 문구 일부: "${copyPreview}"`
        : "광고 카피가 입력되었습니다.",
      "문구 톤과 게시 맥락을 함께 확인할 필요가 있습니다.",
      "짧은 문구는 의도와 다르게 축약 해석될 수 있습니다.",
    ],
    falsePositiveNote:
      "문구 검토는 맥락 후보를 정리하는 단계이며, 특정 의도나 성향을 판정하지 않습니다.",
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
      "빠르게 확산되는 채널의 주말 게시 일정은 결재자 응답 가능 시간과 함께 검토하는 것이 좋습니다.",
    evidence: [
      "SNS 채널은 게시 직후 반응 속도가 빠를 수 있습니다.",
      "주말 게시 시 브랜드/PR 결재자의 확인 가능 시간을 점검하는 것이 좋습니다.",
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
      title: "상품/촬영 설명서 기준 명시",
      description:
        "손동작, 제품 파지 방식, 크롭 기준처럼 자동 판정하기 어려운 시각 요소는 상품 설명서나 촬영 가이드에 명확히 남기세요.",
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
      title: "게시 전 결재 라인 확인",
      description:
        "확산 속도가 빠른 채널은 게시 전 작성자 의견과 브랜드/PR 결재자 확인을 함께 남기는 흐름을 권장합니다.",
    });
  }

  return suggestions;
}

function createApprovalSteps(
  campaignId: string,
  timestamp: string,
  requesterName: string,
): ApprovalStep[] {
  return [
    {
      id: `${campaignId}-step-ai`,
      campaignId,
      order: 1,
      title: "AI 1차 검토",
      ownerName: "브랜드가드 모의 AI",
      role: "ADMIN",
      status: "approved",
      description: "업로드 소재 기반 검토 후보를 생성했습니다.",
      decision: "approve",
      comment: "검토 후보와 수정 제안이 생성되었습니다.",
      decidedAt: timestamp,
    },
    {
      id: `${campaignId}-step-requester-opinion`,
      campaignId,
      order: 2,
      title: "작성자 의견",
      ownerName: requesterName,
      role: "REQUESTER",
      status: "in_progress",
      description: "AI 결과가 실제 소재 맥락과 맞는지 작성자가 의견을 남깁니다.",
    },
    {
      id: `${campaignId}-step-marketing`,
      campaignId,
      order: 3,
      title: "마케팅 리더",
      ownerName: "마케팅 리더",
      role: "MARKETING_REVIEWER",
      status: "pending",
      description: "작성자 의견과 AI 검토 후보를 함께 확인합니다.",
    },
    {
      id: `${campaignId}-step-final`,
      campaignId,
      order: 4,
      title: "최종 결재",
      ownerName: "최종 결정자",
      role: "FINAL_APPROVER",
      status: "pending",
      description: "전체 의견과 감사 로그를 보고 최종 게시 가능 여부를 결정합니다.",
    },
  ];
}

function createDraftApprovalSteps(
  campaignId: string,
  timestamp: string,
  requesterName: string,
): ApprovalStep[] {
  return [
    {
      id: `${campaignId}-step-ai`,
      campaignId,
      order: 1,
      title: "AI 1차 검토",
      ownerName: "브랜드가드 모의 AI",
      role: "ADMIN",
      status: "pending",
      description: "작성자가 AI 1차 검토를 시작하면 후보를 생성합니다.",
    },
    {
      id: `${campaignId}-step-requester-opinion`,
      campaignId,
      order: 2,
      title: "작성자 의견",
      ownerName: requesterName,
      role: "REQUESTER",
      status: "pending",
      description: "AI 결과가 생성된 뒤 작성자가 의견을 남깁니다.",
    },
    {
      id: `${campaignId}-step-marketing`,
      campaignId,
      order: 3,
      title: "마케팅 리더",
      ownerName: "마케팅 리더",
      role: "MARKETING_REVIEWER",
      status: "pending",
      description: "작성자 의견과 AI 검토 후보를 함께 확인합니다.",
    },
    {
      id: `${campaignId}-step-final`,
      campaignId,
      order: 4,
      title: "최종 결재",
      ownerName: "최종 결정자",
      role: "FINAL_APPROVER",
      status: "pending",
      description: "전체 의견과 감사 로그를 보고 최종 게시 가능 여부를 결정합니다.",
    },
  ];
}

function createDraftAnalysis(
  campaignId: string,
  timestamp: string,
): AnalysisResult {
  return {
    id: `analysis-${campaignId}-draft`,
    campaignId,
    versionId: "draft",
    source: "mock",
    overallRiskScore: 0,
    overallRiskLevel: "low",
    summary:
      "초안 저장 상태입니다. AI 1차 검토를 시작하면 검토 후보와 수정 제안이 생성됩니다.",
    reviewRequired: false,
    categories: [],
    suggestions: [],
    createdAt: timestamp,
  };
}

function getSafeDraftPublishDate(value?: string) {
  if (value && !Number.isNaN(Date.parse(value))) {
    return value;
  }

  return new Date().toISOString().slice(0, 10);
}

function createInitialAuditLog(
  campaignId: string,
  timestamp: string,
  actorName = "현재 사용자",
): AuditLogEntry[] {
  return [
    {
      id: `${campaignId}-audit-created`,
      campaignId,
      actorName,
      action: "campaign_created",
      toStatus: "DRAFT",
      message: "검토 요청을 생성하고 소재를 등록했습니다.",
      createdAt: timestamp,
    },
    {
      id: `${campaignId}-audit-analysis-started`,
      campaignId,
      actorName,
      action: "analysis_started",
      fromStatus: "DRAFT",
      toStatus: "ANALYZING",
      message: "AI 1차 검토를 시작했습니다.",
      createdAt: timestamp,
    },
    {
      id: `${campaignId}-audit-ai`,
      campaignId,
      actorName: "브랜드가드 모의 AI",
      action: "analysis_completed",
      fromStatus: "ANALYZING",
      toStatus: "AI_REVIEWED",
      message: "업로드 소재를 기반으로 검토 후보와 수정 제안을 생성했습니다.",
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
    return "샘플 홍보 소재입니다. OCR 문구 후보를 중심으로 표시됩니다.";
  }

  return "이미지 없이 문구 중심으로 등록된 소재입니다.";
}

function resetApprovalStepsForRevision(
  steps: ApprovalStep[],
  timestamp: string,
) {
  return steps.map((step) => {
    if (step.title === "AI 1차 검토") {
      return {
        ...step,
        status: "approved" as const,
        decidedAt: timestamp,
      };
    }

    if (step.title === "작성자 의견") {
      return {
        ...step,
        status: "in_progress" as const,
        comment: "수정본 재분석 후 작성자 의견 대기",
        decidedAt: undefined,
      };
    }

    if (step.title === "마케팅 리더" || step.title === "최종 결재") {
      return {
        ...step,
        status: "pending" as const,
        comment: undefined,
        decidedAt: undefined,
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
