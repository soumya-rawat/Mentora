import {
  AIProvider,
  RoleExplanationInput,
  ResumeFeedbackInput,
  BulletRewriteInput,
  SmartSuggestionInput,
  JDFeedbackInput,
} from "./types";
import { RewrittenBullet, SmartSuggestion } from "@/types";

export class MockAIProvider implements AIProvider {
  async generateRoleExplanation(input: RoleExplanationInput): Promise<string> {
    const { role, matchScore, topMatchingSkills, gapSkills } = input;

    const skillsList = topMatchingSkills.slice(0, 3).join(", ");
    const gapsList = gapSkills.slice(0, 2).join(" and ");

    if (matchScore >= 75) {
      return `You're a strong fit for ${role.title} (${matchScore}% match). Your experience with ${skillsList} directly aligns with what this role demands. ${role.title}s are in ${role.demandLevel} demand in India's tech market, with freshers earning ${role.salaryINR.fresher}.${gapSkills.length > 0 ? ` To strengthen your profile, consider building skills in ${gapsList} — these are commonly expected in job postings for this role.` : " You already have a solid foundation to start applying for entry-level positions."}`;
    }

    if (matchScore >= 50) {
      return `You have solid foundations for ${role.title} (${matchScore}% match). Your skills in ${skillsList || "related areas"} provide a good starting point for this career path. ${role.demandLevel === "high" ? "This role is in high demand across Indian tech companies, " : "This is a growing field, "}with freshers earning ${role.salaryINR.fresher}.${gapSkills.length > 0 ? ` To become competitive, focus on developing ${gapsList}. A structured learning roadmap can help you bridge these gaps in 3-6 months.` : ""}`;
    }

    return `${role.title} is an exploratory match for you (${matchScore}% match). While your current skill set in ${skillsList || "other areas"} doesn't directly overlap with this role's requirements, your interests suggest you might enjoy this career direction. ${role.title}s earn ${role.salaryINR.fresher} as freshers in India.${gapSkills.length > 0 ? ` You'll need to build foundational skills in ${gapsList} before pursuing this path. Expect 6-12 months of focused preparation.` : ""}`;
  }

  async generateResumeFeedback(input: ResumeFeedbackInput): Promise<string> {
    const { atsScore, targetRole, detectedSections, keywordMatches } = input;
    const missingKeywords = keywordMatches
      .filter((k) => !k.found)
      .map((k) => k.skill);
    const missingSections = ["education", "experience", "skills", "projects"].filter(
      (s) => !detectedSections.includes(s)
    );

    let feedback = "";

    if (atsScore >= 75) {
      feedback += `Your resume is well-aligned with ${targetRole.title} positions (${atsScore}% ATS score). `;
    } else if (atsScore >= 50) {
      feedback += `Your resume has a moderate match for ${targetRole.title} roles (${atsScore}% ATS score). There's room for improvement. `;
    } else {
      feedback += `Your resume needs significant improvements to match ${targetRole.title} job requirements (${atsScore}% ATS score). `;
    }

    if (missingSections.length > 0) {
      feedback += `Missing sections: ${missingSections.join(", ")}. Adding these will improve your resume structure. `;
    }

    if (missingKeywords.length > 0) {
      feedback += `Key skills missing from your resume: ${missingKeywords.slice(0, 5).join(", ")}. Try to incorporate these terms naturally in your skills or project descriptions. `;
    }

    feedback += `For ${targetRole.title} positions in India, recruiters typically look for quantified achievements, relevant project work, and specific technical skills. Make sure to highlight any hands-on experience with the tools and technologies listed in the job description.`;

    return feedback;
  }

  async rewriteBulletPoints(input: BulletRewriteInput): Promise<RewrittenBullet[]> {
    const { bullets, targetRole } = input;

    return bullets.slice(0, 6).map((bullet) => {
      const issues = bullet.issues;
      let rewritten = bullet.text;
      let explanation = "";

      // Simple rule-based rewriting for mock
      if (issues.includes("starts with a weak verb")) {
        rewritten = `Developed ${bullet.text.replace(/^(helped|worked on|assisted with|was responsible for)\s*/i, "")}`;
        explanation = "Replaced weak verb with a strong action verb";
      } else if (issues.includes("no quantified impact or metrics")) {
        rewritten = `${bullet.text}, resulting in measurable improvement in performance`;
        explanation = "Added quantification placeholder — replace with actual metrics";
      } else if (issues.includes("no specific technologies or tools mentioned")) {
        const tech = targetRole?.skills.slice(0, 2).map((s) => s.name).join(" and ") || "relevant technologies";
        rewritten = `${bullet.text} using ${tech}`;
        explanation = "Added specific technologies to increase ATS relevance";
      } else {
        rewritten = `Engineered ${bullet.text.charAt(0).toLowerCase()}${bullet.text.slice(1)}`;
        explanation = "Strengthened with action verb and clearer framing";
      }

      return { original: bullet.text, rewritten, explanation };
    });
  }

  async generateSmartSuggestions(input: SmartSuggestionInput): Promise<SmartSuggestion[]> {
    const { weaknesses, keywordMatches, bulletAnalysis, targetRole } = input;
    const suggestions: SmartSuggestion[] = [];

    // Generate suggestions from weaknesses
    for (const weakness of weaknesses.slice(0, 3)) {
      suggestions.push({
        category: "rewrite",
        section: weakness.area.includes("bullet") ? "projects" : "overall",
        suggestion: weakness.suggestion,
        priority: weakness.severity === "critical" ? "high" : "medium",
      });
    }

    // Suggest adding missing high-weight keywords
    const missingHighWeight = keywordMatches
      .filter((k) => !k.found && k.weight >= 0.7)
      .slice(0, 3);
    for (const kw of missingHighWeight) {
      suggestions.push({
        category: "add",
        section: "skills",
        suggestion: `Add "${kw.skill}" to your skills section — it's a high-priority keyword for ${targetRole?.title || "this role"}`,
        priority: "high",
      });
    }

    // Suggest bullet rewrites if many are weak
    const weakCount = bulletAnalysis.filter((b) => b.rating === "weak").length;
    if (weakCount >= 2) {
      suggestions.push({
        category: "rewrite",
        section: "projects",
        suggestion: `${weakCount} bullet points lack impact. Use format: [Action Verb] + [What you did] + [Tech used] + [Measurable result]`,
        priority: "high",
      });
    }

    // Add positioning suggestion
    if (targetRole) {
      suggestions.push({
        category: "reposition",
        section: "overall",
        suggestion: `Lead your resume with skills most relevant to ${targetRole.title}: ${targetRole.skills.slice(0, 3).map((s) => s.name).join(", ")}`,
        priority: "medium",
      });
    }

    return suggestions.slice(0, 8);
  }

  async generateJDFeedback(input: JDFeedbackInput): Promise<string> {
    const { jdMatchResult, userContext } = input;
    const { matchScore, missingSkills, weakSkills } = jdMatchResult;

    let feedback = "";

    if (matchScore >= 75) {
      feedback = `Strong match (${matchScore}%). Your resume covers most of what this role requires. `;
    } else if (matchScore >= 50) {
      feedback = `Moderate match (${matchScore}%). You have a foundation but need to address some gaps. `;
    } else {
      feedback = `Low match (${matchScore}%). This is a stretch role — you'll need significant preparation. `;
    }

    if (missingSkills.length > 0) {
      feedback += `Critical gaps: ${missingSkills.slice(0, 3).join(", ")}. These are must-haves in the JD. `;
    }

    if (weakSkills.length > 0) {
      feedback += `Skills mentioned but not demonstrated: ${weakSkills.slice(0, 3).join(", ")}. Add project examples that prove these skills. `;
    }

    if (userContext.yearOfStudy <= 3) {
      feedback += `As a Year ${userContext.yearOfStudy} student, focus on building projects that demonstrate the missing skills rather than just listing them.`;
    } else {
      feedback += `For placement readiness, prioritize adding quantified achievements and project outcomes that directly map to the JD requirements.`;
    }

    return feedback;
  }
}
