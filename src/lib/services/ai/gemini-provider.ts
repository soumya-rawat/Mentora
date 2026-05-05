import { GoogleGenAI } from "@google/genai";
import {
  AIProvider,
  RoleExplanationInput,
  ResumeFeedbackInput,
  BulletRewriteInput,
  SmartSuggestionInput,
  JDFeedbackInput,
} from "./types";
import { MockAIProvider } from "./mock-provider";
import { RewrittenBullet, SmartSuggestion } from "@/types";

const SYSTEM_PROMPT = `You are a career advisor for Indian BTech, BCA, and MCA students.
You give specific, practical, and encouraging advice.
Use Indian job market context: mention CTC ranges in LPA, placement cycles, product vs service companies, and free learning resources.
Keep responses concise (3-5 sentences max). Do not use markdown formatting.`;

const RESUME_EXPERT_PROMPT = `You are a senior resume reviewer and career coach specializing in Indian tech placements.
You understand:
- Indian fresher hiring: on-campus (Tier 1/2/3 differences), off-campus, referrals
- ATS systems used by Indian product companies (Razorpay, Flipkart, Atlassian) and service companies (TCS, Infosys, Wipro)
- What makes resumes stand out for freshers: quantified impact, specific tech, project complexity
- STAR format for bullet points: Situation, Task, Action, Result
- Indian salary context: LPA ranges, stock options at startups vs base at MNCs
Always give actionable, specific advice. Never be vague or generic.`;

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  private fallback: MockAIProvider;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    this.fallback = new MockAIProvider();
  }

  async generateRoleExplanation(input: RoleExplanationInput): Promise<string> {
    const { role, matchScore, topMatchingSkills, gapSkills, userInterests } = input;

    const prompt = `A student has a ${matchScore}% fit score for the "${role.title}" role.

Their matching skills: ${topMatchingSkills.join(", ") || "none yet"}.
Skills they need to develop: ${gapSkills.join(", ") || "none — they're well prepared"}.
Their interests: ${userInterests.join(", ")}.

Role details:
- Category: ${role.category}
- Demand in India: ${role.demandLevel}
- Fresher salary: ${role.salaryINR.fresher}
- Key companies hiring: ${role.indianCompanies.slice(0, 4).join(", ")}

Write a personalized explanation of why this role fits (or doesn't fit) this student. Be honest but encouraging. Mention specific skills and Indian market context.`;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 300,
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text && text.length > 20) return text;
      return this.fallback.generateRoleExplanation(input);
    } catch (error) {
      console.error("Gemini role explanation failed, using fallback:", error);
      return this.fallback.generateRoleExplanation(input);
    }
  }

  async generateResumeFeedback(input: ResumeFeedbackInput): Promise<string> {
    const { extractedText, detectedSections, keywordMatches, atsScore, targetRole } = input;

    const foundKeywords = keywordMatches.filter((k) => k.found).map((k) => k.skill);
    const missingKeywords = keywordMatches.filter((k) => !k.found).map((k) => k.skill);

    const prompt = `Analyze this resume for a "${targetRole.title}" position in India.

ATS Score: ${atsScore}/100
Sections found: ${detectedSections.join(", ") || "none detected"}
Matching keywords: ${foundKeywords.join(", ") || "none"}
Missing keywords: ${missingKeywords.join(", ") || "none — good coverage"}

Resume text (first 1500 chars):
${extractedText.slice(0, 1500)}

Give specific, actionable feedback. Mention which missing keywords to add and where. Reference Indian fresher hiring expectations. Be constructive, not generic.`;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 400,
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text && text.length > 20) return text;
      return this.fallback.generateResumeFeedback(input);
    } catch (error) {
      console.error("Gemini resume feedback failed, using fallback:", error);
      return this.fallback.generateResumeFeedback(input);
    }
  }

  async rewriteBulletPoints(input: BulletRewriteInput): Promise<RewrittenBullet[]> {
    const { bullets, targetRole, jobDescription, userContext } = input;

    if (bullets.length === 0) return [];

    const roleContext = targetRole
      ? `Target role: ${targetRole.title} (${targetRole.category}). Key skills: ${targetRole.skills.slice(0, 5).map((s) => s.name).join(", ")}.`
      : "";

    const jdContext = jobDescription
      ? `Job description context: ${jobDescription.slice(0, 500)}`
      : "";

    const bulletList = bullets
      .slice(0, 6) // Limit to 6 bullets per API call
      .map((b, i) => `${i + 1}. "${b.text}" [Issues: ${b.issues.join(", ")}]`)
      .join("\n");

    const prompt = `Rewrite these weak resume bullet points for an Indian ${userContext.collegeTier} college student (Year ${userContext.yearOfStudy}).

${roleContext}
${jdContext}

Weak bullets to rewrite:
${bulletList}

For each bullet, provide an improved version that:
- Starts with a strong action verb
- Includes quantified impact where possible (even reasonable estimates)
- Names specific technologies used
- Is 12-20 words long
- Is honest (don't fabricate achievements, just better position what they did)

Respond in JSON format only:
[{"original": "...", "rewritten": "...", "explanation": "..."}]`;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: RESUME_EXPERT_PROMPT,
          maxOutputTokens: 800,
          temperature: 0.6,
        },
      });

      const text = response.text?.trim();
      if (!text) return this.fallback.rewriteBulletPoints(input);

      // Parse JSON from response (handle markdown code blocks)
      const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr) as RewrittenBullet[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return this.fallback.rewriteBulletPoints(input);
    } catch (error) {
      console.error("Gemini bullet rewrite failed, using fallback:", error);
      return this.fallback.rewriteBulletPoints(input);
    }
  }

  async generateSmartSuggestions(input: SmartSuggestionInput): Promise<SmartSuggestion[]> {
    const {
      bulletAnalysis, strengths, weaknesses,
      keywordMatches, targetRole, jobDescription, userContext,
    } = input;

    const weakBulletCount = bulletAnalysis.filter((b) => b.rating === "weak").length;
    const missingSkills = keywordMatches.filter((k) => !k.found).map((k) => k.skill);
    const strengthSummary = strengths.map((s) => s.area).join(", ");
    const weaknessSummary = weaknesses.map((w) => `${w.area}: ${w.description}`).join("; ");

    const roleContext = targetRole
      ? `Target: ${targetRole.title}. Missing skills: ${missingSkills.slice(0, 5).join(", ")}.`
      : "";

    const jdContext = jobDescription
      ? `JD highlights: ${jobDescription.slice(0, 300)}`
      : "";

    const prompt = `Generate prioritized resume improvement suggestions for an Indian ${userContext.collegeTier} student (Year ${userContext.yearOfStudy}).

${roleContext}
${jdContext}

Current analysis:
- Strengths: ${strengthSummary || "none identified"}
- Weaknesses: ${weaknessSummary || "none critical"}
- Weak bullets: ${weakBulletCount} out of ${bulletAnalysis.length}
- Missing keywords: ${missingSkills.slice(0, 8).join(", ")}

Generate 5-8 specific, actionable suggestions. Each should be concrete (not "improve your resume").

Respond in JSON format only:
[{"category": "add|remove|rewrite|reposition", "section": "skills|projects|experience|education|overall", "suggestion": "...", "priority": "high|medium|low"}]`;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: RESUME_EXPERT_PROMPT,
          maxOutputTokens: 600,
          temperature: 0.6,
        },
      });

      const text = response.text?.trim();
      if (!text) return this.fallback.generateSmartSuggestions(input);

      const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr) as SmartSuggestion[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return this.fallback.generateSmartSuggestions(input);
    } catch (error) {
      console.error("Gemini smart suggestions failed, using fallback:", error);
      return this.fallback.generateSmartSuggestions(input);
    }
  }

  async generateJDFeedback(input: JDFeedbackInput): Promise<string> {
    const { jdMatchResult, parsedResume, jobDescription, userContext } = input;

    const prompt = `A ${userContext.collegeTier} college student (Year ${userContext.yearOfStudy}) is applying for this role.

Job Description:
${jobDescription.slice(0, 800)}

Match Analysis:
- Overall match: ${jdMatchResult.matchScore}%
- Matched skills: ${jdMatchResult.matchedSkills.filter((s) => s.found).map((s) => s.skill).join(", ")}
- Missing required skills: ${jdMatchResult.missingSkills.join(", ") || "none"}
- Weak/undemonstrated skills: ${jdMatchResult.weakSkills.join(", ") || "none"}
- Resume sections: ${parsedResume.detectedSections.join(", ")}
- Resume word count: ${parsedResume.wordCount}

Give specific feedback:
1. How competitive is this application? Be honest.
2. What are the 2-3 most important gaps to address?
3. What can they do RIGHT NOW to improve their chances? (not "learn X for 6 months")
4. If they're a fresher, what realistically matters most for this role?

Keep it to 4-6 sentences. Be direct, practical, India-focused.`;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: RESUME_EXPERT_PROMPT,
          maxOutputTokens: 400,
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text && text.length > 20) return text;
      return this.fallback.generateJDFeedback(input);
    } catch (error) {
      console.error("Gemini JD feedback failed, using fallback:", error);
      return this.fallback.generateJDFeedback(input);
    }
  }
}
