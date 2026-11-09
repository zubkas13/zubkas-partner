import { useState } from 'react';
import { UserPlus, Search, MessageCircle, Trash2, TriangleAlert as AlertTriangle, Building2, Mail, Phone, Users as UsersIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Customer } from '@/types';

interface CustomerForm {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  whatsapp: string;
  partnerId: string;
}

const emptyForm: CustomerForm = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  whatsapp: '',
  partnerId: '',
};

export function AdminCustomers() {
  const { customers, partners, addCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const partnerName = (partnerId: string) => partners.find(p => p.id === partnerId)?.name ?? 'Unassigned';

  const filtered = customers.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.companyName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || c.status === statusFilter) &&
    (partnerFilter === 'All' || c.partnerId === partnerFilter)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date('2026-10-08').toISOString().split('T')[0];
    const renewalDate = new Date(new Date('2026-10-08').setMonth(new Date('2026-10-08').getMonth() + 2)).toISOString().split('T')[0];
    addCustomer({
      partnerId: form.partnerId,
      name: form.name,
      companyName: form.companyName || '—',
      phone: form.phone,
      email: form.email,
      whatsapp: form.whatsapp,
      planType: 'Monthly',
      planTier: 'Free',
      commissionRate: 5,
      subscriptionAmount: 0,
      startDate: today,
      renewalDate,
      status: 'Active',
    });
    setForm(emptyForm);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Customer Management"
        subtitle={`${customers.length} customers across all partners`}
        action={<button onClick={() => { setForm({ ...emptyForm, partnerId: partners[0]?.id ?? '' }); setShowAdd(true); }} className="btn-primary"><UserPlus className="h-4 w-4" /> Add Customer</button>}
      />

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm"><UsersIcon className="h-4 w-4" /> Total</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{customers.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-sm"><MessageCircle className="h-4 w-4" /> Active</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{customers.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm"><AlertTriangle className="h-4 w-4" /> Unpaid</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{customers.filter(c => c.status === 'Unpaid').length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm"><Building2 className="h-4 w-4" /> Partners</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{new Set(customers.map(c => c.partnerId)).size}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, company, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className="input-field sm:w-48">
          <option>All</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-36">
          <option>All</option>
          <option>Active</option>
          <option>Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No customers found" message="Try adjusting your search or filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">WhatsApp</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Assigned Partner</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Subscription</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Renewal</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.companyName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.phone}</td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{partnerName(c.partnerId)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{c.planType}</span>
                      <span className="text-xs text-gray-500 ml-1">{c.planTier}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(c.subscriptionAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.renewalDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field pl-9" placeholder="Company Pvt Ltd (optional)" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-9" placeholder="customer@company.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-9" placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">WhatsApp Number <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field pl-9" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Assign to Partner <span className="text-red-500">*</span></label>
            <select required value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} className="input-field mt-1">
              <option value="">Select a partner...</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name} — {p.company}</option>)}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full"><UserPlus className="h-4 w-4" /> Add Customer</button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Are you sure?</p>
                <p className="text-xs text-red-700 mt-1">
                  This will permanently remove {deleteTarget.name} ({deleteTarget.companyName}) and all associated commission data. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={() => { deleteCustomer(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
