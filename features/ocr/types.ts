export type OcrExtractionStatus =
  | "not_requested"
  | "succeeded"
  | "empty"
  | "failed";

export type OcrImageRegion = {
  confidence: number;
  height: number;
  id: string;
  label: string;
  type: "ocr_text";
  width: number;
  x: number;
  y: number;
};

export type OcrExtractionResult = {
  confidence: number;
  errorMessage?: string;
  progress: number;
  regions: OcrImageRegion[];
  status: OcrExtractionStatus;
  text: string;
};
