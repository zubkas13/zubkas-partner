import { useState } from 'react';
import { PlusCircle, Search, IndianRupee, Calendar, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { formatCurrencyFull, formatDate } from '@/utils/helpers';
import type { Customer } from '@/types';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function AdminAddRecords() {
  const { customers, customerPayments, addCustomerPayment, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerPaymentList = selectedCustomer
    ? customerPayments.filter(p => p.customerId === selectedCustomer.id)
    : [];

  const paidPeriods = new Set(customerPaymentList.map(p => p.periodLabel));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSaving(true);
    setError(null);
    try {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        setError('Please enter a valid amount.');
        setSaving(false);
        return;
      }
      if (!periodLabel) {
        setError('Please select a payment period.');
        setSaving(false);
        return;
      }
      if (paidPeriods.has(periodLabel)) {
        setError(`Payment for ${periodLabel} already exists for this customer.`);
        setSaving(false);
        return;
      }
      await addCustomerPayment({
        customerId: selectedCustomer.id,
        amount: amt,
        periodLabel,
        planType: selectedCustomer.planType,
        paymentDate,
        notes,
        recordedBy: currentUser?.name ?? 'Admin',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      setAmount('');
      setNotes('');
      setPeriodLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const generateMonthlyOptions = () => {
    if (!selectedCustomer) return [];
    const start = new Date(selectedCustomer.startDate);
    const endYear = 2030;
    const endMonth = 11; // December (0-indexed)
    const options: { label: string; display: string }[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d.getFullYear() < endYear || (d.getFullYear() === endYear && d.getMonth() <= endMonth)) {
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const display = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      options.push({ label, display });
      d.setMonth(d.getMonth() + 1);
    }
    return options;
  };

  const generateYearlyOptions = () => {
    if (!selectedCustomer) return [];
    const start = new Date(selectedCustomer.startDate);
    const endYear = 2030;
    const options: { label: string; display: string }[] = [];
    for (let year = start.getFullYear(); year <= endYear; year++) {
      options.push({ label: String(year), display: `Year ${year}` });
    }
    return options;
  };

  const periodOptions = selectedCustomer?.planType === 'Yearly' ? generateYearlyOptions() : generateMonthlyOptions();
  const availablePeriods = periodOptions.filter(o => !paidPeriods.has(o.label));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Add Payment Records"
        subtitle="Record customer payments for monthly or yearly plans"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer selection */}
        <div className="card p-5">
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
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState icon={UserIcon} title="No customers found" message="Try a different search" />
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setAmount(String(c.subscriptionAmount || ''));
                    setPeriodLabel('');
                    setSuccess(false);
                    setError(null);
                  }}
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
                  <div className="text-right shrink-0">
                    <span className={`badge ${c.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{c.planType}</span>
                    <p className="text-xs text-gray-500 mt-1">{formatCurrencyFull(c.subscriptionAmount)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Payment form */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Record Payment</h3>
          {!selectedCustomer ? (
            <EmptyState icon={PlusCircle} title="No customer selected" message="Select a customer from the list to record a payment" />
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-500">{selectedCustomer.companyName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${selectedCustomer.planType === 'Yearly' ? 'badge-zubkas' : 'badge-neutral'}`}>{selectedCustomer.planType}</span>
                    <p className="text-xs text-gray-500 mt-1">{selectedCustomer.planTier}</p>
                  </div>
                </div>
              </div>

              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Payment recorded successfully!
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field mt-1"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedCustomer.planType === 'Yearly' ? 'Payment Year' : 'Payment Month'}
                  </label>
                  <select
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    className="input-field mt-1"
                    required
                  >
                    <option value="">Select {selectedCustomer.planType === 'Yearly' ? 'year' : 'month'}...</option>
                    {availablePeriods.map(o => (
                      <option key={o.label} value={o.label}>{o.display}</option>
                    ))}
                  </select>
                  {availablePeriods.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">All periods have been paid for this customer.</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="input-field mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field mt-1 min-h-16"
                    placeholder="Add any notes about this payment..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full" disabled={saving}>
                  <PlusCircle className="h-4 w-4" />
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </form>

              {/* Already-paid periods */}
              {customerPaymentList.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Already Recorded ({customerPaymentList.length})</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {customerPaymentList.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-emerald-50/50 px-3 py-2 text-xs">
                        <span className="font-medium text-gray-700">{p.periodLabel}</span>
                        <span className="text-gray-500">{formatCurrencyFull(p.amount)} — {formatDate(p.paymentDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
