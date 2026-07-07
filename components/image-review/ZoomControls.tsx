import { Minus, Plus, RotateCcw } from "lucide-react";

export function ZoomControls({
  onReset,
  onZoomIn,
  onZoomOut,
  zoom,
}: {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-lg border border-white/15 bg-white/10 p-1 text-white">
      <button
        aria-label="이미지 축소"
        className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onZoomOut}
        type="button"
      >
        <Minus aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <span className="min-w-14 px-2 text-center text-xs font-medium">
        {Math.round(zoom * 100)}%
      </span>
      <button
        aria-label="이미지 확대"
        className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onZoomIn}
        type="button"
      >
        <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <button
        aria-label="확대 초기화"
        className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onReset}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}
