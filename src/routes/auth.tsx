import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, User as UserIcon, AlertCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? ("signup" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — Nexoraaa" },
      {
        name: "description",
        content:
          "Sign in to Nexoraaa to build your resume, take AI skill assessments and practice mock interviews.",
      },
      { property: "og:title", content: "Sign In or Create Account — Nexoraaa" },
      {
        property: "og:description",
        content: "Access your Nexoraaa AI career workspace — resumes, assessments and interviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signupSchema = loginSchema
  .extend({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function Field({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className="w-full rounded-xl border border-border/60 bg-surface/60 py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[color:var(--gold)]"
        />
      </div>
      {error && <p className="mt-1.5 pl-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/skill-assessment", replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    setErrors({});
    setFormError(null);
  }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = isSignup
      ? signupSchema.safeParse({ fullName, email, password, confirm })
      : loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/skill-assessment", replace: true });
      } else {
        setFormError("Check your email to confirm your account, then sign in.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 opacity-25 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <span
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl font-black text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
          >
            N
          </span>
          <h1
            className="mt-5 text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Start building your resume, skills and interview confidence."
              : "Sign in to continue your Nexoraaa journey."}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-surface/60 p-1">
            {(["login", "signup"] as const).map((m) => (
              <Link
                key={m}
                to="/auth"
                search={{ mode: m }}
                replace
                className={`rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === m ? { background: "var(--gradient-gold)" } : undefined}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </Link>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {isSignup && (
              <Field
                icon={UserIcon}
                type="text"
                placeholder="Full name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />
            )}
            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            {isSignup && (
              <Field
                icon={Lock}
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
              />
            )}

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: "var(--gradient-gold)" }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? isSignup
                  ? "Creating account…"
                  : "Signing in…"
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to Nexoraaa? "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "login" : "signup" }}
              replace
              className="font-semibold text-foreground hover:underline"
            >
              {isSignup ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
