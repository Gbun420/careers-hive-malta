import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-950 text-white py-14 md:py-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-md group-hover:scale-105 transition-transform">C</div>
              <span className="text-xl font-bold tracking-tightest text-white">{BRAND_NAME}</span>
            </Link>
            <p className="max-w-sm text-base text-neutral-400 leading-relaxed font-medium">
              Malta&apos;s high-performance job feed. Bridging the gap between top talent and verified Maltese brands.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Platform</h4>
            <ul className="space-y-4">
              {[
                { name: "Browse Jobs", href: "/jobs" },
                { name: "For Employers", href: "/for-employers" },
                { name: "Pricing", href: "/pricing" },
                { name: "Blog", href: "/blog" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Support</h4>
            <ul className="space-y-4">
              {[
                { name: "Contact Us", href: "#" },
                { name: "Help Center", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">
          <p>© {currentYear} {BRAND_NAME}. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
            <Link href="/robots.txt" className="hover:text-white transition-colors">Robots</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
