import { useState } from 'react';
import { Plus, Tag, FolderTree, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import type { Category } from '@/types';

export function AdminCategories() {
  const { categories, addCategory, deleteCategory } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await addCategory({ name: form.name, description: form.description });
      setForm({ name: '', description: '' });
      setShowAdd(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Partner Categories"
        subtitle="Organize partners by business type"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Category</button>}
      />

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" message="Create your first partner category" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
                  <Tag className="h-5 w-5 text-zubkas-700" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete category">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-display font-semibold text-gray-900">{c.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Category">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="e.g. Healthcare" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field mt-1 min-h-20" placeholder="Brief description of this category" />
          </div>
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Category <span className="font-semibold">{deleteTarget.name}</span> will be permanently removed. Partners currently assigned to this category will need to be reassigned.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteCategory(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Category
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
