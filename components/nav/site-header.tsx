"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DynamicLogo from "./dynamic-logo";
import { Menu, X } from "lucide-react";

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "For Employers", href: "/for-employers" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8 lg:gap-12">
          <DynamicLogo />
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-all duration-300 hover:text-primary relative group",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 lg:gap-4">
            <Button asChild variant="ghost" className="font-bold text-muted-foreground hover:text-primary h-10 px-4">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="default" className="rounded-xl h-10 px-6 shadow-md">
              <Link href="/signup?role=employer">Post a Job</Link>
            </Button>
          </div>
          
          <button 
            className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
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
                  pathname === item.href ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full justify-center h-12 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" className="w-full justify-center h-12 rounded-xl font-bold shadow-lg" onClick={() => setIsMenuOpen(false)}>
                <Link href="/signup?role=employer">Post a Job</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}