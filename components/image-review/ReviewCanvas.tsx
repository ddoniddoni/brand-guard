"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult } from "@/features/risk-analysis/types";
import { formatPercent, getRiskCategoryLabel } from "@/lib/format";
import { cx } from "@/lib/utils";
import { ZoomControls } from "@/components/image-review/ZoomControls";

type RegionViewModel = {
  confidence: number;
  findingId: string;
  findingTitle: string;
  height: number;
  id: string;
  label: string;
  landmarks?: Array<{ x: number; y: number; label?: string }>;
  type: "hand" | "ocr_text" | "symbol" | "object";
  width: number;
  x: number;
  y: number;
};

const regionClassName: Record<RegionViewModel["type"], string> = {
  hand: "border-[var(--color-review-overlay-hand)] bg-[var(--color-review-overlay-hand)]/15",
  ocr_text:
    "border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/15",
  symbol:
    "border-[var(--color-review-overlay-symbol)] bg-[var(--color-review-overlay-symbol)]/15",
  object:
    "border-[var(--color-info-border)] bg-[var(--color-info-border)]/15",
};

export function ReviewCanvas({
  analysis,
  selectedFindingId,
  onSelectFinding,
}: {
  analysis: AnalysisResult;
  selectedFindingId: string;
  onSelectFinding: (findingId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const regions = useMemo(
    () =>
      analysis.categories.flatMap((finding) =>
        (finding.regions ?? []).map((region) => ({
          ...region,
          findingId: finding.id,
          findingTitle: finding.title,
        })),
      ),
    [analysis.categories],
  );

  const selectedRegion = regions.find(
    (region) => region.findingId === selectedFindingId,
  );

  const updateZoom = (nextZoom: number) => {
    setZoom(Math.min(1.35, Math.max(0.8, nextZoom)));
  };

  return (
    <section className="rounded-xl bg-[var(--color-review-canvas)] p-5 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Review canvas</p>
          <h2 className="mt-2 text-2xl font-normal">이미지 검토 영역</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            좌표는 원본 이미지 기준 normalized `0..1` 값으로 저장하고, 렌더링
            시 현재 캔버스 크기에 맞춰 변환합니다.
          </p>
        </div>
        <ZoomControls
          onReset={() => setZoom(1)}
          onZoomIn={() => updateZoom(zoom + 0.1)}
          onZoomOut={() => updateZoom(zoom - 0.1)}
          zoom={zoom}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl bg-[var(--color-review-canvas-panel)] p-4">
        <div
          className="mx-auto aspect-[4/3] max-h-[620px] w-full max-w-4xl origin-center overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))]"
          style={{ transform: `scale(${zoom})` }}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-8 rounded-[28px] bg-[var(--color-signature-cream)]/95" />
            <div className="absolute left-[12%] top-[18%] h-[50%] w-[42%] rounded-2xl bg-white/95 p-6 text-[var(--color-ink)]">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Northstar
              </p>
              <p className="mt-4 text-4xl font-normal leading-tight">
                Summer calm,
                <br />
                reviewed first.
              </p>
            </div>
            <div className="absolute right-[15%] top-[18%] h-[42%] w-[23%] rounded-full bg-[var(--color-signature-peach)]" />
            <div className="absolute bottom-[14%] left-[16%] h-[12%] w-[58%] rounded-xl bg-white/90" />

            {regions.map((region) => {
              const isSelected = region.findingId === selectedFindingId;

              return (
                <button
                  aria-label={`${region.findingTitle} 영역 선택`}
                  className={cx(
                    "absolute rounded-md border-2 text-left outline-none transition",
                    regionClassName[region.type],
                    isSelected
                      ? "border-[3px] ring-2 ring-white"
                      : "hover:ring-2 hover:ring-white/70 focus-visible:ring-2 focus-visible:ring-white",
                  )}
                  key={region.id}
                  onClick={() => onSelectFinding(region.findingId)}
                  style={{
                    height: `${region.height * 100}%`,
                    left: `${region.x * 100}%`,
                    top: `${region.y * 100}%`,
                    width: `${region.width * 100}%`,
                  }}
                  type="button"
                >
                  <span className="absolute -top-8 left-0 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-[var(--color-ink)]">
                    {getRiskCategoryLabel(
                      analysis.categories.find(
                        (finding) => finding.id === region.findingId,
                      )?.category ?? "brand_mismatch",
                    )}
                  </span>
                  {region.landmarks ? <LandmarkOverlay region={region} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {regions.map((region) => (
          <button
            className={cx(
              "rounded-lg border border-white/15 bg-white/10 p-4 text-left text-sm",
              region.findingId === selectedFindingId && "bg-white text-[var(--color-ink)]",
            )}
            key={region.id}
            onClick={() => onSelectFinding(region.findingId)}
            type="button"
          >
            <span className="block font-medium">{region.findingTitle}</span>
            <span
              className={cx(
                "mt-1 block text-xs",
                region.findingId === selectedFindingId
                  ? "text-[var(--color-body)]"
                  : "text-white/70",
              )}
            >
              {region.label} · 신뢰도 {formatPercent(region.confidence)}
            </span>
          </button>
        ))}
      </div>

      {selectedRegion ? (
        <p className="mt-4 text-sm leading-6 text-white/70">
          선택된 영역: {selectedRegion.label}. 툴팁 정보는 오른쪽 검토 패널과
          아래 텍스트 리스트에서도 동일하게 확인할 수 있습니다.
        </p>
      ) : null}
    </section>
  );
}

function LandmarkOverlay({ region }: { region: RegionViewModel }) {
  if (!region.landmarks || region.landmarks.length === 0) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
    >
      <polyline
        fill="none"
        points={region.landmarks
          .map((landmark) => {
            const x = ((landmark.x - region.x) / region.width) * 100;
            const y = ((landmark.y - region.y) / region.height) * 100;
            return `${x},${y}`;
          })
          .join(" ")}
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {region.landmarks.map((landmark) => {
        const x = ((landmark.x - region.x) / region.width) * 100;
        const y = ((landmark.y - region.y) / region.height) * 100;

        return (
          <circle
            cx={x}
            cy={y}
            fill="white"
            key={`${landmark.label}-${landmark.x}-${landmark.y}`}
            r="3"
          />
        );
      })}
    </svg>
  );
}
