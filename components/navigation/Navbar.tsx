"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DynamicLogo from "@/components/nav/dynamic-logo";
import { Menu, X, ShieldCheck, LayoutDashboard, FileText, User } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { getUserRole } from "@/lib/auth/roles";

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setRole(getUserRole(session.user));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setRole(getUserRole(session.user));
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const navItems = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "For Employers", href: "/for-employers" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8 lg:gap-12">
          <div className="flex items-center gap-2">
            <DynamicLogo />
            <span className="hidden items-center gap-1 rounded-full border border-brand-accent/20 bg-brand-accent/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-accent sm:inline-flex">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Verified
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-all duration-300 hover:text-brand relative group",
                  pathname === item.href ? "text-brand" : "text-muted-foreground"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-brand transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 lg:gap-4">
            {user ? (
              <>
                <Link
                  href={role === 'admin' ? '/admin/dashboard' : role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard'}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand transition-colors px-3 py-2 rounded-lg"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                {role === 'jobseeker' && (
                  <Link
                    href="/jobseeker/applications"
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand transition-colors px-3 py-2 rounded-lg"
                  >
                    <FileText className="h-4 w-4" />
                    My Applications
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand/10 hover:text-brand transition-all"
                >
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="font-bold text-muted-foreground hover:text-brand h-10 px-4">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="default" className="rounded-xl h-10 px-6 shadow-cta hover:shadow-cta-hover transition-all bg-brand text-white border-none">
                  <Link href="/signup?role=employer">Post a Job</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-brand transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in shadow-xl">
          <nav className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-lg font-bold transition-all px-2 py-1 rounded-lg",
                  pathname === item.href ? "text-brand bg-brand/5" : "text-foreground hover:bg-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-center h-12 rounded-xl font-bold border-border" onClick={() => setIsMenuOpen(false)}>
                    <Link href={role === 'admin' ? '/admin/dashboard' : role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard'}>Dashboard</Link>
                  </Button>
                  {role === 'jobseeker' && (
                    <Button asChild variant="outline" className="w-full justify-center h-12 rounded-xl font-bold border-border" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/jobseeker/applications">My Applications</Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full justify-center h-12 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/profile">Profile Settings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full justify-center h-12 rounded-xl font-bold border-border" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="default" className="w-full justify-center h-12 rounded-xl font-bold shadow-lg bg-brand text-white" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/signup?role=employer">Post a Job</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}