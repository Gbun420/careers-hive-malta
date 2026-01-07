"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type FeatureCTAProps = {
  jobId: string;
  billingEnabled: boolean;
  label?: string;
  size?: "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
  redirectPath?: string;
};

type CTAError = {
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function FeatureCTA({
  jobId,
  billingEnabled,
  label = "Boost visibility",
  size = "default",
  variant = "default",
  className,
  redirectPath,
}: FeatureCTAProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CTAError | null>(null);

  const handleClick = async () => {
    if (!billingEnabled) {
      const message = "Billing is not configured.";
      setError({ message, actionHref: "/setup", actionLabel: "View setup" });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/billing/checkout-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        url?: string;
      };

      if (!response.ok) {
        const code = payload.error?.code;
        const message =
          payload.error?.message ?? "Unable to start checkout.";

        if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
          const redirect = redirectPath ?? window.location.pathname;
          setError({
            message: "Sign in as an employer to feature a job.",
            actionHref: `/login?redirectedFrom=${encodeURIComponent(redirect)}`,
            actionLabel: "Go to login",
          });
          return;
        }

        if (code === "NOT_FOUND") {
          setError({ message: "Job not found or not yours." });
          return;
        }

        if (code === "STRIPE_NOT_CONFIGURED") {
          setError({ message: "Billing is not configured.", actionHref: "/setup", actionLabel: "View setup" });
          return;
        }

        setError({ message: message ?? "Unable to start checkout." });
        return;
      }

      if (!payload.url) {
        setError({ message: "Checkout URL missing. Try again." });
        return;
      }

      window.location.href = payload.url;
    } catch (err) {
      setError({ message: "Network error. Please retry." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        size={size}
        variant={variant}
        disabled={!billingEnabled || loading}
        onClick={handleClick}
        className={
          variant === "default" 
            ? "bg-navy-950 hover:bg-navy-800 text-white font-black rounded-2xl gap-2 shadow-lg shadow-navy-950/10"
            : "border-navy-200 text-navy-950 font-black rounded-2xl gap-2"
        }
      >
        <Sparkles className="h-4 w-4 text-gold-500 fill-gold-500" />
        {loading ? "Synchronizing..." : label}
      </Button>
      {!billingEnabled ? (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Billing not configured.{" "}
          <Link href="/setup" className="underline font-bold text-navy-950">
            View setup
          </Link>
          .
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs font-bold text-coral-600">
          {error.message}{" "}
          {error.actionHref ? (
            <Link href={error.actionHref} className="underline">
              {error.actionLabel ?? "Learn more"}
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}