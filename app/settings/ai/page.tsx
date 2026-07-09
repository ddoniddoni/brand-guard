import { KeyRound, Server, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";

export default function AiSettingsPage() {
  return (
    <AppShell activePath="/settings/ai">
      <PageHeader
        description="AI 이미지 분석은 확장 기능입니다. API Key 연결 전에도 텍스트 검사와 OCR 검사는 계속 동작합니다."
        eyebrow="AI 설정"
        title="AI 이미지 분석 연결"
      />
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            description="현재는 OCR 기반 이미지 문구 검사만 사용"
            icon={ShieldCheck}
            title="연결 상태"
            value="미연결"
          />
          <MetricCard
            description="서버 사이드 provider 자리만 준비"
            icon={Server}
            title="Provider"
            value="Disabled"
          />
          <MetricCard
            description="클라이언트 저장소에 API Key를 저장하지 않음"
            icon={KeyRound}
            title="보안 원칙"
            value="Server"
          />
        </section>

        <section className="app-panel p-6">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            AI 이미지 분석 미연결
          </p>
          <h2 className="mt-2 text-2xl font-normal">
            OCR 기반 검수는 계속 사용할 수 있습니다
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            현재는 대본/문구 검사와 Tesseract.js OCR 기반 이미지 문구 검사가
            가능합니다. API Key를 연결하면 이미지의 시각 요소와 장면 구성까지
            추가로 검토할 수 있습니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Provider</span>
              <input
                className="app-input mt-2 h-11 w-full px-3 text-sm"
                disabled
                value="disabledVisionProvider"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">API Key</span>
              <input
                className="app-input mt-2 h-11 w-full px-3 text-sm"
                disabled
                placeholder="서버 설정 이후 연결 가능"
                type="password"
              />
            </label>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
