/**
 * OCR fallback for image-based PDFs.
 * Uses tesseract.js (pure JS, no system dependencies).
 * Triggered when unpdf extracts insufficient text (<100 chars).
 */

export interface OCRResult {
  text: string;
  confidence: "low" | "medium" | "high";
  pagesProcessed: number;
}

/**
 * Attempts OCR on a PDF buffer when text extraction fails.
 * Returns extracted text with confidence level.
 */
export async function extractTextWithOCR(buffer: Buffer): Promise<OCRResult> {
  try {
    const { createWorker } = await import("tesseract.js");

    const worker = await createWorker("eng");

    // Convert buffer to base64 data URL for tesseract
    const base64 = buffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    const { data } = await worker.recognize(dataUrl);

    await worker.terminate();

    const text = data.text.trim();
    const confidence = getConfidenceLevel(data.confidence);

    return {
      text,
      confidence,
      pagesProcessed: 1,
    };
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return {
      text: "",
      confidence: "low",
      pagesProcessed: 0,
    };
  }
}

function getConfidenceLevel(score: number): "low" | "medium" | "high" {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/**
 * Determines if OCR should be attempted based on extracted text quality.
 */
export function shouldAttemptOCR(extractedText: string): boolean {
  const trimmed = extractedText.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  // Too little text extracted — likely image-based PDF
  if (trimmed.length < 100) return true;
  if (wordCount < 30) return true;

  // No email or phone found — might be garbled extraction
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(trimmed);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(trimmed);
  if (!hasEmail && !hasPhone && wordCount < 80) return true;

  return false;
}
