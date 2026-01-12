"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ShieldCheck, LayoutDashboard, FileText, User, Sparkles } from "lucide-react";
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
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 md:h-24 max-w-[1440px] items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-secondary transition-transform group-hover:rotate-12">
               <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-black text-primary tracking-tightest">
              THE HIVE<span className="text-secondary">.</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-widest transition-all duration-300 relative group",
                  pathname === item.href ? "text-primary" : "text-slate-400 hover:text-primary"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 bg-secondary transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Button asChild variant="ghost" className="font-bold text-slate-500 hover:text-primary">
                  <Link href={role === 'admin' ? '/admin/dashboard' : role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard'} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Link
                  href="/profile"
                  className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] shadow-sm">
                  <Link href="/signup?role=employer">Post A Job</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-3 rounded-2xl bg-slate-50 text-primary hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-50 p-8 animate-in slide-in-from-right duration-300">
          <nav className="flex flex-col gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-3xl font-display font-black tracking-tightest uppercase",
                  pathname === item.href ? "text-secondary" : "text-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex flex-col gap-4">
               {user ? (
                 <Button asChild size="xl" className="w-full bg-primary rounded-3xl h-20 text-xl font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/dashboard">Dashboard</Link>
                 </Button>
               ) : (
                 <>
                   <Button asChild size="xl" className="w-full bg-primary rounded-3xl h-20 text-xl font-black uppercase tracking-widest text-white" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/signup?role=employer">Post A Job</Link>
                   </Button>
                   <Button asChild variant="outline" size="xl" className="w-full rounded-3xl h-20 text-xl font-black uppercase tracking-widest border-2" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Sign In</Link>
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