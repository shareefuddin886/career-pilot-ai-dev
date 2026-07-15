import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import {
  evaluateAssessment,
  generateAssessment,
  type AssessmentQuestion,
} from "@/lib/assessment.functions";

export const Route = createFileRoute("/skill-assessment")({
  head: () => ({
    meta: [
      { title: "Skill Assessment — CareerPilot AI" },
      {
        name: "description",
        content:
          "Adaptive MCQ, code and scenario quizzes across Java, React, SQL, and more — with AI explanations, weak-topic analysis, and a personalized learning path.",
      },
    ],
  }),
  component: SkillAssessmentPage,
});

type Phase = "setup" | "quiz" | "report";
type Difficulty = "easy" | "medium" | "hard";

const TECHS = [
  { id: "Java", topics: "OOP, Collections, JVM, Streams" },
  { id: "Spring Boot", topics: "DI, JPA, REST, Security" },
  { id: "Python", topics: "Syntax, Data structures, OOP" },
  { id: "JavaScript", topics: "ES6+, Async, DOM" },
  { id: "React", topics: "Hooks, State, Rendering" },
  { id: "SQL", topics: "Joins, Indexing, Windows" },
  { id: "C++", topics: "Pointers, STL, OOP" },
  { id: "Data Structures", topics: "Arrays, Trees, Graphs" },
];

const DIFFS: { id: Difficulty; label: string; count: number; time: number; hint: string }[] = [
  { id: "easy", label: "Easy", count: 6, time: 10, hint: "Fundamentals & syntax" },
  { id: "medium", label: "Medium", count: 9, time: 18, hint: "Applied problem solving" },
  { id: "hard", label: "Hard", count: 12, time: 25, hint: "Design & edge cases" },
];

const MIX: Record<Difficulty, { mcq: number; code: number; scenario: number }> = {
  easy: { mcq: 4, code: 1, scenario: 1 },
  medium: { mcq: 5, code: 3, scenario: 1 },
  hard: { mcq: 6, code: 4, scenario: 2 },
};

type Answer = { selectedIndex: number | null; text: string };

function SkillAssessmentPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [tech, setTech] = useState<string>("Java");
  const [diff, setDiff] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [current, setCurrent] = useState(0);
  const [report, setReport] = useState<Awaited<ReturnType<typeof evaluateAssessment>> | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const gen = useServerFn(generateAssessment);
  const evalFn = useServerFn(evaluateAssessment);

  const meta = DIFFS.find((d) => d.id === diff)!;

  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) {
      void submit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const qs = await gen({
        data: { technology: tech, difficulty: diff, count: meta.count, mix: MIX[diff] },
      });
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(meta.time * 60);
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        question: q,
        userAnswer: answers[q.id]?.text ?? "",
        selectedIndex: answers[q.id]?.selectedIndex ?? null,
      }));
      const res = await evalFn({
        data: { technology: tech, difficulty: diff, answers: payload },
      });
      setReport(res);
      setPhase("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-24 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <Setup
            key="setup"
            tech={tech}
            setTech={setTech}
            diff={diff}
            setDiff={setDiff}
            loading={loading}
            error={error}
            onStart={start}
          />
        )}
        {phase === "quiz" && (
          <Quiz
            key="quiz"
            tech={tech}
            diff={diff}
            questions={questions}
            current={current}
            setCurrent={setCurrent}
            answers={answers}
            setAnswers={setAnswers}
            timeLeft={timeLeft}
            loading={loading}
            onSubmit={submit}
          />
        )}
        {phase === "report" && report && (
          <Report
            key="report"
            tech={tech}
            diff={diff}
            report={report}
            onRestart={() => {
              setPhase("setup");
              setReport(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Setup ---------------- */

function Setup({
  tech,
  setTech,
  diff,
  setDiff,
  loading,
  error,
  onStart,
}: {
  tech: string;
  setTech: (v: string) => void;
  diff: Difficulty;
  setDiff: (v: Difficulty) => void;
  loading: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const meta = DIFFS.find((d) => d.id === diff)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-6xl px-4 md:px-8"
    >
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Adaptive AI Assessment
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Test your skills the way{" "}
          <span className="text-gradient-lime">recruiters do.</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Pick a technology and difficulty. Answer MCQ, code, and scenario questions.
          Get AI-explained mistakes and a personalized learning path.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="glass rounded-3xl p-8 shadow-card">
          <SectionTitle icon={Layers} label="Technology" />
          <div className="mt-5 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TECHS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTech(t.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  tech === t.id
                    ? "border-primary/60 bg-primary/5 shadow-glow"
                    : "border-border/60 hover:border-border bg-surface/40"
                }`}
              >
                <div className="font-semibold">{t.id}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.topics}</div>
              </button>
            ))}
          </div>

          <div className="mt-10">
            <SectionTitle icon={Target} label="Difficulty" />
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {DIFFS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDiff(d.id)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    diff === d.id
                      ? "border-primary/60 bg-primary/5 shadow-glow"
                      : "border-border/60 hover:border-border bg-surface/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{d.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.count} Qs · {d.time}m
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{d.hint}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="glass rounded-3xl p-6 shadow-card h-fit sticky top-24">
          <div className="text-xs uppercase tracking-widest text-primary" style={{ fontFamily: "var(--font-mono)" }}>
            /Session
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Ready to begin</h3>
          <div className="mt-6 space-y-3 text-sm">
            <Row label="Technology" value={tech} />
            <Row label="Difficulty" value={meta.label} />
            <Row label="Questions" value={`${meta.count}`} />
            <Row label="Duration" value={`${meta.time} min`} />
            <Row
              label="Mix"
              value={`${MIX[diff].mcq} MCQ · ${MIX[diff].code} Code · ${MIX[diff].scenario} Scenario`}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={onStart}
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--gradient-lime)" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                Start Assessment <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Powered by Gemini · Adaptive question set
          </p>
        </aside>
      </div>
    </motion.div>
  );
}

/* ---------------- Quiz ---------------- */

function Quiz({
  tech,
  diff,
  questions,
  current,
  setCurrent,
  answers,
  setAnswers,
  timeLeft,
  loading,
  onSubmit,
}: {
  tech: string;
  diff: Difficulty;
  questions: AssessmentQuestion[];
  current: number;
  setCurrent: (n: number) => void;
  answers: Record<string, Answer>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Answer>>>;
  timeLeft: number;
  loading: boolean;
  onSubmit: () => void;
}) {
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const setAnswer = (patch: Partial<Answer>) =>
    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        selectedIndex: prev[q.id]?.selectedIndex ?? null,
        text: prev[q.id]?.text ?? "",
        ...patch,
      },
    }));

  const isLast = current === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-6xl px-4 md:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary" style={{ fontFamily: "var(--font-mono)" }}>
            /{tech} · {diff}
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Question {current + 1} <span className="text-muted-foreground">/ {questions.length}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="tabular-nums font-medium">{mm}:{ss}</span>
          </div>
          <div className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" /> {answered}/{questions.length} answered
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-surface overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${((current + 1) / questions.length) * 100}%`,
            background: "var(--gradient-lime)",
          }}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_260px] gap-6">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-8 shadow-card"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TypeBadge type={q.type} />
            <span className="rounded-full bg-surface px-2.5 py-1">{q.topic}</span>
          </div>
          <h3 className="mt-4 text-xl md:text-2xl font-semibold leading-snug">{q.prompt}</h3>

          {q.code && (
            <pre className="mt-5 overflow-auto rounded-2xl border border-border/60 bg-black/40 p-4 text-sm leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
              <code>{q.code}</code>
            </pre>
          )}

          {(q.type === "mcq" || q.type === "code") && q.options && (
            <div className="mt-6 space-y-2">
              {q.options.map((opt, i) => {
                const selected = answers[q.id]?.selectedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswer({ selectedIndex: i, text: opt })}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      selected
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/60 hover:border-border bg-surface/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                          selected
                            ? "text-primary-foreground"
                            : "bg-surface text-muted-foreground"
                        }`}
                        style={selected ? { background: "var(--gradient-lime)" } : undefined}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "scenario" && (
            <textarea
              value={answers[q.id]?.text ?? ""}
              onChange={(e) => setAnswer({ text: e.target.value, selectedIndex: null })}
              rows={6}
              placeholder="Write your answer. Explain your reasoning and trade-offs..."
              className="mt-6 w-full rounded-2xl border border-border/60 bg-surface/40 p-4 text-sm outline-none focus:border-primary/60 transition-colors"
            />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="rounded-full glass px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
            >
              Previous
            </button>
            {isLast ? (
              <button
                onClick={onSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                style={{ background: "var(--gradient-lime)" }}
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Grading…</> : <>Submit Assessment <ChevronRight className="h-4 w-4" /></>}
              </button>
            ) : (
              <button
                onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-lime)" }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        <aside className="glass rounded-3xl p-4 shadow-card h-fit sticky top-24">
          <div className="text-xs text-muted-foreground mb-3 px-1">Question map</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((qq, i) => {
              const a = answers[qq.id];
              const done = a && (a.selectedIndex != null || a.text.trim().length > 0);
              const isCurrent = i === current;
              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrent(i)}
                  className={`h-9 rounded-lg text-xs font-medium border transition-all ${
                    isCurrent
                      ? "border-primary/60 text-primary-foreground shadow-glow"
                      : done
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-border/60 bg-surface/40 text-muted-foreground hover:text-foreground"
                  }`}
                  style={isCurrent ? { background: "var(--gradient-lime)" } : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground leading-relaxed px-1">
            Auto-submits when time runs out. You can revisit any question before submitting.
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

/* ---------------- Report ---------------- */

function Report({
  tech,
  diff,
  report,
  onRestart,
}: {
  tech: string;
  diff: Difficulty;
  report: NonNullable<Awaited<ReturnType<typeof evaluateAssessment>>>;
  onRestart: () => void;
}) {
  const correctCount = useMemo(
    () => report.grading.filter((g) => g.autoCorrect).length,
    [report]
  );
  const total = report.grading.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-6xl px-4 md:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
            {tech} · {diff}
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
            Your Assessment <span className="text-gradient-lime">Report</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">{report.summary}</p>
        </div>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:bg-surface"
        >
          Take another
        </button>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <ScoreRing label="Overall" value={report.overallScore} />
        <StatCard
          label="Objective Accuracy"
          value={`${correctCount}/${total.toString()}`}
          icon={Target}
          sub="MCQ + Code auto-graded"
        />
        <StatCard
          label="Weak Topics"
          value={String(report.weakTopics.length)}
          icon={TrendingUp}
          sub={report.weakTopics.slice(0, 3).join(" · ") || "None identified"}
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <ListCard
          title="Strengths"
          items={report.strengths}
          icon={Check}
          tone="primary"
        />
        <ListCard
          title="Weaknesses"
          items={report.weaknesses}
          icon={X}
          tone="danger"
        />
      </div>

      <div className="mt-6 glass rounded-3xl p-6 md:p-8 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold tracking-tight">Recommended learning path</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {report.learningPath.map((l, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <div className="font-semibold">{l.topic}</div>
              <div className="mt-1 text-sm text-primary">{l.resource}</div>
              <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{l.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold tracking-tight mb-4">Question review</h3>
        <div className="space-y-3">
          {report.grading.map((g, i) => {
            const q = g.question;
            const scenario = report.scenarioScores.find((s) => s.id === q.id);
            const passed = q.type === "scenario" ? (scenario?.score ?? 0) >= 6 : g.autoCorrect;
            return (
              <details
                key={q.id}
                className="group glass rounded-2xl overflow-hidden border border-border/60"
              >
                <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                      passed
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <TypeBadge type={q.type} />
                      <span>Q{i + 1} · {q.topic}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium truncate">{q.prompt}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-border/60 p-5 space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Your answer
                    </div>
                    <div className="rounded-xl bg-surface/60 p-3">
                      {g.userAnswer || <span className="text-muted-foreground">No answer</span>}
                    </div>
                  </div>
                  {(q.type === "mcq" || q.type === "code") && q.options && q.correctIndex != null && (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Correct answer
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                        {q.options[q.correctIndex]}
                      </div>
                    </div>
                  )}
                  {q.type === "scenario" && q.correctAnswer && (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Model answer
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                        {q.correctAnswer}
                      </div>
                    </div>
                  )}
                  {scenario && (
                    <div className="rounded-xl border border-border/60 bg-surface/40 p-3">
                      <div className="text-xs text-muted-foreground">
                        Scenario score: <span className="text-foreground font-semibold">{scenario.score}/10</span>
                      </div>
                      <div className="mt-1">{scenario.feedback}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      AI explanation
                    </div>
                    <div className="text-muted-foreground leading-relaxed">{q.explanation}</div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Bits ---------------- */

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
        style={{ background: "var(--gradient-lime)" }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="text-sm font-semibold tracking-tight">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: AssessmentQuestion["type"] }) {
  const map = {
    mcq: { label: "MCQ", icon: BrainCircuit },
    code: { label: "Code", icon: Code2 },
    scenario: { label: "Scenario", icon: Lightbulb },
  } as const;
  const it = map[type];
  const Icon = it.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
      <Icon className="h-3 w-3" /> {it.label}
    </span>
  );
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <div className="glass rounded-3xl p-6 shadow-card flex items-center gap-5">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} strokeWidth="8" className="stroke-border/60" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={r}
            strokeWidth="8"
            fill="none"
            stroke="url(#g)"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.85 0.19 130)" />
              <stop offset="100%" stopColor="oklch(0.72 0.20 145)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-3xl font-semibold text-gradient-lime tabular-nums">{v}</div>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold">out of 100</div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-2 text-xs text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}

function ListCard({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "danger";
}) {
  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            tone === "primary" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-muted-foreground">
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                tone === "primary" ? "bg-primary" : "bg-destructive"
              }`}
            />
            <span className="text-foreground/90">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}