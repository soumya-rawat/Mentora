import { AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { GeminiProvider } from "./gemini-provider";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "mock";

  switch (provider) {
    case "gemini":
      return new GeminiProvider();
    case "mock":
    default:
      return new MockAIProvider();
  }
}
