import type {
  VisionAnalysisProvider,
  VisionAnalysisResult,
} from "@/features/vision-ai/types";

export const mockVisionProvider: VisionAnalysisProvider = {
  async analyzeImages(input): Promise<VisionAnalysisResult> {
    return {
      findings: [],
      summary:
        input.imageUrls.length > 0
          ? "Mock AI 이미지 분석 모드입니다. 실제 이미지 판단이나 최종 판정은 제공하지 않습니다."
          : "Mock AI 이미지 분석 모드입니다. 분석할 이미지가 없습니다.",
    };
  },
};
