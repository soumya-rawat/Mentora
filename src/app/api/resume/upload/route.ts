import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadResume } from "@/lib/services/resume.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("No file provided");
    if (file.type !== "application/pdf") return badRequest("Only PDF files are accepted");
    if (file.size > 5 * 1024 * 1024) return badRequest("File size must be under 5MB");

    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText: string;
    try {
      extractedText = await extractPdfText(buffer);
    } catch (err) {
      console.error("PDF parse error:", err);
      return badRequest("Could not parse PDF. Please ensure it is a valid PDF file.");
    }

    // OCR fallback for image-based PDFs
    if (!extractedText || extractedText.trim().length < 100) {
      try {
        const { shouldAttemptOCR, extractTextWithOCR } = await import("@/lib/utils/ocr-service");
        if (shouldAttemptOCR(extractedText || "")) {
          const ocrResult = await extractTextWithOCR(buffer);
          if (ocrResult.text.length > extractedText.length) {
            extractedText = ocrResult.text;
          }
        }
      } catch (ocrErr) {
        console.error("OCR fallback failed:", ocrErr);
      }
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return badRequest("Could not extract enough text from the PDF. The file might be image-based or empty.");
    }

    const upload = await uploadResume(session.user.id, file.name, extractedText);

    return NextResponse.json(
      {
        data: {
          id: upload.id,
          fileName: upload.fileName,
          wordCount: upload.wordCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const result = await extractText(new Uint8Array(buffer));
  return Array.isArray(result.text) ? result.text.join("\n") : result.text;
}
