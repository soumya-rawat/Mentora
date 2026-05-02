import { GoogleGenAI } from "@google/genai";
import { AIProvider, RoleExplanationInput, ResumeFeedbackInput } from "./types";
import { MockAIProvider } from "./mock-provider";

const SYSTEM_PROMPT = `You are a career advisor for Indian BTech, BCA, and MCA students.
You give specific, practical, and encouraging advice.
Use Indian job market context: mention CTC ranges in LPA, placement cycles, product vs service companies, and free learning resources.
Keep responses concise (3-5 sentences max). Do not use markdown formatting.`;

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
}