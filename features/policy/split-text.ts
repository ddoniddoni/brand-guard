import type { TextSegment } from "@/features/policy/types";
import { normalizeText } from "@/features/policy/normalize-text";

export function splitTextIntoSegments({
  reviewJobId,
  source,
  text,
}: {
  reviewJobId: string;
  source: "pasted_text" | "image_ocr";
  text: string;
}) {
  const segments: TextSegment[] = [];
  let sentenceIndex = 0;

  text.split(/\n+/).forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    const sentences = line
      .split(/(?<=[.!?。！？]|[다요죠음함됨임])\s+/)
      .flatMap((sentence) => {
        const trimmedSentence = sentence.trim();

        return trimmedSentence ? [trimmedSentence] : [];
      });

    const usableSentences = sentences.length > 0 ? sentences : [line];

    usableSentences.forEach((sentence) => {
      sentenceIndex += 1;
      segments.push({
        id: `${reviewJobId}-${source}-${lineIndex + 1}-${sentenceIndex}`,
        lineNumber: lineIndex + 1,
        normalizedText: normalizeText(sentence),
        reviewJobId,
        sentenceIndex,
        source,
        text: sentence,
      });
    });
  });

  return segments;
}
