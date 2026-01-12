import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Star, TrendingUp, TrendingDown, Eye, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardStatsProps = {
  stats: {
    jobCount: number;
    applicationCount: number;
    featuredJobs: any[];
    views: number;
    avgTimeToHire: number;
    conversionRate: number;
  };
};

export default function EnhancedDashboardStats({ stats }: DashboardStatsProps) {
  const conversionTrend = stats.conversionRate > 15 ? "up" : "down";
  const timeToHireColor = stats.avgTimeToHire < 30 ? "text-secondary" : "text-amber-600";
  const timeToHireBg = stats.avgTimeToHire < 30 ? "bg-secondary/10" : "bg-amber-50";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12 animate-fade-down">
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Active Jobs
          </CardTitle>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
            <Briefcase className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.jobCount}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Total listings
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              <span className="text-[9px] text-secondary font-black uppercase">+12%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Applications
          </CardTitle>
          <div className="p-2 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.applicationCount}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Received all time
            </p>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-brand" />
              <span className="text-[9px] text-brand font-black uppercase">
                {stats.conversionRate}% CVR
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Featured Slots
          </CardTitle>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
            <Star className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.featuredJobs.length}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Currently active
            </p>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-amber-500" />
              <span className="text-[9px] text-amber-500 font-black uppercase">3x views</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Views
          </CardTitle>
          <div className="p-2 rounded-xl bg-purple-50 text-purple-500 group-hover:scale-110 transition-transform">
            <Eye className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.views.toLocaleString()}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              This month
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              <span className="text-[9px] text-secondary font-black uppercase">+24%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Avg. Time to Hire
          </CardTitle>
          <div
            className={cn(
              "p-2 rounded-xl group-hover:scale-110 transition-transform",
              timeToHireBg,
              timeToHireColor
            )}
          >
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.avgTimeToHire}d</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Days average
            </p>
            <div className="flex items-center gap-1">
              {stats.avgTimeToHire < 30 ? (
                <TrendingDown className="h-3 w-3 text-secondary" />
              ) : (
                <TrendingUp className="h-3 w-3 text-amber-500" />
              )}
              <span
                className={cn(
                  "text-[9px] font-black uppercase",
                  stats.avgTimeToHire < 30 ? "text-secondary" : "text-amber-500"
                )}
              >
                {stats.avgTimeToHire < 30 ? "Good" : "Slow"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Conversion Rate
          </CardTitle>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 group-hover:scale-110 transition-transform">
            <Target className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.conversionRate}%</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Application rate
            </p>
            <div className="flex items-center gap-1">
              {conversionTrend === "up" ? (
                <TrendingUp className="h-3 w-3 text-secondary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-amber-500" />
              )}
              <span
                className={cn(
                  "text-[9px] font-black uppercase",
                  conversionTrend === "up" ? "text-secondary" : "text-amber-500"
                )}
              >
                {conversionTrend === "up" ? "Strong" : "Needs work"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
