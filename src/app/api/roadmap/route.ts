import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRoadmap } from "@/lib/services/roadmap.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: {
        milestones: {
          include: { tasks: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ data: roadmap });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const { roleSlug } = body;

    if (!roleSlug) {
      return badRequest("roleSlug is required");
    }

    const roadmap = await generateRoadmap(session.user.id, roleSlug);

    return NextResponse.json({ data: roadmap }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
