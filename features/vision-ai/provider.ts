import "server-only";
import { disabledVisionProvider } from "@/features/vision-ai/disabled-provider";
import { mockVisionProvider } from "@/features/vision-ai/mock-provider";
import { serverVisionProvider } from "@/features/vision-ai/server-provider";
import type {
  VisionAnalysisProvider,
  VisionConnection,
  VisionProviderId,
} from "@/features/vision-ai/types";

const providers: Record<VisionProviderId, VisionAnalysisProvider> = {
  disabledVisionProvider,
  mockVisionProvider,
  serverVisionProvider,
};

export function getVisionProviderSetup() {
  const connection = resolveVisionConnection();

  return {
    connection,
    provider: providers[connection.provider],
  };
}

function resolveVisionConnection(): VisionConnection {
  const mode = process.env.VISION_AI_MODE?.trim().toLowerCase();

  if (mode === "mock") {
    return {
      detail:
        "Mock provider가 활성화되었습니다. 실제 API Key나 외부 이미지 분석 호출은 사용하지 않습니다.",
      provider: "mockVisionProvider",
      state: "mock_mode",
    };
  }

  if (mode === "server") {
    if (process.env.VISION_AI_API_KEY?.trim()) {
      return {
        detail:
          "서버 환경 변수에 API Key가 설정되었습니다. 실제 provider endpoint 연결 전까지는 OCR 기반 검수가 계속 사용됩니다.",
        provider: "serverVisionProvider",
        state: "configured",
      };
    }

    return {
      detail:
        "Server provider 모드이지만 API Key가 설정되지 않았습니다. 서버 환경 변수를 확인하세요.",
      provider: "serverVisionProvider",
      state: "connection_failed",
    };
  }

  return {
    detail:
      "현재는 대본/문구 검사와 Tesseract.js OCR 기반 이미지 문구 검사가 가능합니다. API Key를 연결하면 이미지의 시각 요소와 장면 구성까지 추가로 검토할 수 있습니다.",
    provider: "disabledVisionProvider",
    state: "not_configured",
  };
}
