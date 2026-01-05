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
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          How it works
        </p>
        <h2 className="font-display text-3xl font-semibold text-slate-900">
          Alert. Match. Apply.
        </h2>
        <p className="max-w-2xl text-slate-600">
          Careers.mt keeps you ahead of the Maltese market with fast alerts
          and trusted postings.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div className="mt-4 flex items-center gap-2">
              <step.icon className="h-5 w-5 text-teal-600" />
              <p className="text-lg font-semibold text-slate-900">
                {step.title}
              </p>
            </div>
            <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            {index < steps.length - 1 ? (
              <ArrowRight className="absolute right-6 top-6 hidden h-5 w-5 text-slate-300 lg:block" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
