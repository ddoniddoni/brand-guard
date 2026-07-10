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

const OCR_RETRY_CONFIDENCE = 0.82;
const MIN_REGION_CONFIDENCE = 45;

export async function extractImageTextWithTesseract(
  file: File,
  {
    onProgress,
    timeoutMs = 20_000,
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
        user_defined_dpi: "300",
      });

      const originalResult = await worker.recognize(file, undefined, {
        blocks: true,
        text: true,
      });
      const enhancedImage =
        getOcrConfidence(originalResult) < OCR_RETRY_CONFIDENCE
          ? await createOcrReadyFile(file, imageDimensions)
          : null;

      if (!enhancedImage) {
        return { imageDimensions, result: originalResult };
      }

      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        user_defined_dpi: "300",
      });
      const enhancedResult = await worker.recognize(enhancedImage.file, undefined, {
        blocks: true,
        text: true,
      });

      return getOcrQuality(enhancedResult) > getOcrQuality(originalResult)
        ? { imageDimensions: enhancedImage.dimensions, result: enhancedResult }
        : { imageDimensions, result: originalResult };
    })();
    const ocrOutput = await Promise.race([ocrPromise, timeoutPromise]);
    const result = ocrOutput.result;
    const lines = collectLines(result.data.blocks);
    const regions = createOcrRegions({
      imageScopedId: `${file.name}-${file.lastModified}`,
      imageHeight: ocrOutput.imageDimensions.height,
      imageWidth: ocrOutput.imageDimensions.width,
      lines,
    });
    const text = getReliableOcrText(result.data.text, lines);

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

async function createOcrReadyFile(
  file: File,
  dimensions: { height: number; width: number },
) {
  const longestSide = Math.max(dimensions.width, dimensions.height);
  const scale = Math.min(3, 3_200 / longestSide);

  if (!Number.isFinite(scale) || scale <= 1) {
    return null;
  }

  try {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(dimensions.width * scale));
    canvas.height = Math.max(1, Math.round(dimensions.height * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.filter = "grayscale(1) contrast(1.45) brightness(1.08)";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas);

    return blob
      ? {
          dimensions: { height: canvas.height, width: canvas.width },
          file: new File([blob], `${getFileStem(file.name)}-ocr.png`, {
            type: "image/png",
          }),
        }
      : null;
  } catch {
    return null;
  }
}

function getOcrConfidence(result: { data: { confidence: number } }) {
  return clampConfidence((result.data.confidence ?? 0) / 100);
}

function getOcrQuality(result: {
  data: {
    blocks: Tesseract.Block[] | null;
    confidence: number;
    text: string;
  };
}) {
  const lines = collectLines(result.data.blocks).filter(isReliableLine);

  if (lines.length === 0) {
    return getOcrConfidence(result) * 0.5;
  }

  let weightedConfidence = 0;
  let totalWeight = 0;

  for (const line of lines) {
    const characterCount = getMeaningfulCharacterCount(line.text ?? "");
    const weight = Math.max(1, Math.min(characterCount, 40));

    weightedConfidence += (line.confidence ?? 0) * weight;
    totalWeight += weight;
  }

  const averageConfidence = weightedConfidence / totalWeight / 100;
  const reliableCharacterCount = lines.reduce(
    (total, line) => total + getMeaningfulCharacterCount(line.text ?? ""),
    0,
  );

  return averageConfidence + Math.min(reliableCharacterCount, 120) / 1_200;
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
  const usableLines = lines.filter(isReliableLine);

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

function getReliableOcrText(
  fallbackText: string,
  lines: TesseractLine[],
) {
  const readableLines = lines.filter(isReadableLine);

  if (readableLines.length === 0) {
    return normalizeOcrText(fallbackText);
  }

  return normalizeOcrText(
    readableLines.map((line) => line.text ?? "").join("\n"),
  );
}

function isReliableLine(line: TesseractLine) {
  const confidence = line.confidence ?? 0;
  const characterCount = getMeaningfulCharacterCount(line.text ?? "");

  if (
    !isReadableLine(line) ||
    confidence < MIN_REGION_CONFIDENCE ||
    (characterCount < 2 && confidence < 65)
  ) {
    return false;
  }

  return true;
}

function isReadableLine(line: TesseractLine) {
  const bbox = line.bbox;

  return Boolean(
    bbox &&
      bbox.x1 > bbox.x0 &&
      bbox.y1 > bbox.y0 &&
      (line.confidence ?? 0) >= 30 &&
      getMeaningfulCharacterCount(line.text ?? "") > 0,
  );
}

function getMeaningfulCharacterCount(text: string) {
  return text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
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

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve(image);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 전처리를 준비하지 못했습니다."));
    });
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

function getFileStem(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "ocr-image";
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
