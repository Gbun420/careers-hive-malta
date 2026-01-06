"use client";

import { useEffect, useState, useCallback } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Stage, ApplicantFields } from "@/lib/airtable";
import { Calendar, User, FileText, Star, Edit2, Loader2, AlertCircle } from "lucide-react";

const STAGES: Stage[] = [
  "Submitted",
  "Interviewing",
  "Decision needed",
  "Hire",
  "No hire",
];

const SCORES = ["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"];

export default function ApplicantTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setJobs] = useState<any[]>([]);
  const [interviewersMap, setInterviewersMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("kanban");

  // Edit State
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ApplicantFields>>({});

  const fetchData = useCallback(async (mode: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/airtable/applicants?mode=${mode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch applicants");
      setJobs(data.applicants);
      setInterviewersMap(data.interviewersMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      Stage: record.fields.Stage,
      "Onsite interview": record.fields["Onsite interview"],
      "Onsite interview score": record.fields["Onsite interview score"],
      "Onsite interview notes": record.fields["Onsite interview notes"],
    });
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/airtable/applicants/${editingRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      
      // Optimistic update locally
      setJobs(prev => prev.map(a => 
        a.id === editingRecord.id 
          ? { ...a, fields: { ...a.fields, ...editForm } } 
          : a
      ));
      
      setEditingRecord(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getInterviewerNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "N/A";
    return ids.map(id => interviewersMap[id] || id).join(", ");
  };

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h2>
          <p className="text-slate-500 max-w-md mb-6">{error}</p>
          <Button onClick={() => fetchData(activeTab)}>Retry Sync</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-10">
        <SectionHeading
          title="Applicant Tracker"
          subtitle="Airtable-backed recruitment pipeline and onsite schedule."
        />
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="kanban" className="rounded-lg px-6">Pipeline Kanban</TabsTrigger>
            <TabsTrigger value="interviewing" className="rounded-lg px-6">Onsite Schedule</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            {loading ? "Syncing Airtable..." : "System Synced"}
          </div>
        </div>

        <TabsContent value="kanban" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {STAGES.map(stage => {
              const stageApplicants = applicants.filter(a => a.fields.Stage === stage);
              return (
                <div key={stage} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                      {stage}
                    </h3>
                    <Badge variant="default" className="bg-slate-100 text-slate-600 border-none">
                      {loading ? "..." : stageApplicants.length}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-4 min-h-[500px] rounded-2xl bg-slate-50/50 p-2 border border-dashed border-slate-200">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-12 rounded-full" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </div>
                        </div>
                      ))
                    ) : (
                      stageApplicants.map(app => (
                        <Card key={app.id} className="group hover:border-brand/50 hover:shadow-md transition-all cursor-pointer overflow-hidden border-slate-200" onClick={() => handleEdit(app)}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-1">
                                {app.fields.Name || "Unnamed Applicant"}
                              </h4>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>

                            {app.fields["Onsite interview"] && (
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Calendar className="h-3 w-3 text-brand" />
                                {app.fields["Onsite interview"]}
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-1">
                              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                <span className="font-black uppercase tracking-tighter w-8">Phone</span>
                                <span className="truncate text-slate-600">{getInterviewerNames(app.fields["Phone interviewer"])}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                <span className="font-black uppercase tracking-tighter w-8">Onsite</span>
                                <span className="truncate text-slate-600">{getInterviewerNames(app.fields["Onsite interviewer"])}</span>
                              </div>
                            </div>

                            {app.fields["Onsite interview score"] && (
                              <Badge variant="verified" className="w-full justify-center bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
                                Score: {app.fields["Onsite interview score"].split(" ")[0]}
                              </Badge>
                            )}

                            {app.fields["Onsite interview notes"] && (
                              <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                &quot;{app.fields["Onsite interview notes"]}&quot;
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                    
                    {!loading && stageApplicants.length === 0 && (
                      <div className="flex items-center justify-center py-10 opacity-30">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="interviewing" className="m-0">
          <Card className="border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Onsite Date</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Name</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Phone Interviewer</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Onsite Interviewer</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Score</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      </TableRow>
                    ))
                  ) : applicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                        No onsite interviews scheduled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applicants.map(app => (
                      <TableRow key={app.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleEdit(app)}>
                        <TableCell className="font-bold text-brand">{app.fields["Onsite interview"] || "TBD"}</TableCell>
                        <TableCell className="font-bold text-slate-900">{app.fields.Name}</TableCell>
                        <TableCell className="text-slate-600 text-xs">{getInterviewerNames(app.fields["Phone interviewer"])}</TableCell>
                        <TableCell className="text-slate-600 text-xs">{getInterviewerNames(app.fields["Onsite interviewer"])}</TableCell>
                        <TableCell>
                          {app.fields["Onsite interview score"] && (
                            <Badge variant="verified" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                              {app.fields["Onsite interview score"].split(" ")[0]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs italic max-w-xs truncate">
                          {app.fields["Onsite interview notes"]}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tightest uppercase">
              Update Candidate
            </DialogTitle>
            <DialogDescription className="font-medium">
              Updating {editingRecord?.fields.Name} in Airtable.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Current Stage</Label>
              <Select
                id="stage"
                value={editForm.Stage}
                onChange={(e) => setEditForm(prev => ({ ...prev, Stage: e.target.value as Stage }))}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="onsite-date" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Onsite Interview Date</Label>
              <Input
                id="onsite-date"
                type="date"
                value={editForm["Onsite interview"] || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, "Onsite interview": e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="score" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Interview Score</Label>
              <Select
                id="score"
                value={editForm["Onsite interview score"] || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, "Onsite interview score": e.target.value }))}
              >
                <option value="">No score set</option>
                {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Interview Notes</Label>
              <Textarea
                id="notes"
                placeholder="Detailed feedback from the onsite loop..."
                rows={4}
                value={editForm["Onsite interview notes"] || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, "Onsite interview notes": e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="rounded-xl px-8 shadow-cta bg-brand text-white border-none">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

