import type { OcrExtractionResult, OcrImageRegion } from "@/features/ocr/types";

type TesseractLine = {
  bbox?: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
  confidence?: number;
  text?: string;
};

type TesseractWorker = Tesseract.Worker;

export async function extractImageTextWithTesseract(
  file: File,
  {
    onProgress,
    timeoutMs = 12_000,
  }: {
    onProgress?: (progress: number) => void;
    timeoutMs?: number;
  } = {},
): Promise<OcrExtractionResult> {
  if (file.size < 256) {
    return {
      confidence: 0,
      progress: 1,
      regions: [],
      status: "empty",
      text: "",
    };
  }

  const imageDimensions = await getImageDimensions(file);
  let worker: TesseractWorker | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const { PSM, createWorker } = await import("tesseract.js");
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("OCR_TIMEOUT")),
        timeoutMs,
      );
    });
    const ocrPromise = (async () => {
      worker = await createWorker(["kor", "eng"], undefined, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            onProgress?.(message.progress);
          }
        },
      });
      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      });

      return worker.recognize(file, undefined, { blocks: true, text: true });
    })();
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    const text = normalizeOcrText(result.data.text);
    const lines = collectLines(result.data.blocks);
    const regions = createOcrRegions({
      imageScopedId: `${file.name}-${file.lastModified}`,
      imageHeight: imageDimensions.height,
      imageWidth: imageDimensions.width,
      lines,
    });

    return {
      confidence: clampConfidence((result.data.confidence ?? 0) / 100),
      progress: 1,
      regions,
      status: text ? "succeeded" : "empty",
      text,
    };
  } catch (error) {
    return {
      confidence: 0,
      errorMessage:
        error instanceof Error && error.message === "OCR_TIMEOUT"
          ? "OCR 처리 시간이 길어져 직접 입력 문구 기준으로 검토를 계속합니다."
          : "OCR을 실행하지 못해 직접 입력 문구 기준으로 검토를 계속합니다.",
      progress: 1,
      regions: [],
      status: "failed",
      text: "",
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    await (worker as TesseractWorker | null)?.terminate();
  }
}

function collectLines(blocks: Tesseract.Block[] | null): TesseractLine[] {
  const lines: TesseractLine[] = [];

  for (const block of blocks ?? []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        if (line.text?.trim()) {
          lines.push(line);
        }
      }
    }
  }

  return lines;
}

function createOcrRegions({
  imageScopedId,
  imageHeight,
  imageWidth,
  lines,
}: {
  imageScopedId: string;
  imageHeight: number;
  imageWidth: number;
  lines: TesseractLine[];
}): OcrImageRegion[] {
  const usableLines = lines.filter(
    (line) => line.bbox && line.text?.trim() && (line.confidence ?? 0) >= 25,
  );

  if (usableLines.length === 0 || imageWidth <= 0 || imageHeight <= 0) {
    return [];
  }

  return usableLines.slice(0, 80).map((line, index) => {
    const bbox = line.bbox;
    const label = normalizeOcrText(line.text ?? "");

    return {
      confidence: clampConfidence((line.confidence ?? 0) / 100),
      height: clamp01(((bbox?.y1 ?? 0) - (bbox?.y0 ?? 0)) / imageHeight),
      id: `ocr-region-${hashText(`${imageScopedId}-${index}-${label}`)}`,
      label,
      type: "ocr_text",
      width: clamp01(((bbox?.x1 ?? 0) - (bbox?.x0 ?? 0)) / imageWidth),
      x: clamp01((bbox?.x0 ?? 0) / imageWidth),
      y: clamp01((bbox?.y0 ?? 0) / imageHeight),
    };
  });
}

function getImageDimensions(file: File) {
  return new Promise<{ height: number; width: number }>((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve({
        height: image.naturalHeight || 1,
        width: image.naturalWidth || 1,
      });
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve({ height: 1, width: 1 });
    });
    image.src = url;
  });
}

function normalizeOcrText(text: string) {
  return text
    .split(/\n+/)
    .flatMap((line) => {
      const normalizedLine = line.replace(/\s+/g, " ").trim();

      return normalizedLine ? [normalizedLine] : [];
    })
    .join("\n");
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampConfidence(value: number) {
  return Math.min(0.99, Math.max(0, Number.isFinite(value) ? value : 0));
}

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
