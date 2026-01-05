"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DynamicLogo from "./dynamic-logo";

export default function SiteHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "For Employers", href: "/for-employers" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-300 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <DynamicLogo />
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:text-brand-secondary relative group",
                  pathname === item.href ? "text-brand-secondary" : "text-neutral-500"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-brand-secondary transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex font-bold text-neutral-600 hover:text-brand-secondary">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="rounded-xl px-8 shadow-md">
            <Link href="/signup?role=employer">Post a Job</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
