import type { CampaignVersion } from "@/features/campaign/version-types";
import { RiskBadge } from "@/components/ui/RiskBadge";

export function VersionImageComparison({
  after,
  afterImageDataUrl,
  before,
  beforeImageDataUrl,
}: {
  after: CampaignVersion;
  afterImageDataUrl?: string;
  before: CampaignVersion;
  beforeImageDataUrl?: string;
}) {
  return (
    <section className="rounded-xl bg-[var(--color-review-canvas)] p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/70">
            이미지 비교 미리보기
          </p>
          <h2 className="mt-2 text-2xl font-normal">이미지 변경 비교</h2>
        </div>
        <RiskBadge className="shrink-0" level="medium" label="오버레이 비교" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <VersionPreview
          imageDataUrl={beforeImageDataUrl}
          label={before.label}
          note={before.imageNote}
          showHandRegion
        />
        <VersionPreview
          imageDataUrl={afterImageDataUrl}
          label={after.label}
          note={after.imageNote}
        />
      </div>
    </section>
  );
}

function VersionPreview({
  imageDataUrl,
  label,
  note,
  showHandRegion = false,
}: {
  imageDataUrl?: string;
  label: string;
  note: string;
  showHandRegion?: boolean;
}) {
  return (
    <article className="rounded-xl bg-[var(--color-review-canvas-panel)] p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="truncate text-sm font-medium">{label}</p>
      </div>
      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))]">
        {imageDataUrl ? (
          <div
            aria-label={`${label} 업로드 이미지`}
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${imageDataUrl})` }}
          />
        ) : (
          <>
            <div className="absolute inset-5 rounded-2xl bg-[var(--color-signature-cream)]/95" />
            <div className="absolute left-[13%] top-[18%] h-[44%] w-[44%] rounded-2xl bg-white/95" />
            <div className="absolute right-[18%] top-[20%] h-[34%] w-[24%] rounded-full bg-[var(--color-signature-peach)]" />
            <div className="absolute bottom-[16%] left-[15%] h-[13%] w-[58%] rounded-xl bg-white/90" />
          </>
        )}
        {showHandRegion ? (
          <div className="absolute left-[52%] top-[24%] h-[34%] w-[24%] rounded-md border-2 border-[var(--color-review-overlay-hand)] bg-[var(--color-review-overlay-hand)]/15" />
        ) : null}
        <div className="absolute left-[14%] top-[66%] h-[12%] w-[58%] rounded-md border-2 border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/15" />
      </div>
      <p className="mt-4 text-sm leading-6 text-white/70">{note}</p>
    </article>
  );
}
