import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-charcoal-dark text-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-black text-xl shadow-cta">C</div>
              <span className="text-xl font-black tracking-tightest text-white">Careers.mt</span>
            </Link>
            <p className="max-w-sm text-lg font-medium text-slate-400 leading-relaxed">
              Malta&apos;s high-performance job feed. Bridging the gap between top talent and verified Maltese brands.
            </p>
            <div className="mt-10 flex gap-6">
              {/* Social icons could go here */}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">Platform</h4>
            <ul className="space-y-4">
              {["Browse Jobs", "For Employers", "Pricing", "Blog"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-400 hover:text-brand-sky font-medium transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">Support</h4>
            <ul className="space-y-4">
              {["Contact Us", "Help Center", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-400 hover:text-brand-sky font-medium transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-medium text-slate-500">
          <p>© 2026 Careers.mt. All Rights Reserved.</p>
          <div className="flex gap-12">
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
            <Link href="/robots.txt" className="hover:text-white transition-colors">Robots</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
