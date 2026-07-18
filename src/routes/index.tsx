import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  ScanSearch,
  BrainCircuit,
  MessagesSquare,
  ArrowRight,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "Generate polished, ATS-ready resumes with AI-crafted bullet points and stronger action verbs.",
    href: "/resume-builder",
    cta: "Try Resume Builder",
  },
  {
    icon: ScanSearch,
    title: "AI Resume Reviewer",
    desc: "Upload your resume and get an instant ATS score, grammar check, and targeted improvement suggestions.",
    href: "/resume-review",
    cta: "Review My Resume",
  },
  {
    icon: BrainCircuit,
    title: "Skill Assessment",
    desc: "Adaptive MCQ, code, and scenario quizzes across Java, React, SQL and more — with AI explanations.",
    href: "/skill-assessment",
    cta: "Test My Skills",
  },
  {
    icon: MessagesSquare,
    title: "AI Mock Interview",
    desc: "Chat with an AI interviewer that adapts difficulty, evaluates answers, and returns a full report.",
    href: "/mock-interview",
    cta: "Start Mock Interview",
  },
] as const;

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-slow -z-10" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl animate-float-slower -z-10" />

      <section className="mx-auto max-w-7xl px-4 md:px-8 pt-16 pb-24 md:pt-28 md:pb-32">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-4 items-center">
          <div className="animate-fade-up relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Career Platform
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
              Build Your Future.
              <br />
              <span className="text-gradient-lime">We Power Your Journey.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Create ATS-ready resumes, evaluate your skills, practice AI mock interviews and
              get personalized guidance — all in one intelligent platform.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/mock-interview"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] shadow-glow"
                style={{ background: "var(--gradient-lime)" }}
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Explore Demo
                <PlayCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <img
              src={heroImg}
              alt="AI career platform visualization"
              width={1536}
              height={1280}
              className="w-full h-auto select-none pointer-events-none"
              style={{
                maskImage:
                  "radial-gradient(ellipse 70% 70% at 55% 55%, black 45%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 70% at 55% 55%, black 45%, transparent 85%)",
              }}
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 md:px-8 pb-32">
        <div className="max-w-2xl">
          <span
            className="text-xs uppercase tracking-widest text-primary"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            /Features
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Everything you need to land the offer.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Four AI modules that work together — from your first resume draft to your final on-site.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Link
              key={f.href}
              to={f.href}
              className="group relative overflow-hidden rounded-3xl glass p-8 transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div
                className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-3xl"
                style={{ background: "var(--gradient-lime)" }}
              />
              <div className="relative">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-lime)" }}
                >
                  <f.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {f.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 pb-32">
        <div className="relative overflow-hidden rounded-[2rem] glass p-12 md:p-16 text-center shadow-card">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60" />
          <div className="relative">
            <h3 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Your first mock interview is{" "}
              <span className="text-gradient-lime">one click away.</span>
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              No signup. No credit card. Open the interviewer and start talking.
            </p>
            <Link
              to="/mock-interview"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-lime)" }}
            >
              Launch Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className="grid h-6 w-6 place-items-center rounded-md"
              style={{ background: "var(--gradient-lime)" }}
            >
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </span>
            <span>CareerPilot AI — built for placement season.</span>
          </div>
          <div>© {new Date().getFullYear()} CareerPilot AI</div>
        </footer>
      </section>
    </div>
  );
}