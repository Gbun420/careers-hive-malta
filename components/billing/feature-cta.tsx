"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  trackCheckoutCreated,
  trackCheckoutFailed,
  trackFeatureClick,
} from "@/lib/analytics/events";

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
  label = "Feature",
  size = "default",
  variant = "outline",
  className,
  redirectPath,
}: FeatureCTAProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CTAError | null>(null);

  const handleClick = async () => {
    if (!billingEnabled) {
      const message = "Billing is not configured.";
      setError({ message, actionHref: "/setup", actionLabel: "View setup" });
      trackCheckoutFailed({ jobId, reason: "STRIPE_NOT_CONFIGURED" });
      return;
    }

    setError(null);
    trackFeatureClick({ jobId, source: "employer_ui" });
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
          trackCheckoutFailed({ jobId, reason: "FORBIDDEN" });
          return;
        }

        if (code === "NOT_FOUND") {
          setError({ message: "Job not found or not yours." });
          trackCheckoutFailed({ jobId, reason: "NOT_FOUND" });
          return;
        }

        if (code === "STRIPE_NOT_CONFIGURED") {
          setError({ message: "Billing is not configured.", actionHref: "/setup", actionLabel: "View setup" });
          trackCheckoutFailed({ jobId, reason: "STRIPE_NOT_CONFIGURED" });
          return;
        }

        setError({ message: message ?? "Unable to start checkout." });
        trackCheckoutFailed({ jobId, reason: code ?? "UNKNOWN" });
        return;
      }

      if (!payload.url) {
        setError({ message: "Checkout URL missing. Try again." });
        trackCheckoutFailed({ jobId, reason: "MISSING_URL" });
        return;
      }

      trackCheckoutCreated({ jobId, sessionUrl: payload.url });
      window.location.href = payload.url;
    } catch (err) {
      setError({ message: "Network error. Please retry." });
      trackCheckoutFailed({ jobId, reason: "NETWORK_ERROR" });
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
        title={!billingEnabled ? "Billing not configured" : undefined}
      >
        {loading ? "Redirecting..." : label}
      </Button>
      {!billingEnabled ? (
        <p className="mt-2 text-xs text-slate-500">
          Billing not configured.{" "}
          <Link href="/setup" className="underline">
            View setup
          </Link>
          .
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-rose-600">
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
