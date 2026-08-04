import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  Award, BadgeCheck, BrainCircuit, Briefcase, Check, ChevronLeft, ChevronRight,
  Download, FileText, GraduationCap, Layout, Lightbulb, Loader2, Plus, Printer,
  Sparkles, Trash2, TriangleAlert, User, Wand2, X,
} from "lucide-react";
import {
  STEPS, emptyResume, uid,
  type ResumeData, type Education, type Project, type Experience, type Certification,
  type TemplateKey,
} from "./types";
import { ResumePreview } from "./ResumePreview";
import { improveText, analyzeResume, liveTips } from "@/lib/resume.functions";

const STORAGE_KEY = "careerpilot-resume-v1";

const SKILL_LIBRARY = [
  "Java", "Spring Boot", "React", "JavaScript", "TypeScript", "SQL", "MongoDB",
  "Docker", "Git", "AWS", "Hibernate", "REST APIs", "Node.js", "Python",
  "Kubernetes", "GraphQL", "Redis", "Kafka", "Microservices", "System Design",
];

const TEMPLATES: { key: TemplateKey; name: string; hint: string }[] = [
  { key: "modern", name: "Modern", hint: "Emerald accent, clean" },
  { key: "minimal", name: "Minimal", hint: "Editorial, serif" },
  { key: "professional", name: "Professional", hint: "Bold banner" },
  { key: "corporate", name: "Corporate", hint: "Monochrome" },
  { key: "developer", name: "Developer", hint: "Mono type" },
  { key: "executive", name: "Executive", hint: "Amber, refined" },
];

const STEP_ICONS = [User, FileText, GraduationCap, Sparkles, Layout, Briefcase, Award, Download];

export default function ResumeStudio() {
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<TemplateKey>("modern");
  const [tips, setTips] = useState<{ type: string; text: string }[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeResume>> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const improveFn = useServerFn(improveText);
  const analyzeFn = useServerFn(analyzeResume);
  const tipsFn = useServerFn(liveTips);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  // debounced live tips
  useEffect(() => {
    const filled =
      data.personal.fullName ||
      data.summary ||
      data.experience.length ||
      data.projects.length;
    if (!filled) {
      setTips([]);
      return;
    }
    const t = setTimeout(async () => {
      setTipsLoading(true);
      try {
        const r = await tipsFn({ data: { resume: JSON.stringify(data).slice(0, 6000) } });
        setTips(r.tips);
      } catch {} finally { setTipsLoading(false); }
    }, 1400);
    return () => clearTimeout(t);
  }, [data, tipsFn]);

  const setPersonal = (k: keyof ResumeData["personal"], v: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const r = await analyzeFn({ data: { resume: JSON.stringify(data) } });
      setAnalysis(r);
    } finally { setAnalyzing(false); }
  };

  const printResume = () => window.print();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]" />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-8 print:hidden">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Resume Studio
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Build a <span className="text-gradient-lime">Professional Resume</span> with AI
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl">
              Create an ATS-friendly resume in minutes. Improve your content with AI, preview in real time, and export a polished resume ready for placements.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["ATS Friendly", "Live Resume Preview", "AI Writing Assistant"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {b}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl glass p-6 shadow-card">
              <div className="rounded-2xl bg-white/95 aspect-[1/1.15] p-4 text-slate-800 text-[10px] leading-snug overflow-hidden">
                <div className="h-3 w-32 bg-slate-900 rounded" />
                <div className="mt-2 h-1.5 w-40 bg-emerald-500 rounded" />
                <div className="mt-4 space-y-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-1.5 w-full bg-slate-200 rounded" style={{ width: `${90 - i * 6}%` }} />
                  ))}
                </div>
                <div className="mt-4 flex gap-1.5 flex-wrap">
                  {["Java", "React", "AWS", "Docker", "SQL"].map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[8px] border border-emerald-200">{s}</span>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-1.5 bg-slate-200 rounded" style={{ width: `${60 + (i % 3) * 12}%` }} />
                  ))}
                </div>
              </div>
              <FloatingChip className="absolute -top-3 -left-3" tone="emerald" icon={<Check className="h-3 w-3" />} text="Grammar Improved" delay={0} />
              <FloatingChip className="absolute top-10 -right-4" tone="lime" icon={<Sparkles className="h-3 w-3" />} text="ATS Score 94%" delay={0.4} />
              <FloatingChip className="absolute bottom-16 -left-4" tone="fuchsia" icon={<Wand2 className="h-3 w-3" />} text="Strong Verbs Added" delay={0.8} />
              <FloatingChip className="absolute -bottom-3 right-4" tone="sky" icon={<BrainCircuit className="h-3 w-3" />} text="AI Suggestions Applied" delay={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 print:p-0 print:max-w-none">
        {/* Step nav */}
        <div className="rounded-2xl glass p-3 mb-6 print:hidden">
          <div className="flex gap-1.5 overflow-x-auto">
            {STEPS.map((label, i) => {
              const Icon = STEP_ICONS[i];
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={label}
                  onClick={() => setStep(i)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : done
                        ? "text-foreground bg-surface"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="opacity-70">{i + 1}.</span> {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[45%_55%] gap-6 print:block">
          {/* LEFT — editor */}
          <div className="print:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl glass p-6 shadow-card"
              >
                {step === 0 && <PersonalStep data={data} onChange={setPersonal} />}
                {step === 1 && (
                  <SummaryStep
                    value={data.summary}
                    onChange={(v) => setData((d) => ({ ...d, summary: v }))}
                    improve={improveFn}
                  />
                )}
                {step === 2 && <EducationStep data={data} setData={setData} />}
                {step === 3 && <SkillsStep data={data} setData={setData} />}
                {step === 4 && <ProjectsStep data={data} setData={setData} improve={improveFn} />}
                {step === 5 && <ExperienceStep data={data} setData={setData} improve={improveFn} />}
                {step === 6 && <CertificationsStep data={data} setData={setData} />}
                {step === 7 && (
                  <ExportStep
                    onPrint={printResume}
                    onAnalyze={analyze}
                    analyzing={analyzing}
                    analysis={analysis}
                  />
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    disabled={step === STEPS.length - 1}
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-40"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* AI assistant panel */}
            <div className="mt-6 rounded-2xl glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold tracking-tight">AI Writing Assistant</h3>
                {tipsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-2">
                {tips.length === 0 && (
                  <p className="text-xs text-muted-foreground">Start filling your resume — smart suggestions will appear here.</p>
                )}
                {tips.map((t, i) => (
                  <TipCard key={i} type={t.type} text={t.text} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — preview */}
          <div className="lg:sticky lg:top-24 self-start print:static">
            <div className="rounded-2xl glass p-3 mb-4 print:hidden">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground px-2 pb-2">Templates</p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTemplate(t.key)}
                    className={`rounded-xl p-2 text-left transition-all border ${
                      template === t.key
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-border bg-surface/50"
                    }`}
                  >
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-card print:shadow-none print:rounded-none">
              <motion.div
                key={template}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ResumePreview data={data} template={template} />
              </motion.div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <button onClick={printResume} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={printResume} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button onClick={analyze} disabled={analyzing} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-primary" />} Improve Entire Resume
              </button>
            </div>
          </div>
        </div>

        {analysis && (
          <AnalysisPanel analysis={analysis} onClose={() => setAnalysis(null)} />
        )}
      </section>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area { position: absolute !important; left: 0; top: 0; width: 100% !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function FloatingChip({
  className, tone, icon, text, delay,
}: { className: string; tone: string; icon: React.ReactNode; text: string; delay: number }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    lime: "bg-primary/20 text-primary border-primary/40",
    fuchsia: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
    sky: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{ opacity: { delay, duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay } }}
      className={`${className} inline-flex items-center gap-1.5 rounded-full backdrop-blur-xl border px-2.5 py-1 text-[11px] font-medium shadow-lg ${tones[tone]}`}
    >
      {icon} {text}
    </motion.div>
  );
}

function TipCard({ type, text }: { type: string; text: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    success: { icon: <Check className="h-3.5 w-3.5" />, cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
    warning: { icon: <TriangleAlert className="h-3.5 w-3.5" />, cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
    idea: { icon: <Lightbulb className="h-3.5 w-3.5" />, cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
    sparkle: { icon: <Sparkles className="h-3.5 w-3.5" />, cls: "text-primary border-primary/30 bg-primary/10" },
  };
  const s = map[type] ?? map.idea;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${s.cls}`}>
      <span className="mt-0.5">{s.icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StepHeader({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="relative block group">
      <input
        type={type}
        value={value}
        placeholder={placeholder || " "}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full rounded-xl bg-surface/60 border border-border/60 px-3.5 pt-5 pb-1.5 text-sm text-foreground placeholder-transparent focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition"
      />
      <span className="pointer-events-none absolute left-3.5 top-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground peer-focus:text-primary">
        {label}
      </span>
    </label>
  );
}

function TextArea({
  label, value, onChange, rows = 4, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="relative block">
      <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-1.5">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-surface/60 border border-border/60 p-3 text-sm resize-y focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

function PersonalStep({
  data, onChange,
}: { data: ResumeData; onChange: (k: keyof ResumeData["personal"], v: string) => void }) {
  const p = data.personal;
  return (
    <>
      <StepHeader icon={User} title="Personal Information" hint="Recruiters see this at the top of your resume." />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full Name" value={p.fullName} onChange={(v) => onChange("fullName", v)} />
        <Field label="Professional Title" value={p.title} onChange={(v) => onChange("title", v)} placeholder="e.g. Full-Stack Developer" />
        <Field label="Email" value={p.email} onChange={(v) => onChange("email", v)} type="email" />
        <Field label="Phone" value={p.phone} onChange={(v) => onChange("phone", v)} />
        <Field label="Location" value={p.location} onChange={(v) => onChange("location", v)} />
        <Field label="LinkedIn" value={p.linkedin} onChange={(v) => onChange("linkedin", v)} />
        <Field label="GitHub" value={p.github} onChange={(v) => onChange("github", v)} />
        <Field label="Portfolio Website" value={p.website} onChange={(v) => onChange("website", v)} />
      </div>
    </>
  );
}

function ImproveButton({
  onClick, loading,
}: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-60"
      style={{ background: "var(--gradient-gold)" }}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      Improve with AI
    </button>
  );
}

function DiffPanel({
  original, improved, onAccept, onReject,
}: { original: string; improved: string; onAccept: () => void; onReject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-1.5">Original</p>
          <p className="text-xs whitespace-pre-wrap text-muted-foreground">{original}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-primary mb-1.5">AI Enhanced</p>
          <p className="text-xs whitespace-pre-wrap">{improved}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={onReject} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs">
          <X className="h-3.5 w-3.5" /> Reject
        </button>
        <button onClick={onAccept} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
          <Check className="h-3.5 w-3.5" /> Accept
        </button>
      </div>
    </motion.div>
  );
}

function SummaryStep({
  value, onChange, improve,
}: { value: string; onChange: (v: string) => void; improve: ReturnType<typeof useServerFn<typeof improveText>> }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const run = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const r = await improve({ data: { text: value, kind: "summary" } });
      setSuggestion(r.improved);
    } finally { setLoading(false); }
  };
  return (
    <>
      <StepHeader icon={FileText} title="Professional Summary" hint="A crisp 2–3 sentence intro. Let AI polish it." />
      <TextArea label="Summary" value={value} onChange={onChange} rows={5} placeholder="Write a short introduction about yourself." />
      <div className="mt-3">
        <ImproveButton onClick={run} loading={loading} />
      </div>
      {suggestion && (
        <DiffPanel
          original={value}
          improved={suggestion}
          onAccept={() => { onChange(suggestion); setSuggestion(null); }}
          onReject={() => setSuggestion(null)}
        />
      )}
    </>
  );
}

function EducationStep({ data, setData }: { data: ResumeData; setData: (u: (d: ResumeData) => ResumeData) => void }) {
  const add = () =>
    setData((d) => ({
      ...d,
      education: [...d.education, { id: uid(), college: "", degree: "", branch: "", cgpa: "", year: "" } as Education],
    }));
  const update = (id: string, k: keyof Education, v: string) =>
    setData((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, [k]: v } : e)) }));
  const remove = (id: string) => setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));

  return (
    <>
      <StepHeader icon={GraduationCap} title="Education" hint="Add colleges, degrees, and CGPA." />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.education.map((e) => (
            <motion.div
              key={e.id} layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-border/60 bg-surface/50 p-4"
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="College Name" value={e.college} onChange={(v) => update(e.id, "college", v)} />
                <Field label="Degree" value={e.degree} onChange={(v) => update(e.id, "degree", v)} />
                <Field label="Branch" value={e.branch} onChange={(v) => update(e.id, "branch", v)} />
                <Field label="CGPA" value={e.cgpa} onChange={(v) => update(e.id, "cgpa", v)} />
                <Field label="Graduation Year" value={e.year} onChange={(v) => update(e.id, "year", v)} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add Education
        </button>
      </div>
    </>
  );
}

function SkillsStep({ data, setData }: { data: ResumeData; setData: (u: (d: ResumeData) => ResumeData) => void }) {
  const [query, setQuery] = useState("");
  const available = useMemo(
    () =>
      SKILL_LIBRARY.filter(
        (s) => !data.skills.includes(s) && s.toLowerCase().includes(query.toLowerCase())
      ),
    [data.skills, query]
  );
  const add = (s: string) => {
    const v = s.trim();
    if (!v || data.skills.includes(v)) return;
    setData((d) => ({ ...d, skills: [...d.skills, v] }));
    setQuery("");
  };
  const remove = (s: string) => setData((d) => ({ ...d, skills: d.skills.filter((x) => x !== s) }));

  return (
    <>
      <StepHeader icon={Sparkles} title="Skills" hint="Pick from suggestions or type to add custom skills." />
      <div className="rounded-xl border border-border/60 bg-surface/50 p-3 mb-3 min-h-[3rem]">
        {data.skills.length === 0 && <p className="text-xs text-muted-foreground px-1">No skills yet.</p>}
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence>
            {data.skills.map((s) => (
              <motion.button
                key={s}
                layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => remove(s)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-gold)" }}
              >
                {s} <X className="h-3 w-3 opacity-80" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(query); } }}
        placeholder="Search or add a custom skill…"
        className="w-full rounded-xl bg-surface/60 border border-border/60 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {available.slice(0, 16).map((s) => (
          <button key={s} onClick={() => add(s)} className="rounded-full glass px-3 py-1 text-xs hover:border-primary/40">
            + {s}
          </button>
        ))}
        {query && !SKILL_LIBRARY.some((s) => s.toLowerCase() === query.toLowerCase()) && (
          <button onClick={() => add(query)} className="rounded-full px-3 py-1 text-xs font-medium text-primary-foreground" style={{ background: "var(--gradient-gold)" }}>
            + Add "{query}"
          </button>
        )}
      </div>
    </>
  );
}

function ProjectsStep({
  data, setData, improve,
}: { data: ResumeData; setData: (u: (d: ResumeData) => ResumeData) => void; improve: ReturnType<typeof useServerFn<typeof improveText>> }) {
  const add = () =>
    setData((d) => ({
      ...d,
      projects: [...d.projects, { id: uid(), name: "", tech: "", github: "", demo: "", description: "" } as Project],
    }));
  const update = (id: string, k: keyof Project, v: string) =>
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, [k]: v } : p)) }));
  const remove = (id: string) => setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  return (
    <>
      <StepHeader icon={Layout} title="Projects" hint="Highlight impact — AI can rewrite descriptions into strong bullets." />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.projects.map((p) => (
            <ProjectCard key={p.id} project={p} onUpdate={update} onRemove={remove} improve={improve} />
          ))}
        </AnimatePresence>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>
    </>
  );
}

function ProjectCard({
  project, onUpdate, onRemove, improve,
}: {
  project: Project;
  onUpdate: (id: string, k: keyof Project, v: string) => void;
  onRemove: (id: string) => void;
  improve: ReturnType<typeof useServerFn<typeof improveText>>;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const run = async () => {
    if (!project.description.trim()) return;
    setLoading(true);
    try {
      const r = await improve({ data: { text: project.description, kind: "project", context: `${project.name} · ${project.tech}` } });
      setSuggestion(r.improved);
    } finally { setLoading(false); }
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-border/60 bg-surface/50 p-4">
      <div className="flex justify-end mb-2">
        <button onClick={() => onRemove(project.id)} className="text-muted-foreground hover:text-destructive p-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Project Name" value={project.name} onChange={(v) => onUpdate(project.id, "name", v)} />
        <Field label="Technologies" value={project.tech} onChange={(v) => onUpdate(project.id, "tech", v)} />
        <Field label="GitHub" value={project.github} onChange={(v) => onUpdate(project.id, "github", v)} />
        <Field label="Live Demo" value={project.demo} onChange={(v) => onUpdate(project.id, "demo", v)} />
      </div>
      <div className="mt-3">
        <TextArea label="Description" value={project.description} onChange={(v) => onUpdate(project.id, "description", v)} rows={4} placeholder="What did you build and what impact did it have?" />
        <div className="mt-2 flex justify-between items-center">
          <p className="text-[11px] text-muted-foreground">Tip: quantify impact where possible.</p>
          <ImproveButton onClick={run} loading={loading} />
        </div>
      </div>
      {suggestion && (
        <DiffPanel
          original={project.description}
          improved={suggestion}
          onAccept={() => { onUpdate(project.id, "description", suggestion); setSuggestion(null); }}
          onReject={() => setSuggestion(null)}
        />
      )}
    </motion.div>
  );
}

function ExperienceStep({
  data, setData, improve,
}: { data: ResumeData; setData: (u: (d: ResumeData) => ResumeData) => void; improve: ReturnType<typeof useServerFn<typeof improveText>> }) {
  const add = () =>
    setData((d) => ({
      ...d,
      experience: [...d.experience, { id: uid(), company: "", role: "", duration: "", responsibilities: "" } as Experience],
    }));
  const update = (id: string, k: keyof Experience, v: string) =>
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, [k]: v } : e)) }));
  const remove = (id: string) => setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));
  return (
    <>
      <StepHeader icon={Briefcase} title="Experience" hint="AI turns plain descriptions into recruiter-friendly bullets." />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.experience.map((e) => (
            <ExperienceCard key={e.id} exp={e} onUpdate={update} onRemove={remove} improve={improve} />
          ))}
        </AnimatePresence>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add Experience
        </button>
      </div>
    </>
  );
}

function ExperienceCard({
  exp, onUpdate, onRemove, improve,
}: {
  exp: Experience;
  onUpdate: (id: string, k: keyof Experience, v: string) => void;
  onRemove: (id: string) => void;
  improve: ReturnType<typeof useServerFn<typeof improveText>>;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const run = async () => {
    if (!exp.responsibilities.trim()) return;
    setLoading(true);
    try {
      const r = await improve({ data: { text: exp.responsibilities, kind: "experience", context: `${exp.role} at ${exp.company}` } });
      setSuggestion(r.improved);
    } finally { setLoading(false); }
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-border/60 bg-surface/50 p-4">
      <div className="flex justify-end mb-2">
        <button onClick={() => onRemove(exp.id)} className="text-muted-foreground hover:text-destructive p-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Company" value={exp.company} onChange={(v) => onUpdate(exp.id, "company", v)} />
        <Field label="Role" value={exp.role} onChange={(v) => onUpdate(exp.id, "role", v)} />
        <Field label="Duration" value={exp.duration} onChange={(v) => onUpdate(exp.id, "duration", v)} placeholder="Jun 2024 – Present" />
      </div>
      <div className="mt-3">
        <TextArea label="Responsibilities" value={exp.responsibilities} onChange={(v) => onUpdate(exp.id, "responsibilities", v)} rows={4} placeholder="What did you do? AI will convert this into strong bullets." />
        <div className="mt-2 flex justify-end">
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-60"
            style={{ background: "var(--gradient-gold)" }}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Enhance using AI
          </button>
        </div>
      </div>
      {suggestion && (
        <DiffPanel
          original={exp.responsibilities}
          improved={suggestion}
          onAccept={() => { onUpdate(exp.id, "responsibilities", suggestion); setSuggestion(null); }}
          onReject={() => setSuggestion(null)}
        />
      )}
    </motion.div>
  );
}

function CertificationsStep({ data, setData }: { data: ResumeData; setData: (u: (d: ResumeData) => ResumeData) => void }) {
  const add = () =>
    setData((d) => ({
      ...d,
      certifications: [...d.certifications, { id: uid(), name: "", organization: "", date: "", link: "" } as Certification],
    }));
  const update = (id: string, k: keyof Certification, v: string) =>
    setData((d) => ({ ...d, certifications: d.certifications.map((c) => (c.id === id ? { ...c, [k]: v } : c)) }));
  const remove = (id: string) => setData((d) => ({ ...d, certifications: d.certifications.filter((c) => c.id !== id) }));
  return (
    <>
      <StepHeader icon={Award} title="Certifications" hint="Add relevant credentials with issuer and date." />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.certifications.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-border/60 bg-surface/50 p-4">
              <div className="flex justify-end mb-2">
                <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Certificate Name" value={c.name} onChange={(v) => update(c.id, "name", v)} />
                <Field label="Organization" value={c.organization} onChange={(v) => update(c.id, "organization", v)} />
                <Field label="Issue Date" value={c.date} onChange={(v) => update(c.id, "date", v)} placeholder="Mar 2025" />
                <Field label="Credential Link" value={c.link} onChange={(v) => update(c.id, "link", v)} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add Another Certificate
        </button>
      </div>
    </>
  );
}

function ExportStep({
  onPrint, onAnalyze, analyzing, analysis,
}: {
  onPrint: () => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analysis: Awaited<ReturnType<typeof analyzeResume>> | null;
}) {
  return (
    <>
      <StepHeader icon={Download} title="Preview & Export" hint="Download a polished PDF or ask AI to grade your resume." />
      <div className="grid sm:grid-cols-2 gap-3">
        <button onClick={onPrint} className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-left hover:border-primary transition">
          <Download className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display font-semibold">Download PDF</p>
          <p className="text-xs text-muted-foreground">Save as PDF via your browser's print dialog.</p>
        </button>
        <button onClick={onPrint} className="rounded-2xl glass p-5 text-left hover:border-primary/40 transition">
          <Printer className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display font-semibold">Print Resume</p>
          <p className="text-xs text-muted-foreground">Only the preview is included in print.</p>
        </button>
        <button onClick={onAnalyze} disabled={analyzing} className="sm:col-span-2 rounded-2xl glass p-5 text-left hover:border-primary/40 transition disabled:opacity-60">
          <div className="flex items-center gap-2">
            {analyzing ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Wand2 className="h-5 w-5 text-primary" />}
            <p className="font-display font-semibold">Improve Entire Resume</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Get an ATS score, keyword gaps, and actionable suggestions.</p>
        </button>
      </div>
      {analysis && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ScoreCard label="Overall" value={analysis.score} />
          <ScoreCard label="ATS Score" value={analysis.atsScore} />
        </div>
      )}
    </>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl glass p-4">
      <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">
        <span className="text-gradient-lime">{value}</span>
        <span className="text-base text-muted-foreground">/100</span>
      </p>
    </div>
  );
}

function AnalysisPanel({
  analysis, onClose,
}: {
  analysis: NonNullable<Awaited<ReturnType<typeof analyzeResume>>>;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-2xl glass p-6 print:hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary">AI Resume Report</p>
          <h3 className="font-display text-xl font-semibold mt-1">Full Analysis</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ScoreCard label="Overall" value={analysis.score} />
        <ScoreCard label="ATS Score" value={analysis.atsScore} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <ListBlock title="Strengths" items={analysis.strengths} tone="emerald" />
        <ListBlock title="Improvements" items={analysis.improvements} tone="amber" />
        <ListBlock title="Missing Keywords" items={analysis.missingKeywords} tone="sky" chip />
        <ListBlock title="Stronger Action Verbs" items={analysis.strongerVerbs} tone="primary" chip />
        {analysis.grammar.length > 0 && (
          <ListBlock title="Grammar & Style" items={analysis.grammar} tone="fuchsia" />
        )}
      </div>
    </motion.div>
  );
}

function ListBlock({
  title, items, tone, chip,
}: { title: string; items: string[]; tone: string; chip?: boolean }) {
  if (!items.length) return null;
  const tones: Record<string, string> = {
    emerald: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    amber: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    sky: "text-sky-300 border-sky-500/30 bg-sky-500/10",
    primary: "text-primary border-primary/30 bg-primary/10",
    fuchsia: "text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10",
  };
  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
      <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-2">{title}</p>
      {chip ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-full border text-[11px] ${tones[tone]}`}>{it}</span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="text-xs flex gap-2">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${tones[tone].split(" ").find((c) => c.startsWith("bg-"))}`} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}