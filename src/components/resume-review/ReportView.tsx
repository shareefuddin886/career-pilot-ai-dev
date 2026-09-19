import { useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  type ReqStatus,
  type ResumeReview,
} from "@/lib/resume-review-types";

const STATUS_LABEL: Record<ReqStatus, string> = {
  verified: "Verified",
  related: "Related",
  not_found: "Not found",
  unclear: "Unclear",
};

const STATUS_CLASS: Record<ReqStatus, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  related: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  not_found: "border-border bg-surface-2 text-muted-foreground",
  unclear: "border-border bg-surface-2 text-muted-foreground",
};

function StatusPill({ status }: { status: ReqStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Section({
  title,
  children,
  hint,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-base font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      aria-label="Copy suggested text"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export function ReportView({
  review,
  onNewReview,
}: {
  review: ResumeReview;
  onNewReview: () => void;
}) {
  const reviewed = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const reqs = review.jobMatch?.requirements ?? [];
  const counts = {
    total: reqs.length,
    verified: reqs.filter((r) => r.status === "verified").length,
    related: reqs.filter((r) => r.status === "related").length,
    missing: reqs.filter((r) => r.status === "not_found" || r.status === "unclear").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Resume Review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {review.candidate.name ?? review.resumeFileName}
            {review.candidate.title ? ` · ${review.candidate.title}` : ""} · Reviewed {reviewed}
          </p>
        </div>
        <Button variant="outline" onClick={onNewReview}>
          Start another review
        </Button>
      </header>

      {/* Score + summary */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/40 p-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall score</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {review.overallScore}
            <span className="text-base font-normal text-muted-foreground"> / 100</span>
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{review.summary}</p>
      </div>

      {/* Resume health */}
      <Section title="Resume Health">
        <div className="space-y-3">
          {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((k) => {
            const v = review.categoryScores[k];
            return (
              <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[180px_minmax(0,1fr)_40px]">
                <span className="text-sm">{CATEGORY_LABELS[k]}</span>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface-2 sm:col-span-1">
                  <div
                    className={`h-full rounded-full ${
                      v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${v}%` }}
                  />
                </div>
                <span className="text-sm tabular-nums text-muted-foreground sm:text-right">{v}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Strengths */}
      {review.strengths.length ? (
        <Section title="Strengths">
          <ul className="space-y-2">
            {review.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Improvements */}
      {review.improvements.length ? (
        <Section title="Areas to Improve">
          <div className="space-y-4">
            {review.improvements.map((im, i) => (
              <div key={i} className="rounded-md border border-border bg-surface/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {im.category}
                </p>
                <p className="mt-1.5 text-sm font-medium">{im.issue}</p>
                {im.why ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">Why it matters: {im.why}</p>
                ) : null}
                {im.recommendation ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Recommendation: {im.recommendation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Job match */}
      {review.jobMatch && reqs.length ? (
        <Section
          title="Job Match"
          hint={review.jobMatch.role ? `Role: ${review.jobMatch.role}` : undefined}
        >
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Requirements checked", counts.total],
              ["Verified", counts.verified],
              ["Related", counts.related],
              ["Not found", counts.missing],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-md border border-border px-4 py-3">
                <p className="text-xl font-semibold tabular-nums">{value as number}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label as string}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Requirement</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Resume evidence</th>
                </tr>
              </thead>
              <tbody>
                {reqs.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4">{r.requirement}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {r.evidence ? `"${r.evidence}"` : (r.note ?? "Not found in resume.")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {counts.missing ? (
            <div className="mt-6 rounded-md border border-border bg-surface/40 p-4">
              <p className="text-sm font-medium">Missing or unverified requirements</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {reqs
                  .filter((r) => r.status === "not_found" || r.status === "unclear")
                  .map((r, i) => (
                    <li key={i}>• {r.requirement}</li>
                  ))}
              </ul>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                These were not found in the resume. That does not mean the skill is absent — adding
                it explicitly, if you have it, would make it verifiable.
              </p>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Rewrites */}
      {review.rewrites.length ? (
        <Section title="Suggested Improvements">
          <div className="space-y-4">
            {review.rewrites.map((rw, i) => (
              <div key={i} className="rounded-md border border-border bg-surface/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{rw.current}</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Suggested
                    </p>
                    <p className="mt-1 text-sm">{rw.suggested}</p>
                  </div>
                  <CopyButton text={rw.suggested} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Skills */}
      {review.skillGroups.length ? (
        <Section title="Skills found in your resume">
          <div className="space-y-3">
            {review.skillGroups.map((g) => (
              <div key={g.group} className="sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-sm font-medium">{g.group}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-0">{g.skills.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Section notes */}
      {review.sectionNotes.length ? (
        <Section title="Detailed review">
          <div className="space-y-3">
            {review.sectionNotes.map((s, i) => (
              <div key={i} className="sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-sm font-medium">{s.section}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-0">{s.note}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
