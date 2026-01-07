"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  History, 
  Search, 
  User, 
  Activity, 
  Database,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type AuditLog = {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  meta: any;
  created_at: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function AdminAuditList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchActor, setSearchActor] = useState("");
  const [searchAction, setSearchAction] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: "50",
        actor: searchActor,
        action: searchAction,
      });
      const res = await fetch(`/api/admin/audit?${query}`);
      const payload = await res.json();
      setLogs(payload.data || []);
      setPagination(payload.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchActor, searchAction]);

  useEffect(() => {
    const timer = setTimeout(loadLogs, 300);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
            <User className="h-4 w-4" />
          </div>
          <Input 
            placeholder="Filter by Actor (Email or ID)..."
            value={searchActor}
            onChange={e => { setSearchActor(e.target.value); setPage(1); }}
            className="pl-11 h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:border-brand"
          />
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
            <Activity className="h-4 w-4" />
          </div>
          <Input 
            placeholder="Filter by Action (e.g. verification)..."
            value={searchAction}
            onChange={e => { setSearchAction(e.target.value); setPage(1); }}
            className="pl-11 h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:border-brand"
          />
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-2 border-slate-100 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <History className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">No logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-900">{format(new Date(log.created_at), "MMM d, HH:mm:ss")}</p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <p className="text-xs font-black text-brand-600 uppercase tracking-tight">{log.actor_email || "System"}</p>
                      <p className="text-[9px] font-medium text-slate-400 font-mono mt-0.5">{log.actor_id}</p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Badge variant="default" className="rounded-full font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 border-slate-200 text-slate-600">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{log.entity_type}</p>
                      <p className="text-[9px] font-medium text-slate-400 font-mono mt-0.5">{log.entity_id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <pre className="text-[9px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg max-w-[200px] overflow-hidden text-ellipsis">
                        {JSON.stringify(log.meta)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {logs.length} of {pagination.total} events
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1 || loading}
                onClick={() => setPage(p => p - 1)}
                className="h-9 w-9 p-0 rounded-xl border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="h-9 px-4 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black">
                {page} / {pagination.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === pagination.totalPages || loading}
                onClick={() => setPage(p => p + 1)}
                className="h-9 w-9 p-0 rounded-xl border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}