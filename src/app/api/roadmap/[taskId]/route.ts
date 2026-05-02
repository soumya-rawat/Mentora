import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleTaskCompletion } from "@/lib/services/roadmap.service";
import { unauthorized, notFound, handleApiError } from "@/lib/utils/api-errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { taskId } = await params;

    const result = await toggleTaskCompletion(taskId, session.user.id);

    if (!result) return notFound("Task not found");

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
