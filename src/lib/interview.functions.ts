import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MessageSchema = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number().optional(),
});

const ConfigSchema = z.object({
  role: z.string(),
  type: z.enum(["hr", "technical", "mixed"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.number(),
  skills: z.array(z.string()),
  language: z.enum(["english", "hindi"]),
  totalQuestions: z.number(),
});

export type InterviewConfig = z.infer<typeof ConfigSchema>;
export type InterviewTurn = z.infer<typeof MessageSchema>;

const MODEL = "google/gemini-2.5-flash";

function getProvider() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

function systemPrompt(cfg: InterviewConfig) {
  return `You are a senior technical interviewer at a top-tier company (Google, Microsoft, Amazon caliber) conducting a ${cfg.type} interview for a ${cfg.role} candidate at ${cfg.difficulty} difficulty. Focus on skills: ${cfg.skills.join(", ") || "general"}. Language: ${cfg.language}. Be professional, calm, and probing. Ask ONE question at a time. Total questions: ${cfg.totalQuestions}.`;
}

export const startInterview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ConfigSchema.parse(d))
  .handler(async ({ data }) => {
    const provider = getProvider();
    const { object } = await generateObject({
      model: provider(MODEL),
      schema: z.object({ question: z.string() }),
      system: systemPrompt(data),
      prompt: `Ask the first ${data.type} interview question. Keep it clear and concise (1-3 sentences). No preamble, just the question.`,
    });
    return object;
  });

const EvalInput = z.object({
  config: ConfigSchema,
  history: z.array(MessageSchema),
  currentQuestion: z.string(),
  answer: z.string(),
  questionIndex: z.number(),
});

export const evaluateAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EvalInput.parse(d))
  .handler(async ({ data }) => {
    const provider = getProvider();
    const isLast = data.questionIndex + 1 >= data.config.totalQuestions;
    const { object } = await generateObject({
      model: provider(MODEL),
      schema: z.object({
        score: z.number().min(0).max(10),
        strengths: z.array(z.string()).max(4),
        improvements: z.array(z.string()).max(4),
        suggestion: z.string(),
        shouldFollowUp: z.boolean(),
        nextQuestion: z.string().nullable(),
      }),
      system: systemPrompt(data.config),
      prompt: `Question asked: "${data.currentQuestion}"
Candidate answer: "${data.answer}"
History so far: ${JSON.stringify(data.history)}

Evaluate the answer strictly but fairly. Return score 0-10, 2-3 strengths, 2-3 improvements, and one concise suggestion paragraph.
Then decide: ${isLast ? "This was the final question — set shouldFollowUp=false and nextQuestion=null." : `Either ask one intelligent follow-up (shouldFollowUp=true) OR move to the next distinct question (shouldFollowUp=false). Set nextQuestion to the actual next question text.`}`,
    });
    return { ...object, isLast };
  });

const ReportInput = z.object({
  config: ConfigSchema,
  history: z.array(MessageSchema),
});

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReportInput.parse(d))
  .handler(async ({ data }) => {
    const provider = getProvider();
    const { object } = await generateObject({
      model: provider(MODEL),
      schema: z.object({
        overall: z.number().min(0).max(100),
        technical: z.number().min(0).max(100),
        communication: z.number().min(0).max(100),
        problemSolving: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        timeManagement: z.number().min(0).max(100),
        strengths: z.array(z.string()).min(2).max(5),
        weaknesses: z.array(z.string()).min(2).max(5),
        recommendedTopics: z.array(
          z.object({
            topic: z.string(),
            currentLevel: z.string(),
            recommendedLevel: z.string(),
            studyTime: z.string(),
          })
        ).min(2).max(5),
        recommendation: z.string(),
      }),
      system: systemPrompt(data.config),
      prompt: `Full interview transcript with scores: ${JSON.stringify(data.history)}. Produce the final performance report.`,
    });
    return object;
  });