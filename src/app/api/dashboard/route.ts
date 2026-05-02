import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard.service";
import { unauthorized, handleApiError } from "@/lib/utils/api-errors";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const stats = await getDashboardStats(session.user.id);

    return NextResponse.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
