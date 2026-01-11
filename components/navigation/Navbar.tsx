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
            <span className="hidden items-center gap-1 rounded-full border border-brand-emerald-500/20 bg-brand-emerald-500/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-emerald-600 sm:inline-flex">
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
                  "text-sm font-semibold transition-all duration-300 hover:text-brand-emerald-600 relative group",
                  pathname === item.href ? "text-brand-emerald-600" : "text-muted-foreground"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-brand-emerald-600 transition-all duration-300",
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
                <Button asChild variant="tertiary" size="sm">
                  <Link
                    href={role === 'admin' ? '/admin/dashboard' : role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard'}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                </Button>
                {role === 'jobseeker' && (
                  <Button asChild variant="ghost" size="sm">
                    <Link
                      href="/jobseeker/applications"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Applications
                    </Link>
                  </Button>
                )}
                <Link
                  href="/profile"
                  className="h-10 w-10 rounded-2xl bg-brand-slate-100 flex items-center justify-center text-brand-slate-500 hover:bg-brand-emerald-500/10 hover:text-brand-emerald-600 transition-all border-2 border-transparent hover:border-brand-emerald-500/20"
                >
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="font-bold">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="primary" size="sm">
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
                  <Button asChild variant="tertiary" className="w-full justify-center h-14" onClick={() => setIsMenuOpen(false)}>
                    <Link href={role === 'admin' ? '/admin/dashboard' : role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard'}>Dashboard</Link>
                  </Button>
                  {role === 'jobseeker' && (
                    <Button asChild variant="ghost" className="w-full justify-center h-14" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/jobseeker/applications">My Applications</Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full justify-center h-14" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/profile">Profile Settings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="tertiary" className="w-full justify-center h-14" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="primary" className="w-full justify-center h-14" onClick={() => setIsMenuOpen(false)}>
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