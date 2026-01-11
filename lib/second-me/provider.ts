import "server-only";
import { Anthropic } from "@anthropic-ai/sdk";
import { GenerationType, OutputSchemas } from "./types";

export interface AIProvider {
  generate(type: GenerationType, prompt: string): Promise<any>;
}

export class MiniMaxProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string, baseURL?: string) {
    this.client = new Anthropic({
      apiKey,
      baseURL: baseURL || "https://api.minimax.io/anthropic/v1",
      defaultHeaders: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });
  }

  async generate(type: GenerationType, prompt: string): Promise<any> {
    const response = await this.client.messages.create({
      model: "MiniMax-M2.1",
      max_tokens: 4096,
      system: "You are a professional Maltese career coach. You output ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const contentBlock = response.content.find((block: any) => block.type === "text");
    if (!contentBlock || contentBlock.type !== "text") {
      throw new Error("MiniMax Error: No text content in response");
    }

    try {
      const content = JSON.parse(contentBlock.text);
      // Validate against schema
      return OutputSchemas[type].parse(content);
    } catch (e) {
      console.error("Failed to parse MiniMax JSON:", contentBlock.text);
      throw new Error("MiniMax Error: Invalid JSON response");
    }
  }
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(type: GenerationType, prompt: string): Promise<any> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost effective and fast
        messages: [
          { role: "system", content: "You are a professional Maltese career coach. You output ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Error: ${error}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    // Validate against schema
    return OutputSchemas[type].parse(content);
  }
}

export class StubProvider implements AIProvider {
  async generate(type: GenerationType, _prompt: string): Promise<any> {
    const fallbacks: Record<GenerationType, any> = {
      FIT_SUMMARY: {
        headline: "Excellent match for your Senior Frontend experience.",
        match_points: ["5+ years of React expertise", "Previous experience in Maltese iGaming"],
        risks: ["Requires relocation to Sliema if not remote"],
        suggested_next_steps: ["Highlight your Next.js project", "Mention your team lead experience"],
      },
      BULLETS: {
        bullets: [
          "Optimized high-traffic React applications reducing latency by 40%.",
          "Led migration of legacy systems to modern Next.js architecture.",
        ],
      },
      COVER_LETTER: {
        subject: "Senior Frontend Developer Application",
        body: "I am writing to express my strong interest...",
      },
      INTERVIEW_PREP: {
        questions: [
          { q: "Tell us about a time you solved a performance bottleneck.", why: "Testing technical depth.", star_prompt: "Situation: slow dashboard. Task: improve it..." },
        ],
      },
    };

    return fallbacks[type];
  }
}

export function getAIProvider(): AIProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL;
  
  // If MiniMax configuration is provided, prefer it
  if (anthropicKey && anthropicBaseUrl?.includes("minimax")) {
    return new MiniMaxProvider(anthropicKey, anthropicBaseUrl);
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey && openAIKey !== "stub") {
    return new OpenAIProvider(openAIKey);
  }
  return new StubProvider();
}
