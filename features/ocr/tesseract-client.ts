import type { OcrExtractionResult, OcrImageRegion } from "@/features/ocr/types";

type TesseractWord = {
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
    const words = collectWords(result.data.blocks);
    const regions = createOcrRegions({
      imageScopedId: `${file.name}-${file.lastModified}`,
      imageHeight: imageDimensions.height,
      imageWidth: imageDimensions.width,
      words,
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

function collectWords(blocks: Tesseract.Block[] | null): TesseractWord[] {
  const words: TesseractWord[] = [];

  for (const block of blocks ?? []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        for (const word of line.words) {
          if (word.text?.trim()) {
            words.push(word);
          }
        }
      }
    }
  }

  return words;
}

function createOcrRegions({
  imageScopedId,
  imageHeight,
  imageWidth,
  words,
}: {
  imageScopedId: string;
  imageHeight: number;
  imageWidth: number;
  words: TesseractWord[];
}): OcrImageRegion[] {
  const usableWords = words.filter(
    (word) => word.bbox && (word.confidence ?? 0) >= 35,
  );

  if (usableWords.length === 0 || imageWidth <= 0 || imageHeight <= 0) {
    return [];
  }

  const x0 = Math.min(...usableWords.map((word) => word.bbox?.x0 ?? 0));
  const y0 = Math.min(...usableWords.map((word) => word.bbox?.y0 ?? 0));
  const x1 = Math.max(...usableWords.map((word) => word.bbox?.x1 ?? 0));
  const y1 = Math.max(...usableWords.map((word) => word.bbox?.y1 ?? 0));
  const averageConfidence =
    usableWords.reduce((sum, word) => sum + (word.confidence ?? 0), 0) /
    usableWords.length;

  return [
    {
      confidence: clampConfidence(averageConfidence / 100),
      height: clamp01((y1 - y0) / imageHeight),
      id: `ocr-region-${hashText(imageScopedId)}`,
      label: "OCR 추출 문구 영역",
      type: "ocr_text",
      width: clamp01((x1 - x0) / imageWidth),
      x: clamp01(x0 / imageWidth),
      y: clamp01(y0 / imageHeight),
    },
  ];
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
