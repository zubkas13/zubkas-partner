import { Users, DollarSign, TrendingUp, Building2, UserPlus, Trophy, ArrowUpRight, Crown, Star, Award, Rocket } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatCard, SectionHeader } from '@/components/Shared';
import { formatCurrency, formatDate, getInitials } from '@/utils/helpers';
import { computeAllPartnerStats, partnerWithStats } from '@/utils/partnerStats';

const badgeIcons: Record<string, typeof Crown> = { 'Top Performer': Crown, 'Rising Star': Star, 'Consistent Earner': Award, 'New Champion': Rocket };

export function AdminDashboard() {
  const { partners, leads, announcements, customers, transactions } = useApp();
  const statsMap = computeAllPartnerStats(partners, customers, leads, transactions);
  const partnersWithStats = partners.map(p => partnerWithStats(p, statsMap));

  const totalCommission = partnersWithStats.reduce((s, p) => s + p.totalCommission, 0);
  const totalMonthlySales = partnersWithStats.reduce((s, p) => s + p.monthlySales, 0);
  const totalCustomers = customers.filter(c => c.status === 'Active').length;
  const topPerformers = [...partnersWithStats].sort((a, b) => b.monthlySales - a.monthlySales).slice(0, 4);

  const recentPartners = [...partnersWithStats].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your partner program performance</p>
      </div>

      {/* Top Performers Widget */}
      <div className="card p-6">
        <SectionHeader
          title="Top Performing Partners"
          subtitle="Leading partners this month by sales volume"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topPerformers.map((p, i) => {
            const BadgeIcon = badgeIcons[p.badge ?? ''] ?? Trophy;
            return (
              <div key={p.id} className={`relative rounded-xl p-4 ${i === 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200' : 'bg-gray-50 border border-gray-100'}`}>
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-lg">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-amber-500 text-white' : 'bg-zubkas-700 text-white'}`}>
                    {getInitials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="truncate text-xs text-gray-500">{p.company}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Monthly Sales</p>
                    <p className="text-lg font-display font-bold text-gray-900">{formatCurrency(p.monthlySales)}</p>
                  </div>
                  {p.badge && <BadgeIcon className={`h-5 w-5 ${i === 0 ? 'text-amber-500' : 'text-zubkas-700'}`} />}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  #{i + 1} this month
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Partners" value={String(partners.length)} icon={Users} trend={`${partners.filter(p => p.status === 'Active').length} active`} trendUp accent="zubkas" />
        <StatCard label="Total Customers" value={String(totalCustomers)} icon={Building2} trend="Across all partners" accent="blue" />
        <StatCard label="Monthly Sales" value={formatCurrency(totalMonthlySales)} icon={TrendingUp} trend="+12.5% vs last month" trendUp accent="emerald" />
        <StatCard label="Total Commission Paid" value={formatCurrency(totalCommission)} icon={DollarSign} trend="All-time payout" accent="amber" />
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent partners */}
        <div className="card p-6">
          <SectionHeader title="Recent Partners" subtitle="Newly joined partner accounts" />
          <div className="mt-4 space-y-3">
            {recentPartners.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-50 p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.company} · {p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{formatDate(p.joinedDate)}</p>
                  <span className="badge badge-success mt-0.5">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent announcements */}
        <div className="card p-6">
          <SectionHeader title="Recent Announcements" subtitle="Latest broadcasts to partners" />
          <div className="mt-4 space-y-3">
            {announcements.slice(0, 5).map(a => (
              <div key={a.id} className="rounded-lg border border-gray-50 p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  {a.isPinned && <span className="badge badge-zubkas shrink-0">Pinned</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                  <span>{a.author}</span>
                  <span>·</span>
                  <span>{formatDate(a.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads overview */}
      <div className="card p-6">
        <SectionHeader title="Lead Pipeline Overview" subtitle={`${leads.length} total leads across all partners`} />
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Pending', count: leads.filter(l => l.status === 'Pending Approval').length, color: 'bg-slate-50 text-slate-700' },
            { label: 'Locked', count: leads.filter(l => l.status === 'Locked' || l.status === 'Approved').length, color: 'bg-amber-50 text-amber-700' },
            { label: 'Converted', count: leads.filter(l => l.status === 'Converted').length, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Lost', count: leads.filter(l => l.status === 'Lost' || l.status === 'Rejected').length, color: 'bg-red-50 text-red-700' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 p-4 text-center">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${s.color} mb-2`}>
                <span className="text-sm font-bold">{s.count}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
