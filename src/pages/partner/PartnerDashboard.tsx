import { Users, DollarSign, TrendingUp, Clock, Crown, Star, Award, Rocket, Trophy, ArrowUpRight, TriangleAlert as AlertTriangle, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatCard, SectionHeader } from '@/components/Shared';
import { formatCurrency, formatDate, getInitials } from '@/utils/helpers';
import { computeAllPartnerStats, partnerWithStats } from '@/utils/partnerStats';
import { leaderboard } from '@/data/mockData';

const badgeIcons: Record<string, typeof Crown> = { 'Top Performer': Crown, 'Rising Star': Star, 'Consistent Earner': Award, 'New Champion': Rocket };

export function PartnerDashboard() {
  const { currentUser, partners, customers, leads, transactions } = useApp();
  const statsMap = computeAllPartnerStats(partners, customers, leads, transactions);
  const partnersWithStats = partners.map(p => partnerWithStats(p, statsMap));
  const partner = partnersWithStats.find(p => p.id === currentUser?.partnerId);

  if (!partner) return <div>Partner not found</div>;

  const myCustomers = customers.filter(c => c.partnerId === partner.id);
  const myLeads = leads.filter(l => l.partnerId === partner.id);
  const unpaidCustomers = myCustomers.filter(c => c.status === 'Unpaid');

  // Top performers for widget
  const topPerformers = [...partnersWithStats].sort((a, b) => b.monthlySales - a.monthlySales).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-zubkas-700 to-zubkas-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {partner.name.split(' ')[0]}!</h1>
            <p className="text-sm text-zubkas-100 mt-1">{partner.company} · Partner since {formatDate(partner.joinedDate)}</p>
            {partner.badge && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                {(() => { const Icon = badgeIcons[partner.badge] ?? Trophy; return <Icon className="h-3.5 w-3.5" />; })()}
                {partner.badge}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-sm">
              {getInitials(partner.name)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performance Widget */}
      <div className="card p-6">
        <SectionHeader title="Top Performers This Month" subtitle="See how you rank among top partners" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topPerformers.map((p, i) => {
            const isMe = p.id === partner.id;
            const BadgeIcon = badgeIcons[p.badge ?? ''] ?? Trophy;
            return (
              <div key={p.id} className={`relative rounded-xl p-4 transition-all ${isMe ? 'bg-zubkas-50 border-2 border-zubkas-300 ring-2 ring-zubkas-700/10' : i === 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200' : 'bg-gray-50 border border-gray-100'}`}>
                {isMe && (
                  <div className="absolute -top-2 -right-2 rounded-full bg-zubkas-700 px-2 py-0.5 text-[10px] font-bold text-white">
                    YOU
                  </div>
                )}
                {i === 0 && !isMe && (
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-lg">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${isMe ? 'bg-zubkas-700 text-white' : i === 0 ? 'bg-amber-500 text-white' : 'bg-zubkas-700 text-white'}`}>
                    {getInitials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="truncate text-xs text-gray-500">{p.company}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Monthly Sales</p>
                  <p className="text-lg font-display font-bold text-gray-900">{formatCurrency(p.monthlySales)}</p>
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
        <StatCard label="Active Customers" value={String(myCustomers.filter(c => c.status === 'Active').length)} icon={Users} trend={`${myCustomers.length} total`} accent="zubkas" />
        <StatCard label="Monthly Sales" value={formatCurrency(partner.monthlySales)} icon={TrendingUp} trend="+12.5% vs last month" trendUp accent="blue" />
        <StatCard label="Monthly Commission" value={formatCurrency(partner.monthlyCommission)} icon={DollarSign} trend="This month's earnings" trendUp accent="emerald" />
        <StatCard label="Pending Commission" value={formatCurrency(partner.pendingCommission)} icon={Clock} trend={unpaidCustomers.length > 0 ? `${unpaidCustomers.length} unpaid customer${unpaidCustomers.length > 1 ? 's' : ''}` : 'All clear'} accent="amber" />
      </div>

      {/* Total commission + unpaid warning */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Commission Earned</p>
              <p className="text-3xl font-display font-bold text-gray-900">{formatCurrency(partner.totalCommission)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: '72%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">72% of annual target reached</p>
        </div>

        {/* Unpaid warning */}
        {unpaidCustomers.length > 0 && (
          <div className="card p-6 lg:col-span-2 border-l-4 border-l-amber-400">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-gray-900">Unpaid Subscription Alert</h3>
                <p className="text-sm text-gray-500 mt-1">Commission has been blocked for the following customers this month due to unpaid subscriptions:</p>
                <div className="mt-3 space-y-2">
                  {unpaidCustomers.map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-amber-50/50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.companyName} · {c.planTier} Plan ({c.commissionRate}%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-700">-{formatCurrency(c.subscriptionAmount * c.commissionRate / 100)}</p>
                        <p className="text-xs text-gray-400">blocked</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent customers + leads */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <SectionHeader title="Recent Customers" subtitle={`${myCustomers.length} total customers`} />
          <div className="mt-4 space-y-3">
            {myCustomers.slice(-4).reverse().map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-50 p-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.companyName} · {c.planTier} ({c.planType})</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.commissionEarned)}</span>
                  <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <SectionHeader title="My Recent Leads" subtitle={`${myLeads.length} total leads`} />
          <div className="mt-4 space-y-3">
            {myLeads.slice(-4).reverse().map(l => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-gray-50 p-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.companyName}</p>
                  <p className="text-xs text-gray-500">{l.contactName} · {formatDate(l.submittedDate)}</p>
                </div>
                <span className={`badge ${l.status === 'Locked' ? 'badge-warning' : l.status === 'Converted' ? 'badge-success' : l.status === 'Lost' ? 'badge-error' : 'badge-neutral'}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
