import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadResume } from "@/lib/services/resume.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";
import { PDFParse } from "pdf-parse";

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
      const pdf = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await pdf.getText();
      extractedText = result.text;
      await pdf.destroy();
    } catch (err) {
      console.error("PDF parse error:", err);
      return badRequest("Could not parse PDF. Please ensure it is a valid PDF file.");
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