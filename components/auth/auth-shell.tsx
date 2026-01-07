import Link from "next/link";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  const benefits = [
    { icon: ShieldCheck, text: "Verified Maltese employers only" },
    { icon: Zap, text: "Instant job alerts in < 5 mins" },
    { icon: BarChart3, text: "Real-time application tracking" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center py-12 px-6 lg:px-8">
      <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left: Brand & Benefits */}
        <div className="hidden lg:flex flex-col gap-10">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-white font-black text-2xl">C</div>
            <span className="text-3xl font-black tracking-tightest text-slate-950">careers.mt</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-black tracking-tightest text-slate-950 leading-[1.1]">
              The premium hub for <span className="text-brand">Malta careers.</span>
            </h1>
            <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-md">
              Join thousands of professionals finding verified opportunities across the Maltese islands.
            </p>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <benefit.icon className="h-3.5 w-3.5" />
                </div>
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Auth Card */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-premium lg:p-10">
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-xl">C</div>
              <span className="text-xl font-black tracking-tightest text-slate-950">careers.mt</span>
            </div>
            
            <header className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">{title}</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
            </header>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}