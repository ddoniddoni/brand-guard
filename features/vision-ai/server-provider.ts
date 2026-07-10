import "server-only";
import type { VisionAnalysisProvider } from "@/features/vision-ai/types";

export const serverVisionProvider: VisionAnalysisProvider = {
  async analyzeImages() {
    return {
      findings: [],
      summary:
        "서버 AI provider 연결 정보가 감지되었습니다. 실제 이미지 분석 endpoint를 연결하면 여기에서 서버 사이드 호출을 실행합니다.",
    };
  },
};
