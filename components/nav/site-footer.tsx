import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="border-t border-navy-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image 
                src="/brand/logo-horizontal.svg" 
                alt="Careers.mt" 
                width={160} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-6 max-w-sm text-lg font-medium leading-relaxed text-slate-500">
              Malta&apos;s high-performance job feed. Bridging the gap between top talent and verified Maltese brands.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-navy-400 hover:bg-navy-950 hover:text-white transition-all">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-navy-400 hover:bg-navy-950 hover:text-white transition-all">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-navy-950">Platform</h4>
            <ul className="mt-8 space-y-4">
              {["Browse Jobs", "Employer Dashboard", "Pricing", "Candidate Search"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-slate-500 hover:text-coral-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-navy-950">Support</h4>
            <ul className="mt-8 space-y-4">
              {["Contact Us", "Help Center", "Legal", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-slate-500 hover:text-coral-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-8 border-t border-slate-50 pt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <p>© 2026 Careers.mt. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="/sitemap.xml" className="hover:text-navy-950 transition-colors">Sitemap</Link>
            <Link href="/robots.txt" className="hover:text-navy-950 transition-colors">Robots</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}