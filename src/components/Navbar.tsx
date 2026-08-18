import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/resume-builder", label: "Resume Builder" },
  { to: "/resume-review", label: "Resume Review" },
  { to: "/skill-assessment", label: "Skill Assessment" },
  { to: "/mock-interview", label: "Mock Interview" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    await router.invalidate();
    router.navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60" : ""
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <span
            className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground font-black text-xl tracking-tight shadow-glow"
            style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
          >
            N
          </span>
          <span className="flex flex-col leading-tight">
            <span
              className="text-xl font-bold tracking-[0.14em] text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NEXORAAA
            </span>
            <span
              className="text-[10px] tracking-[0.28em] font-medium"
              style={{ color: "var(--gold)" }}
            >
              AI CAREER PLATFORM
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              activeProps={{
                className:
                  "text-foreground after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[image:var(--gradient-gold)]",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="max-w-[180px] truncate text-sm text-muted-foreground">
                {(user.user_metadata?.full_name as string) || user.email}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 shadow-glow"
                style={{ background: "var(--gradient-gold)" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg glass"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl flex flex-col p-4 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface"
                activeProps={{ className: "text-foreground bg-surface" }}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={signOut}
                className="mt-1 flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-foreground rounded-lg hover:bg-surface"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}