"use client";

import { useEffect, useState, useCallback, use } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  Mail, 
  MessageSquare, 
  StickyNote, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock,
  Send,
  Loader2,
  ChevronLeft,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type Application = {
  id: string;
  status: string;
  created_at: string;
  job: { id: string; title: string; location: string };
  candidate: { id: string; full_name: string; headline: string; skills: string[]; bio: string; cv_file_path: string };
};

type Note = { id: string; body: string; created_at: string; author_user_id: string };
type Message = { id: string; body: string; created_at: string; sender_role: 'EMPLOYER' | 'CANDIDATE' };

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Input states
  const [newNote, setNewNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, notesRes, messagesRes] = await Promise.all([
        fetch(`/api/employer/applications/${id}`),
        fetch(`/api/employer/applications/${id}/notes`),
        fetch(`/api/employer/applications/${id}/messages`)
      ]);

      const [appData, notesData, messagesData] = await Promise.all([
        appRes.json(),
        notesRes.json(),
        messagesRes.json()
      ]);

      setApp(appData.data);
      setNotes(notesData.data || []);
      setMessages(messagesData.data || []);
    } catch (err) {
      console.error("Failed to load application details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (status: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) setApp(prev => prev ? ({ ...prev, status }) : null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newNote })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.data, ...prev]);
        setNewNote("");
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage, sender_role: 'EMPLOYER' })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage("");
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <Skeleton className="h-[600px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!app) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-black text-slate-900">Application not found</h2>
          <Button asChild className="mt-6"><Link href="/employer/dashboard">Back to Dashboard</Link></Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-brand gap-2">
            <Link href="/employer/dashboard"><ChevronLeft className="h-4 w-4" /> Pipeline</Link>
          </Button>
          <div className="flex items-center gap-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Status</Label>
            <Select 
              value={app.status} 
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isUpdatingStatus}
              className="w-48 rounded-xl font-bold bg-white"
            >
              <option value="NEW">New</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="SHORTLIST">Shortlist</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </Select>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
          <div className="space-y-8">
            {/* Candidate Identity */}
            <Card className="rounded-[2.5rem] overflow-hidden border-border shadow-sm">
              <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row items-center gap-8">
                <div className="h-24 w-24 rounded-3xl bg-brand/20 flex items-center justify-center text-brand">
                  <User className="h-12 w-12" />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h1 className="text-4xl font-black tracking-tightest uppercase">{app.candidate.full_name}</h1>
                  <p className="text-xl font-medium text-slate-400">{app.candidate.headline}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    <Badge variant="verified" className="bg-brand/20 text-brand border-none">{app.status}</Badge>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <Clock className="h-3 w-3" /> Applied {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Professional Biography</h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">{app.candidate.bio || "No biography provided."}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Core Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.candidate.skills?.map(skill => (
                      <Badge key={skill} variant="default" className="rounded-xl px-4 py-1 bg-slate-100 text-slate-700 border-none font-bold">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tight">Candidate Resume</p>
                      <p className="text-xs font-medium text-slate-500">Curriculum Vitae (PDF/Doc)</p>
                    </div>
                  </div>
                  <Button asChild className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-2 shadow-lg shadow-indigo-600/20">
                    <a href={app.candidate.cv_file_path} target="_blank"><Download className="h-4 w-4" /> View Document</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Notes and Messages */}
            <Tabs defaultValue="messages" className="w-full">
              <TabsList className="w-full justify-start h-14 bg-slate-50 rounded-2xl border border-slate-200 p-1 mb-6">
                <TabsTrigger value="messages" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <MessageSquare className="h-4 w-4" /> Candidate Messaging
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <StickyNote className="h-4 w-4" /> Internal Team Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900">Direct Conversation</h3>
                  </div>
                  <CardContent className="p-0">
                    <div className="h-[400px] overflow-y-auto p-6 space-y-6 flex flex-col">
                      {messages.map(msg => (
                        <div key={msg.id} className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                          msg.sender_role === 'EMPLOYER' 
                            ? 'bg-brand text-white self-end rounded-tr-none' 
                            : 'bg-slate-100 text-slate-700 self-start rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.body}</p>
                          <p className={`text-[10px] mt-2 opacity-60 ${msg.sender_role === 'EMPLOYER' ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                          <MessageSquare className="h-12 w-12" />
                          <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100">
                      <div className="flex gap-3">
                        <Input 
                          placeholder="Type your message to the candidate..." 
                          className="flex-1 rounded-xl h-12"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <Button 
                          onClick={sendMessage} 
                          disabled={isSendingMessage || !newMessage.trim()}
                          className="rounded-xl h-12 w-12 bg-brand text-white p-0 shadow-cta border-none"
                        >
                          {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-3 block">New Internal Note</Label>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Share feedback with your team about this candidate..." 
                        rows={3} 
                        className="rounded-2xl resize-none"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={addNote} 
                          disabled={isAddingNote || !newNote.trim()}
                          className="rounded-xl px-8 bg-slate-900 text-white border-none shadow-cta h-10 gap-2"
                        >
                          {isAddingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {notes.map(note => (
                      <div key={note.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Recruitment Team</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                          &quot;{note.body}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-6">
            <Card className="rounded-[2rem] border-border shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Applying For</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{app.job.title}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">{app.job.location}</p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full rounded-xl gap-2 border-slate-200">
                  <Link href={`/jobs/${app.job.id}`} target="_blank">View Listing <ExternalLink className="h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-brand/20 bg-brand/5 shadow-premium">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">Hiring Speed</p>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                    Quick responses increase candidate retention by 40% in Malta.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
