"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { 
  History, 
  CircleDot, 
  StickyNote, 
  Mail, 
  CheckCircle2, 
  ArrowRightCircle
} from "lucide-react";

type ActivityEvent = {
  id: string;
  type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'MESSAGE_SENT' | 'APPLIED';
  title: string;
  detail?: string;
  timestamp: string;
};

type ActivityTabProps = {
  application: any;
  notes: any[];
  messages: any[];
};

export default function ActivityTab({ application, notes, messages }: ActivityTabProps) {
  const events = useMemo(() => {
    const list: ActivityEvent[] = [];

    // 1. Initial Application
    list.push({
      id: 'initial',
      type: 'APPLIED',
      title: 'Application Submitted',
      detail: `Initial status: ${application.status}`,
      timestamp: application.created_at
    });

    // 2. Notes
    notes.forEach(note => {
      list.push({
        id: note.id,
        type: 'NOTE_ADDED',
        title: 'Internal Note Added',
        detail: note.body.substring(0, 100) + (note.body.length > 100 ? '...' : ''),
        timestamp: note.created_at
      });
    });

    // 3. Messages
    messages.forEach(msg => {
      list.push({
        id: msg.id,
        type: 'MESSAGE_SENT',
        title: msg.sender_role === 'EMPLOYER' ? 'Employer Message' : 'Candidate Reply',
        detail: msg.body.substring(0, 100) + (msg.body.length > 100 ? '...' : ''),
        timestamp: msg.created_at
      });
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [application, notes, messages]);

  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'APPLIED': return <CheckCircle2 className="h-4 w-4 text-secondary" />;
      case 'NOTE_ADDED': return <StickyNote className="h-4 w-4 text-slate-400" />;
      case 'MESSAGE_SENT': return <Mail className="h-4 w-4 text-brand" />;
      case 'STATUS_CHANGE': return <ArrowRightCircle className="h-4 w-4 text-amber-500" />;
      default: return <CircleDot className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-5 w-5 text-slate-400" />
        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-tight">Activity Timeline</h3>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
        {events.map((event) => (
          <div key={event.id} className="relative flex items-start gap-6 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm z-10">
              {getIcon(event.type)}
            </div>
            <div className="flex flex-col gap-1 pt-1.5 pb-6 border-b border-slate-50 w-full">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.title}</p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {format(new Date(event.timestamp), "MMM d, HH:mm")}
                </span>
              </div>
              {event.detail && (
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-1">
                  {event.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
