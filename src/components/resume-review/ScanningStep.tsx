import { Check, Loader2 } from "lucide-react";

export type Stage = { id: string; label: string };

export function ScanningStep({
  stages,
  activeIndex,
}: {
  stages: Stage[];
  activeIndex: number;
}) {
  const pct = Math.round((Math.min(activeIndex, stages.length) / stages.length) * 100);

  return (
    <section className="grid gap-10 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-12">
      {/* Document with scan line */}
      <div className="mx-auto w-full max-w-[260px]">
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-5">
          <div className="space-y-2.5">
            <div className="h-2.5 w-2/5 rounded-sm bg-foreground/25" />
            <div className="h-1.5 w-3/5 rounded-sm bg-foreground/12" />
            <div className="h-px w-full bg-border" />
            {[
              "w-full",
              "w-11/12",
              "w-4/5",
              "w-full",
              "w-3/5",
              "w-full",
              "w-10/12",
              "w-2/3",
              "w-full",
              "w-1/2",
            ].map((w, i) => (
              <div key={i} className={`h-1.5 rounded-sm bg-foreground/10 ${w}`} />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 h-px bg-primary/70"
            style={{ animation: "resume-scan 2.4s ease-in-out infinite" }}
            aria-hidden
          />
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h2 className="text-xl font-semibold">Reviewing your resume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes a few seconds.
        </p>

        <div
          className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Review progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{pct}% complete</p>

        <ul className="mt-6 space-y-3">
          {stages.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    done
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                      : active
                        ? "border-primary/50 text-primary"
                        : "border-border text-muted-foreground/50"
                  }`}
                >
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                </span>
                <span
                  className={
                    done || active ? "text-foreground" : "text-muted-foreground/70"
                  }
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
