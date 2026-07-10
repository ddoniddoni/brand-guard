import {
  KeyRound,
  Server,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import type { VisionConnection } from "@/features/vision-ai/types";

const connectionCopy = {
  configured: {
    heading: "서버 연결 준비됨",
    metric: "구성됨",
    status: "AI 이미지 분석 server provider가 준비되었습니다",
  },
  connection_failed: {
    heading: "서버 설정 확인 필요",
    metric: "설정 필요",
    status: "AI 이미지 분석 연결을 완료하지 못했습니다",
  },
  mock_mode: {
    heading: "Mock provider로 동작 중",
    metric: "Mock",
    status: "AI 이미지 분석 mock 모드",
  },
  not_configured: {
    heading: "OCR 기반 검수는 계속 사용할 수 있습니다",
    metric: "미연결",
    status: "AI 이미지 분석 미연결",
  },
} as const;

export function AiConnectionStatus({
  connection,
}: {
  connection: VisionConnection;
}) {
  const copy = connectionCopy[connection.state];
  const StatusIcon =
    connection.state === "connection_failed" ? TriangleAlert : ShieldCheck;
  const keyStatus =
    connection.state === "configured"
      ? "서버 환경 변수에 설정됨"
      : "클라이언트에 저장하지 않음";

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          description="텍스트 정책 매칭과 OCR 검수는 모든 상태에서 사용 가능"
          icon={StatusIcon}
          title="연결 상태"
          value={copy.metric}
        />
        <MetricCard
          description="실제 외부 API 호출은 서버 provider에서만 처리"
          icon={Server}
          title="Provider"
          value={connection.provider.replace("Provider", "")}
        />
        <MetricCard
          description="API Key 값은 브라우저와 localStorage에 전달하지 않음"
          icon={KeyRound}
          title="보안 원칙"
          value="Server only"
        />
      </section>

      <section className="app-panel p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
          <Sparkles aria-hidden="true" size={16} strokeWidth={1.8} />
          {copy.status}
        </p>
        <h2 className="mt-2 text-2xl font-normal">{copy.heading}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
          {connection.detail}
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-[var(--color-muted)]">
          AI 이미지 분석 결과는 자동 확정 판정이 아니며, 실제 캠페인 맥락에
          따라 담당자 검토가 필요합니다.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Provider</span>
            <input
              className="app-input mt-2 h-11 w-full px-3 text-sm"
              disabled
              value={connection.provider}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">API Key</span>
            <input
              className="app-input mt-2 h-11 w-full px-3 text-sm"
              disabled
              value={keyStatus}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
