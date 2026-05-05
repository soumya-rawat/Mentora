import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAnalysisReport } from "@/lib/utils/report-generator";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";
import { getRoleBySlug } from "@/lib/constants/roles";
import { ResumeAnalysisResultV2 } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) return badRequest("analysisId is required");

    const analysis = await prisma.resumeAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        resumeUpload: { select: { fileName: true, userId: true } },
      },
    });

    if (!analysis) return badRequest("Analysis not found");
    if (analysis.resumeUpload.userId !== session.user.id) return unauthorized();

    const role = getRoleBySlug(analysis.targetRoleSlug);

    const reportData = {
      analysis: {
        atsScore: analysis.atsScore,
        keywordMatches: analysis.keywordMatches as unknown as ResumeAnalysisResultV2["keywordMatches"],
        sectionScores: analysis.sectionScores as unknown as ResumeAnalysisResultV2["sectionScores"],
        suggestions: analysis.suggestions as unknown as ResumeAnalysisResultV2["suggestions"],
        feedback: analysis.feedback,
        bulletAnalysis: (analysis.bulletAnalysis || []) as unknown as ResumeAnalysisResultV2["bulletAnalysis"],
        strengths: (analysis.strengths || []) as unknown as ResumeAnalysisResultV2["strengths"],
        weaknesses: (analysis.weaknesses || []) as unknown as ResumeAnalysisResultV2["weaknesses"],
        rewrittenBullets: (analysis.rewrittenBullets || []) as unknown as ResumeAnalysisResultV2["rewrittenBullets"],
        smartSuggestions: (analysis.smartSuggestions || []) as unknown as ResumeAnalysisResultV2["smartSuggestions"],
        domain: (analysis.domain || null) as unknown as ResumeAnalysisResultV2["domain"],
        formattingIssues: (analysis.formattingIssues || []) as unknown as ResumeAnalysisResultV2["formattingIssues"],
      },
      domain: (analysis.domain || null) as unknown as ResumeAnalysisResultV2["domain"],
      fileName: analysis.resumeUpload.fileName,
      targetRole: role?.title || analysis.targetRoleSlug,
    };

    const pdfBuffer = generateAnalysisReport(reportData);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="mentora-report-${analysis.targetRoleSlug}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
