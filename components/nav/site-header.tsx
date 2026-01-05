"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck, Building2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const navLinks = [
  { label: "Jobs", href: "/jobs" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Employers", href: "/#for-employers" },
  { label: "Sign in", href: "/login" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="tech-header">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-slate-950 p-1.5 rounded-lg group-hover:bg-brand-600 transition-colors">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-sans text-lg font-black tracking-tighter text-slate-950">
            {siteConfig.name.toUpperCase()}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 transition hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/40 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-slate-200 bg-white/95 px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
