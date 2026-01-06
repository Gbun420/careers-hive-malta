"use client";

import { useEffect, useState, useCallback } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { JobAlert, CreateJobAlert, JobAlertFilters, JobAlertFrequency } from "@/lib/alerts/types";
import { getAlertSummary } from "@/lib/alerts/summary";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Mail, 
  Clock, 
  MapPin, 
  Briefcase, 
  Search,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function JobseekerAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateJobAlert>>({
    name: "",
    query: "",
    frequency: "DAILY",
    enabled: true,
    filters: {}
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobseeker/alerts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to fetch alerts");
      setAlerts(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleOpenDialog = (alert?: JobAlert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        name: alert.name,
        query: alert.query || "",
        frequency: alert.frequency,
        enabled: alert.enabled,
        filters: alert.filters
      });
    } else {
      setEditingAlert(null);
      setFormData({
        name: "",
        query: "",
        frequency: "DAILY",
        enabled: true,
        filters: {}
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = editingAlert ? `/api/jobseeker/alerts/${editingAlert.id}` : "/api/jobseeker/alerts";
      const method = editingAlert ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Save failed");
      
      await fetchAlerts();
      setIsDialogOpen(false);
    } catch (err: any) {
      window.alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    
    try {
      const res = await fetch(`/api/jobseeker/alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      window.alert(err.message);
    }
  };

  const toggleEnabled = async (alertToToggle: JobAlert) => {
    try {
      const res = await fetch(`/api/jobseeker/alerts/${alertToToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !alertToToggle.enabled }),
      });
      if (!res.ok) throw new Error("Update failed");
      
      setAlerts(prev => prev.map(a => 
        a.id === alertToToggle.id ? { ...a, enabled: !a.enabled } : a
      ));
    } catch (err: any) {
      window.alert(err.message);
    }
  };

  const updateFilters = (newFilters: Partial<JobAlertFilters>) => {
    setFormData(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  };

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Error</h2>
          <p className="text-slate-500 max-w-md mb-6">{error}</p>
          <Button onClick={fetchAlerts}>Retry</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            title="Job Alerts"
            subtitle="Manage your saved searches and daily digest notifications."
          />
          <Button onClick={() => handleOpenDialog()} className="rounded-xl px-6 bg-brand text-white border-none shadow-cta">
            <Plus className="mr-2 h-4 w-4" /> New Alert
          </Button>
        </header>

        {loading && alerts.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-6 text-slate-400">
              <Bell className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No alerts yet</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Create an alert to get notified as soon as new jobs match your criteria.
            </p>
            <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-xl border-slate-300">
              Create your first alert
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {alerts.map(alert => (
              <Card key={alert.id} className={`overflow-hidden border-slate-200 transition-all ${!alert.enabled && 'opacity-60'}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-black text-slate-900">{alert.name}</h3>
                        {alert.enabled ? (
                          <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100">Active</Badge>
                        ) : (
                          <Badge variant="default">Disabled</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                        Matching: <span className="text-slate-900 font-bold">{getAlertSummary(alert.query, alert.filters)}</span>
                      </p>

                      <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {alert.frequency}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {alert.last_sent_at ? `Last sent ${new Date(alert.last_sent_at).toLocaleDateString()}` : "Never sent"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 p-6 md:p-8 flex items-center justify-between md:flex-col md:justify-center gap-4">
                      <div className="flex items-center gap-3 md:mb-2">
                        <Label htmlFor={`toggle-${alert.id}`} className="text-xs font-bold uppercase tracking-widest text-slate-400">Enabled</Label>
                        <Switch 
                          id={`toggle-${alert.id}`} 
                          checked={alert.enabled} 
                          onCheckedChange={() => toggleEnabled(alert)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => handleOpenDialog(alert)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(alert.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tightest uppercase">
                {editingAlert ? "Edit Alert" : "New Job Alert"}
              </DialogTitle>
              <DialogDescription className="font-medium">
                We&apos;ll email you a digest of new jobs matching your specific criteria.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Alert Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Senior Dev Roles in Sliema" 
                  value={formData.name} 
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="query" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Keywords</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    id="query" 
                    className="pl-10" 
                    placeholder="e.g. Engineer, Marketing, Manager" 
                    value={formData.query || ""} 
                    onChange={e => setFormData(prev => ({ ...prev, query: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="location" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="location" 
                      className="pl-10" 
                      placeholder="e.g. Valletta, Remote" 
                      value={formData.filters?.location || ""} 
                      onChange={e => updateFilters({ location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Employment Type</Label>
                  <Select 
                    id="type"
                    value={formData.filters?.employmentType || ""} 
                    onChange={e => updateFilters({ employmentType: e.target.value })}
                  >
                    <option value="">Any Type</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="frequency" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Frequency</Label>
                  <Select 
                    id="frequency"
                    value={formData.frequency} 
                    onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value as JobAlertFrequency }))}
                  >
                    <option value="DAILY">Daily Digest</option>
                    <option value="WEEKLY">Weekly Update</option>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="salary" className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Min. Salary (€)</Label>
                  <Input 
                    id="salary" 
                    type="number" 
                    placeholder="e.g. 45000" 
                    value={formData.filters?.salaryMin || ""} 
                    onChange={e => updateFilters({ salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                <Switch 
                  checked={formData.filters?.remote || false} 
                  onCheckedChange={checked => updateFilters({ remote: checked })}
                />
                Remote roles only
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.name} className="rounded-xl px-10 bg-brand text-white border-none shadow-cta">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingAlert ? "Update Alert" : "Create Alert"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  );
}