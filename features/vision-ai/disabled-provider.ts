import type { VisionAnalysisProvider } from "@/features/vision-ai/types";

export const disabledVisionProvider: VisionAnalysisProvider = {
  async analyzeImages() {
    return {
      findings: [],
      summary: "AI 이미지 분석이 연결되지 않았습니다.",
    };
  },
};
