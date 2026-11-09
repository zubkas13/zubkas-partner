import { useState } from 'react';
import { Plus, Lock, CircleCheck as CheckCircle2, Circle as XCircle, Clock, TriangleAlert as AlertTriangle, Search, Package, Layers, Trash2, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatDate, daysUntil } from '@/utils/helpers';
import type { PlanType } from '@/types';

const statusConfig = {
  'Pending Approval': { icon: Clock, badge: 'badge-neutral' },
  Locked: { icon: Lock, badge: 'badge-warning' },
  Approved: { icon: CheckCircle2, badge: 'badge-success' },
  Open: { icon: Clock, badge: 'badge-neutral' },
  Converted: { icon: CheckCircle2, badge: 'badge-success' },
  Lost: { icon: XCircle, badge: 'badge-error' },
  Rejected: { icon: XCircle, badge: 'badge-error' },
};

interface LeadForm {
  customerId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  productId: string;
  planType: PlanType;
  notes: string;
}

const emptyForm: LeadForm = {
  customerId: '',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  whatsapp: '',
  productId: '',
  planType: 'Monthly',
  notes: '',
};

export function PartnerLeads() {
  const { currentUser, leads, customers, products, settings, addLead, deleteLead } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<typeof leads[number] | null>(null);

  const allMyLeads = leads.filter(l => l.partnerId === currentUser?.partnerId);
  const pendingApprovalCount = allMyLeads.filter(l => l.status === 'Pending Approval').length;
  const myLeads = allMyLeads.filter(l => l.status !== 'Pending Approval' && l.status !== 'Rejected');
  const myCustomers = customers.filter(c => c.partnerId === currentUser?.partnerId);
  const filtered = myLeads.filter(l =>
    l.companyName.toLowerCase().includes(search.toLowerCase()) || l.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === '') {
      setForm(prev => ({ ...prev, customerId: '', companyName: '', contactName: '', email: '', phone: '', whatsapp: '' }));
      return;
    }
    const customer = myCustomers.find(c => c.id === customerId);
    if (customer) {
      setForm(prev => ({
        ...prev,
        customerId,
        companyName: customer.companyName,
        contactName: customer.name,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp ?? customer.phone,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const selectedProduct = products.find(p => p.id === form.productId);
    const result = addLead({
      partnerId: currentUser?.partnerId ?? '',
      companyName: form.companyName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      notes: form.notes,
      productId: form.productId || undefined,
      productName: selectedProduct?.name,
      planType: form.planType,
    });
    if (result) {
      const productLabel = selectedProduct ? ` for ${selectedProduct.name} (${form.planType})` : '';
      setSuccess(`Lead submitted! "${form.companyName}" is now pending admin approval${productLabel}. Once approved, it will appear in your active leads list and be locked for ${settings.leadLockDays} days.`);
      setForm(emptyForm);
      setTimeout(() => { setShowAdd(false); setSuccess(''); }, 3500);
    } else {
      setError(`This company ("${form.companyName}") is currently locked by another partner. Please try again after the lock period ends.`);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Leads"
        subtitle={`${myLeads.length} active leads · ${pendingApprovalCount} pending approval`}
        action={<button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Submit New Lead</button>}
      />

      {/* Pending approval banner */}
      {pendingApprovalCount > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{pendingApprovalCount} Lead{pendingApprovalCount > 1 ? 's' : ''} Pending Admin Approval</p>
            <p className="text-xs text-amber-700 mt-0.5">Your submitted lead{pendingApprovalCount > 1 ? 's are' : ' is'} waiting for admin review. Once approved, {pendingApprovalCount > 1 ? 'they' : 'it'} will appear here and be locked for {settings.leadLockDays} days.</p>
          </div>
        </div>
      )}

      {/* Lead lock info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Lead Lock Protection</p>
          <p className="text-xs text-blue-700 mt-0.5">When your lead is approved, the company is locked for {settings.leadLockDays} days. During this period, other partners cannot add the same company. Convert your leads before the lock expires!</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {(['Locked', 'Approved', 'Open', 'Converted', 'Lost'] as const).map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          const count = myLeads.filter(l => l.status === s).length;
          return (
            <div key={s} className="card p-4">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-display font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{s}</p>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 sm:max-w-xs" />
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No leads found" message="Submit your first lead to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Lock Ends</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Notes</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const cfg = statusConfig[l.status];
                  const Icon = cfg.icon;
                  const lockDaysLeft = daysUntil(l.lockEndDate);
                  return (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{l.companyName}</td>
                      <td className="px-4 py-3 text-gray-600">{l.contactName}</td>
                      <td className="px-4 py-3 text-gray-600">{l.phone}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {l.productName ? (
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3 w-3 text-zubkas-700" />
                            {l.productName}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.planType ? (
                          <span className={`badge ${l.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{l.planType}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(l.submittedDate)}</td>
                      <td className="px-4 py-3 text-xs">
                        {l.status === 'Converted' || l.paymentStatus === 'Paid' ? (
                          <span className="text-gray-400">—</span>
                        ) : (l.status === 'Locked' || l.status === 'Approved') && lockDaysLeft > 0 ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1"><Lock className="h-3 w-3" /> {lockDaysLeft} day{lockDaysLeft > 1 ? 's' : ''} left</span>
                        ) : (
                          <span className="text-gray-400">{formatDate(l.lockEndDate)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${cfg.badge}`}>
                          <Icon className="h-3 w-3" />
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{l.notes}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setDeleteTarget(l)}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Are you sure?</p>
              <p className="text-xs text-red-700 mt-1">
                This will permanently remove the lead for {deleteTarget?.companyName} ({deleteTarget?.contactName}). This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => {
                if (deleteTarget) deleteLead(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setError(''); setSuccess(''); }} title="Submit New Lead" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 flex items-start gap-2"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
          {success && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />{success}</div>}

          <div>
            <label className="text-sm font-medium text-gray-700">Select Existing Customer <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="input-field mt-1"
              disabled={myCustomers.length === 0}
            >
              <option value="">{myCustomers.length === 0 ? '— No customers available —' : '— Enter manually instead —'}</option>
              {myCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Selecting a customer auto-fills company, contact, email, phone, and WhatsApp fields.</p>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
              <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field mt-1" placeholder="Company name to refer" />
              <p className="text-xs text-gray-400 mt-1">This company will be locked for {settings.leadLockDays} days after submission.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Person <span className="text-red-500">*</span></label>
              <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input-field mt-1" placeholder="Contact name at the company" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field mt-1" placeholder="contact@company.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" placeholder="+91 ..." />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp Number <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field pl-9" placeholder="+91 ..." />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Interest <span className="text-red-500">*</span></label>
              <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input-field mt-1">
                <option value="">— Select a product —</option>
                {products.filter(p => p.status !== 'Coming Soon').map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.monthlyPrice != null ? `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo` : 'TBD'}</option>
                ))}
              </select>
              {form.productId && (() => {
                const p = products.find(prod => prod.id === form.productId);
                return p ? (
                  <div className="mt-2 rounded-lg bg-zubkas-50 p-3 text-xs text-zubkas-700">
                    <span className="font-semibold">{p.name}</span>: {p.commissionEligible ? 'Commission eligible' : 'Not commission eligible'}{p.monthlyPrice != null ? ` · ₹${p.monthlyPrice.toLocaleString('en-IN')}/mo` : ''}{p.yearlyPrice != null ? ` · ₹${p.yearlyPrice.toLocaleString('en-IN')}/yr` : ''}
                  </div>
                ) : null;
              })()}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span></label>
              <div className="mt-1 flex gap-3">
                {(['Monthly', 'Yearly'] as const).map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setForm({ ...form, planType: pt })}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${form.planType === pt ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <Layers className="h-4 w-4" />
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field mt-1 min-h-20" placeholder="Any details about the lead..." />
          </div>

          <button type="submit" className="btn-primary w-full">Submit Lead</button>
        </form>
      </Modal>
    </div>
  );
}
