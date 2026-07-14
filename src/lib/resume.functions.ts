import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-2.5-flash";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const ImproveTextInput = z.object({
  text: z.string().min(1),
  kind: z.enum(["summary", "project", "experience", "generic"]),
  context: z.string().optional(),
});

export const improveText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ImproveTextInput.parse(d))
  .handler(async ({ data }) => {
    const kindHint: Record<string, string> = {
      summary:
        "Rewrite this professional summary. Keep 2-3 sentences, ATS friendly, strong wording, first person implicit, preserve original meaning.",
      project:
        "Rewrite this project description as 2-3 crisp bullet points (single string, use \\n between bullets, each starting with •). Use strong action verbs, quantify impact where possible.",
      experience:
        "Rewrite these responsibilities as 3-4 professional resume bullet points (single string, \\n separated, each starting with •). Use strong action verbs, quantify impact.",
      generic: "Improve grammar and professionalism, keep meaning.",
    };
    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({ improved: z.string() }),
      system:
        "You are an elite resume coach. Return only the improved text — no preamble, no quotes, no markdown fences.",
      prompt: `${kindHint[data.kind]}${data.context ? `\nContext: ${data.context}` : ""}\n\nOriginal:\n${data.text}`,
    });
    return object;
  });

const AnalyzeInput = z.object({
  resume: z.string().min(1),
});

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data }) => {
    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({
        score: z.number().min(0).max(100),
        atsScore: z.number().min(0).max(100),
        strengths: z.array(z.string()).min(1).max(5),
        improvements: z.array(z.string()).min(1).max(6),
        missingKeywords: z.array(z.string()).max(10),
        strongerVerbs: z.array(z.string()).max(6),
        grammar: z.array(z.string()).max(6),
      }),
      system:
        "You are a senior technical recruiter and ATS expert. Score strictly, give actionable, specific feedback.",
      prompt: `Analyze this resume JSON and return improvement suggestions:\n${data.resume}`,
    });
    return object;
  });

const LiveTipsInput = z.object({
  resume: z.string().min(1),
});

export const liveTips = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => LiveTipsInput.parse(d))
  .handler(async ({ data }) => {
    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({
        tips: z
          .array(
            z.object({
              type: z.enum(["success", "warning", "idea", "sparkle"]),
              text: z.string(),
            })
          )
          .min(3)
          .max(6),
      }),
      system: "You are a resume assistant. Short, specific, actionable tips (max 12 words each).",
      prompt: `Look at this resume JSON and return quick suggestions:\n${data.resume}`,
    });
    return object;
  });