import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportView } from "@/components/resume-review/ReportView";
import { ScanningStep, type Stage } from "@/components/resume-review/ScanningStep";
import { UploadStep, type UploadState } from "@/components/resume-review/UploadStep";
import { deleteReview, loadReviews, saveReview } from "@/components/resume-review/history";
import { extractDocumentText, reviewResume } from "@/lib/resume-review.functions";
import type { ResumeReview } from "@/lib/resume-review-types";

export const Route = createFileRoute("/resume-review")({
  head: () => ({
    meta: [
      { title: "Resume Review — Nexora" },
      {
        name: "description",
        content:
          "Upload your resume and get clear, evidence-backed feedback on content, experience, skills, ATS readability and formatting — plus a role-specific comparison.",
      },
      { property: "og:title", content: "Resume Review — Nexora" },
      {
        property: "og:description",
        content:
          "Clear, actionable resume feedback with evidence quoted from your own resume, and optional job-description matching.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumeReviewPage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result ?? "");
      resolve(res.slice(res.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

type Phase = "upload" | "scanning" | "report";

function ResumeReviewPage() {
  const extract = useServerFn(extractDocumentText);
  const review = useServerFn(reviewResume);

  const [phase, setPhase] = useState<Phase>("upload");
  const [state, setState] = useState<UploadState>({ resume: null, jdFile: null, jdText: "" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeReview | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [history, setHistory] = useState<ResumeReview[]>([]);
  const running = useRef(false);

  useEffect(() => {
    setHistory(loadReviews());
  }, []);

  const hasJd = Boolean(state.jdFile) || state.jdText.trim().length > 40;

  const stages: Stage[] = [
    { id: "read", label: "Reading your resume" },
    { id: "extract", label: "Extracting text" },
    ...(hasJd ? [{ id: "jd", label: "Reading the job description" }] : []),
    { id: "review", label: "Reviewing content, skills and structure" },
    ...(hasJd ? [{ id: "match", label: "Comparing job requirements" }] : []),
    { id: "prepare", label: "Preparing recommendations" },
  ];

  const start = useCallback(async () => {
    if (!state.resume || running.current) return;
    running.current = true;
    setError(null);
    setPhase("scanning");
    setStageIndex(0);

    try {
      const resumeB64 = await fileToBase64(state.resume);
      setStageIndex(1);
      const resumeRes = await extract({
        data: { fileBase64: resumeB64, fileName: state.resume.name },
      });
      if (!resumeRes.ok) {
        setError(resumeRes.error);
        setPhase("upload");
        return;
      }

      let jobText: string | null = null;
      if (state.jdFile) {
        setStageIndex(2);
        const jdB64 = await fileToBase64(state.jdFile);
        const jdRes = await extract({
          data: { fileBase64: jdB64, fileName: state.jdFile.name },
        });
        if (!jdRes.ok) {
          setError(`Job description: ${jdRes.error}`);
          setPhase("upload");
          return;
        }
        jobText = jdRes.text;
      } else if (state.jdText.trim().length > 40) {
        setStageIndex(2);
        jobText = state.jdText.trim();
      }

      setStageIndex(hasJd ? 3 : 2);
      const res = await review({
        data: {
          resumeText: resumeRes.text,
          jobText,
          resumeFileName: state.resume.name,
        },
      });
      if (!res.ok) {
        setError(res.error);
        setPhase("upload");
        return;
      }

      setStageIndex(stages.length);
      setResult(res.review);
      setHistory(saveReview(res.review));
      setPhase("report");
    } catch {
      setError("Something went wrong while reviewing this resume. Please try again.");
      setPhase("upload");
    } finally {
      running.current = false;
    }
  }, [state, extract, review, hasJd, stages.length]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14">
      {phase === "upload" ? (
        <>
          <header className="mb-10">
            <h1 className="text-3xl font-semibold">Resume Review</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Get clear, actionable feedback on your resume.
            </p>
          </header>

          <UploadStep state={state} setState={setState} onStart={() => void start()} error={error} />

          {history.length ? (
            <section className="mt-14 border-t border-border pt-8">
              <h2 className="text-base font-semibold">Recent reviews</h2>
              <ul className="mt-4 space-y-2">
                {history.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-surface/40 px-4 py-3"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setResult(r);
                        setPhase("report");
                      }}
                    >
                      <span className="block truncate text-sm font-medium">
                        {r.candidate.name ?? r.resumeFileName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()} · {r.overallScore}/100
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Delete review"
                      onClick={() => setHistory(deleteReview(r.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {phase === "scanning" ? <ScanningStep stages={stages} activeIndex={stageIndex} /> : null}

      {phase === "report" && result ? (
        <ReportView
          review={result}
          onNewReview={() => {
            setResult(null);
            setState({ resume: null, jdFile: null, jdText: "" });
            setPhase("upload");
          }}
        />
      ) : null}

      {phase === "report" && !result ? (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> This review is no longer available.
        </p>
      ) : null}
    </main>
  );
}
