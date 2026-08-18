import { createFileRoute } from "@tanstack/react-router";
import { ScanSearch } from "lucide-react";
import { ComingNext } from "@/components/ComingNext";

export const Route = createFileRoute("/_authenticated/resume-review")({
  head: () => ({
    meta: [
      { title: "AI Resume Review — CareerPilot AI" },
      {
        name: "description",
        content:
          "Upload a resume PDF and get an ATS score, grammar check, and targeted improvements.",
      },
    ],
  }),
  component: () => (
    <ComingNext
      icon={ScanSearch}
      title="AI Resume Reviewer"
      tagline="Upload a PDF. Get an ATS compatibility score, grammar report, missing-skill suggestions, and a prioritized fix list."
      points={[
        "PDF upload with text extraction",
        "ATS compatibility score",
        "Strengths, weaknesses, grammar",
        "Beautiful charts and progress rings",
      ]}
    />
  ),
});