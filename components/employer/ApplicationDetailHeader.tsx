"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HeaderProps = {
  candidateName: string;
  jobTitle: string;
  jobId: string;
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating: boolean;
};

const STAGES = [
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "SHORTLIST", label: "Shortlist" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIRED", label: "Hired" },
];

export default function ApplicationDetailHeader({
  candidateName,
  jobTitle,
  jobId,
  status,
  onStatusChange,
  isUpdating,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
      <div className="space-y-1">
        <Button variant="ghost" asChild className="-ml-4 h-8 text-muted-foreground hover:text-brand gap-1 text-xs uppercase font-black tracking-widest">
          <Link href="/employer/dashboard">
            <ChevronLeft className="h-3 w-3" />
            Back to Pipeline
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black tracking-tightest uppercase text-slate-900">
            {candidateName}
          </h1>
          <Badge variant="verified" className="bg-brand/10 text-brand border-none">
            {status}
          </Badge>
        </div>
        <p className="text-sm font-medium text-slate-500">
          Applying for <Link href={`/jobs/${jobId}`} className="text-brand font-bold hover:underline">{jobTitle}</Link>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Status</span>
          <Select 
            value={status} 
            onValueChange={onStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-48 rounded-xl font-bold border-slate-200 bg-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}