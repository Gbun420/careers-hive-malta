import Link from "next/link";
import { Building2, Github, Twitter, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm pt-20 pb-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-slate-950 p-1.5 rounded-xl">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-tightest text-slate-950">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-lg text-slate-500 leading-relaxed">
              The fastest way to find verified jobs in Malta. Get instant alerts and join the local tech ecosystem.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all">
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-950">Platform</h4>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-slate-500">
              <li><Link href="/jobs" className="hover:text-brand-600 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/pricing" className="hover:text-brand-600 transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-brand-600 transition-colors">Career Blog</Link></li>
              <li><Link href="/signup?role=employer" className="hover:text-brand-600 transition-colors">Post a Job</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-950">Legal</h4>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-slate-500">
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © 2026 {siteConfig.name}. Handcrafted in Malta.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
