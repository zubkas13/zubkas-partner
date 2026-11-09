import { Megaphone, Pin, Package, Bell, Wrench, Info, Filter, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { formatDate } from '@/utils/helpers';
import { useState, useEffect, useRef } from 'react';
import type { Announcement } from '@/types';

const typeConfig: Record<Announcement['type'], { icon: typeof Package; color: string; bg: string; label: string }> = {
  product: { icon: Package, color: 'text-zubkas-700', bg: 'bg-zubkas-50', label: 'Product Launch' },
  update: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Update' },
  maintenance: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Maintenance' },
  general: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'General' },
};

interface PartnerAnnouncementsProps {
  highlightId?: string | null;
}

export function PartnerAnnouncements({ highlightId }: PartnerAnnouncementsProps) {
  const { announcements, dismissedAnnouncementIds, setDismissedAnnouncementIds } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const visible = announcements.filter(a => !dismissedAnnouncementIds.includes(a.id));
  const filtered = visible.filter(a => typeFilter === 'All' || a.type === typeFilter);
  const sorted = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleDismiss = (id: string) => {
    setDismissedAnnouncementIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  // Scroll to and flash the highlighted announcement when navigated from notification dropdown
  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setFlashId(highlightId);
        setTimeout(() => setFlashId(null), 3000);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightId]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Announcements & Updates" subtitle="Latest news, product launches, and important updates" />

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-48">
          <option>All</option>
          <option value="product">Product Launch</option>
          <option value="update">Update</option>
          <option value="maintenance">Maintenance</option>
          <option value="general">General</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements found" message="Check back later for updates" />
      ) : (
        <div className="space-y-4">
          {sorted.map(a => {
            const cfg = typeConfig[a.type];
            const Icon = cfg.icon;
            const isHighlighted = highlightId === a.id;
            const isFlashing = flashId === a.id;
            return (
              <div
                key={a.id}
                ref={isHighlighted ? highlightRef : undefined}
                className={`card p-5 transition-all duration-500 ${a.isPinned ? 'border-l-4 border-l-zubkas-700' : ''} ${isFlashing ? 'ring-2 ring-zubkas-500 shadow-lg bg-zubkas-50/60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold text-gray-900">{a.title}</h3>
                      {a.isPinned && <span className="badge badge-zubkas"><Pin className="h-3 w-3" /> Pinned</span>}
                      <span className={`badge ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.content}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{a.author}</span>
                      <span>·</span>
                      <span>{a.authorRole}</span>
                      <span>·</span>
                      <span>{formatDate(a.date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(a.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    title="Dismiss from your view"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
