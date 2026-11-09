import { useState } from 'react';
import { Megaphone, Plus, Pin, Package, Bell, Wrench, Info, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatDate } from '@/utils/helpers';
import type { Announcement } from '@/types';

const typeConfig: Record<Announcement['type'], { icon: typeof Package; color: string; bg: string; label: string }> = {
  product: { icon: Package, color: 'text-zubkas-700', bg: 'bg-zubkas-50', label: 'Product Launch' },
  update: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Update' },
  maintenance: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Maintenance' },
  general: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'General' },
};

export function AdminAnnouncements() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'product' as Announcement['type'] });
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const result = await addAnnouncement({ title: form.title, content: form.content, type: form.type });
    if (result.success) {
      setForm({ title: '', content: '', type: 'product' });
      setShowAdd(false);
    } else {
      setSubmitError(result.error ?? 'Failed to publish announcement');
    }
    setSubmitting(false);
  };

  const sorted = [...announcements].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements & Product Launches"
        subtitle="Broadcast updates that instantly appear in partner feeds"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> New Announcement</button>}
      />

      {sorted.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" message="Create your first broadcast" />
      ) : (
        <div className="space-y-4">
          {sorted.map(a => {
            const cfg = typeConfig[a.type];
            const Icon = cfg.icon;
            return (
              <div key={a.id} className={`card p-5 ${a.isPinned ? 'border-l-4 border-l-zubkas-700' : ''}`}>
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
                  <button onClick={() => setDeleteTarget(a)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0" title="Delete announcement">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setSubmitError(null); }} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Announcement['type'] })} className="input-field mt-1">
              <option value="product">Product Launch</option>
              <option value="update">Update</option>
              <option value="maintenance">Maintenance</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field mt-1" placeholder="Announcement title" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field mt-1 min-h-28" placeholder="Write your announcement..." />
          </div>
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {submitError}
            </div>
          )}
          <div className="rounded-lg bg-zubkas-50 p-3 text-xs text-zubkas-700">
            This announcement will instantly appear in all partners' notification feeds.
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Publishing…' : 'Publish Announcement'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Announcement" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Announcement <span className="font-semibold">{deleteTarget.title}</span> will be permanently removed and will no longer appear in partner feeds.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteAnnouncement(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Announcement
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
