"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type ApplyButtonProps = {
  jobId: string;
  jobTitle: string;
};

export default function ApplyButton({ jobId, jobTitle }: ApplyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = async () => {
    setStatus('loading');
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        setStatus('success');
        trackEvent('application_submitted', { jobId, jobTitle });
      } else {
        const payload = await response.json();
        setErrorMsg(payload.error?.message || "Application failed.");
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg("Network error.");
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-2 text-secondary font-bold border border-emerald-100">
        <Check className="h-4 w-4" /> Application Sent
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleApply} 
        disabled={status === 'loading'}
        size="lg"
        className="bg-coral-500 hover:bg-coral-600 text-white font-black rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-coral-500/20"
      >
        <Send className="h-4 w-4" />
        {status === 'loading' ? "Sending..." : "One-Click Apply"}
      </Button>
      {status === 'error' && (
        <p className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-widest">{errorMsg}</p>
      )}
    </div>
  );
}
