import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { ComingNext } from "@/components/ComingNext";

export const Route = createFileRoute("/mock-interview")({
  head: () => ({
    meta: [
      { title: "AI Mock Interview — CareerPilot AI" },
      {
        name: "description",
        content:
          "Practice with an AI interviewer that adapts difficulty and returns a full performance report.",
      },
    ],
  }),
  component: () => (
    <ComingNext
      icon={MessagesSquare}
      title="AI Mock Interview"
      tagline="A ChatGPT-style interviewer that asks one question at a time, evaluates each answer, and adapts difficulty as you go."
      points={[
        "Roles: Java / Backend / Full Stack / SDE",
        "HR, Technical, or Mixed rounds",
        "Per-answer scoring & follow-ups",
        "Final report: communication, technical, confidence",
      ]}
    />
  ),
});