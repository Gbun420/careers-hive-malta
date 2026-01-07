"use client";

import { useEffect, useState, useCallback, use } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  MapPin, 
  FileText, 
  Download, 
  MessageSquare, 
  StickyNote, 
  History,
  CheckCircle2,
  ExternalLink,
  Target
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

// New Refined Components
import ApplicationDetailHeader from "@/components/employer/ApplicationDetailHeader";
import ApplicationDetailSidebar from "@/components/employer/ApplicationDetailSidebar";
import NotesTab from "@/components/employer/NotesTab";
import MessagesTab from "@/components/employer/MessagesTab";
import ActivityTab from "@/components/employer/ActivityTab";

type Application = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  job: { id: string; title: string; location: string; employer_id: string };
  candidate: { id: string; full_name: string; headline: string; skills: string[]; bio: string; cv_file_path: string };
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  
  // Status states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [appRes, notesRes, messagesRes] = await Promise.all([
        fetch(`/api/employer/applications/${id}`),
        fetch(`/api/employer/applications/${id}/notes`),
        fetch(`/api/employer/applications/${id}/messages`)
      ]);

      if (appRes.status === 404 || appRes.status === 403) {
        setApp(null);
        return;
      }

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

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = app?.status;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApp(prev => prev ? ({ ...prev, status: newStatus, updated_at: new Date().toISOString() }) : null);
        trackEvent('application_status_changed' as any, { 
          application_id: id, 
          job_id: app?.job.id,
          from: oldStatus,
          to: newStatus
        });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (body: string) => {
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.data, ...prev]);
        trackEvent('employer_note_added' as any, { application_id: id, job_id: app?.job.id });
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSendMessage = async (body: string) => {
    setIsSendingMessage(true);
    try {
      const res = await fetch(`/api/employer/applications/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, sender_role: 'EMPLOYER' })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.data]);
        trackEvent('employer_message_sent' as any, { application_id: id, job_id: app?.job.id });
      } else {
        trackEvent('employer_message_failed' as any, { application_id: id, job_id: app?.job.id });
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-8">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-96 rounded-3xl" />
            </div>
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!app) {
    return (
      <PageShell>
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <User className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Application Not Found</h2>
          <p className="text-slate-500 mt-2 font-medium">You don&apos;t have permission to view this application or it has been removed.</p>
          <Button asChild className="mt-8 rounded-xl px-8 bg-brand text-white border-none shadow-cta">
            <Link href="/employer/dashboard">Return to Pipeline</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <ApplicationDetailHeader 
          candidateName={app.candidate.full_name}
          jobTitle={app.job.title}
          jobId={app.job.id}
          status={app.status}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdatingStatus}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
          <div className="space-y-8">
            {/* Candidate Overview Card */}
            <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row border-b border-slate-100">
                  <div className="flex-1 p-8 md:p-10 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Location</Label>
                        <p className="text-slate-900 font-bold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand" /> {app.job.location || "Malta"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role Title</Label>
                        <p className="text-slate-900 font-bold flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-brand" /> {app.candidate.headline || "Talent"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate Bio</Label>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-brand/10 pl-4 py-1">
                        {app.candidate.bio || "No professional summary provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {app.candidate.skills?.map(s => (
                        <Badge key={s} variant="default" className="bg-slate-50 text-slate-600 border-slate-200 py-1 px-3 rounded-lg font-bold lowercase">
                          #{s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-72 bg-slate-50/50 p-8 md:p-10 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between gap-8">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">Curriculum Vitae</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for review</p>
                      </div>
                    </div>
                    <Button asChild className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-600/10 gap-2 font-black uppercase tracking-widest text-[10px]">
                      <a href={app.candidate.cv_file_path} target="_blank">
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start h-14 bg-slate-100/50 rounded-2xl border border-slate-200 p-1 mb-8">
                <TabsTrigger value="messages" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <MessageSquare className="h-3.5 w-3.5" /> Messages
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <StickyNote className="h-3.5 w-3.5" /> Internal Notes
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <History className="h-3.5 w-3.5" /> Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="m-0">
                <MessagesTab 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  isSending={isSendingMessage} 
                />
              </TabsContent>

              <TabsContent value="notes" className="m-0">
                <NotesTab 
                  notes={notes} 
                  onAddNote={handleAddNote} 
                  isAdding={isAddingNote} 
                />
              </TabsContent>

              <TabsContent value="activity" className="m-0">
                <ActivityTab 
                  application={app} 
                  notes={notes} 
                  messages={messages} 
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:sticky lg:top-24">
            <ApplicationDetailSidebar 
              appliedDate={app.created_at}
              lastActivity={app.updated_at}
              onAction={setActiveTab}
              onStatusChange={handleStatusChange}
              isUpdating={isUpdatingStatus}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}