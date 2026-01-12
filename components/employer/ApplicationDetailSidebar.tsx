"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  StickyNote, 
  UserCheck, 
  UserMinus, 
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

type SidebarProps = {
  appliedDate: string;
  lastActivity?: string;
  source?: string;
  onAction: (tab: string) => void;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
};

export default function ApplicationDetailSidebar({
  appliedDate,
  lastActivity,
  source = "Careers.mt",
  onAction,
  onStatusChange,
  isUpdating,
}: SidebarProps) {
  return (
    <aside className="space-y-6">
      <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Button 
            className="w-full rounded-xl bg-brand text-white border-none shadow-cta font-black uppercase tracking-widest text-xs h-12 gap-2"
            onClick={() => onAction("messages")}
          >
            <MessageSquare className="h-4 w-4" />
            Message Candidate
          </Button>
          <Button 
            variant="outline"
            className="w-full rounded-xl border-slate-200 font-black uppercase tracking-widest text-xs h-12 gap-2"
            onClick={() => onAction("notes")}
          >
            <StickyNote className="h-4 w-4" />
            Add Internal Note
          </Button>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline"
              className="rounded-xl border-emerald-100 bg-secondary/10 text-secondary hover:bg-emerald-100 text-[10px] font-black uppercase tracking-widest h-10"
              disabled={isUpdating}
              onClick={() => onStatusChange("HIRED")}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Hire
            </Button>
            <Button 
              variant="outline"
              className="rounded-xl border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-black uppercase tracking-widest h-10"
              disabled={isUpdating}
              onClick={() => onStatusChange("REJECTED")}
            >
              <UserMinus className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border shadow-sm bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Info</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Applied
                </span>
                <span className="text-slate-900 font-bold">{format(new Date(appliedDate), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Last Activity
                </span>
                <span className="text-slate-900 font-bold">{lastActivity ? format(new Date(lastActivity), "MMM d, HH:mm") : "Never"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" /> Source
                </span>
                <span className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">{source}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">Recruiter Tip</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
              Candidates in Malta usually prefer being contacted within 48 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
