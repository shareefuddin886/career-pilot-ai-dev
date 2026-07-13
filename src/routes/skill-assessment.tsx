import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { ComingNext } from "@/components/ComingNext";

export const Route = createFileRoute("/skill-assessment")({
  head: () => ({
    meta: [
      { title: "Skill Assessment — CareerPilot AI" },
      {
        name: "description",
        content:
          "Adaptive quizzes across Java, React, SQL and more, with AI explanations for every mistake.",
      },
    ],
  }),
  component: () => (
    <ComingNext
      icon={BrainCircuit}
      title="Skill Assessment"
      tagline="Pick a technology and difficulty. Answer MCQ, code, and scenario questions. Get AI-explained mistakes and a learning path."
      points={[
        "Java, Spring Boot, Python, JS, React, SQL, C++",
        "MCQ, code, and scenario questions",
        "AI explanations, not just correct answers",
        "Weak-topic breakdown & learning suggestions",
      ]}
    />
  ),
});