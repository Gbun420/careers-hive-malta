import { Bell, ShieldCheck, Sparkles } from "lucide-react";

type FeatureCardsProps = {
  featuredEnabled: boolean;
};

const cardBase =
  "card-gradient flex h-full flex-col gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm";

export default function FeatureCards({ featuredEnabled }: FeatureCardsProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className={cardBase}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Instant alerts (email + push)
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Get immediate notifications and stay on top of new Maltese
              listings without refreshing boards.
            </p>
          </div>
        </div>
        <div className={cardBase}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Verified employers + moderation
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Verification requests, report flows, and audit logs keep the
              marketplace trusted.
            </p>
          </div>
        </div>
        <div className={cardBase}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Featured jobs {featuredEnabled ? "available" : "coming soon"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {featuredEnabled
                ? "Promote priority roles to the top of the feed and search results."
                : "Upgrade postings once Stripe billing is enabled for your account."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
