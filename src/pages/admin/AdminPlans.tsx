import { useState } from 'react';
import { Plus, Layers, Percent, Trash2, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, X, IndianRupee, Pencil } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import type { Plan } from '@/types';

interface PlanFormState {
  name: string;
  price: string;
  commissionRate: string;
  type: Plan['type'];
  description: string;
  features: string[];
  gstApplicable: boolean;
  gstRate: string;
}

const emptyForm: PlanFormState = {
  name: '',
  price: '',
  commissionRate: '10',
  type: 'Monthly',
  description: '',
  features: [''],
  gstApplicable: false,
  gstRate: '18',
};

function computeGstAmount(price: number, rate: number): number {
  return Math.round((price * (rate / 100)) * 100) / 100;
}

function planToForm(p: Plan): PlanFormState {
  return {
    name: p.name,
    price: p.price != null ? String(p.price) : '',
    commissionRate: String(p.commissionRate),
    type: p.type,
    description: p.description,
    features: p.features && p.features.length > 0 ? [...p.features] : [''],
    gstApplicable: p.gstApplicable ?? false,
    gstRate: p.gstRate != null ? String(p.gstRate) : '18',
  };
}

function buildPayload(form: PlanFormState) {
  const cleanFeatures = form.features.map(f => f.trim()).filter(Boolean);
  const numericPrice = form.price ? Number(form.price) : 0;
  const gstRate = form.gstApplicable ? Number(form.gstRate) : 0;
  const gstAmount = form.gstApplicable ? computeGstAmount(numericPrice, gstRate) : 0;
  return {
    name: form.name,
    price: numericPrice,
    commissionRate: Number(form.commissionRate),
    type: form.type,
    description: form.description,
    features: cleanFeatures,
    gstApplicable: form.gstApplicable,
    gstRate,
    gstAmount,
  };
}

export function AdminPlans() {
  const { plans, addPlan, updatePlan, deletePlan } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<PlanFormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await addPlan(buildPayload(form));
      setForm(emptyForm);
      setShowAdd(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to add plan');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (plan: Plan) => {
    setEditTarget(plan);
    setEditForm(planToForm(plan));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updatePlan(editTarget.id, buildPayload(editForm));
      setEditTarget(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => setForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  const updateFeature = (index: number, value: string) => setForm(prev => ({ ...prev, features: prev.features.map((f, i) => i === index ? value : f) }));
  const removeFeature = (index: number) => setForm(prev => ({ ...prev, features: prev.features.length > 1 ? prev.features.filter((_, i) => i !== index) : [''] }));

  const addEditFeature = () => setEditForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  const updateEditFeature = (index: number, value: string) => setEditForm(prev => ({ ...prev, features: prev.features.map((f, i) => i === index ? value : f) }));
  const removeEditFeature = (index: number) => setEditForm(prev => ({ ...prev, features: prev.features.length > 1 ? prev.features.filter((_, i) => i !== index) : [''] }));

  const renderGstConfig = (state: PlanFormState, set: (updater: (prev: PlanFormState) => PlanFormState) => void) => {
    const basePrice = state.price ? Number(state.price) : 0;
    const gstAmount = state.gstApplicable ? computeGstAmount(basePrice, state.gstRate ? Number(state.gstRate) : 0) : 0;
    const total = basePrice + gstAmount;
    return (
      <div className="rounded-lg bg-gray-50 p-3 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.gstApplicable}
            onChange={(e) => set(prev => ({ ...prev, gstApplicable: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-zubkas-700 focus:ring-zubkas-700/20"
          />
          <span className="text-sm font-medium text-gray-700">Apply GST to this plan</span>
        </label>
        {state.gstApplicable && (
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-600">GST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={state.gstRate}
                onChange={(e) => set(prev => ({ ...prev, gstRate: e.target.value }))}
                className="input-field mt-1"
                placeholder="18"
              />
            </div>
            {state.price !== '' && (
              <div className="rounded-md bg-white border border-gray-100 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Price</span>
                  <span className="font-medium text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST ({state.gstRate || 0}%)</span>
                  <span className="font-medium text-gray-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Total (incl. GST)</span>
                  <span className="font-semibold text-zubkas-700">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Plans & Commission Rates"
        subtitle="Manage subscription plans and partner commission percentages"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Plan</button>}
      />

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">1-Year Commission Cap Rule</p>
        <p>Monthly plans earn commission every month for up to 12 months from the subscription start date. Yearly plans earn a one-time lump-sum commission. After the cap, commission payout stops automatically.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(p => {
          const basePrice = p.price ?? 0;
          const isFree = p.price == null || p.price === 0;
          const gstAmount = p.gstApplicable ? computeGstAmount(basePrice, p.gstRate ?? 18) : 0;
          const total = basePrice + gstAmount;
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
                  <Layers className="h-5 w-5 text-zubkas-700" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-zubkas-50 hover:text-zubkas-700 transition-colors" title="Edit plan">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete plan">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-display font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{p.description}</p>
              {p.features && p.features.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">{isFree ? '0' : basePrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-500">{p.type === 'Yearly' ? '/yr' : '/mo'}</span>
                  </div>
                  {isFree && <span className="text-xs font-medium text-emerald-600">Free</span>}
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-4 w-4 text-zubkas-700" />
                    <span className="text-lg font-bold text-zubkas-700">{p.commissionRate}%</span>
                    <span className="text-xs text-gray-500">commission</span>
                  </div>
                </div>
                {p.gstApplicable && !isFree && (
                  <div className="space-y-1 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Base Price</span>
                      <span className="font-medium text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">GST ({p.gstRate ?? 18}%)</span>
                      <span className="font-medium text-gray-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Total (incl. GST)</span>
                      <span className="font-semibold text-zubkas-700">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Plan Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Plan Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="e.g. Enterprise Plan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Plan Price (₹)</label>
              <div className="relative mt-1">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field pl-9" placeholder="999" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Plan['type'] })} className="input-field mt-1">
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Enter 0 or leave blank for a free plan.</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Commission Rate (%)</label>
            <input required type="number" min="1" max="50" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} className="input-field mt-1" />
          </div>
          {renderGstConfig(form, setForm)}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field mt-1 min-h-20" placeholder="Plan features and details" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Plan Features</label>
              <button type="button" onClick={addFeature} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zubkas-700 hover:bg-zubkas-50 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add Feature
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {form.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Feature ${index + 1} (e.g. "Priority support")`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    title="Remove feature"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {saveError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{saveError}</div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Plan'}</button>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Plan">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Plan Name</label>
            <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field mt-1" placeholder="e.g. Enterprise Plan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Plan Price (₹)</label>
              <div className="relative mt-1">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" step="1" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="input-field pl-9" placeholder="999" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
              <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Plan['type'] })} className="input-field mt-1">
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Enter 0 or leave blank for a free plan.</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Commission Rate (%)</label>
            <input required type="number" min="1" max="50" value={editForm.commissionRate} onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })} className="input-field mt-1" />
          </div>
          {renderGstConfig(editForm, setEditForm)}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-field mt-1 min-h-20" placeholder="Plan features and details" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Plan Features</label>
              <button type="button" onClick={addEditFeature} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zubkas-700 hover:bg-zubkas-50 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add Feature
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {editForm.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={feature}
                    onChange={(e) => updateEditFeature(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Feature ${index + 1} (e.g. "Priority support")`}
                  />
                  <button
                    type="button"
                    onClick={() => removeEditFeature(index)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    title="Remove feature"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {saveError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{saveError}</div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Plan" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Plan <span className="font-semibold">{deleteTarget.name}</span> ({deleteTarget.commissionRate}% commission) will be permanently removed. Existing customers on this plan will keep their current commission rate.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deletePlan(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Plan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
