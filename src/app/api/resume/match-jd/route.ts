import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { matchResumeToJD } from "@/lib/services/resume.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const { resumeUploadId, jobDescription } = body;

    if (!resumeUploadId) {
      return badRequest("resumeUploadId is required");
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return badRequest("jobDescription must be at least 50 characters");
    }

    const result = await matchResumeToJD(
      resumeUploadId,
      jobDescription,
      session.user.id
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
