"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SiteHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/brand/logo-horizontal.svg" 
              alt="Careers.mt" 
              width={140} 
              height={35} 
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-coral-500",
                  pathname === item.href ? "text-navy-950" : "text-slate-500"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex font-bold text-navy-950 hover:text-coral-500 hover:bg-coral-50">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-navy-950 hover:bg-navy-800 text-white font-bold rounded-xl px-6">
            <Link href="/signup">Post a Job</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}