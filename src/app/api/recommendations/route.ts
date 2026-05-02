import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorized, handleApiError } from "@/lib/utils/api-errors";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const recommendations = await prisma.roleRecommendation.findMany({
      where: { userId: session.user.id },
      orderBy: { totalScore: "desc" },
    });

    return NextResponse.json({ data: recommendations });
  } catch (error) {
    return handleApiError(error);
  }
}
