import { AiConnectionStatus } from "@/components/ai/AiConnectionStatus";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { getVisionProviderSetup } from "@/features/vision-ai/provider";

export const dynamic = "force-dynamic";

export default function AiSettingsPage() {
  const { connection } = getVisionProviderSetup();

  return (
    <AppShell activePath="/settings/ai">
      <PageHeader
        description="AI 이미지 분석은 확장 기능입니다. API Key 연결 전에도 텍스트 검사와 OCR 검사는 계속 동작합니다."
        eyebrow="AI 설정"
        title="AI 이미지 분석 연결"
      />
      <AiConnectionStatus connection={connection} />
    </AppShell>
  );
}
