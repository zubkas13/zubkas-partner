import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: 'zubkas' | 'emerald' | 'amber' | 'blue';
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, accent = 'zubkas' }: StatCardProps) {
  const accentColors = {
    zubkas: 'bg-zubkas-50 text-zubkas-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`rounded-lg p-2 ${accentColors[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <span className="text-2xl font-display font-bold text-gray-900">{value}</span>
      {trend && (
        <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-gray-500'}`}>
          {trend}
        </span>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-display font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-3">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{message}</p>
    </div>
  );
}
