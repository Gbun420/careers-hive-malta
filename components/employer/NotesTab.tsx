"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, User, Loader2, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Note = {
  id: string;
  body: string;
  created_at: string;
  pinned: boolean;
  author: { full_name: string };
};

type NotesTabProps = {
  notes: Note[];
  onAddNote: (body: string) => Promise<void>;
  isAdding: boolean;
};

export default function NotesTab({ notes, onAddNote, isAdding }: NotesTabProps) {
  const [newNote, setNewNote] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newNote.trim() || isAdding) return;
    await onAddNote(newNote);
    setNewNote("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Composer */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-brand">
          <StickyNote className="h-4 w-4" />
          <h3 className="font-bold text-slate-900">Internal notes</h3>
        </div>
        <div className="space-y-4">
          <Textarea 
            placeholder="Share feedback with your team about this candidate... (Enter to submit)" 
            rows={3} 
            className="rounded-2xl resize-none border-slate-200"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-slate-400 italic">Not visible to candidates.</p>
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isAdding || !newNote.trim()}
              className="rounded-xl px-8 bg-slate-900 text-white border-none shadow-cta h-10 gap-2"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
              Add note
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No internal notes yet</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className={`group relative bg-white rounded-2xl border transition-all ${note.pinned ? 'border-brand/30 shadow-md ring-1 ring-brand/10' : 'border-slate-100 shadow-sm'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="h-3 w-3" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{note.author?.full_name || "Recruiter"}</span>
                    {note.pinned && <Badge variant="verified" className="bg-brand/10 text-brand py-0 h-4 border-none px-1.5"><Pin className="h-2 w-2 mr-1" /> Pinned</Badge>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                  &quot;{note.body}&quot;
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
