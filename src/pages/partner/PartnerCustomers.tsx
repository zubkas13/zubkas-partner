import { useState } from 'react';
import { Search, MessageCircle, TriangleAlert as AlertTriangle, DollarSign, Clock, Users as Users2, UserPlus, CircleCheck as CheckCircle2, Building2, Mail, Phone, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatCurrency, formatDate } from '@/utils/helpers';

interface CustomerForm {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  whatsapp: string;
}

const emptyForm: CustomerForm = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  whatsapp: '',
};

export function PartnerCustomers() {
  const { currentUser, customers, addCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<typeof customers[number] | null>(null);

  const myCustomers = customers.filter(c => c.partnerId === currentUser?.partnerId);
  const filtered = myCustomers.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.companyName.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || c.status === statusFilter) &&
    (planFilter === 'All' || c.planType === planFilter)
  );

  const totalEarned = myCustomers.reduce((s, c) => s + c.commissionEarned, 0);
  const blockedCommission = myCustomers.filter(c => c.status === 'Unpaid').reduce((s, c) => s + (c.subscriptionAmount * c.commissionRate / 100), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date('2026-10-08').toISOString().split('T')[0];
    const renewalDate = new Date(new Date('2026-10-08').setMonth(new Date('2026-10-08').getMonth() + 2)).toISOString().split('T')[0];

    addCustomer({
      partnerId: currentUser?.partnerId ?? '',
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

    setSuccess(`Customer "${form.name}" has been added successfully!`);
    setForm(emptyForm);
    setTimeout(() => { setShowAdd(false); setSuccess(''); }, 2500);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Customers"
        subtitle={`${myCustomers.length} customers referred by you`}
        action={<button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="btn-primary"><UserPlus className="h-4 w-4" /> Add Customer</button>}
      />

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm"><Users2 className="h-4 w-4" /> Total</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{myCustomers.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-sm"><DollarSign className="h-4 w-4" /> Earned</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{formatCurrency(totalEarned)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm"><AlertTriangle className="h-4 w-4" /> Blocked</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{formatCurrency(blockedCommission)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm"><Clock className="h-4 w-4" /> Active</div>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{myCustomers.filter(c => c.status === 'Active').length}</p>
        </div>
      </div>

      {/* Unpaid warning banner */}
      {myCustomers.some(c => c.status === 'Unpaid') && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Commission Blocked for Unpaid Customers</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {myCustomers.filter(c => c.status === 'Unpaid').length} customer(s) have unpaid subscriptions. Commission for this month has been automatically deducted/blocked. Commission will resume once payment is received.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-36">
          <option>All</option>
          <option>Active</option>
          <option>Unpaid</option>
        </select>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="input-field sm:w-36">
          <option>All</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No customers found" message="Try adjusting your search or filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">WhatsApp</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Plan Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Start Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Renewal Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Commission %</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Commission Earned</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Commission End Date</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.companyName}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.email}</td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{c.planType}</span>
                      <span className="text-xs text-gray-500 ml-1">{c.planTier}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.startDate)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.renewalDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zubkas-700">{c.commissionRate}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(c.commissionEarned)}</span>
                      {c.planType === 'Monthly' && (
                        <p className="text-[10px] text-gray-400">{c.remainingMonths}/12 months left</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(c.commissionEndDate)}
                      {c.planType === 'Monthly' && c.remainingMonths === 0 && (
                        <span className="block text-[10px] text-zubkas-700 font-medium">Cap reached</span>
                      )}
                    </td>
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

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Are you sure?</p>
              <p className="text-xs text-red-700 mt-1">
                This will permanently remove {deleteTarget?.name} ({deleteTarget?.companyName}) and all associated commission data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => {
                if (deleteTarget) deleteCustomer(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setSuccess(''); }} title="Add New Customer" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              {success}
            </div>
          )}

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

          <button type="submit" className="btn-primary w-full"><UserPlus className="h-4 w-4" /> Add Customer</button>
        </form>
      </Modal>
    </div>
  );
}
