"use client";

import Link from "next/link";

export default function DynamicLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-brand">
        Careers<span className="text-brandAccent">.mt</span>
      </span>
    </Link>
  );
}