import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ComingNext } from "@/components/ComingNext";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: "AI Resume Builder — CareerPilot AI" },
      {
        name: "description",
        content:
          "Generate ATS-ready resumes with AI-crafted bullet points, stronger verbs, and modern layouts.",
      },
    ],
  }),
  component: () => (
    <ComingNext
      icon={FileText}
      title="AI Resume Builder"
      tagline="Fill in your details once. Get a polished, ATS-ready resume with AI-rewritten bullets and downloadable PDF."
      points={[
        "Structured form: education, skills, projects, experience",
        "Multiple modern resume layouts",
        "Gemini rewrites weak bullet points",
        "One-click PDF export",
      ]}
    />
  ),
});