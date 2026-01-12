"use client";

import { useEffect, useState, use, useCallback } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  Mail, 
  MessageSquare, 
  Send, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  HelpCircle,
  ExternalLink,
  History
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { getStatusMeta } from "@/lib/ui/applicationStatus";
import { trackEvent } from "@/lib/analytics";

type ApplicationDetail = {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    company_name: string;
    description: string;
  };
  messages: any[];
};

export default function JobseekerApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobseeker/applications/${id}`);
      if (res.status === 404) {
        setApp(null);
        return;
      }
      const payload = await res.json();
      setApp(payload.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/jobseeker/applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply })
      });

      if (res.ok) {
        const data = await res.json();
        setApp(prev => prev ? ({
          ...prev,
          messages: [...prev.messages, data.data]
        }) : null);
        setReply("");
        trackEvent('jobseeker_message_sent' as any, { applicationId: id });
      }
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-8">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-96 rounded-3xl" />
            </div>
            <Skeleton className="h-80 rounded-3xl" />
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
            <Building2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Application Not Found</h2>
          <p className="text-slate-500 mt-2 font-medium">You don&apos;t have access to this application or it has been removed.</p>
          <Button asChild className="mt-8 rounded-xl px-8 bg-brand text-white border-none shadow-cta">
            <Link href="/jobseeker/applications">Back to Applications</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const statusMeta = getStatusMeta(app.status);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="space-y-1">
            <Button variant="ghost" asChild className="-ml-4 h-8 text-muted-foreground hover:text-brand gap-1 text-xs uppercase font-black tracking-widest">
              <Link href="/jobseeker/applications">
                <ChevronLeft className="h-3 w-3" />
                Your Applications
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black tracking-tightest uppercase text-slate-900">
                {app.job.title}
              </h1>
              <Badge className={`${statusMeta.bgColor} ${statusMeta.color} border-none font-bold text-xs`}>
                {statusMeta.label}
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              at <span className="text-slate-900 font-bold">{app.job.company_name}</span> &bull; Applied on {format(new Date(app.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start h-14 bg-slate-100/50 rounded-2xl border border-slate-200 p-1 mb-8">
                <TabsTrigger value="messages" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <MessageSquare className="h-3.5 w-3.5" /> Conversation
                </TabsTrigger>
                <TabsTrigger value="overview" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <Briefcase className="h-3.5 w-3.5" /> Job Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl h-full px-8 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase font-black tracking-widest text-[10px]">
                  <History className="h-3.5 w-3.5" /> Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-brand">
                        <Mail className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Employer Chat</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Visible to the employer.</p>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="h-[400px] overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
                      {app.messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                          <MessageSquare className="h-12 w-12 text-slate-400" />
                          <p className="text-sm font-bold uppercase tracking-widest">No messages from the employer yet</p>
                        </div>
                      ) : (
                        app.messages.map(msg => (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.sender_role === 'CANDIDATE' ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                              msg.sender_role === 'CANDIDATE' 
                                ? 'bg-brand text-white rounded-tr-none' 
                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                            }`}>
                              <p className="leading-relaxed">{msg.body}</p>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                              <span className="text-[10px] font-black uppercase text-slate-300">
                                {msg.sender_role === 'CANDIDATE' ? 'You' : 'Employer'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                      <form onSubmit={handleSendReply} className="flex gap-3">
                        <Input 
                          placeholder="Type your reply..." 
                          className="flex-1 rounded-xl h-12 border-slate-200 focus:border-brand transition-all"
                          value={reply}
                          onChange={e => setReply(e.target.value)}
                          disabled={isSending}
                        />
                        <Button 
                          type="submit"
                          disabled={isSending || !reply.trim()}
                          className="rounded-xl h-12 w-12 bg-brand text-white p-0 shadow-cta border-none hover:opacity-90 transition-all"
                        >
                          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="m-0 animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Position Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 prose prose-neutral max-w-none">
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {app.job.description || "No description provided."}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="m-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                  <div className="relative flex items-start gap-6 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm z-10">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1.5 pb-6 border-b border-slate-50 w-full">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Application Submitted</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {format(new Date(app.created_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* More events would go here in a full audit trail implementation */}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className={`p-4 rounded-2xl ${statusMeta.bgColor} border border-transparent mb-6 text-center`}>
                  <p className={`text-lg font-black uppercase tracking-tight ${statusMeta.color}`}>
                    {statusMeta.label}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <MapPin className="h-4 w-4 text-brand" /> {app.job.location}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Briefcase className="h-4 w-4 text-brand" /> {app.job.company_name}
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full mt-8 rounded-xl border-slate-200 font-bold gap-2">
                  <Link href={`/job/${app.job.id}`}>
                    View Original Post
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3 text-indigo-700">
                <HelpCircle className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-tight">Need Help?</h4>
              </div>
              <p className="text-xs text-indigo-600 font-medium leading-relaxed mb-4 italic">
                If you have questions about this role, you can message the employer directly using the Conversation tab.
              </p>
              <Link href="/support" className="text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:underline">
                Contact Support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
