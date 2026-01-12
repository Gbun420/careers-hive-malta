"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Briefcase } from "lucide-react";
import CheckoutButton from "@/components/billing/CheckoutButton";

type PaywallModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  jobId: string;
};

export default function PaywallModal({
  isOpen,
  onOpenChange,
  companyId,
  jobId,
}: PaywallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-brand p-8 text-white">
          <Badge className="bg-white/20 text-white border-none mb-4">Entitlement Required</Badge>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tightest uppercase text-white">
              Unlock Publishing
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium text-lg">
              Choose a plan to activate your job posting and reach Malta&apos;s top talent.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 grid gap-6 sm:grid-cols-2">
          {/* Single Post Option */}
          <div className="flex flex-col rounded-3xl border border-slate-200 p-6 bg-white shadow-sm hover:border-brand/20 transition-all">
            <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-4">
              <Briefcase className="h-3 w-3" />
              One-time
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Single Post</h3>
            <p className="text-2xl font-black text-slate-900 mb-4">€49</p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                30 days visibility
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                Standard placement
              </li>
            </ul>
            <CheckoutButton
              companyId={companyId}
              jobId={jobId}
              product="JOB_POST"
              className="w-full rounded-xl"
              variant="outline"
            >
              Buy Single Post
            </CheckoutButton>
          </div>

          {/* Pro Subscription Option */}
          <div className="flex flex-col rounded-3xl border-2 border-brand p-6 bg-brand/5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase">Best Value</div>
            <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-4">
              <Zap className="h-3 w-3" />
              Subscription
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Professional</h3>
            <p className="text-2xl font-black text-slate-900 mb-4">€299<span className="text-xs font-medium text-slate-500">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                Unlimited postings
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                <Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                Featured credits
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                <Check className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                ATS Tools
              </li>
            </ul>
            <CheckoutButton
              companyId={companyId}
              product="PRO_SUB"
              className="w-full rounded-xl bg-brand text-white border-none shadow-cta"
            >
              Go Professional
            </CheckoutButton>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Stripe Checkout · Automatic Tax Collection</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
