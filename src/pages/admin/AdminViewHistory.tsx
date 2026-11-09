import { useState } from 'react';
import { Search, History, Trash2, Calendar, IndianRupee, User as UserIcon, CircleCheck, Clock, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { formatCurrencyFull, formatDate } from '@/utils/helpers';
import type { Customer } from '@/types';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function AdminViewHistory() {
  const { customers, customerPayments, deleteCustomerPayment, settings } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerPaymentList = selectedCustomer
    ? customerPayments.filter(p => p.customerId === selectedCustomer.id)
    : [];

  const sortedPayments = [...customerPaymentList].sort((a, b) => a.periodLabel.localeCompare(b.periodLabel));

  const paidPeriods = new Set(sortedPayments.map(p => p.periodLabel));

  // For monthly: calculate the 12-month cycle from start date
  const monthlyMonths = () => {
    if (!selectedCustomer) return [];
    const start = new Date(selectedCustomer.startDate);
    const months: { label: string; display: string; paid: boolean }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        label,
        display: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        paid: paidPeriods.has(label),
      });
    }
    return months;
  };

  // For yearly: calculate years from start date
  const yearlyYears = () => {
    if (!selectedCustomer) return [];
    const start = new Date(selectedCustomer.startDate);
    const now = new Date();
    const years: { label: string; display: string; paid: boolean; isUpcoming: boolean }[] = [];
    for (let i = 0; i <= 3; i++) {
      const year = start.getFullYear() + i;
      const label = String(year);
      years.push({
        label,
        display: `Year ${year}`,
        paid: paidPeriods.has(label),
        isUpcoming: year > now.getFullYear(),
      });
    }
    return years;
  };

  const monthlyData = selectedCustomer?.planType === 'Monthly' ? monthlyMonths() : [];
  const yearlyData = selectedCustomer?.planType === 'Yearly' ? yearlyYears() : [];

  const paidCount = monthlyData.filter(m => m.paid).length || yearlyData.filter(y => y.paid).length;
  const remainingMonths = monthlyData.length - monthlyData.filter(m => m.paid).length;
  const totalPaid = sortedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Customer Payment History"
        subtitle="View complete payment transaction history per customer"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer selection */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Select Customer</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState icon={UserIcon} title="No customers found" message="Try a different search" />
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setDeleteTarget(null); }}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    selectedCustomer?.id === c.id ? 'bg-zubkas-50 border-2 border-zubkas-300' : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.companyName}</p>
                  </div>
                  <span className={`badge ${c.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{c.planType}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* History display */}
        <div className="lg:col-span-2 space-y-5">
          {!selectedCustomer ? (
            <div className="card p-5">
              <EmptyState icon={History} title="No customer selected" message="Select a customer to view their payment history" />
            </div>
          ) : (
            <>
              {/* Customer info + summary */}
              <div className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.companyName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Plan: {selectedCustomer.planTier} ({selectedCustomer.planType}) — Started {formatDate(selectedCustomer.startDate)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center rounded-lg bg-gray-50 p-3">
                      <p className="text-2xl font-display font-bold text-gray-900">{sortedPayments.length}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Payments</p>
                    </div>
                    <div className="text-center rounded-lg bg-emerald-50 p-3">
                      <p className="text-2xl font-display font-bold text-emerald-700">{paidCount}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Paid</p>
                    </div>
                    <div className="text-center rounded-lg bg-zubkas-50 p-3">
                      <p className="text-2xl font-display font-bold text-zubkas-700">{formatCurrencyFull(totalPaid)}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly plan: 12-month cycle grid */}
              {selectedCustomer.planType === 'Monthly' && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-gray-900">12-Month Payment Cycle</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-600"><CircleCheck className="h-3.5 w-3.5" /> Paid</span>
                      <span className="flex items-center gap-1.5 text-gray-400"><Clock className="h-3.5 w-3.5" /> Pending</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {monthlyData.map(m => (
                      <div
                        key={m.label}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                          m.paid ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        {m.paid ? (
                          <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${m.paid ? 'text-emerald-700' : 'text-gray-500'}`}>{m.display}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-emerald-50 p-3 text-center">
                      <p className="text-xl font-display font-bold text-emerald-700">{paidCount} / 12</p>
                      <p className="text-xs text-gray-500">Months Paid</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-xl font-display font-bold text-amber-700">{remainingMonths} / 12</p>
                      <p className="text-xs text-gray-500">Months Remaining</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Yearly plan: year cycle grid */}
              {selectedCustomer.planType === 'Yearly' && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-gray-900">Yearly Payment Records</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-600"><CircleCheck className="h-3.5 w-3.5" /> Paid</span>
                      <span className="flex items-center gap-1.5 text-amber-500"><Clock className="h-3.5 w-3.5" /> Upcoming</span>
                      <span className="flex items-center gap-1.5 text-gray-400"><XCircle className="h-3.5 w-3.5" /> Unpaid</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {yearlyData.map(y => (
                      <div
                        key={y.label}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                          y.paid ? 'border-emerald-200 bg-emerald-50' : y.isUpcoming ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        {y.paid ? (
                          <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : y.isUpcoming ? (
                          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                        )}
                        <p className={`text-xs font-medium truncate ${y.paid ? 'text-emerald-700' : y.isUpcoming ? 'text-amber-600' : 'text-gray-500'}`}>{y.display}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction list */}
              <div className="card p-5">
                <h4 className="font-display font-semibold text-gray-900 mb-3">Transaction History</h4>
                {sortedPayments.length === 0 ? (
                  <EmptyState icon={Calendar} title="No payments recorded" message="Payment transactions will appear here once recorded" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Period</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Payment Date</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Recorded By</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">Notes</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPayments.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="badge badge-success">{p.periodLabel}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(p.paymentDate)}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              <span className="flex items-center justify-end gap-1">
                                <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                                {p.amount.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{p.recordedBy || '—'}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs max-w-40 truncate">{p.notes || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setDeleteTarget(p.id)}
                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete payment record"
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
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-slide-up p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Payment Record?</h3>
                <p className="text-sm text-gray-500 mt-1">This will permanently remove this payment entry. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={() => { deleteCustomerPayment(deleteTarget); setDeleteTarget(null); }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
