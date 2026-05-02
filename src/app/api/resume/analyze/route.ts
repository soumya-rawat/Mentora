import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeResume } from "@/lib/services/resume.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const { resumeUploadId, targetRoleSlug } = body;

    if (!resumeUploadId || !targetRoleSlug) {
      return badRequest("resumeUploadId and targetRoleSlug are required");
    }

    const result = await analyzeResume(resumeUploadId, targetRoleSlug);

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
