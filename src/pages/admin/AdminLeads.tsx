import { useState } from 'react';
import { Search, Lock, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Trash2, TriangleAlert as AlertTriangle, Check, X, Hourglass, Package, DollarSign, Percent, Plus, Layers, Building2, Mail, Phone, MessageCircle, CreditCard, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatDate, daysUntil } from '@/utils/helpers';
import type { Lead, PlanType, LeadPaymentStatus } from '@/types';

const statusConfig: Record<Lead['status'], { icon: typeof Lock; badge: string; text: string }> = {
  'Pending Approval': { icon: Hourglass, badge: 'badge-neutral', text: 'text-blue-700' },
  Locked:            { icon: Lock,        badge: 'badge-warning', text: 'text-amber-700' },
  Approved:          { icon: CheckCircle2, badge: 'badge-success', text: 'text-emerald-700' },
  Open:              { icon: Clock,       badge: 'badge-neutral', text: 'text-gray-600'  },
  Converted:         { icon: CheckCircle2, badge: 'badge-success', text: 'text-emerald-700' },
  Lost:              { icon: XCircle,     badge: 'badge-error',   text: 'text-red-700'   },
  Rejected:          { icon: XCircle,     badge: 'badge-error',   text: 'text-red-700'   },
};

const statusOrder: Lead['status'][] = ['Pending Approval', 'Locked', 'Approved', 'Open', 'Converted', 'Lost', 'Rejected'];

interface ApprovalForm {
  productId: string;
  planType: PlanType;
  planPrice: string;
  commissionRate: string;
}

interface PaymentForm {
  paymentStatus: LeadPaymentStatus;
  planPrice: string;
  commissionRate: string;
  renewalDate: string;
}

interface CreateLeadForm {
  partnerId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  productId: string;
  planType: PlanType;
  notes: string;
}

const emptyCreateForm: CreateLeadForm = {
  partnerId: 'none',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  whatsapp: '',
  productId: '',
  planType: 'Monthly',
  notes: '',
};

export function AdminLeads() {
  const { leads, products, partners, plans, customers, settings, deleteLead, updateLeadStatus, approveLead, adminAddLead, updateLeadPayment } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [approveTarget, setApproveTarget] = useState<Lead | null>(null);
  const [pendingTarget, setPendingTarget] = useState<Lead | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Lead | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeadForm>(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateLeadForm, string>>>({});
  const [createSuccess, setCreateSuccess] = useState('');
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    productId: '',
    planType: 'Monthly',
    planPrice: '',
    commissionRate: '15',
  });
  const [paymentTarget, setPaymentTarget] = useState<Lead | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    paymentStatus: 'Unpaid',
    planPrice: '',
    commissionRate: '15',
    renewalDate: '',
  });
  const [paymentErrors, setPaymentErrors] = useState<Partial<PaymentForm>>({});
  const [approvalErrors, setApprovalErrors] = useState<Partial<ApprovalForm>>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId === '') {
      setCreateForm(prev => ({ ...prev, companyName: '', contactName: '', email: '', phone: '', whatsapp: '' }));
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCreateForm(prev => ({
        ...prev,
        companyName: customer.companyName,
        contactName: customer.name,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp ?? customer.phone,
      }));
    }
  };

  const filtered = leads.filter(l =>
    (l.companyName.toLowerCase().includes(search.toLowerCase()) ||
     l.partnerName.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || l.status === statusFilter)
  );

  const pendingCount = leads.filter(l => l.status === 'Pending Approval').length;

  const getPartnerPlanCommission = (lead: Lead): string | null => {
    const partner = partners.find(p => p.id === lead.partnerId);
    if (!partner?.planId) return null;
    const plan = plans.find(pl => pl.id === partner.planId);
    return plan ? String(plan.commissionRate) : null;
  };

  const getProductPrice = (lead: Lead): string | null => {
    if (!lead.productId) return null;
    const product = products.find(p => p.id === lead.productId);
    if (!product) return null;
    const price = lead.planType === 'Yearly' ? product.yearlyPrice : product.monthlyPrice;
    return price != null ? String(price) : null;
  };

  const openPayment = (lead: Lead) => {
    const planRate = getPartnerPlanCommission(lead);
    const productPrice = getProductPrice(lead);
    setPaymentForm({
      paymentStatus: lead.paymentStatus ?? 'Unpaid',
      planPrice: lead.planPrice ? String(lead.planPrice) : productPrice ?? '',
      commissionRate: lead.commissionRate ? String(lead.commissionRate) : planRate ?? '15',
      renewalDate: lead.renewalDate ?? '',
    });
    setPaymentErrors({});
    setPaymentTarget(lead);
  };

  const validatePayment = (): boolean => {
    const errs: Partial<PaymentForm> = {};
    const price = Number(paymentForm.planPrice);
    if (!paymentForm.planPrice || isNaN(price) || price <= 0) errs.planPrice = 'Enter a valid price';
    const rate = Number(paymentForm.commissionRate);
    if (!paymentForm.commissionRate || isNaN(rate) || rate < 0 || rate > 100) errs.commissionRate = '0–100%';
    if (!paymentForm.renewalDate) errs.renewalDate = 'Required';
    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const confirmPayment = () => {
    if (!paymentTarget || !validatePayment()) return;
    updateLeadPayment(paymentTarget.id, {
      paymentStatus: paymentForm.paymentStatus,
      planPrice: Number(paymentForm.planPrice),
      commissionRate: Number(paymentForm.commissionRate),
      renewalDate: paymentForm.renewalDate,
    });
    setPaymentTarget(null);
  };

  const paymentCommissionPreview =
    paymentForm.planPrice && paymentForm.commissionRate
      ? ((Number(paymentForm.planPrice) * Number(paymentForm.commissionRate)) / 100)
      : null;

  const openApprove = (lead: Lead) => {
    const planRate = getPartnerPlanCommission(lead);
    const productPrice = getProductPrice(lead);
    setApprovalForm({
      productId: lead.productId ?? '',
      planType: lead.planType ?? 'Monthly',
      planPrice: lead.planPrice ? String(lead.planPrice) : productPrice ?? '',
      commissionRate: lead.commissionRate ? String(lead.commissionRate) : planRate ?? '15',
    });
    setApprovalErrors({});
    setApproveTarget(lead);
  };

  const validateApproval = (): boolean => {
    const errs: Partial<ApprovalForm> = {};
    if (!approvalForm.productId) errs.productId = 'Required';
    const price = Number(approvalForm.planPrice);
    if (!approvalForm.planPrice || isNaN(price) || price <= 0) errs.planPrice = 'Enter a valid price';
    const rate = Number(approvalForm.commissionRate);
    if (!approvalForm.commissionRate || isNaN(rate) || rate < 0 || rate > 100) errs.commissionRate = '0–100%';
    setApprovalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const confirmApprove = () => {
    if (!approveTarget || !validateApproval()) return;
    const selectedProduct = products.find(p => p.id === approvalForm.productId);
    approveLead(approveTarget.id, {
      productId: approvalForm.productId || undefined,
      productName: selectedProduct?.name,
      planType: approvalForm.planType,
      planPrice: Number(approvalForm.planPrice),
      commissionRate: Number(approvalForm.commissionRate),
    });
    setApproveTarget(null);
  };

  const validateCreate = (): boolean => {
    const errs: Partial<Record<keyof CreateLeadForm, string>> = {};
    if (!createForm.companyName.trim()) errs.companyName = 'Required';
    if (!createForm.contactName.trim()) errs.contactName = 'Required';
    if (!createForm.email.trim()) errs.email = 'Required';
    if (!createForm.phone.trim()) errs.phone = 'Required';
    if (!createForm.whatsapp.trim()) errs.whatsapp = 'Required';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;
    const selectedProduct = createForm.productId ? products.find(p => p.id === createForm.productId) : undefined;
    adminAddLead({
      partnerId: createForm.partnerId,
      companyName: createForm.companyName,
      contactName: createForm.contactName,
      email: createForm.email,
      phone: createForm.phone,
      whatsapp: createForm.whatsapp,
      productId: createForm.productId || undefined,
      productName: selectedProduct?.name,
      planType: createForm.planType,
      notes: createForm.notes,
    });
    setCreateSuccess(`Lead for "${createForm.companyName}" created successfully!`);
    setCreateForm(emptyCreateForm);
    setSelectedCustomerId('');
    setCreateErrors({});
    setTimeout(() => { setShowCreate(false); setCreateSuccess(''); }, 2000);
  };

  const selectedProduct = products.find(p => p.id === approvalForm.productId);
  const estimatedCommission =
    approvalForm.planPrice && approvalForm.commissionRate
      ? ((Number(approvalForm.planPrice) * Number(approvalForm.commissionRate)) / 100)
      : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="All Leads"
        subtitle={`${leads.length} leads across all partners${pendingCount > 0 ? ` · ${pendingCount} pending approval` : ''}`}
        action={<button onClick={() => { setCreateForm(emptyCreateForm); setSelectedCustomerId(''); setCreateErrors({}); setCreateSuccess(''); setShowCreate(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Create Lead</button>}
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statusOrder.map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          const count = leads.filter(l => l.status === s).length;
          return (
            <div key={s} className="card p-4">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${cfg.text}`} />
                <span className="text-2xl font-display font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{s}</p>
            </div>
          );
        })}
      </div>

      {/* Pending approval alert */}
      {pendingCount > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <Hourglass className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {pendingCount} Lead{pendingCount > 1 ? 's' : ''} Awaiting Your Review
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Review and approve (with financial details), keep pending, or reject submitted leads below.
              Approved leads become visible to the partner and are locked for {settings.leadLockDays} days.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or partner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option>All</option>
          <option>Pending Approval</option>
          <option>Locked</option>
          <option>Approved</option>
          <option>Open</option>
          <option>Converted</option>
          <option>Lost</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No leads found" message="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Partner</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Lock Ends</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product / Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const cfg = statusConfig[l.status];
                  const Icon = cfg.icon;
                  const lockDaysLeft = daysUntil(l.lockEndDate);
                  const isPending = l.status === 'Pending Approval';
                  const isRejected = l.status === 'Rejected';
                  const isConverted = l.status === 'Converted';
                  return (
                    <tr
                      key={l.id}
                      className={`border-b border-gray-50 transition-colors ${
                        isPending ? 'bg-amber-50/40' : isRejected ? 'bg-red-50/20' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{l.companyName}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{l.contactName}</p>
                        <p className="text-xs text-gray-500">{l.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.partnerName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(l.submittedDate)}</td>
                      <td className="px-4 py-3 text-xs">
                        {l.status === 'Converted' || l.paymentStatus === 'Paid' ? (
                          <span className="text-gray-400">—</span>
                        ) : (l.status === 'Locked' || l.status === 'Approved' || l.status === 'Pending Approval') && lockDaysLeft > 0 ? (
                          <span className="text-amber-600 font-medium">{lockDaysLeft}d left</span>
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
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {l.productName ? (
                          <div>
                            <p className="font-medium text-gray-800">{l.productName}</p>
                            <p className="text-gray-500">
                              {l.planType ?? '—'}
                              {l.planPrice ? ` · ₹${l.planPrice.toLocaleString()}` : ''}
                              {l.commissionRate != null ? ` · ${l.commissionRate}%` : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.paymentStatus ? (
                          <span className={`badge ${l.paymentStatus === 'Paid' ? 'badge-success' : 'badge-error'}`}>
                            {l.paymentStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => openApprove(l)}
                            disabled={l.status === 'Locked' || l.status === 'Approved' || isConverted}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Approve lead"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => openPayment(l)}
                            disabled={isConverted}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Manage payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Payment
                          </button>
                          <button
                            onClick={() => setPendingTarget(l)}
                            disabled={l.status === 'Pending Approval' || isConverted}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Set as pending"
                          >
                            <Hourglass className="h-3.5 w-3.5" />
                            Pending
                          </button>
                          <button
                            onClick={() => setRejectTarget(l)}
                            disabled={l.status === 'Rejected' || isConverted}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Reject lead"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(l)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

      {/* ── Approval Modal ────────────────────────────────────────────── */}
      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve Lead"
        size="lg"
      >
        {approveTarget && (
          <div className="space-y-5">
            {/* Lead summary */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{approveTarget.companyName}</p>
              <p className="text-xs text-gray-600">Contact: {approveTarget.contactName} · {approveTarget.phone}</p>
              <p className="text-xs text-gray-500">Partner: {approveTarget.partnerName} · Submitted {formatDate(approveTarget.submittedDate)}</p>
              {approveTarget.notes && <p className="text-xs text-gray-500 italic mt-1">"{approveTarget.notes}"</p>}
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700">
                After approval, this lead will be <strong>locked for {settings.leadLockDays} days</strong> and become visible in the partner's active leads list. A notification will be sent to the partner.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                Product &amp; Plan Details
              </h4>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={approvalForm.productId}
                  onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    const price = approvalForm.planType === 'Yearly' ? prod?.yearlyPrice : prod?.monthlyPrice;
                    setApprovalForm(f => ({ ...f, productId: e.target.value, planPrice: price != null ? String(price) : '' }));
                  }}
                  className={`input-field ${approvalErrors.productId ? 'border-red-400' : ''}`}
                >
                  <option value="">— Select a product —</option>
                  {products.filter(p => p.status !== 'Coming Soon').map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.monthlyPrice != null ? `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo` : 'TBD'}</option>
                  ))}
                </select>
                {approvalErrors.productId && (
                  <p className="text-xs text-red-500 mt-1">{approvalErrors.productId}</p>
                )}
                {selectedProduct && (
                  <div className="mt-2 rounded-lg bg-zubkas-50 border border-zubkas-100 px-3 py-2 text-xs text-zubkas-700">
                    <span className="font-semibold">{selectedProduct.name}</span>
                    {selectedProduct.commissionEligible
                      ? ' · Commission eligible'
                      : ' · Not commission eligible'}
                    {selectedProduct.monthlyPrice != null && ` · ₹${selectedProduct.monthlyPrice.toLocaleString('en-IN')}/mo`}
                    {selectedProduct.yearlyPrice != null && ` · ₹${selectedProduct.yearlyPrice.toLocaleString('en-IN')}/yr`}
                  </div>
                )}
              </div>

              {/* Plan type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                <div className="flex gap-3">
                  {(['Monthly', 'Yearly'] as const).map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => {
                        const prod = products.find(p => p.id === approvalForm.productId);
                        const price = pt === 'Yearly' ? prod?.yearlyPrice : prod?.monthlyPrice;
                        setApprovalForm(f => ({ ...f, planType: pt, planPrice: price != null ? String(price) : f.planPrice }));
                      }}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        approvalForm.planType === pt
                          ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Commission side by side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 999"
                      value={approvalForm.planPrice}
                      onChange={e => setApprovalForm(f => ({ ...f, planPrice: e.target.value }))}
                      className={`input-field pl-9 ${approvalErrors.planPrice ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {approvalErrors.planPrice && (
                    <p className="text-xs text-red-500 mt-1">{approvalErrors.planPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Commission % <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="e.g. 15"
                      value={approvalForm.commissionRate}
                      onChange={e => setApprovalForm(f => ({ ...f, commissionRate: e.target.value }))}
                      className={`input-field pl-9 ${approvalErrors.commissionRate ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {approvalErrors.commissionRate && (
                    <p className="text-xs text-red-500 mt-1">{approvalErrors.commissionRate}</p>
                  )}
                </div>
              </div>

              {/* Commission preview */}
              {estimatedCommission !== null && estimatedCommission > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-emerald-700 font-medium">Estimated commission per period</span>
                  <span className="text-lg font-display font-bold text-emerald-700">
                    ₹{estimatedCommission.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setApproveTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={confirmApprove}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] flex-1"
              >
                <Check className="h-4 w-4" />
                Confirm Approval
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Set Pending Modal ─────────────────────────────────────────── */}
      <Modal open={!!pendingTarget} onClose={() => setPendingTarget(null)} title="Set Lead Pending" size="sm">
        {pendingTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <Hourglass className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Set lead back to pending?</p>
                <p className="text-xs text-amber-700 mt-1">
                  The lead for <span className="font-semibold">{pendingTarget.companyName}</span> will be set back to
                  "Pending Approval" and hidden from the partner's active leads.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPendingTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { updateLeadStatus(pendingTarget.id, 'Pending Approval'); setPendingTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-700 active:scale-[0.98] flex-1"
              >
                <Hourglass className="h-4 w-4" />
                Set Pending
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject Modal ──────────────────────────────────────────────── */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Lead" size="sm">
        {rejectTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Reject this lead?</p>
                <p className="text-xs text-red-700 mt-1">
                  The lead for <span className="font-semibold">{rejectTarget.companyName}</span> will be rejected
                  and hidden from the partner's active leads list.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { updateLeadStatus(rejectTarget.id, 'Rejected'); setRejectTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <X className="h-4 w-4" />
                Reject Lead
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ──────────────────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Lead" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  The lead for <span className="font-semibold">{deleteTarget.companyName}</span> (contact:{' '}
                  {deleteTarget.contactName}) will be permanently removed from the system.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteLead(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Lead
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Lead Modal ─────────────────────────────────────────── */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateErrors({}); setCreateSuccess(''); }}
        title="Create Lead"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createSuccess && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {createSuccess}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Select Existing Customer <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="input-field mt-1"
              disabled={customers.length === 0}
            >
              <option value="">{customers.length === 0 ? '— No customers available —' : '— Enter manually instead —'}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Selecting a customer auto-fills company, contact, email, phone, and WhatsApp fields.</p>
          </div>

          {/* Partner Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Assign to Partner</label>
            <select
              value={createForm.partnerId}
              onChange={(e) => setCreateForm({ ...createForm, partnerId: e.target.value })}
              className="input-field mt-1"
            >
              <option value="none">None (Direct Admin Lead)</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.company}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Select a partner to assign this lead to, or leave as "None" for a direct admin lead.</p>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            {/* Company Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                  className={`input-field pl-9 ${createErrors.companyName ? 'border-red-400' : ''}`}
                  placeholder="Company name"
                />
              </div>
              {createErrors.companyName && <p className="text-xs text-red-500 mt-1">{createErrors.companyName}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Person <span className="text-red-500">*</span></label>
              <input
                required
                value={createForm.contactName}
                onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })}
                className={`input-field mt-1 ${createErrors.contactName ? 'border-red-400' : ''}`}
                placeholder="Contact name at the company"
              />
              {createErrors.contactName && <p className="text-xs text-red-500 mt-1">{createErrors.contactName}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className={`input-field pl-9 ${createErrors.email ? 'border-red-400' : ''}`}
                    placeholder="contact@company.com"
                  />
                </div>
                {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className={`input-field pl-9 ${createErrors.phone ? 'border-red-400' : ''}`}
                    placeholder="+91 ..."
                  />
                </div>
                {createErrors.phone && <p className="text-xs text-red-500 mt-1">{createErrors.phone}</p>}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp Number <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={createForm.whatsapp}
                  onChange={(e) => setCreateForm({ ...createForm, whatsapp: e.target.value })}
                  className={`input-field pl-9 ${createErrors.whatsapp ? 'border-red-400' : ''}`}
                  placeholder="+91 ..."
                />
              </div>
              {createErrors.whatsapp && <p className="text-xs text-red-500 mt-1">{createErrors.whatsapp}</p>}
            </div>
          </div>

          {/* Product & Plan Type */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Interest</label>
              <select
                value={createForm.productId}
                onChange={(e) => setCreateForm({ ...createForm, productId: e.target.value })}
                className="input-field mt-1"
              >
                <option value="">— Select a product (optional) —</option>
                {products.filter(p => p.status !== 'Coming Soon').map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.monthlyPrice != null ? `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo` : 'TBD'}</option>
                ))}
              </select>
              {createForm.productId && (() => {
                const p = products.find(prod => prod.id === createForm.productId);
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
                    onClick={() => setCreateForm({ ...createForm, planType: pt })}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${createForm.planType === pt ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <Layers className="h-4 w-4" />
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="input-field mt-1 min-h-20"
              placeholder="Any details about the lead..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); setCreateErrors({}); setCreateSuccess(''); }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              <Plus className="h-4 w-4" />
              Create Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Manage Payment Modal ─────────────────────────────────────── */}
      <Modal
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        title="Manage Payment"
        size="lg"
      >
        {paymentTarget && (
          <div className="space-y-5">
            {/* Lead summary */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{paymentTarget.companyName}</p>
              <p className="text-xs text-gray-600">Contact: {paymentTarget.contactName} · {paymentTarget.phone}</p>
              <p className="text-xs text-gray-500">Partner: {paymentTarget.partnerName}</p>
              {paymentTarget.productName && (
                <p className="text-xs text-gray-500">Product: {paymentTarget.productName} · {paymentTarget.planType ?? '—'}</p>
              )}
            </div>

            {paymentForm.paymentStatus === 'Unpaid' && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs text-red-700">
                  While marked <strong>Unpaid</strong>, partner commissions for this lead are <strong>paused</strong>. Mark as Paid to resume commission calculations.
                </p>
              </div>
            )}

            {paymentForm.paymentStatus === 'Paid' && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700">
                  Marking as <strong>Paid</strong> will activate commission calculations for the partner.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                Payment &amp; Commission Details
              </h4>

              {/* Payment Status toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <div className="flex gap-3">
                  {(['Paid', 'Unpaid'] as const).map(ps => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => setPaymentForm(f => ({ ...f, paymentStatus: ps }))}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        paymentForm.paymentStatus === ps
                          ? ps === 'Paid'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Indicates whether the customer has paid for the current {paymentTarget.planType === 'Yearly' ? 'year' : 'month'}.
                </p>
              </div>

              {/* Price & Commission side by side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 999"
                      value={paymentForm.planPrice}
                      onChange={e => setPaymentForm(f => ({ ...f, planPrice: e.target.value }))}
                      className={`input-field pl-9 ${paymentErrors.planPrice ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {paymentErrors.planPrice && <p className="text-xs text-red-500 mt-1">{paymentErrors.planPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Commission % <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="e.g. 15"
                      value={paymentForm.commissionRate}
                      onChange={e => setPaymentForm(f => ({ ...f, commissionRate: e.target.value }))}
                      className={`input-field pl-9 ${paymentErrors.commissionRate ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {paymentErrors.commissionRate && <p className="text-xs text-red-500 mt-1">{paymentErrors.commissionRate}</p>}
                </div>
              </div>

              {/* Renewal Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal {paymentTarget.planType === 'Yearly' ? 'Year' : 'Month'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={paymentForm.renewalDate}
                    onChange={e => setPaymentForm(f => ({ ...f, renewalDate: e.target.value }))}
                    className={`input-field pl-9 ${paymentErrors.renewalDate ? 'border-red-400' : ''}`}
                  />
                </div>
                {paymentErrors.renewalDate && <p className="text-xs text-red-500 mt-1">{paymentErrors.renewalDate}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  When the customer's {paymentTarget.planType === 'Yearly' ? 'yearly' : 'monthly'} subscription is up for renewal.
                </p>
              </div>

              {/* Commission preview */}
              {paymentCommissionPreview !== null && paymentCommissionPreview > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">Commission per period</span>
                  <span className="text-lg font-display font-bold text-blue-700">
                    ₹{paymentCommissionPreview.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setPaymentTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={confirmPayment}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] flex-1"
              >
                <CreditCard className="h-4 w-4" />
                Save Payment Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
