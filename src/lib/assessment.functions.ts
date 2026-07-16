import { createServerFn } from "@tanstack/react-start";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-2.5-flash";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "code", "scenario"]),
  topic: z.string(),
  prompt: z.string(),
  code: z.string().nullable(),
  options: z.array(z.string()).nullable(),
  correctIndex: z.number().nullable(),
  correctAnswer: z.string().nullable(),
  explanation: z.string(),
});

export type AssessmentQuestion = z.infer<typeof QuestionSchema>;

const GenInput = z.object({
  technology: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().min(3).max(20),
  mix: z.object({
    mcq: z.number(),
    code: z.number(),
    scenario: z.number(),
  }),
  mode: z
    .enum(["mixed", "mcq", "coding", "scenario", "debugging", "rapid"])
    .optional()
    .default("mixed"),
  adaptive: z.boolean().optional().default(true),
});

export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => GenInput.parse(d))
  .handler(async ({ data }) => {
    const modeHint =
      data.mode === "mcq"
        ? "MCQ only."
        : data.mode === "coding"
          ? "All coding output/prediction questions using the code field."
          : data.mode === "scenario"
            ? "All scenario/design questions."
            : data.mode === "debugging"
              ? "All debugging questions: put buggy snippet in code and ask which fix is correct as MCQ."
              : data.mode === "rapid"
                ? "All short MCQs, one line each."
                : `Mixed: ${data.mix.mcq} MCQ, ${data.mix.code} code, ${data.mix.scenario} scenario.`;

    const run = async () => {
      const { object } = await generateObject({
        model: getModel(),
        schema: z.object({ questions: z.array(QuestionSchema) }),
        system:
          "You are a senior technical interviewer. Output ONLY valid JSON matching the schema. For MCQ: options length 4, correctIndex 0-3, correctAnswer=null. For code: put snippet in code, options length 4, correctIndex 0-3, correctAnswer=null. For scenario: options=null, correctIndex=null, correctAnswer is a 2-4 sentence model answer. explanation is always required and non-empty.",
        prompt: `Create ${data.count} ${data.difficulty} questions for ${data.technology}. ${modeHint} Vary topics. Unique short ids q1..q${data.count}.`,
      });
      return object.questions.slice(0, data.count);
    };

    try {
      return await run();
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) {
        // one retry, keep same schema — Gemini occasionally emits invalid JSON
        return await run();
      }
      throw e;
    }
  });

const EvalInput = z.object({
  technology: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answers: z.array(
    z.object({
      question: QuestionSchema,
      userAnswer: z.string(),
      selectedIndex: z.number().nullable(),
    })
  ),
});

export const evaluateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EvalInput.parse(d))
  .handler(async ({ data }) => {
    // Auto-grade objective, LLM grades scenarios + produces report
    const items = data.answers.map((a) => {
      let correct = false;
      if (a.question.type === "mcq" || a.question.type === "code") {
        correct = a.selectedIndex != null && a.selectedIndex === a.question.correctIndex;
      }
      return { ...a, autoCorrect: correct };
    });

    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({
        scenarioScores: z.array(
          z.object({
            id: z.string(),
            score: z.number().min(0).max(10),
            feedback: z.string(),
          })
        ),
        overallScore: z.number().min(0).max(100),
        radar: z.object({
          accuracy: z.number().min(0).max(100),
          problemSolving: z.number().min(0).max(100),
          conceptUnderstanding: z.number().min(0).max(100),
          confidence: z.number().min(0).max(100),
          codingSkill: z.number().min(0).max(100),
          communication: z.number().min(0).max(100),
        }),
        interviewReadiness: z.number().min(0).max(100),
        skillLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
        companiesReady: z.array(z.string()),
        companiesNeedsImprovement: z.array(z.string()),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        weakTopics: z.array(z.string()),
        learningPath: z.array(
          z.object({
            topic: z.string(),
            resource: z.string(),
            reason: z.string(),
          })
        ),
        summary: z.string(),
      }),
      system:
        "You are a fair but strict technical evaluator producing a rich, actionable report. Score scenarios 0-10 with 1-line feedback. Compute overallScore 0-100. Produce a 6-axis radar (all 0-100). Estimate interviewReadiness 0-100 and a skillLevel bucket. Suggest 3-6 Indian/global companies the candidate is READY for (service+product tiers) and 2-5 that NEED IMPROVEMENT. Return concise, actionable output. Output ONLY valid JSON.",
      prompt: `Technology: ${data.technology} (${data.difficulty}).\nAnswers:\n${JSON.stringify(items)}\n\nGrade scenarios by id. Combine auto-graded MCQ/code (each 10) with scenario scores for overallScore. Return 2-5 strengths, 2-5 weaknesses, weak topic tags, 3-5 learning-path items (topic, resource, one-line reason).`,
    });

    return { grading: items, ...object };
  });