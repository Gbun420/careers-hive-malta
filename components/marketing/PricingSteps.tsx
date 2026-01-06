import { cn } from "@/lib/utils";

type Step = {
  badge: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
};

const steps: Step[] = [
  { badge: "FREE", title: "1 Job Post", subtitle: "30 days live" },
  { badge: "€49", title: "Featured 7 days", subtitle: "3× more views", highlight: true },
  { badge: "€299/mo", title: "Professional", subtitle: "Unlimited posts" },
];

function StepCard({ s }: { s: Step }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/5 backdrop-blur px-6 py-5 shadow-sm transition-all hover:bg-white/10",
        "border-white/10",
        s.highlight && "ring-1 ring-brandAccent/50 bg-brandAccent/5 border-brandAccent/20"
      )}
    >
      <div className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        s.highlight ? "border-brandAccent/30 bg-brandAccent/20 text-brandAccent" : "border-white/10 bg-white/10 text-white/80"
      )}>
        {s.badge}
      </div>
      <div className="mt-3 text-base font-semibold text-white">{s.title}</div>
      <div className="mt-1 text-xs font-medium tracking-wide text-white/60">
        {s.subtitle}
      </div>
    </div>
  );
}

export default function PricingSteps() {
  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StepCard s={steps[0]} />
        <StepCard s={steps[1]} />
        <div className="sm:col-span-2 sm:justify-self-center w-full sm:max-w-[15.5rem]">
          <StepCard s={steps[2]} />
        </div>
      </div>
    </div>
  );
}
