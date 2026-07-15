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
});

export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => GenInput.parse(d))
  .handler(async ({ data }) => {
    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({ questions: z.array(QuestionSchema) }),
      system:
        "You are a senior technical interviewer and educator. Generate high-quality assessment questions. For MCQ set options (4), correctIndex, options must not repeat, and correctAnswer=null. For code, put the snippet in code, set options (4) representing possible outputs / next lines / bug fixes, correctIndex, correctAnswer=null. For scenario, options=null, correctIndex=null, correctAnswer is a short model answer (2-4 sentences). Always include a concise explanation.",
      prompt: `Create ${data.count} ${data.difficulty} difficulty questions for ${data.technology}. Mix: ${data.mix.mcq} MCQ, ${data.mix.code} code, ${data.mix.scenario} scenario. Vary topics within ${data.technology}. Use unique short ids like q1, q2, ...`,
    });
    return object.questions.slice(0, data.count);
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
        "You are a fair but strict technical evaluator. Score scenario answers 0-10 with a one-line feedback. Then produce an overall report combining auto-graded MCQ/code (each worth 10) with scenario scores. Return concise, actionable output.",
      prompt: `Technology: ${data.technology} (${data.difficulty}).\nAnswers:\n${JSON.stringify(items)}\n\nGrade scenarios by id. Compute overallScore in 0-100 using average across all questions. Return 2-5 strengths, 2-5 weaknesses, weak topic tags (short), and a 3-5 item learning path (topic, one recommended resource, one-line reason).`,
    });

    return { grading: items, ...object };
  });