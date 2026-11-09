import { useState } from 'react';
import { Package, Plus, CircleCheck as CheckCircle2, Sparkles, Briefcase, ChartBar as BarChart3, HardHat, CreditCard, Wallet, Users, Trash2, Pencil, X, Tag, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import type { Product } from '@/types';

const iconOptions = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'HardHat', icon: HardHat },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Wallet', icon: Wallet },
  { name: 'Users', icon: Users },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Package', icon: Package },
];

const iconMap: Record<string, typeof Package> = Object.fromEntries(
  iconOptions.map(o => [o.name, o.icon])
);

const statusOptions: Product['status'][] = ['Active', 'Beta', 'Coming Soon'];
const billingFrequencyOptions: Product['billingFrequency'][] = ['Monthly', 'Yearly'];

interface FormState {
  name: string;
  description: string;
  icon: string;
  billingFrequency: 'Monthly' | 'Yearly';
  monthlyPrice: string;
  yearlyPrice: string;
  commissionEligible: boolean;
  showOnLanding: boolean;
  status: Product['status'];
  features: string[];
  gstApplicable: boolean;
  gstRate: string;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  icon: 'Package',
  billingFrequency: 'Monthly',
  monthlyPrice: '',
  yearlyPrice: '',
  commissionEligible: true,
  showOnLanding: false,
  status: 'Active',
  features: [''],
  gstApplicable: false,
  gstRate: '18',
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    description: p.description,
    icon: p.icon,
    billingFrequency: p.billingFrequency ?? (p.yearlyPrice != null ? 'Yearly' : 'Monthly'),
    monthlyPrice: p.monthlyPrice != null ? String(p.monthlyPrice) : '',
    yearlyPrice: p.yearlyPrice != null ? String(p.yearlyPrice) : '',
    commissionEligible: p.commissionEligible,
    showOnLanding: p.showOnLanding,
    status: p.status,
    features: p.features.length ? p.features : [''],
    gstApplicable: p.gstApplicable ?? false,
    gstRate: p.gstRate != null ? String(p.gstRate) : '18',
  };
}

function computeGstAmount(price: number, rate: number): number {
  return Math.round((price * (rate / 100)) * 100) / 100;
}

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAdd(true);
  };

  const openEdit = (p: Product) => {
    setForm(productToForm(p));
    setEditingId(p.id);
    setShowAdd(true);
  };

  const closeForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = form.features.filter(f => f.trim() !== '');
    const payload: Omit<Product, 'id'> = {
      name: form.name,
      description: form.description,
      icon: form.icon,
      billingFrequency: form.billingFrequency,
      monthlyPrice: form.billingFrequency === 'Monthly' && form.monthlyPrice ? Number(form.monthlyPrice) : null,
      yearlyPrice: form.billingFrequency === 'Yearly' && form.yearlyPrice ? Number(form.yearlyPrice) : null,
      commissionEligible: form.commissionEligible,
      showOnLanding: form.showOnLanding,
      status: form.status,
      features: filteredFeatures,
      gstApplicable: form.gstApplicable,
      gstRate: form.gstApplicable ? Number(form.gstRate) : 0,
    };
    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct({ ...payload, launchDate: new Date().toISOString().split('T')[0] });
    }
    closeForm();
  };

  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (index: number) => setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== index) }));
  const updateFeature = (index: number, value: string) => setForm(f => ({ ...f, features: f.features.map((feat, i) => i === index ? value : feat) }));

  const activePrice = form.billingFrequency === 'Monthly'
    ? (form.monthlyPrice ? Number(form.monthlyPrice) : 0)
    : (form.yearlyPrice ? Number(form.yearlyPrice) : 0);
  const gstAmount = form.gstApplicable
    ? computeGstAmount(activePrice, form.gstRate ? Number(form.gstRate) : 0)
    : 0;
  const totalWithGst = activePrice + gstAmount;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products Suite"
        subtitle="Manage Zubkas products available for partner referral"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add Product</button>}
      />

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" message="Add your first product to the suite" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => {
            const Icon = iconMap[p.icon] ?? Package;
            const displayPrice = p.billingFrequency === 'Yearly'
              ? p.yearlyPrice
              : p.billingFrequency === 'Monthly'
                ? p.monthlyPrice
                : (p.monthlyPrice ?? p.yearlyPrice);
            return (
              <div key={p.id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
                    <Icon className="h-5 w-5 text-zubkas-700" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`badge ${p.status === 'Active' ? 'badge-success' : p.status === 'Beta' ? 'badge-warning' : 'badge-neutral'}`}>{p.status}</span>
                    <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-zubkas-50 hover:text-zubkas-700 transition-colors" title="Edit product">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete product">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 font-display font-semibold text-gray-900">{p.name}</h3>
                <p className="mt-1 text-sm text-gray-500 flex-1">{p.description}</p>
                <div className="mt-3 space-y-1">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Billing</span>
                    <span className="font-medium text-gray-900">{p.billingFrequency ?? 'Monthly'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Base Price</span>
                    {displayPrice != null ? (
                      <span className="font-medium text-gray-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="font-medium text-emerald-600">Free</span>
                    )}
                  </div>
                  {displayPrice != null && p.gstApplicable && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">+ GST ({p.gstRate ?? 18}%)</span>
                        <span className="font-medium text-gray-700">₹{computeGstAmount(displayPrice, p.gstRate ?? 18).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Total (incl. GST)</span>
                        <span className="font-semibold text-zubkas-700">₹{(displayPrice + computeGstAmount(displayPrice, p.gstRate ?? 18)).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Commission</span>
                    {p.commissionEligible ? (
                      <span className="font-medium text-emerald-600">Eligible</span>
                    ) : (
                      <span className="text-gray-400">Not eligible</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Landing Page</span>
                    {p.showOnLanding ? (
                      <span className="font-medium text-zubkas-700">Visible</span>
                    ) : (
                      <span className="text-gray-400">Hidden</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal open={showAdd} onClose={closeForm} title={editingId ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field mt-1"
              placeholder="e.g. Zubkas Inventory Pro"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field mt-1 min-h-20"
              placeholder="Brief description of the product and its purpose"
            />
          </div>

          {/* Billing Frequency */}
          <div>
            <label className="text-sm font-medium text-gray-700">Billing Frequency</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {billingFrequencyOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, billingFrequency: opt })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.billingFrequency === opt ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  <Tag className="h-4 w-4" />
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Price Input */}
          {form.billingFrequency === 'Monthly' ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Monthly Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.monthlyPrice}
                onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                className="input-field mt-1"
                placeholder="499"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700">Yearly Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.yearlyPrice}
                onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                className="input-field mt-1"
                placeholder="4,990"
              />
            </div>
          )}

          {/* GST Configuration — available for both monthly and yearly */}
          <div className="rounded-lg bg-gray-50 p-3 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.gstApplicable}
                onChange={(e) => setForm({ ...form, gstApplicable: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-zubkas-700 focus:ring-zubkas-700/20"
              />
              <span className="text-sm font-medium text-gray-700">Apply GST to this product</span>
            </label>
            {form.gstApplicable && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.gstRate}
                    onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                    className="input-field mt-1"
                    placeholder="18"
                  />
                </div>
                {activePrice > 0 && (
                  <div className="rounded-md bg-white border border-gray-100 p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Price</span>
                      <span className="font-medium text-gray-900">₹{activePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">+ GST ({form.gstRate || 0}%)</span>
                      <span className="font-medium text-gray-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-600 font-medium">Total (incl. GST)</span>
                      <span className="font-semibold text-zubkas-700">₹{totalWithGst.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Commission Eligible toggle */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.commissionEligible}
                onChange={(e) => setForm({ ...form, commissionEligible: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-zubkas-700 focus:ring-zubkas-700/20"
              />
              <span className="text-sm font-medium text-gray-700">Commission eligible</span>
            </label>
            <span className="text-xs text-gray-400">Partners can earn commission on referrals</span>
          </div>

          {/* Show on Landing Page toggle */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showOnLanding}
                onChange={(e) => setForm({ ...form, showOnLanding: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-zubkas-700 focus:ring-zubkas-700/20"
              />
              <span className="text-sm font-medium text-gray-700">Show on Landing Page</span>
            </label>
            <span className="text-xs text-gray-400">Display this product in the Home page Products dropdown</span>
          </div>

          {/* Status + Icon */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}
                className="input-field mt-1"
              >
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Icon</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {iconOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: opt.name })}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${form.icon === opt.name ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Features — dynamic add/remove */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Key Features</label>
              <button type="button" onClick={addFeature} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zubkas-700 hover:bg-zubkas-50 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {form.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Feature ${i + 1}`}
                  />
                  {form.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeForm} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Product <span className="font-semibold">{deleteTarget.name}</span> will be permanently removed from the product suite and will no longer be available for partner referrals.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteProduct(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
