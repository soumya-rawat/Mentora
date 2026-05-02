import { AIProvider, RoleExplanationInput, ResumeFeedbackInput } from "./types";

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
}
