import { ArrowRight, Radar, Send, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Alert",
    description: "Set a saved search once. Choose instant, daily, or weekly.",
    icon: Radar,
  },
  {
    title: "Match",
    description: "We match postings to your criteria and verified employers.",
    icon: Sparkles,
  },
  {
    title: "Apply",
    description: "Apply fast while the role is still fresh and visible.",
    icon: Send,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="flex flex-col gap-4 text-center items-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-brand-600">
          The Process
        </p>
        <h2 className="font-sans text-5xl font-extrabold text-slate-950 tracking-tightest">
          Alert. Match. Apply.
        </h2>
        <p className="max-w-2xl text-lg text-slate-500 mt-2">
          Careers.mt keeps you ahead of the Maltese market with fast alerts
          and trusted postings.
        </p>
      </div>
      <div className="mt-16 grid gap-8 lg:grid-cols-3 relative">
        {/* Subtle connector line for desktop */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />
        
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="premium-card p-10 rounded-[3rem] bg-white group z-10"
          >
            <div className="flex flex-col gap-6">
              <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-slate-200 group-hover:bg-brand-600 transition-colors">
                {index + 1}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <step.icon className="h-6 w-6 text-brand-600" />
                  <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
