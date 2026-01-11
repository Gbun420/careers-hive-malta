import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, Star } from 'lucide-react'

type DashboardStatsProps = {
  stats: {
    jobCount: number;
    applicationCount: number;
    featuredJobs: any[];
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-down">
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Jobs</CardTitle>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
            <Briefcase className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.jobCount}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Total listings</p>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applications</CardTitle>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.applicationCount}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Received all time</p>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Slots</CardTitle>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
            <Star className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-950">{stats.featuredJobs.length}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Currently active</p>
        </CardContent>
      </Card>
    </div>
  )
}
